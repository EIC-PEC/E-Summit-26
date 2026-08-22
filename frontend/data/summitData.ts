// data/summitData.ts
// Master Centralized Single-Source-Of-Truth Data Repository for PEC E-Summit 2026

export interface Speaker {
  id: string
  name: string
  role: string
  company: string
  badge: string
  category: 'keynote' | 'panelist' | 'investor' | 'mentor'
  initials: string
  image?: string
  bio: string
  track: string
}

export interface EventItem {
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
  partner?: string
  registrationUrl?: string | null
}


export interface AlumniItem {
  id: string
  name: string
  role: string
  company: string
  batch: string
  achievement: string
  image?: string
}

export interface SponsorItem {
  id: string
  name: string
  tier: 'Title Sponsor' | 'Powered By' | 'Associate Sponsor' | 'Ecosystem Partner'
  logo: string
  category: string
}

export interface FAQItem {
  id: string
  question: string
  answer: string
  category: 'General' | 'Passes' | 'Hackathon' | 'Pitch'
}

export const MASTER_SPEAKERS: Speaker[] = [
  {
    id: 'sp-1',
    name: 'Peyush Bansal',
    role: 'Co-Founder & CEO',
    company: 'Lenskart',
    badge: 'KEYNOTE SPEAKER',
    category: 'keynote',
    initials: 'PB',
    bio: 'Peyush Bansal revolutionized D2C eyewear retail across Asia and has backed 50+ early-stage tech startups.',
    track: 'D2C & Retail Innovation',
  },
  {
    id: 'sp-2',
    name: 'Anupam Mittal',
    role: 'Founder & CEO',
    company: 'People Group (Shaadi.com)',
    badge: 'SHARK INVESTOR',
    category: 'investor',
    initials: 'AM',
    bio: 'Pioneer of consumer internet platforms in India and active angel investor in over 200+ technology companies.',
    track: 'Angel Syndicates & VC Scaling',
  },
  {
    id: 'sp-3',
    name: 'Dr. Ritesh Malik',
    role: 'Founder',
    company: 'Innov8 Coworking',
    badge: 'STARTUP MENTOR',
    category: 'mentor',
    initials: 'RM',
    bio: 'Doctor turned entrepreneur and ecosystem builder focused on prop-tech and healthcare innovation.',
    track: 'Zero to One Scaling',
  },
  {
    id: 'sp-4',
    name: 'Gajendra Jangid',
    role: 'Co-Founder & CMO',
    company: 'CAR24',
    badge: 'PANELIST',
    category: 'panelist',
    initials: 'GJ',
    bio: 'PEC Alumnus scaling auto-tech logistics across international markets.',
    track: 'Growth Strategy & Execution',
  },
  {
    id: 'sp-5',
    name: 'Upasana Taku',
    role: 'Co-Founder & COO',
    company: 'MobiKwik',
    badge: 'FINTECH KEYNOTE',
    category: 'keynote',
    initials: 'UT',
    bio: 'Fintech pioneer leading digital payments infrastructure and financial inclusion for millions.',
    track: 'Fintech Infrastructure',
  },
  {
    id: 'sp-6',
    name: 'Kunwar Sachdev',
    role: 'Founder',
    company: 'Su-Kam Power Systems',
    badge: 'HARDWARE MENTOR',
    category: 'mentor',
    initials: 'KS',
    bio: 'Solar energy and hardware manufacturing pioneer in North India.',
    track: 'Hardware & CleanTech Manufacturing',
  },
]

