'use client'

import React, { useState } from 'react'
import { Sparkles, Users, Building2 } from 'lucide-react'
import PassCard from './PassCard'
import PassesComparisonTable from './PassesComparisonTable'
import StudentPassesCards from './StudentPassesCards'
import { STARTUP_PACKAGES } from './passesData'

interface PassesSectionProps {
  isStandalonePage?: boolean
}

export default function PassesSection({ isStandalonePage = false }: PassesSectionProps) {
  const [activeTab, setActiveTab] = useState<'student' | 'startup'>('student')

  return (
    <section
      id="passes"
      className={`relative z-10 overflow-hidden bg-[#071511] text-white ${
        isStandalonePage
          ? 'pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 md:pb-24'
          : '-mt-10 sm:-mt-12 rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] border-t border-mint/20 py-16 sm:py-20 md:py-24'
      }`}
      aria-label="Summit Passes and Registration"
    >
      {/* Background Ambience Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-mint/15 blur-[120px] rounded-full" />
      </div>

      <div className="section-container relative z-10">
        {/* Header Block with Audience Toggle */}
        <div className="mt-4 sm:mt-6 mb-8 lg:mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <span className="font-mono-data text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-mint flex items-center gap-2 mb-2">
              <Sparkles size={14} />
              {activeTab === 'student' ? 'OFFICIAL STUDENT REGISTRATION' : 'PARTNER WITH US'}
            </span>
            <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-none">
              {activeTab === 'student' ? (
                <>
                  STUDENT <span className="text-gradient-mint">PASSES</span>
                </>
              ) : (
                <>
                  STARTUP <span className="text-gradient-mint">PACKAGES</span>
                </>
              )}
            </h2>
            <p className="font-mono-data text-xs sm:text-sm text-gray-300 font-bold uppercase tracking-widest mt-3">
              {activeTab === 'student'
                ? 'EXPO • COMPETITIONS • HACKATHON • WORKSHOPS'
                : 'SHOWCASE • NETWORK • HIRE • COLLABORATE'}
            </p>
          </div>

          {/* Audience Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="inline-flex p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setActiveTab('student')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'student'
                    ? 'bg-mint text-void shadow-[0_0_15px_rgba(0,245,212,0.25)]'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Users size={14} />
                <span>Student Passes</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('startup')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'startup'
                    ? 'bg-mint text-void shadow-[0_0_15px_rgba(0,245,212,0.25)]'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Building2 size={14} />
                <span>Startup Packages</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        {activeTab === 'student' ? (
          <StudentPassesCards />
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-2 mb-10">
              {STARTUP_PACKAGES.map((pkg, idx) => (
                <PassCard key={pkg.id} pkg={pkg} index={idx} isCenter={idx === 1} />
              ))}
            </div>

            <div className="mt-4">
              <PassesComparisonTable />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}


