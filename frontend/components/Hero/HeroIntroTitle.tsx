'use client'

import React from 'react'
import { motion, MotionValue } from 'framer-motion'

export interface HeroIntroTitleProps {
  opacity: MotionValue<number>
  visibility: MotionValue<string>
}

export default function HeroIntroTitle({ opacity, visibility }: HeroIntroTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      style={{ opacity, visibility: visibility as any }}
      className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.3)_40%,transparent_70%)] sm:bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.5)_0%,transparent_60%)] pointer-events-none" />
      <h1
        className="relative font-display font-black leading-none tracking-tighter drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)] flex flex-wrap items-baseline justify-center gap-2 sm:gap-4 w-full px-4"
        style={{ fontSize: 'clamp(2rem, 10vw, 8.5rem)' }}
      >
        <span className="text-gradient-white">E-SUMMIT</span>{' '}
        <span className="text-gradient-mint">&apos;26</span>
      </h1>
      <p
        className="relative mt-3 sm:mt-4 w-full max-w-[90vw] font-mono-data text-[10px] sm:text-sm md:text-base font-bold uppercase tracking-[0.15em] sm:tracking-widest text-white/80 drop-shadow-[0_4px_20px_rgba(0,0,0,1)] text-center animate-fade-in"
      >
        Chandigarh&apos;s Launchpad <span className="hidden sm:inline">for Founders</span>
        <span className="inline sm:hidden">
          <br />
          for Founders
        </span>
      </p>
    </motion.div>
  )
}
