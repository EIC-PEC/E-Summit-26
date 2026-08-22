// lib/api-types.ts
// Hand-mirrored response shapes from E_Summit_Backend (/api/v1).
// Keep in sync with the NestJS DTOs/services.

export type Role = 'SUPER_ADMIN' | 'ORGANIZER' | 'VOLUNTEER_CHECKIN' | 'INVESTOR' | 'DELEGATE'

export type PassType =
  | 'STUDENT_GENERAL'
  | 'FOUNDER_PITCH'
  | 'HACKATHON_BUILDER'
  | 'CAMPUS_AMBASSADOR'

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED'

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface PublicUser {
  id: string
  email: string
  name: string
  phone: string | null
  college: string | null
  gradYear: string | null
  city: string | null
  role: Role
  referralCode: string | null
  createdAt: string
}

export interface AuthResponse {
  user: PublicUser
  accessToken: string
}

// ─── Passes & Registration ────────────────────────────────────────────────────

export interface PassCatalogEntry {
  id: string
  enumType: PassType
  title: string
  tagline: string
  feeAmount: number
  feeDisplay: string
  badgeTitle: string
  category: 'student' | 'founder' | 'group' | 'ambassador'
  features: string[]
  popular?: boolean
  totalIssued: number
}

export interface FormattedRegistration {
  id: string
  passId: string
  passType: PassType
  categoryTitle: string
  badgeTitle: string
  amountPaid: number
  isCheckedIn: boolean
  tracks: string[]
  qrToken: string
  qrCodeDataUrl: string
  createdAt: string
  user: { id: string; name: string; email: string; college: string | null; phone: string | null }
  payment: { orderId: string; status: PaymentStatus; amount: number } | null
}

export interface CreateRegistrationDto {
  name: string
  email: string
  phone?: string
  college?: string
  gradYear?: string
  city?: string
  passType: PassType
  tracks?: string[]
  referralCode?: string
}

export interface CreateRegistrationResponse {
  registration: FormattedRegistration
  isPaymentRequired: boolean
  catalogInfo: PassCatalogEntry
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export interface CreateOrderResponse {
  orderId: string
  amount: number
  amountInPaisa: number
  currency: string
  passId: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  razorpayKeyId: string
}

export interface VerifyPaymentResponse {
  success: boolean
  message: string
  payment: {
    id: string
    orderId: string
    transactionId: string | null
    amount: number
    currency: string
    status: PaymentStatus
  }
}

// ─── CMS Content Types ────────────────────────────────────────────────────────

export interface SiteConfig {
  id: string
  heroTitle: string
  heroSubtitle: string
  summitDates: string
  summitVenue: string
  heroVideoUrl: string | null
  announcementText: string | null
  announcementLink: string | null
  stats: Record<string, string>
  contacts: {
    faculty?: Array<{ role: string; name: string; phone: string }>
    studentLeadership?: Array<{ role: string; name: string; phone: string }>
    location?: string
    emails?: string[]
  }
  updatedAt: string
}

export interface CmsEvent {
  id: string
  number: string
  title: string
  category: string
  eyebrow: string
  image: string
  purpose: string
  delivery: string
  expectedParticipation: string
  tags: string[]
  partner: string | null
  registrationUrl: string | null
  // Schedule fields
  type: string
  track: string | null
  day: number
  startTime: string
  endTime: string
  venue: string
  speakerIds: string[]
  order: number
  createdAt: string
  updatedAt: string
}

export interface CmsSpeaker {
  id: string
  name: string
  title: string
  role: string
  company: string
  badge: string
  category: string
  bio: string
  track: string
  avatarUrl: string | null
  initials: string
  color: string
  linkedin: string | null
  twitter: string | null
  order: number
  createdAt: string
  updatedAt: string
}

export interface CmsScheduleItem {
  id: string
  day: number
  date: string
  time: string
  title: string
  tag: string
  venueId: string
  venueName: string
  building: string
  lat: number
  lng: number
  order: number
  createdAt: string
  updatedAt: string
}

export interface CmsSponsor {
  id: string
  name: string
  tier: string
  logoUrl: string | null
  websiteUrl: string | null
  category: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface CmsAlumni {
  id: string
  name: string
  batch: string
  role: string
  company: string
  valuation: string | null
  achievement: string
  bio: string
  imageUrl: string | null
  linkedin: string | null
  order: number
  createdAt: string
  updatedAt: string
}

export interface CmsFaq {
  id: string
  question: string
  answer: string
  category: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface CmsGalleryItem {
  id: string
  title: string | null
  imageUrl: string
  mediaType: string
  slot: number
  createdAt: string
}

export interface PortfolioEventMedia {
  id: string
  eventId: string
  imageUrl: string
  createdAt?: string
  updatedAt?: string
}

/** Single-request bundle returned by GET /api/v1/cms/bundle */
export interface CmsBundle {
  siteConfig: SiteConfig
  events: CmsEvent[]
  speakers: CmsSpeaker[]
  scheduleItems: CmsScheduleItem[]
  sponsors: CmsSponsor[]
  alumni: CmsAlumni[]
  faqs: CmsFaq[]
  gallery: CmsGalleryItem[]
  portfolioMedia?: PortfolioEventMedia[]
}

export interface SubscribeResponse {
  success: boolean
  message: string
}

// Keep legacy aliases for parts of the codebase still using old names
export type BackendEvent = CmsEvent
export type BackendSpeaker = CmsSpeaker
export type BackendSponsor = CmsSponsor
