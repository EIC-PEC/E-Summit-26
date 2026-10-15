import { GraduationCap, Terminal, Briefcase, Award, Shield, Crown, Gem } from 'lucide-react'

export interface PassTier {
  id: string
  title: string
  category?: 'attendee' | 'startup'
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
    id: 'free-delegate',
    title: 'Free Delegate Pass',
    category: 'attendee',
    tagline: 'Expo & Keynotes',
    desc: 'Startup expo, speaker sessions, panel discussions',
    fee: 0,
    feeLabel: 'FREE',
    badge: 'FREE',
    icon: GraduationCap,
  },
  {
    id: 'all-access',
    title: 'All-Access Pass',
    category: 'attendee',
    tagline: 'Competitions & Workshops',
    desc: 'All other competitions, interns fair, exclusive workshops + delegate access',
    fee: 249,
    feeLabel: '₹249',
    badge: 'POPULAR',
    popular: true,
    icon: Award,
  },
  {
    id: 'hackathon',
    title: 'Hackathon Pass',
    category: 'attendee',
    tagline: '24-Hour Hackathon',
    desc: 'Hackathon participation',
    fee: 350,
    feeLabel: '₹350',
    badge: 'HACKATHON',
    icon: Terminal,
  },
  {
    id: 'ultimate-combo',
    title: 'Ultimate Combo Pass',
    category: 'attendee',
    tagline: 'All-Inclusive Pass',
    desc: 'Hackathon + all competitions + interns fair + workshops + delegate access',
    fee: 499,
    feeLabel: '₹499',
    badge: 'BEST VALUE',
    icon: Crown,
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
