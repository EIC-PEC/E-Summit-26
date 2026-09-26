'use client'

import React, { useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion, useScroll, useMotionValue } from 'framer-motion'
import BlurImage from '@/components/ui/BlurImage'

import { Linkedin, ExternalLink, Award, Building2, Sparkles, ArrowUpRight } from 'lucide-react'
import PixelTransition from '@/components/ui/PixelTransition'
import { useAlumni } from '@/hooks/useSummitData'
import type { CmsAlumni } from '@/lib/api-types'

interface AlumniMember {
  id: string
  name: string
  batch: string
  role: string
  company: string
  valuation?: string
  achievement: string
  bio: string
  imageUrl: string
  linkedin: string
}

const ALUMNI_DATA: AlumniMember[] = [
  {
    id: 'alumni-0a',
    name: 'Kalpana Chawla',
    batch: "PEC '82",
    role: 'Astronaut & Aerospace Pioneer',
    company: 'NASA',
    valuation: 'Congressional Space Medal of Honor',
    achievement: 'First Indian-Born Woman in Space',
    bio: 'Pioneering astronaut and aeronautical engineer who inspired generations of innovators and space explorers worldwide.',
    imageUrl: 'https://res.cloudinary.com/dxtvq5s2x/image/upload/v1790450613/esummit/alumni/OIP.webp',
    linkedin: 'https://linkedin.com/company/ecell-pec',
  },
  {
    id: 'alumni-0b',
    name: 'Satish Dhawan',
    batch: "PEC '38",
    role: 'Former Chairman',
    company: 'ISRO',
    valuation: 'Father of Indian Fluid Dynamics',
    achievement: 'Architect of India’s Space Program',
    bio: 'Legendary aerospace scientist who spearheaded India’s indigenous space launch vehicle and satellite programs.',
    imageUrl: 'https://res.cloudinary.com/dxtvq5s2x/image/upload/v1790450614/esummit/alumni/OIP__1__jpg.jpg',
    linkedin: 'https://linkedin.com/company/ecell-pec',
  },
  {
    id: 'alumni-1',
    name: 'Gajendra Jangid',
    batch: "PEC '05",
    role: 'Co-Founder & CMO',
    company: 'CARS24',
    valuation: '$3.3B Unicorn',
    achievement: 'Forbes Global Entrepreneur',
    bio: 'Pioneered auto-tech logistics in India, scaling CARS24 from a seed idea to a multi-billion dollar international marketplace.',
    imageUrl: 'https://res.cloudinary.com/dxtvq5s2x/image/upload/v1790450622/esummit/alumni/1786383606538.png',
    linkedin: 'https://linkedin.com/company/ecell-pec',
  },
  {
    id: 'alumni-2',
    name: 'Padmasree Warrior',
    batch: "PEC '82",
    role: 'Founder & CEO, Fable',
    company: 'Ex-CTO Cisco & Motorola',
    valuation: 'Fortune Most Powerful Women',
    achievement: 'Microsoft & Spotify Board Member',
    bio: 'Global technology icon. Served as Chief Technology Officer at Cisco and Motorola, currently leading digital reading platform Fable.',
    imageUrl: 'https://res.cloudinary.com/dxtvq5s2x/image/upload/v1790450616/esummit/alumni/OIP__3__jpg.jpg',
    linkedin: 'https://linkedin.com/company/ecell-pec',
  },
  {
    id: 'alumni-3',
    name: 'Steve Sanghi',
    batch: "PEC '75",
    role: 'Executive Chairman',
    company: 'Microchip Technology',
    valuation: '$40B+ Nasdaq Giant',
    achievement: 'Semiconductor Executive of the Decade',
    bio: 'Transformed Microchip Technology from near-bankruptcy into a global semiconductor leader with 30+ consecutive years of profitability.',
    imageUrl: 'https://res.cloudinary.com/dxtvq5s2x/image/upload/v1790450618/esummit/alumni/OIP__4__jpg.jpg',
    linkedin: 'https://linkedin.com/company/ecell-pec',
  },
  {
    id: 'alumni-4',
    name: 'Kunwar Sachdev',
    batch: "PEC '84",
    role: 'Founder & Innovator',
    company: 'Su-Kam Power Systems',
    valuation: 'Solar Man of India',
    achievement: 'Ernst & Young Entrepreneur of the Year',
    bio: 'Revolutionized power backup and solar renewable systems across South Asia, Africa, and the Middle East.',
    imageUrl: 'https://res.cloudinary.com/dxtvq5s2x/image/upload/v1787412302/esummit/gallery/pec_admin_building.png',
    linkedin: 'https://linkedin.com/company/ecell-pec',
  },
  {
    id: 'alumni-5',
    name: 'Dr. Ritesh Malik',
    batch: 'Mentor & Partner',
    role: 'Founder',
    company: 'Innov8 Coworking',
    valuation: 'Angel Investor in 80+ Startups',
    achievement: 'Forbes 30 Under 30 Asia',
    bio: 'Doctor turned serial entrepreneur and startup ecosystem builder. Scaled Innov8 to exit and actively mentors student founders across India.',
    imageUrl: 'https://res.cloudinary.com/dxtvq5s2x/image/upload/v1787412331/esummit/gallery/pec_senate_roundtable.png',
    linkedin: 'https://linkedin.com/company/ecell-pec',
  },
  {
    id: 'alumni-6',
    name: 'Jaspal Bhatti',
    batch: "PEC '78",
    role: 'Satirist & Media Pioneer',
    company: 'Flop Show & Media Studio',
    valuation: 'Padma Bhushan Awardee',
    achievement: 'PEC Electrical Engineering Alum',
    bio: 'Legendary satirist, filmmaker, and cultural icon who pioneered independent broadcast television and creative media production in India.',
    imageUrl: 'https://res.cloudinary.com/dxtvq5s2x/image/upload/v1790450615/esummit/alumni/OIP__2__jpg.jpg',
    linkedin: 'https://linkedin.com/company/ecell-pec',
  },
  {
    id: 'alumni-7',
    name: 'Prof. Vijay K. Dhir',
    batch: "PEC '65",
    role: 'Former Dean of Engineering',
    company: 'UCLA Samueli School',
    valuation: 'National Academy of Engineering',
    achievement: 'Distinguished Academic Leader',
    bio: 'Renowned researcher in thermal sciences and space shuttle heat-shield physics. Led UCLA Engineering to top-tier global research ranking.',
    imageUrl: 'https://res.cloudinary.com/dxtvq5s2x/image/upload/v1790450619/esummit/alumni/OIP__6__jpg.jpg',
    linkedin: 'https://linkedin.com/company/ecell-pec',
  },
  {
    id: 'alumni-8',
    name: 'D.C. Anand',
    batch: "PEC '52",
    role: 'Founder & Chairman',
    company: 'ANAND Group India',
    valuation: 'Automotive Industry Titan',
    achievement: 'Pioneer of Auto Tier-1 in India',
    bio: 'Pioneered precision automotive component manufacturing in India, building a conglomerate of 19 companies partnering with global OEMs.',
    imageUrl: 'https://res.cloudinary.com/dxtvq5s2x/image/upload/v1787412333/esummit/gallery/pec_startup_fair.png',
    linkedin: 'https://linkedin.com/company/ecell-pec',
  },
]

