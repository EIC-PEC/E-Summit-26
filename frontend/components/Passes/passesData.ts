export interface Deliverable {
  title: string
  desc: string
}

export interface StartupPassPackage {
  id: string
  name: string
  tier: 'silver' | 'gold' | 'diamond'
  price: string
  gstText: string
  tagline: string
  badgeText: string
  accentColor: {
    cardBg: string
    border: string
    titleColor: string
    priceColor: string
    badgeBg: string
    iconBg: string
    iconColor: string
    deliverablesTitleColor: string
    buttonBg: string
  }
  deliverables: Deliverable[]
}

export const STARTUP_PACKAGES: StartupPassPackage[] = [
  {
    id: 'silver',
    name: 'SILVER PASS',
    tier: 'silver',
    price: '₹1,000',
    gstText: '+ GST',
    tagline: 'Experience the Expo, attend keynotes, and build your startup network.',
    badgeText: 'DISCOVERY TIER',
    accentColor: {
      cardBg: 'bg-gradient-to-b from-[#0e3a2e] to-[#061e18]',
      border: 'border-2 border-emerald-400',
      titleColor: 'text-emerald-300',
      priceColor: 'text-emerald-300',
      badgeBg: 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/60 font-black',
      iconBg: 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/60',
      iconColor: 'text-emerald-300',
      deliverablesTitleColor: 'text-emerald-400',
      buttonBg: 'bg-emerald-400 text-black font-black hover:bg-emerald-300',
    },
    deliverables: [
      {
        title: 'Attend Startup Expo & Pitch Showcase',
        desc: 'Explore the expo pavilions and watch startup pitches across stages.',
      },
      {
        title: 'Access to Speaker Sessions & Panels',
        desc: 'Attend all speaker sessions and keynote panels across tracks.',
      },
      {
        title: 'Curated Networking Lunch',
        desc: 'Join the networking lunch with founders, operators and peers.',
      },
      {
        title: 'Access to Open Pitch Stages & Demo Days',
        desc: 'Connect with fellow builders and explore live product demos.',
      },
      {
        title: 'Official Delegate Pass Credentials',
        desc: 'Verified summit attendee pass and delegate badges.',
      },
      {
        title: 'Access to Career & Flea Pavilions',
        desc: 'Explore E-Bazaar trading stalls and student showcase zones.',
      },
      {
        title: 'E-Summit Delegate Kit & Certificate',
        desc: 'Official participation kit and summit delegate certificate.',
      },
    ],
  },
  {
    id: 'gold',
    name: 'GOLD PASS',
    tier: 'gold',
    price: '₹3,500',
    gstText: '+ GST',
    tagline: 'Pitch on Main Stage, meet institutional investors, and get channel branding.',
    badgeText: 'POPULAR',
    accentColor: {
      cardBg: 'bg-gradient-to-b from-[#3d2705] to-[#1c1202]',
      border: 'border-2 border-amber-400',
      titleColor: 'text-amber-400',
      priceColor: 'text-amber-300',
      badgeBg: 'bg-amber-400 text-black font-black border border-amber-300',
      iconBg: 'bg-amber-400/20 text-amber-300 border border-amber-400/60',
      iconColor: 'text-amber-400',
      deliverablesTitleColor: 'text-amber-400',
      buttonBg: 'bg-amber-400 text-black font-black hover:bg-amber-300',
    },
    deliverables: [
      {
        title: '10-Minute Pitch on Main Stage',
        desc: 'Showcase your traction and product opportunities to investors.',
      },
      {
        title: 'Branding Across Key Channels',
        desc: 'Featured logo on summit web page, digital flyers & schedule.',
      },
      {
        title: 'Access to Investor Panel & Circles',
        desc: 'Connect with institutional investors, founders & industry leaders.',
      },
      {
        title: 'Speaker Sessions & Panel Discussions',
        desc: 'Access to all speaker sessions and panel discussions across tracks.',
      },
      {
        title: 'Curated Networking Lunch',
        desc: 'Join the networking lunch with investors, founders & leaders.',
      },
      {
        title: 'Startup Directory Feature',
        desc: 'Official spotlight entry in the PEC E-Summit 2026 startup index.',
      },
      {
        title: '2 All-Access Delegate Passes',
        desc: 'Full summit credentials for co-founders and team leads.',
      },
    ],
  },
  {
    id: 'diamond',
    name: 'DIAMOND PASS',
    tier: 'diamond',
    price: '₹8,000',
    gstText: '+ GST',
    tagline: 'Premium 10×10 Expo stall, campus hiring desk, and VIP investor dinners.',
    badgeText: 'MOST COMPREHENSIVE',
    accentColor: {
      cardBg: 'bg-gradient-to-b from-[#0b3c36] to-[#041c19]',
      border: 'border-2 border-cyan-400',
      titleColor: 'text-cyan-300',
      priceColor: 'text-cyan-300',
      badgeBg: 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/60 font-black',
      iconBg: 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/60',
      iconColor: 'text-cyan-300',
      deliverablesTitleColor: 'text-cyan-400',
      buttonBg: 'bg-cyan-400 text-black font-black hover:bg-cyan-300',
    },
    deliverables: [
      {
        title: 'Premium 10×10 ft Expo Stall',
        desc: 'Prime high-footfall location at Startup Expo showcase.',
      },
      {
        title: '10-Minute Pitch on Main Stage',
        desc: 'Showcase your story, product and funding ask before investor panel.',
      },
      {
        title: 'Hiring Opportunities with PEC Students',
        desc: 'Dedicated on-site talent acquisition & hiring desk.',
      },
      {
        title: 'Branding Across All Channels',
        desc: 'Logo on website, social media, banners & event collaterals.',
      },
      {
        title: 'Access to Investor Panel & Circles',
        desc: 'Direct closed-door connect with angel investors & venture funds.',
      },
      {
        title: 'Speaker Sessions & Keynote Panels',
        desc: 'VIP entry to all keynote auditoriums and panel discussions.',
      },
      {
        title: 'Networking Lunch & High-Tea',
        desc: 'Curated networking lunch with investors, founders & leaders.',
      },
    ],
  },
]