export const MASTER_EVENTS: EventItem[] = [
  {
    id: 'ev-1',
    number: '01',
    title: 'E-Summit Hackathon',
    category: 'Hackathon',
    eyebrow: '24-HOUR HACKATHON',
    image: '/gallery/pec_pitch_table.png',
    purpose: 'Build working software, AI workflows, and tech prototypes with mentorship from industry engineers.',
    delivery: '24-Hour continuous sprint, mentor checkpoint reviews, and live product demos before judges.',
    expectedParticipation: '500+ Hackers across 120 Teams',
    tags: ['AI & ML', 'Full-Stack', 'Open Source', '₹5.0L Prize Pool'],
    partner: 'Google Cloud & GitHub',
  },
  {
    id: 'ev-2',
    number: '02',
    title: 'Startup Internship & Career Fair',
    category: 'Career Fair',
    eyebrow: 'TALENT RECRUITMENT',
    image: '/gallery/pec_startup_fair.png',
    purpose: 'Direct recruitment drive connecting venture-backed startups and tech firms with top PEC engineering talent.',
    delivery: 'On-spot resume reviews, technical interviews, and internship/PPO opportunities.',
    expectedParticipation: '800+ Applicants across 35+ Companies',
    tags: ['Job Offers', 'Paid Internships', 'Direct Hiring'],
    partner: 'PEC Training & Placement Cell',
  },
  {
    id: 'ev-3',
    number: '03',
    title: 'R&D Innovation Conclave',
    category: 'Deep Tech',
    eyebrow: 'RESEARCH & PATENTS',
    image: '/gallery/pec_senate_roundtable.png',
    purpose: 'Showcasing commercializable research patents, hardware prototypes, and engineering lab innovations to venture mentors.',
    delivery: 'Prototype showcase, research poster presentations, and commercialization roundtables.',
    expectedParticipation: '40+ Research Projects',
    tags: ['Patents', 'Deep Tech', 'Commercialization'],
    partner: 'PEC Research & Consultation Wing',
  },
  {
    id: 'ev-4',
    number: '04',
    title: 'IPL Auction Strategy Challenge',
    category: 'Strategy & Finance',
    eyebrow: 'VALUATION & BIDDING',
    image: '/gallery/pec_pitch.jpg',
    purpose: 'Strategic simulation testing budget allocation, player valuation, team balance, and live bidding tactics.',
    delivery: 'Live simulated auction hall with real-time bidding rounds and squad optimization metrics.',
    expectedParticipation: '60+ Bidding Squads',
    tags: ['Live Auction', 'Budget Strategy', '₹1.0L Prize'],
    partner: 'PEC Sports & Finance Club',
  },
  {
    id: 'ev-5',
    number: '05',
    title: 'Ignite: Early-Stage Pitch',
    category: 'Pitch Competition',
    eyebrow: 'IDEA STAGE',
    image: '/gallery/pec_innovation_stage.png',
    purpose: 'Fast-paced elevator pitch competition for student founders and early-stage concepts.',
    delivery: '3-minute pitch followed by 2 minutes of direct Q&A and actionable feedback from angel investors.',
    expectedParticipation: '100+ Early Concepts',
    tags: ['Elevator Pitch', 'Angel Feedback', 'Grant Pool'],
    partner: 'Chandigarh Angels Network',
  },
  {
    id: 'ev-6',
    number: '06',
    title: 'Campus Treasure Hunt',
    category: 'Campus Quest',
    eyebrow: 'INTERACTIVE CHALLENGE',
    image: '/gallery/pec_lawn_mosaic.png',
    purpose: 'Campus-wide problem-solving quest exploring historic PEC landmarks and startup puzzle clues.',
    delivery: 'Time-bound clue checkpoints across campus with team leaderboards.',
    expectedParticipation: '600+ Participants',
    tags: ['Team Quest', 'Campus Challenge', 'Merchandise'],
    partner: 'PEC Student Council',
  },
  {
    id: 'ev-7',
    number: '07',
    title: 'E-Bazaar: Startup & Flea Market',
    category: 'Marketplace',
    eyebrow: 'STUDENT VENTURES',
    image: '/gallery/pec_group.png',
    purpose: 'Open-air marketplace for student-run D2C brands, artisanal products, and food pop-ups.',
    delivery: '2-Day dedicated exhibition area with thousands of attendee walk-ins.',
    expectedParticipation: '25+ Student Ventures',
    tags: ['D2C Pop-ups', 'Student Stalls', 'Live Sales'],
    partner: 'E-Cell PEC Community',
  },
  {
    id: 'ev-8',
    number: '08',
    title: 'BizTech: Business & Venture Quiz',
    category: 'Quiz Arena',
    eyebrow: 'BUSINESS & TECH TRIVIA',
    image: '/gallery/pec_senate_hall.png',
    purpose: 'Competitive business, tech industry history, and venture capital quiz challenge.',
    delivery: 'Buzzer rounds, rapid-fire trivia, and case identification stages.',
    expectedParticipation: '150+ Quiz Teams',
    tags: ['Brand Trivia', 'Venture Quiz', 'Cash Awards'],
    partner: 'SAASC PEC',
  },
  {
    id: 'ev-9',
    number: '09',
    title: 'Policy & Economic Conclave',
    category: 'Policy & Economics',
    eyebrow: 'MACRO DISCUSSION',
    image: '/gallery/pec_auditorium.png',
    purpose: 'Debate and discussion on macroeconomic trends, startup policy reforms, and digital public infrastructure.',
    delivery: 'Structured panel discussions followed by audience Q&A.',
    expectedParticipation: '200+ Competitors',
    tags: ['Policy', 'Economics', 'Case Review'],
    partner: 'SAASC PEC',
  },
  {
    id: 'ev-10',
    number: '10',
    title: 'Campus Ambassador Network',
    category: 'Leadership',
    eyebrow: 'STUDENT LEADERSHIP',
    image: '/gallery/pec_team.png',
    purpose: 'Pan-India student outreach program driving summit awareness and registrations across 50+ universities.',
    delivery: 'Campus initiatives, referral milestones, leadership recognition, and VIP passes.',
    expectedParticipation: '150+ Campus Ambassadors',
    tags: ['Leadership', 'Outreach', 'Certificates'],
    partner: 'E-Cell PEC Outreach Wing',
  },
  {
    id: 'ev-11',
    number: '11',
    title: 'Keynote Sessions & Fireside Chats',
    category: 'Keynotes',
    eyebrow: 'FOUNDER KEYNOTES',
    image: '/gallery/pec_keynote_speaker.png',
    purpose: 'Keynote talks and fireside conversations with unicorn founders, investors, and industry leaders.',
    delivery: 'Main Auditorium sessions followed by interactive audience Q&A.',
    expectedParticipation: '1,500+ Attendees',
    tags: ['Founders', 'Fireside Chats', 'Q&A'],
    partner: 'PEC Alumni Association',
  },
  {
    id: 'ev-12',
    number: '12',
    title: 'The Ten-Minute Pitch: VC Dealroom',
    category: 'Venture Capital',
    eyebrow: 'INVESTOR DEALROOM',
    image: '/gallery/pec_funding_conclave.png',
    purpose: 'Closed-door pitching conclave connecting revenue-stage and high-traction student startups with VC funds.',
    delivery: 'Curated 1-on-1 pitch presentations and term-sheet discussions.',
    expectedParticipation: '20+ Top VCs & Angel Networks',
    tags: ['Term Sheets', 'VC Pitch', 'Due Diligence'],
    partner: 'Chandigarh Angels Network & VCs',
  },
  {
    id: 'ev-13',
    number: '13',
    title: 'Case Crack: Harvard Business Challenge',
    category: 'Case Competition',
    eyebrow: 'STRATEGY CASE',
    image: '/gallery/pec_admin_building.jpg',
    purpose: 'Solve real-world corporate growth, market expansion, and business turnaround cases.',
    delivery: 'Case presentation defense before management consultants and startup operators.',
    expectedParticipation: '50+ Case Squads',
    tags: ['Strategy', 'Consulting Case', '₹1.5L Pool'],
    partner: 'PEC Consulting & Management Group',
  },
]

