export type Role = 'SUPER_ADMIN' | 'ORGANIZER' | 'VOLUNTEER_CHECKIN' | 'INVESTOR' | 'DELEGATE';

export type PassType = 
  | 'STUDENT_GENERAL' 
  | 'FOUNDER_PITCH' 
  | 'HACKATHON_BUILDER' 
  | 'CAMPUS_AMBASSADOR';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export type CompetitionType = 'PITCH_COMPETITION' | 'HACKATHON';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  college?: string | null;
  gradYear?: string | null;
  city?: string | null;
  role: Role;
  referralCode?: string | null;
  createdAt: string;
}

export interface Registration {
  id: string;
  passId: string;
  passType: PassType;
  amountPaid: number;
  isCheckedIn: boolean;
  tracks: string[];
  createdAt: string;
  badgePdfUrl?: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    college?: string | null;
    role: Role;
  };
  payment?: {
    orderId: string;
    transactionId?: string | null;
    status: PaymentStatus;
  } | null;
}

export interface AnalyticsOverview {
  totalDelegates: number;
  targetDelegates: number;
  totalRevenue: number;
  totalCheckIns: number;
  totalTeams: number;
  targetPercentage?: number;
  checkInPercentage?: number;
}


export interface AnalyticsData {
  overview: AnalyticsOverview;
  passTypeDistribution: { passType: PassType; count: number }[];
  collegeBreakdown: { college: string; count: number }[];
  recentRegistrations: {
    id: string;
    passId: string;
    passType: PassType;
    delegateName: string;
    delegateEmail: string;
    college?: string | null;
    isCheckedIn: boolean;
    amountPaid: number;
    createdAt: string;
  }[];
}

export interface CampusAmbassador {
  id: string;
  name: string;
  email: string;
  college?: string | null;
  referralCode: string;
  totalReferrals: number;
  confirmedSignups: number;
  tier: 'GOLD_AMBASSADOR' | 'SILVER_AMBASSADOR' | 'BRONZE_AMBASSADOR';
}

export interface Submission {
  id: string;
  teamId: string;
  title: string;
  description: string;
  repoUrl?: string | null;
  demoUrl?: string | null;
  deckPdfUrl?: string | null;
  submittedAt: string;
}

export interface Score {
  id: string;
  teamId: string;
  judgeId: string;
  innovation: number;
  execution: number;
  marketSize: number;
  presentation: number;
  comments?: string | null;
  createdAt: string;
  judge?: {
    name: string;
    email: string;
  };
}

export interface TeamMember {
  id: string;
  userId: string;
  role: string;
  user: {
    name: string;
    email: string;
    college?: string | null;
  };
}

export interface Team {
  id: string;
  name: string;
  code: string;
  type: CompetitionType;
  trackName: string;
  leaderId: string;
  members: TeamMember[];
  submission?: Submission | null;
  scores: Score[];
  createdAt: string;
  averageScore?: number;
  totalScore?: number;
}

export interface CheckInLog {
  id: string;
  userId?: string;
  userName: string;
  passId: string;
  passType: PassType | string;
  gateName: string;
  scannedBy?: string;
  timestamp: string;
}

export interface CheckInStatsResponse {
  stats: Record<string, number>;
  recent: CheckInLog[];
}

export interface SubscriberItem {
  id: string;
  email: string;
  createdAt: string;
}

/**
 * Response shape actually returned by POST /checkin/verify-qr on success.
 * The backend returns a flat delegate summary here, not a full Registration.
 */
export interface CheckInSuccessResult {
  passId: string;
  delegateName: string;
  delegateEmail?: string;
  delegateCollege?: string | null;
  passType: string;
  badgeTitle?: string;
  gateName: string;
  timestamp: string;
}

/** Body of the 409 Conflict thrown by POST /checkin/verify-qr on re-scan. */
export interface CheckInConflictInfo {
  message: string;
  passId?: string;
  delegateName?: string;
  delegateCollege?: string | null;
  previousCheckIn?: { gateName: string; timestamp: string } | null;
}

/** One row of POST /checkin/manual-lookup's `results` list (browse mode). */
export interface ManualLookupMatch {
  id: string;
  passId: string;
  passType: string;
  isCheckedIn: boolean;
  delegateName: string;
  delegateEmail: string;
  delegateCollege?: string | null;
  delegatePhone?: string | null;
  createdAt: string;
}