export interface ComparisonFeature {
  name: string
  category: string
  silver: boolean | string
  gold: boolean | string
  diamond: boolean | string
}

export const COMPARISON_FEATURES: ComparisonFeature[] = [
  // Expo & Entry
  {
    name: 'Startup Expo Showcase Attendance',
    category: 'Access & Networking',
    silver: true,
    gold: true,
    diamond: true,
  },
  {
    name: 'Speaker Sessions & Keynote Panels',
    category: 'Access & Networking',
    silver: true,
    gold: true,
    diamond: true,
  },
  {
    name: 'Curated Networking Lunch',
    category: 'Access & Networking',
    silver: true,
    gold: true,
    diamond: true,
  },
  {
    name: 'Summit Delegate Credentials & Kit',
    category: 'Access & Networking',
    silver: true,
    gold: true,
    diamond: true,
  },
  {
    name: 'Open Pitch Stages & Demo Days Access',
    category: 'Access & Networking',
    silver: true,
    gold: true,
    diamond: true,
  },
  {
    name: 'Career & Flea Pavilions Access',
    category: 'Access & Networking',
    silver: true,
    gold: true,
    diamond: true,
  },

  // Pitching & Investors
  {
    name: '10-Minute Pitch on Main Stage',
    category: 'Pitching & Investors',
    silver: false,
    gold: true,
    diamond: true,
  },
  {
    name: 'Closed-Door Investor Panel & Circles',
    category: 'Pitching & Investors',
    silver: false,
    gold: true,
    diamond: true,
  },
  {
    name: 'All-Access Delegate Passes',
    category: 'Pitching & Investors',
    silver: '1 Pass',
    gold: '2 Passes',
    diamond: '4 Passes',
  },

  // Branding & Promotion
  {
    name: 'Digital Branding Across Summit Channels',
    category: 'Branding & Spotlight',
    silver: false,
    gold: true,
    diamond: true,
  },
  {
    name: 'Official Startup Directory Listing',
    category: 'Branding & Spotlight',
    silver: false,
    gold: true,
    diamond: true,
  },

  // Premium Stall & Hiring Desk
  {
    name: 'Dedicated 10×10 ft Premium Expo Stall',
    category: 'Exclusive Perks',
    silver: false,
    gold: false,
    diamond: true,
  },
  {
    name: 'On-Site Hiring Desk with PEC Students',
    category: 'Exclusive Perks',
    silver: false,
    gold: false,
    diamond: true,
  },
  {
    name: 'VIP High-Tea & Closed-Door Dinners',
    category: 'Exclusive Perks',
    silver: false,
    gold: false,
    diamond: true,
  },
]

export interface RegistrationStep {
  number: string
  title: string
  desc: string
}