export default function AlumniSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const xMotion = useMotionValue(0)

  const { alumni: cmsAlumni } = useAlumni()

  // Merge: CMS entries (real data) override static entries by index for real names/companies;
  // static fallback entries fill the rest so the carousel always has rich imagery.
  const displayData: AlumniMember[] =
    Array.isArray(cmsAlumni) && cmsAlumni.length > 0
      ? ALUMNI_DATA.map((staticEntry, i) => {
        const cmsEntry: CmsAlumni | undefined = cmsAlumni[i]
        if (!cmsEntry) return staticEntry
        return {
          ...staticEntry,
          name: cmsEntry.name,
          batch: cmsEntry.batch,
          role: cmsEntry.role,
          company: cmsEntry.company,
          valuation: cmsEntry.valuation ?? staticEntry.valuation,
          achievement: cmsEntry.achievement,
          bio: cmsEntry.bio || staticEntry.bio,
          imageUrl: cmsEntry.imageUrl ?? staticEntry.imageUrl,
          linkedin: cmsEntry.linkedin ?? staticEntry.linkedin,
        }
      })
    : ALUMNI_DATA

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const maxScrollRef = useRef(0)

  useEffect(() => {
    const updateMaxScroll = () => {
      if (trackRef.current) {
        maxScrollRef.current = Math.max(0, trackRef.current.scrollWidth - window.innerWidth)
      }
    }

    updateMaxScroll()
    window.addEventListener('resize', updateMaxScroll, { passive: true })

    const unsubscribe = scrollYProgress.on('change', (progress) => {
      xMotion.set(-progress * maxScrollRef.current)
    })

    return () => {
      window.removeEventListener('resize', updateMaxScroll)
      unsubscribe()
    }
  }, [scrollYProgress, xMotion])

  return (
    <section
      id="alumni"
      ref={containerRef}
      className="relative h-[380vh] bg-section-2 text-white rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 z-10 border-t border-mint/20"
    >
      {/* Cyber Geometric Capsule Pattern */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-25"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='105' viewBox='0 0 80 105'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='death-star' fill='%2300F2B2' fill-opacity='0.08'%3E%3Cpath d='M20 10a5 5 0 0 1 10 0v50a5 5 0 0 1-10 0V10zm15 35a5 5 0 0 1 10 0v50a5 5 0 0 1-10 0V45zM20 75a5 5 0 0 1 10 0v20a5 5 0 0 1-10 0V75zm30-65a5 5 0 0 1 10 0v50a5 5 0 0 1-10 0V10zm0 65a5 5 0 0 1 10 0v20a5 5 0 0 1-10 0V75zM35 10a5 5 0 0 1 10 0v20a5 5 0 0 1-10 0V10zM5 45a5 5 0 0 1 10 0v50a5 5 0 0 1-10 0V45zm0-35a5 5 0 0 1 10 0v20a5 5 0 0 1-10 0V10zm60 35a5 5 0 0 1 10 0v50a5 5 0 0 1-10 0V45zm0-35a5 5 0 0 1 10 0v20a5 5 0 0 1-10 0V10z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Sticky Fullscreen Container with safe top clearance from navbar */}
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center pt-16 sm:pt-18 md:pt-20 pb-6 px-4 sm:px-8 md:px-12">
        {/* Header Section */}
        <div className="max-w-2xl mx-auto w-full flex flex-col items-center text-center z-10 shrink-0">
          <h2
            className="font-display font-black uppercase leading-tight tracking-wider text-center select-none"
            style={{ fontSize: 'clamp(1.75rem, 3.8vw, 2.75rem)' }}
          >
            <span className="text-gradient-mint">ALUMNI</span>
          </h2>

          <p className="text-[11px] sm:text-xs text-gray-300 font-body max-w-lg leading-relaxed mt-1 sm:mt-1.5">
            Pioneers, founders, and venture leaders who emerged from PEC E-Cell to build tech giants and shape global ecosystems.
          </p>
        </div>

        {/* Horizontal Motion Track */}
        <div className="w-full z-10 py-2 mt-3 sm:mt-4 md:mt-5 shrink-0">
          <motion.div 
            ref={trackRef} 
            style={{ x: xMotion }} 
            className="flex gap-4 sm:gap-5 md:gap-6 w-max pl-4 md:pl-16 pr-8 md:pr-16"
          >
            {displayData.map((person) => (
              <div 
                key={person.id} 
                className="shrink-0 rounded-[20px] focus-within:ring-2 focus-within:ring-mint outline-none"
                style={{ width: 'clamp(240px, 75vw, 275px)' }}
                tabIndex={0}
              >
                <PixelTransition
                  gridSize={6}
                  pixelColor="var(--accent-mint, #00FFB2)"
                  animationStepDuration={0.35}
                  aspectRatio="118%"
                  className="rounded-[20px] shadow-2xl bg-[#0A1813] border border-white/12 hover:border-mint/50 transition-all duration-300 w-full overflow-hidden group/card isolate cursor-pointer"
                  style={{ border: '1px solid rgba(255,255,255,0.12)', outline: 'none' }}
                  firstContent={
                    <div className="relative w-full h-full overflow-hidden bg-[#0A1813] rounded-[20px] flex flex-col justify-between">
                      {/* Full card background portrait photo */}
                      <BlurImage
                        src={person.imageUrl}
                        alt={person.name}
                        fill
                        sizes="(max-width: 768px) 275px, 285px"
                        className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
                      />

                      {/* Gradient Scrims: Dark gradient at top for badge, dark gradient at bottom for text */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#06110D] via-[#06110D]/40 to-black/40" />

                      {/* Top Row: Company & Batch Pill */}
                      <div className="relative z-10 p-3 sm:p-3.5 flex items-center justify-between">
                        <span className="font-mono-data text-[8.5px] font-bold uppercase tracking-wider text-mint bg-[#06120E]/85 backdrop-blur-md px-2 py-0.5 rounded-full border border-mint/30 shadow-sm flex items-center gap-1 max-w-[170px] truncate">
                          <Building2 size={10} className="text-mint shrink-0" />
                          <span className="truncate">{person.company}</span>
                          <span className="opacity-40">•</span>
                          <span className="shrink-0">{person.batch}</span>
                        </span>

                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-black/60 text-white/80 backdrop-blur-md border border-white/15">
                          <Linkedin size={11} strokeWidth={2} />
                        </span>
                      </div>

                      {/* Bottom: Name & Hint to hover */}
                      <div className="relative z-10 p-3.5 sm:p-4 pt-0">
                        {person.valuation && (
                          <span className="inline-block font-mono-data text-[8px] font-bold tracking-wider text-mint uppercase mb-1 bg-mint/10 border border-mint/20 px-1.5 py-0.5 rounded">
                            {person.valuation}
                          </span>
                        )}

                        <h3 className="font-display text-base sm:text-lg font-bold uppercase tracking-wider text-white line-clamp-1 leading-snug">
                          {person.name}
                        </h3>

                        <p className="font-mono-data text-[10px] uppercase tracking-wider text-gray-300 font-semibold mt-0.5 line-clamp-1">
                          {person.role}
                        </p>

                        {/* Hover Hint */}
                        <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-gray-400 font-mono-data text-[8.5px] uppercase tracking-wider">
                          <span className="flex items-center gap-1.5 text-mint font-bold">
                            <Sparkles size={10} /> Hover for details
                          </span>
                          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-white/5 text-neutral-400">
                            <ArrowUpRight size={10} strokeWidth={2.5} />
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                  secondContent={
                    <div className="w-full h-full bg-[#0A1813] p-4 sm:p-4.5 flex flex-col justify-between rounded-[20px] text-left select-none text-white shadow-2xl relative border border-white/12" style={{ border: '1px solid rgba(255,255,255,0.1)', outline: 'none' }}>
                      <div>
                        {/* Top: Name & LinkedIn */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div>
                            <h3 className="text-base sm:text-lg font-bold font-display tracking-wider text-white leading-tight">
                              {person.name}
                            </h3>
                            <p className="font-mono-data text-[9.5px] uppercase tracking-wider text-mint font-bold mt-0.5">
                              {person.company} <span className="text-white/40">•</span> {person.batch}
                            </p>
                          </div>

                          <a
                            href={person.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-mint text-white/70 hover:text-void transition-colors border border-white/10 shrink-0 cursor-pointer"
                            title={`${person.name}'s LinkedIn`}
                            aria-label={`${person.name}'s LinkedIn Profile`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Linkedin size={12} strokeWidth={2} />
                          </a>
                        </div>

                        {/* Role */}
                        <p className="font-mono-data text-[9.5px] uppercase tracking-wider text-gray-400 font-semibold mb-2">
                          {person.role}
                        </p>

                        {/* Milestone / Valuation badge */}
                        {person.valuation && (
                          <div className="p-1.5 sm:p-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1.5 mb-2">
                            <Award size={12} strokeWidth={2} className="text-mint shrink-0" />
                            <span className="font-mono-data text-[9px] font-bold tracking-wider text-white uppercase line-clamp-1">
                              {person.valuation}
                            </span>
                          </div>
                        )}

                        {/* Bio */}
                        <p className="text-[10.5px] text-gray-300 leading-relaxed font-body line-clamp-3">
                          {person.bio}
                        </p>
                      </div>

                      {/* Footer: Achievement & Arrow */}
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5 text-mint font-mono-data text-[9px] font-bold uppercase tracking-wider truncate pr-2">
                          <Sparkles size={11} className="shrink-0" />
                          <span className="truncate">{person.achievement}</span>
                        </div>
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-white/5 text-neutral-400 group-hover:bg-mint group-hover:text-void transition-colors shrink-0">
                          <ArrowUpRight size={10} strokeWidth={2.5} />
                        </div>
                      </div>
                    </div>
                  }
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
