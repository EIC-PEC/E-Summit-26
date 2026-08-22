'use client'

import React from 'react'
import { Zap } from 'lucide-react'

export default function LimeTransitionBanner() {
  const words = ['IDEATE', 'BUILD', 'PITCH', 'SCALE', 'INVEST', 'NETWORK']

  return (
    <div className="relative w-full overflow-hidden bg-mint text-void py-5 sm:py-7 my-0 z-20 shadow-[0_0_40px_rgba(181,242,61,0.35)] border-y-2 border-void">
      <style>{`
        @keyframes limeTicker {
          0%   { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
      `}</style>
      {/* Top micro line */}
      <div className="absolute top-1 left-0 right-0 h-0.5 bg-void/20" />

      {/* Repeating Marquee Ticker */}
      <div className="flex whitespace-nowrap overflow-hidden select-none">
        <div
          className="flex items-center gap-6 sm:gap-10 shrink-0"
          style={{
            animation: 'limeTicker 18s linear infinite',
            willChange: 'transform',
          }}
        >
          {[...words, ...words, ...words, ...words].map((word, idx) => (
            <div key={idx} className="flex items-center gap-6 sm:gap-10">
              <span className="font-display font-black text-2xl sm:text-4xl lg:text-5xl uppercase tracking-tighter text-void">
                {word}
              </span>
              <Zap size={22} className="text-void fill-void shrink-0 stroke-[2.5]" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom micro line */}
      <div className="absolute bottom-1 left-0 right-0 h-0.5 bg-void/20" />
    </div>
  )
}
