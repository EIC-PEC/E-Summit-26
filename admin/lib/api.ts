import {
  AnalyticsData,
  CampusAmbassador,
  CheckInConflictInfo,
  CheckInLog,
  CheckInSuccessResult,
  CompetitionType,
  EventInput,
  EventItem,
  HealthStatus,
  ManualLookupMatch,
  Registration,
  SpeakerInput,
  SpeakerItem,
  SponsorInput,
  SponsorItem,
  Team,
  SiteConfig,
  SiteConfigInput,
} from './types';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';

/**
 * Thrown by every ApiClient method on a network failure or non-2xx
 * response. Callers must catch this and surface it in the UI — this
 * client no longer silently substitutes mock data on failure, since
 * doing so let staff mistake fabricated numbers for live data.
 */
export class ApiError extends Error {
  status?: number;
  /** Parsed JSON error body, when the server returned one (e.g. NestJS exception filters). */
  body?: unknown;

  constructor(message: string, status?: number, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

/** Discriminated result of a QR scan at the gate. */
export type VerifyQrResponse =
  | { outcome: 'SUCCESS'; result: CheckInSuccessResult }
  | { outcome: 'DUPLICATE'; conflict: CheckInConflictInfo }
  | { outcome: 'INVALID'; message: string };

/** Discriminated result of a manual attendee lookup at the gate desk. */
export type ManualLookupResponse =
  | { outcome: 'CHECKED_IN'; result: Registration }
  | { outcome: 'ALREADY_CHECKED_IN'; message: string }
  | { outcome: 'MATCHES'; matches: ManualLookupMatch[] }
  | { outcome: 'NOT_FOUND'; message: string };

async function parseBody(res: Response): Promise<unknown> {
  return res.json().catch(() => null);
}

function extractMessage(body: unknown, fallback: string): string {
  const b = body as { message?: string | string[] } | null;
  const msg = Array.isArray(b?.message) ? b?.message[0] : b?.message;
  return msg || fallback;
}

class ApiClient {
  private token: string | null = null;
  private isRefreshing = false;

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('esummit_admin_token') || localStorage.getItem('esummit_admin_token');
      if (stored) {
        this.token = stored;
        return stored;
      }
    }
    return null;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('esummit_admin_token');
      localStorage.removeItem('esummit_admin_token');
    }
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  /** Low-level fetch wrapper: throws ApiError on network failure or non-2xx. */
  private async request<T>(
    path: string,
    init?: RequestInit,
    isRetry = false,
  ): Promise<T> {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}${path}`, {
        credentials: 'include', // Sends HttpOnly refreshToken cookie
        ...init,
        headers: { ...this.getHeaders(), ...(init?.headers || {}) },
      });
    } catch {
      throw new ApiError(
        'Could not reach the E-Summit backend. Check that the API server is running.',
      );
    }

    // Auto-refresh token on 401 (if not already an auth endpoint or retry)
    if (res.status === 401 && !isRetry && !path.startsWith('/auth/')) {
      const refreshed = await this.refreshSession();
      if (refreshed) {
        return this.request<T>(path, init, true);
      }
    }

    if (!res.ok) {
      const body = await parseBody(res);
      throw new ApiError(
        extractMessage(body, `Request failed with HTTP ${res.status}`),
        res.status,
        body,
      );
    }

    if (res.status === 204) {
      return undefined as T;
    }

    return (await res.json()) as T;
  }

  // ── Auth ──
  async login(
    email: string,
    password: string,
  ): Promise<{ user: import('./types').User; accessToken: string }> {
    const res = await this.request<{ user: import('./types').User; accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.accessToken);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('esummit_admin_token', res.accessToken);
    }
    return res;
  }

  async refreshSession(): Promise<boolean> {
    if (this.isRefreshing) return false;
    this.isRefreshing = true;
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.accessToken) {
          this.setToken(data.accessToken);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('esummit_admin_token', data.accessToken);
          }
          return true;
        }
      }
    } catch {
      // Refresh failed
    } finally {
      this.isRefreshing = false;
    }
    return false;
  }

  async logout(): Promise<void> {
    try {
      await this.request<void>('/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  }

  async getMe(): Promise<{ user: import('./types').User; passes?: Registration[] }> {
    return this.request<{ user: import('./types').User; passes?: Registration[] }>('/auth/me');
  }

  // ── Health ──
  async getHealth(): Promise<HealthStatus> {
    return this.request<HealthStatus>('/health');
  }


  // ── Analytics ──
  async getAnalytics(): Promise<AnalyticsData> {
    return this.request<AnalyticsData>('/admin/analytics');
  }

  // ── Delegates ──
  async getDelegates(params?: {
    page?: number;
    limit?: number;
    search?: string;
    passType?: string;
    isCheckedIn?: boolean;
  }): Promise<{ items: Registration[]; total: number; totalPages: number }> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.search) query.set('search', params.search);
    if (params?.passType) query.set('passType', params.passType);
    if (params?.isCheckedIn !== undefined)
      query.set('isCheckedIn', params.isCheckedIn.toString());

    return this.request(`/admin/delegates?${query.toString()}`);
  }

  async toggleCheckInOverride(
    registrationId: string,
  ): Promise<{ success: boolean; isCheckedIn: boolean }> {
    const data = await this.request<{ isCheckedIn: boolean }>(
      `/admin/delegates/${registrationId}/override`,
      { method: 'PATCH' },
    );
    return { success: true, isCheckedIn: data.isCheckedIn };
  }

  // ── QR Scanner & Manual Lookup ──
  /**
   * Verifies a signed QR token against POST /checkin/verify-qr. On a fresh
   * pass this both validates AND performs the check-in server-side. Returns
   * a discriminated outcome rather than throwing, since "already checked in"
   * (409) and "invalid token" (400/404) are expected gate-desk outcomes, not
   * client bugs.
   */
  async verifyQr(qrToken: string, gateName = 'MAIN_GATE'): Promise<VerifyQrResponse> {
    try {
      const result = await this.request<CheckInSuccessResult>('/checkin/verify-qr', {
        method: 'POST',
        body: JSON.stringify({ qrToken, gateName }),
      });
      return { outcome: 'SUCCESS', result };
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        return { outcome: 'DUPLICATE', conflict: err.body as CheckInConflictInfo };
      }
      const message = err instanceof ApiError ? err.message : 'Verification failed.';
      return { outcome: 'INVALID', message };
    }
  }

  /**
   * Browse mode: looks up attendees by name/email/phone/pass ID without
   * checking anyone in. Returns the raw match list so the caller can let
   * the volunteer confirm the exact person before check-in.
   */
  async manualLookupSearch(query: string, gateName = 'MAIN_GATE'): Promise<ManualLookupResponse> {
    try {
      const data = await this.request<{ count: number; results: ManualLookupMatch[] }>(
        '/checkin/manual-lookup',
        { method: 'POST', body: JSON.stringify({ query, gateName, performCheckIn: false }) },
      );
      return { outcome: 'MATCHES', matches: data.results };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Lookup failed.';
      return { outcome: 'NOT_FOUND', message };
    }
  }

  /**
   * Confirms check-in for one specific pass ID (an exact match, so the
   * backend's "exactly one result" check-in branch fires).
   */
  async manualCheckIn(passId: string, gateName = 'MAIN_GATE'): Promise<ManualLookupResponse> {
    try {
      const data = await this.request<{ status: string; attendee: Registration }>(
        '/checkin/manual-lookup',
        { method: 'POST', body: JSON.stringify({ query: passId, gateName, performCheckIn: true }) },
      );
      return { outcome: 'CHECKED_IN', result: data.attendee };
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        return { outcome: 'ALREADY_CHECKED_IN', message: err.message };
      }
      const message = err instanceof ApiError ? err.message : 'Check-in failed.';
      return { outcome: 'NOT_FOUND', message };
    }
  }

  /**
   * General manual lookup that performs either search or check-in based on performCheckIn flag.
   */
  async manualLookup(query: string, gateName = 'MAIN_GATE', performCheckIn = false): Promise<ManualLookupResponse> {
    if (performCheckIn) {
      return this.manualCheckIn(query, gateName);
    }
    return this.manualLookupSearch(query, gateName);
  }

  /** Fetches gate check-in counts and recent scan stream */
  async getCheckInStats(): Promise<import('./types').CheckInStatsResponse> {
    return this.request<import('./types').CheckInStatsResponse>('/checkin/stats');
  }

  // ── CA Leaderboard ──
  async getCaLeaderboard(): Promise<CampusAmbassador[]> {
    return this.request<CampusAmbassador[]>('/admin/ca-leaderboard');
  }

  // ── Teams & Jury Scoring ──
  async getTeams(type?: CompetitionType): Promise<Team[]> {
    return this.request<Team[]>(
      `/teams/leaderboard/${type || 'PITCH_COMPETITION'}`,
    );
  }

  async getTeamById(teamId: string): Promise<Team> {
    return this.request<Team>(`/teams/${teamId}`);
  }

  async scoreTeam(
    teamId: string,
    scores: {
      innovation: number;
      execution: number;
      marketSize: number;
      presentation: number;
      comments?: string;
    },
  ): Promise<{ success: boolean; team?: Team }> {
    const team = await this.request<Team>(`/teams/${teamId}/score`, {
      method: 'POST',
      body: JSON.stringify(scores),
    });
    return { success: true, team };
  }

  // ── CMS: Events ──
  async getEvents(params?: {
    day?: 1 | 2;
    track?: string;
    type?: string;
  }): Promise<EventItem[]> {
    const query = new URLSearchParams();
    if (params?.day) query.set('day', params.day.toString());
    if (params?.track) query.set('track', params.track);
    if (params?.type) query.set('type', params.type);
    const qs = query.toString();
    return this.request<EventItem[]>(`/events${qs ? `?${qs}` : ''}`);
  }

  async createEvent(input: EventInput): Promise<EventItem> {
    return this.request<EventItem>('/events', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateEvent(id: string, input: Partial<EventInput>): Promise<EventItem> {
    return this.request<EventItem>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  }

  async deleteEvent(id: string): Promise<void> {
    await this.request<void>(`/events/${id}`, { method: 'DELETE' });
  }

  // ── CMS: Speakers ──
  async getSpeakers(): Promise<SpeakerItem[]> {
    return this.request<SpeakerItem[]>('/speakers');
  }

  async createSpeaker(input: SpeakerInput): Promise<SpeakerItem> {
    return this.request<SpeakerItem>('/speakers', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateSpeaker(
    id: string,
    input: Partial<SpeakerInput>,
  ): Promise<SpeakerItem> {
    return this.request<SpeakerItem>(`/speakers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  }

  async deleteSpeaker(id: string): Promise<void> {
    await this.request<void>(`/speakers/${id}`, { method: 'DELETE' });
  }

  // ── CMS: Sponsors ──
  async getSponsors(): Promise<SponsorItem[]> {
    return this.request<SponsorItem[]>('/sponsors');
  }

  async createSponsor(input: SponsorInput): Promise<SponsorItem> {
    return this.request<SponsorItem>('/sponsors', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateSponsor(id: string, input: Partial<SponsorInput>): Promise<SponsorItem> {
    return this.request<SponsorItem>(`/sponsors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  }

  async deleteSponsor(id: string): Promise<void> {
    await this.request<void>(`/sponsors/${id}`, { method: 'DELETE' });
  }

  // ── CMS: Subscribers ──
  async getSubscribers(): Promise<import('./types').SubscriberItem[]> {
    return this.request<import('./types').SubscriberItem[]>('/subscribers');
  }

  // ── CMS: Alumni ──
  async getAlumni(): Promise<import('./types').AlumniItem[]> {
    return this.request<import('./types').AlumniItem[]>('/alumni');
  }

  async createAlumni(input: import('./types').AlumniInput): Promise<import('./types').AlumniItem> {
    return this.request<import('./types').AlumniItem>('/alumni', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateAlumni(id: string, input: Partial<import('./types').AlumniInput>): Promise<import('./types').AlumniItem> {
    return this.request<import('./types').AlumniItem>(`/alumni/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  }

  async deleteAlumni(id: string): Promise<void> {
    await this.request<void>(`/alumni/${id}`, { method: 'DELETE' });
  }

  // ── CMS: Gallery ──
  async getGallery(): Promise<import('./types').GalleryItem[]> {
    return this.request<import('./types').GalleryItem[]>('/gallery');
  }

  async createGalleryItem(input: import('./types').GalleryInput): Promise<import('./types').GalleryItem> {
    return this.request<import('./types').GalleryItem>('/gallery', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async deleteGalleryItem(id: string): Promise<void> {
    await this.request<void>(`/gallery/${id}`, { method: 'DELETE' });
  }

  // ── CMS: Portfolio Events Media ──
  async getPortfolioMedia(): Promise<import('./types').PortfolioEventMedia[]> {
    return this.request<import('./types').PortfolioEventMedia[]>('/portfolio-events');
  }

  async setPortfolioImage(eventId: string, imageUrl: string): Promise<import('./types').PortfolioEventMedia> {
    return this.request<import('./types').PortfolioEventMedia>('/portfolio-events', {
      method: 'POST',
      body: JSON.stringify({ eventId, imageUrl }),
    });
  }

  async deletePortfolioImage(eventId: string): Promise<void> {
    await this.request<void>(`/portfolio-events/${eventId}`, { method: 'DELETE' });
  }

  // ── CMS: Schedule Items (Day 1 & Day 2 Timeline) ──
  async getScheduleItems(day?: number): Promise<import('./types').ScheduleItem[]> {
    const query = day !== undefined ? `?day=${day}` : '';
    return this.request<import('./types').ScheduleItem[]>(`/cms/schedule${query}`);
  }

  async createScheduleItem(input: import('./types').ScheduleItemInput): Promise<import('./types').ScheduleItem> {
    return this.request<import('./types').ScheduleItem>('/cms/schedule', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateScheduleItem(id: string, input: Partial<import('./types').ScheduleItemInput>): Promise<import('./types').ScheduleItem> {
    return this.request<import('./types').ScheduleItem>(`/cms/schedule/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  }

  async deleteScheduleItem(id: string): Promise<void> {
    await this.request<void>(`/cms/schedule/${id}`, { method: 'DELETE' });
  }

  // ── CMS: Bundle ──
  async getBundle(): Promise<{
    events: import('./types').EventItem[];
    speakers: import('./types').SpeakerItem[];
    scheduleItems: import('./types').ScheduleItem[];
    sponsors: import('./types').SponsorItem[];
    alumni: import('./types').AlumniItem[];
    gallery: import('./types').GalleryItem[];
    portfolioMedia?: import('./types').PortfolioEventMedia[];
  }> {
    return this.request('/cms/bundle');
  }

  // ── Global SiteConfig & Live Announcements ──
  async getSiteConfig(): Promise<SiteConfig> {
    return this.request('/cms/site-config');
  }

  async updateSiteConfig(dto: SiteConfigInput): Promise<SiteConfig> {
    return this.request('/cms/site-config', {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  }

  // ── Storage / Cloudflare R2 Upload ──
  async uploadFile(file: File, folder: string = 'media'): Promise<{ url: string; key: string; storage: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/storage/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const body = await parseBody(res);
    if (!res.ok) {
      throw new ApiError(extractMessage(body, `Upload failed with status ${res.status}`), res.status, body);
    }

    return body as { url: string; key: string; storage: string };
  }
}

export const api = new ApiClient();
export type { CheckInLog };