export const MASTER_ALUMNI: AlumniItem[] = [
  {
    id: 'al-1',
    name: 'Gajendra Jangid',
    role: 'Co-Founder & CMO',
    company: 'CARS24',
    batch: 'Batch of 2005',
    achievement: 'Scaled CARS24 to a $3.3B+ valuation unicorn across 4 countries.',
  },
  {
    id: 'al-2',
    name: 'Padmasree Warrior',
    role: 'Founder & CEO',
    company: 'Fable',
    batch: 'Batch of 1982',
    achievement: 'Former CTO of Cisco & Motorola; Board member at Microsoft and Spotify.',
  },
  {
    id: 'al-3',
    name: 'Steve Sanghi',
    role: 'Executive Chairman',
    company: 'Microchip Technology',
    batch: 'Batch of 1975',
    achievement: 'Led Microchip Technology from early stage to a $40B+ Nasdaq semiconductor giant.',
  },
]

export const MASTER_SPONSORS: SponsorItem[] = [
  {
    id: 'sp-1',
    name: 'Google Cloud',
    tier: 'Title Sponsor',
    logo: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
    category: 'Cloud Infrastructure',
  },
  {
    id: 'sp-2',
    name: 'GitHub',
    tier: 'Powered By',
    logo: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Logo.png',
    category: 'Developer Ecosystem',
  },
  {
    id: 'sp-3',
    name: 'Razorpay',
    tier: 'Associate Sponsor',
    logo: 'https://razorpay.com/assets/razorpay-glyph.svg',
    category: 'Fintech Infrastructure',
  },
]