/**
 * Known event types used for the CMS type dropdown. The backend only
 * validates `type` as a non-empty string (see CreateEventDto), so seeded
 * data may include values outside this list (e.g. 'logistics', 'expo',
 * 'networking') — `EventItem.type` is typed as `string` to allow for that.
 */
export const EVENT_TYPES = [
  'keynote',
  'panel',
  'competition',
  'hackathon',
  'social',
  'logistics',
  'expo',
  'networking',
] as const;

export interface EventItem {
  id: string;
  title: string;
  type: string;
  track?: string;
  day: 1 | 2;
  startTime: string;
  endTime: string;
  venue: string;
  speakerIds: string[];
}

/** Body accepted by POST /events; PUT /events/:id accepts Partial<EventInput>. */
export interface EventInput {
  title: string;
  type: string;
  track?: string;
  day: 1 | 2;
  startTime: string;
  endTime: string;
  venue: string;
  speakerIds?: string[];
}

export interface ScheduleItem {
  id: string;
  day: number;
  date: string;
  time: string;
  title: string;
  tag: string;
  venueId: string;
  venueName: string;
  building: string;
  lat: number;
  lng: number;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScheduleItemInput {
  day: number;
  date: string;
  time: string;
  title: string;
  tag: string;
  venueId: string;
  venueName: string;
  building: string;
  lat: number;
  lng: number;
  order?: number;
}

export interface SpeakerItem {
  id: string;
  name: string;
  title: string;
  bio: string;
  track: string;
  avatarUrl?: string;
  initials: string;
  color: string;
}

/** Body accepted by POST /speakers; PUT /speakers/:id accepts Partial<SpeakerInput>. */
export interface SpeakerInput {
  name: string;
  title: string;
  bio: string;
  track: string;
  initials: string;
  avatarUrl?: string;
  color?: string;
}

export interface SponsorItem {
  id: string;
  tier: 'title' | 'gold' | 'silver' | 'media';
  name: string;
  logoUrl?: string;
  websiteUrl?: string;
}

/** Body accepted by POST /sponsors. There is no update endpoint for sponsors. */
export interface SponsorInput {
  tier: SponsorItem['tier'];
  name: string;
  logoUrl?: string;
  websiteUrl?: string;
}

export interface HealthStatus {
  status: string;
  uptimeSeconds?: number;
  timestamp?: string;
  dependencies?: {
    database: string;
  };
}


export interface ExpoBooth {
  id: string;
  boothNumber: string;
  startupName?: string;
  founderName?: string;
  sector?: string;
  stage?: 'Pre-Seed' | 'Seed' | 'Series A' | 'Bootstrapped';
  status: 'ASSIGNED' | 'VACANT' | 'RESERVED_VIP';
  description?: string;
}

export interface InvestorSlot {
  id: string;
  timeSlot: string; // e.g. "10:00 AM - 10:15 AM"
  investorName: string;
  investorFirm: string;
  assignedStartup?: string;
  status: 'BOOKED' | 'AVAILABLE';
  meetingRoom: string;
}

export interface AlumniItem {
  id: string;
  name: string;
  batch: string;
  role: string;
  company: string;
  valuation?: string;
  achievement: string;
  bio: string;
  imageUrl?: string;
  linkedin?: string;
  createdAt?: string;
}

export interface AlumniInput {
  name: string;
  batch: string;
  role: string;
  company: string;
  valuation?: string;
  achievement: string;
  bio: string;
  imageUrl?: string;
  linkedin?: string;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  title?: string;
  slot?: number;
  createdAt?: string;
}

export interface GalleryInput {
  imageUrl: string;
  title?: string;
  slot?: number;
}

export interface PortfolioEventMedia {
  id: string;
  eventId: string;
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteConfig {
  id: string;
  heroTitle: string;
  heroSubtitle: string;
  summitDates: string;
  summitVenue: string;
  heroVideoUrl?: string | null;
  announcementText?: string | null;
  announcementLink?: string | null;
  stats?: Record<string, string> | null;
  contacts?: Record<string, unknown> | null;
  updatedAt?: string;
}

export interface SiteConfigInput {
  heroTitle?: string;
  heroSubtitle?: string;
  summitDates?: string;
  summitVenue?: string;
  heroVideoUrl?: string;
  announcementText?: string;
  announcementLink?: string;
  stats?: Record<string, string>;
  contacts?: Record<string, unknown>;
}

