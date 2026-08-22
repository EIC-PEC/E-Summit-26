import { GraduationCap, Terminal, Briefcase, Award } from 'lucide-react'

export interface PassTier {
  id: string
  title: string
  tagline: string
  desc: string
  fee: number
  feeLabel: string
  badge: string
  defaultEventId?: string
  popular?: boolean
  icon: any
}

export const PASS_TIERS: PassTier[] = [
  {
    id: 'student',
    title: 'Student Pass',
    tagline: 'General Access',
    desc: 'Keynotes, keynote panels, open startup expo, and all public workshops.',
    fee: 0,
    feeLabel: 'FREE',
    badge: 'STUDENT PASS',
    defaultEventId: 'ev-2',
    icon: GraduationCap,
  },
  {
    id: 'hackathon',
    title: 'Hackathon Pass',
    tagline: '24-Hour Sprint',
    desc: 'Overnight coding workspace, meals, mentorship, and ₹5L+ prize pool.',
    fee: 199,
    feeLabel: '₹199',
    badge: 'HACKATHON PASS',
    defaultEventId: 'ev-1',
    popular: true,
    icon: Terminal,
  },
  {
    id: 'founder',
    title: 'Pitch Pass',
    tagline: 'Startup Dealroom',
    desc: 'Pitch to VCs, angel investors, expo showcase stall, and 1:1 meetings.',
    fee: 799,
    feeLabel: '₹799',
    badge: 'FOUNDER PASS',
    defaultEventId: 'ev-5',
    icon: Briefcase,
  },
  {
    id: 'ambassador',
    title: 'Ambassador',
    tagline: 'Campus Leader',
    desc: 'Represent your college, get VIP access, leadership certification, and goodies.',
    fee: 0,
    feeLabel: 'FREE',
    badge: 'AMBASSADOR PASS',
    defaultEventId: 'ev-6',
    icon: Award,
  },
]

export const INTEREST_TRACKS = [
  'Artificial Intelligence & ML',
  'Fintech & Venture Finance',
  'Pitch Competitions',
  '24-Hour Hackathons',
  'DeepTech & Robotics',
  'Web3 & Cloud Systems',
]

export const EVENT_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'hackathon', label: 'Hackathons' },
  { id: 'pitch', label: 'Pitch & Startups' },
  { id: 'finance', label: 'Finance' },
  { id: 'workshops', label: 'Workshops' },
]

export interface RegistrationFormData {
  name: string
  email: string
  phone: string
  college: string
  teamName: string
}
