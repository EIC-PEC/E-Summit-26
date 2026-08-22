// components/Common/ScrollExpandLoader.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

declare global {
  interface Window {
    __SCROLL_LOADER_ACTIVE__?: boolean
  }
}

export default function ScrollExpandLoader() {
  const [isMounted, setIsMounted] = useState(false)
  const [stage, setStage] = useState<'loading' | 'expanding' | 'done'>('loading')
  const [initialDims, setInitialDims] = useState({ width: '52vw', height: '60vh' })

  useEffect(() => {
    setIsMounted(true)

    if (typeof window !== 'undefined') {
      window.__SCROLL_LOADER_ACTIVE__ = true
      document.body.classList.add('loader-active')
      window.dispatchEvent(new CustomEvent('scroll-loader-state', { detail: { active: true } }))
    }

    const updateDims = () => {
      if (window.innerWidth < 640) {
        setInitialDims({ width: '88vw', height: '52vh' })
      } else if (window.innerWidth < 1024) {
        setInitialDims({ width: '78vw', height: '58vh' })
      } else {
        setInitialDims({ width: '70vw', height: '65vh' })
      }
    }
    updateDims()
    window.addEventListener('resize', updateDims, { passive: true })

    const unlock = () => {
      setStage('done')
      if (typeof window !== 'undefined') {
        window.__SCROLL_LOADER_ACTIVE__ = false
        document.body.classList.remove('loader-active')
        window.dispatchEvent(new CustomEvent('scroll-loader-state', { detail: { active: false } }))
      }
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
    }

    // Stage 1: Wait for 1.6s progress bar, then expand smoothly
    const timer1 = setTimeout(() => {
      setStage('expanding')
    }, 1600)

    // Stage 1.5: Fade navbar in during expansion
    const timer1_5 = setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.__SCROLL_LOADER_ACTIVE__ = false
        document.body.classList.remove('loader-active')
        window.dispatchEvent(new CustomEvent('scroll-loader-state', { detail: { active: false } }))
      }
    }, 2400)

    // Stage 2: Complete expansion and unlock scroll cleanly
    const timer2 = setTimeout(() => {
      unlock()
    }, 3000)

    // Tab Switch / Blur safety
    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        unlock()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', unlock)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer1_5)
      clearTimeout(timer2)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', unlock)
      window.removeEventListener('resize', updateDims)
      unlock()
    }
  }, [])

  if (stage === 'done') return null

  return (
    <AnimatePresence>
      <motion.div
        key="loader-portal-overlay"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none overflow-hidden"
      >
        {/* Vantage Style Portal Aperture Window — Cutout revealing live site behind it */}
        <motion.div
          initial={{
            width: initialDims.width,
            height: initialDims.height,
            borderRadius: '24px',
          }}
          animate={{
            width: stage === 'expanding' ? '140vw' : initialDims.width,
            height: stage === 'expanding' ? '140vh' : initialDims.height,
            borderRadius: stage === 'expanding' ? '0px' : '24px',
          }}
          transition={{
            duration: 1.4,
            ease: [0.76, 0, 0.24, 1], // Smooth organic cinematic curve
          }}
          className="relative flex items-end justify-center border-2 border-black/30 bg-transparent transition-all"
          style={{
            boxShadow: '0 0 0 9999px #7ED321',
          }}
        >
          {/* Ambient Grid Lines on Lime Mask */}
          <div
            className="absolute -inset-[9999px] opacity-15 pointer-events-none z-0"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.2) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />

          {/* Inner Vignette Shadow on Portal Window Frame */}
          <motion.div
            animate={{ opacity: stage === 'expanding' ? 0 : 1 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 rounded-[inherit] pointer-events-none shadow-[inset_0_0_50px_rgba(0,0,0,0.6)]"
          />

          {/* Bottom Progress Bar — Live E-SUMMIT '26 shines through cutout naturally */}
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{
              opacity: stage === 'expanding' ? 0 : 1,
              y: stage === 'expanding' ? 20 : 0,
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative z-10 mb-8 flex flex-col items-center gap-2 px-6 text-center"
          >
            <div className="w-48 h-1.5 bg-black/80 rounded-full overflow-hidden border border-white/20 p-[1px] shadow-lg">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.6, ease: 'easeInOut' }}
                className="h-full bg-mint rounded-full shadow-[0_0_12px_#7ED321]"
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