export const MASTER_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Who can attend PEC E-Summit 2026?',
    answer: 'E-Summit is open to student founders, developers, creators, aspiring entrepreneurs, and industry professionals from across India.',
    category: 'General',
  },
  {
    id: 'faq-2',
    question: 'Are registration passes free?',
    answer: 'General Student Passes and Campus Ambassador Passes are 100% FREE. Specialized passes like Startup Founder & Hackathon passes have small entry fees for prize pools.',
    category: 'Passes',
  },
  {
    id: 'faq-3',
    question: 'How do I check in at the venue on March 15-16?',
    answer: 'Once you register, your digital E-Badge with a unique QR code is generated instantly. Show your digital badge on your phone at PEC gate entry for volunteer scanning.',
    category: 'Passes',
  },
  {
    id: 'faq-4',
    question: 'What are the cash prizes for competitions?',
    answer: 'The Pitchers Pitch competition features a total prize pool of ₹7.5 Lakhs in non-dilutive equity grants. The 24-Hour Hackathon features a prize pool of ₹5.0 Lakhs.',
    category: 'Pitch',
  },
  {
    id: 'faq-6',
    question: 'Are accommodation options available for outstation participants?',
    answer: 'Yes, subsidized hostel accommodation and campus guest house rooms are allocated on a first-come, first-served basis upon presentation of an active E-Summit registration pass.',
    category: 'General',
  },
]

export const MASTER_CONTACTS = {
  faculty: [
    { role: 'Faculty Coordinator', name: 'Dr. Simranjit Singh', phone: '+91 98725 52898' },
    { role: 'Faculty Co-coordinator', name: 'Dr. Sudesh Rani', phone: '+91 98768 60085' },
  ],
  studentLeadership: [
    { role: 'Student Convener', name: 'Simarpreet Kaur', phone: '+91 84271 46574' },
    { role: 'Student Co-convener', name: 'Shubham Mangal', phone: '+91 78349 75811' },
    { role: 'Student Co-convener', name: 'Vedansh Singh', phone: '+91 88268 73264' },
    { role: 'Marketing Head', name: 'Japneet Pathania', phone: '+91 85449 18700' },
  ],
  location: 'Entrepreneurship & Incubation Cell - Incubator (Near Siemens Lab), Punjab Engineering College, Sector-12 (160012), Chandigarh',
  emails: ['eicpec@pec.edu.in', 'esummitpr.pec@gmail.com'],
}