export const REGISTRATION_STEPS: RegistrationStep[] = [
  {
    number: '01',
    title: 'Select Pass Tier',
    desc: 'Choose your preferred pass tier based on your participation and competition goals.',
  },
  {
    number: '02',
    title: 'Fill Details',
    desc: 'Enter delegate credentials, college affiliation, and relevant focus tracks in under two minutes.',
  },
  {
    number: '03',
    title: 'Instant Booking',
    desc: 'Confirm registration, complete checkout, and receive your digital QR pass immediately.',
  },
  {
    number: '04',
    title: 'Summit Access',
    desc: 'Arrive at PEC Chandigarh on summit day to scan your QR badge and collect your official credentials.',
  },
]

export interface StudentPassItem {
  id: string
  title: string
  price: string
  priceNumber: number
  priceSuffix?: string
  tagline: string
  whatsIncluded: string
  badgeText?: string
  popular?: boolean
  features: string[]
}

export const STUDENT_PASSES: StudentPassItem[] = [
  {
    id: 'free-delegate',
    title: 'Free Delegate Pass',
    price: 'Free',
    priceNumber: 0,
    tagline: 'Expo & Speaker Sessions',
    whatsIncluded: 'Startup expo, speaker sessions, panel discussions',
    features: [
      'Startup expo floor entry',
      'Keynote speaker sessions',
      'Panel discussions with industry leaders',
      'Summit Delegate Kit & Certificate',
    ],
  },
  {
    id: 'all-access',
    title: 'All-Access Pass',
    price: '₹249',
    priceNumber: 249,
    tagline: 'Competitions & Workshops',
    whatsIncluded: 'All other competitions, interns fair, exclusive workshops + delegate access',
    popular: true,
    badgeText: 'MOST POPULAR',
    features: [
      'All other summit competitions',
      'Interns fair entry & recruitment rounds',
      'Exclusive technical & venture workshops',
      'Full delegate access (Expo, Sessions, Panels)',
    ],
  },
  {
    id: 'hackathon',
    title: 'Hackathon Pass',
    price: '₹350',
    priceNumber: 350,
    tagline: '24-Hour Hackathon Sprint',
    whatsIncluded: 'Hackathon participation',
    badgeText: '24-HOUR HACK',
    features: [
      '24-Hour Hackathon arena access',
      'Midnight meals, energy drinks & developer swag',
      '$500+ cloud developer credits & APIs',
      'Mentorship from senior software architects',
    ],
  },
  {
    id: 'ultimate-combo',
    title: 'Ultimate Combo Pass',
    price: '₹499',
    priceNumber: 499,
    tagline: 'All-Inclusive Summit Experience',
    whatsIncluded: 'Hackathon + all competitions + interns fair + workshops + delegate access',
    badgeText: 'BEST VALUE',
    features: [
      '24-Hour Hackathon participation',
      'All other summit competitions',
      'Interns fair priority access',
      'Exclusive hands-on workshops',
      'Full delegate access (Expo, Sessions, Panels)',
    ],
  },
]

export interface StudentComparisonFeature {
  name: string
  free: boolean
  allAccess: boolean
  hackathon: boolean
  combo: boolean
}

export const STUDENT_COMPARISON_FEATURES: StudentComparisonFeature[] = [
  {
    name: 'Startup Expo Floor Access',
    free: true,
    allAccess: true,
    hackathon: false,
    combo: true,
  },
  {
    name: 'Keynote Speaker Sessions',
    free: true,
    allAccess: true,
    hackathon: false,
    combo: true,
  },
  {
    name: 'Founder & Investor Panel Discussions',
    free: true,
    allAccess: true,
    hackathon: false,
    combo: true,
  },
  {
    name: 'All Other Summit Competitions',
    free: false,
    allAccess: true,
    hackathon: false,
    combo: true,
  },
  {
    name: 'Interns Fair & Recruitment Rounds',
    free: false,
    allAccess: true,
    hackathon: false,
    combo: true,
  },
  {
    name: 'Exclusive Hands-on Workshops',
    free: false,
    allAccess: true,
    hackathon: false,
    combo: true,
  },
  {
    name: '24-Hour Hackathon Participation',
    free: false,
    allAccess: false,
    hackathon: true,
    combo: true,
  },
  {
    name: 'Midnight Meals, Energy Drinks & Hacker Swag',
    free: false,
    allAccess: false,
    hackathon: true,
    combo: true,
  },
  {
    name: 'Official Summit ID & Kit',
    free: true,
    allAccess: true,
    hackathon: true,
    combo: true,
  },
]
