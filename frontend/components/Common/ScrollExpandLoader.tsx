// components/Common/ScrollExpandLoader.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

declare global {
  interface Window {
    __SCROLL_LOADER_ACTIVE__?: boolean
  }
}

export default function ScrollExpandLoader() {
  const [isMounted, setIsMounted] = useState(false)
  const [stage, setStage] = useState<'loading' | 'expanding' | 'done'>('loading')
  const [initialDims, setInitialDims] = useState({ width: '60vw', height: '62vh' })
  const hasTriggeredRef = useRef(false)

  useEffect(() => {
    setIsMounted(true)

    if (typeof window !== 'undefined') {
      window.__SCROLL_LOADER_ACTIVE__ = true
      document.body.classList.add('loader-active')
      window.dispatchEvent(new CustomEvent('scroll-loader-state', { detail: { active: true } }))
    }

    const updateDims = () => {
      if (window.innerWidth < 640) {
        setInitialDims({ width: '88vw', height: '54vh' })
      } else if (window.innerWidth < 1024) {
        setInitialDims({ width: '76vw', height: '58vh' })
      } else {
        setInitialDims({ width: '60vw', height: '62vh' })
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

    const triggerExpand = () => {
      if (hasTriggeredRef.current) return
      hasTriggeredRef.current = true
      setStage('expanding')

      // Unlock and notify page as soon as aperture is open
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.__SCROLL_LOADER_ACTIVE__ = false
          document.body.classList.remove('loader-active')
          window.dispatchEvent(new CustomEvent('scroll-loader-state', { detail: { active: false } }))
        }
      }, 700)

      setTimeout(() => {
        unlock()
      }, 1200)
    }

    // Interactive Trigger: Any wheel, touch swipe, or key immediately smoothly expands!
    const onUserInteraction = () => {
      triggerExpand()
    }

    window.addEventListener('wheel', onUserInteraction, { passive: true })
    window.addEventListener('touchmove', onUserInteraction, { passive: true })
    window.addEventListener('keydown', onUserInteraction, { passive: true })

    // Auto-expand gracefully after a brief 1.2s presentation
    const autoExpandTimer = setTimeout(() => {
      triggerExpand()
    }, 1200)

    // Tab Switch / Blur safety
    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        unlock()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', unlock)

    return () => {
      clearTimeout(autoExpandTimer)
      window.removeEventListener('wheel', onUserInteraction)
      window.removeEventListener('touchmove', onUserInteraction)
      window.removeEventListener('keydown', onUserInteraction)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', unlock)
      window.removeEventListener('resize', updateDims)
      unlock()
    }
  }, [])

  if (!isMounted || stage === 'done') return null

  return (
    <AnimatePresence>
      <motion.div
        key="loader-portal-overlay"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none overflow-hidden"
      >
        {/* Vantage Style Portal Aperture Window — Cutout revealing live site behind it */}
        <motion.div
          initial={{
            width: initialDims.width,
            height: initialDims.height,
            borderRadius: '28px',
          }}
          animate={{
            width: stage === 'expanding' ? '150vw' : initialDims.width,
            height: stage === 'expanding' ? '150vh' : initialDims.height,
            borderRadius: stage === 'expanding' ? '0px' : '28px',
          }}
          transition={{
            duration: 1.1,
            ease: [0.16, 1, 0.3, 1], // Buttery organic deceleration curve
          }}
          className="relative flex items-end justify-center border-2 border-mint/40 bg-transparent transition-all"
          style={{
            boxShadow: '0 0 0 9999px #0B1410',
          }}
        >
          {/* Subtle Ambient Grid Lines on Dark Mask */}
          <div
            className="absolute -inset-[9999px] opacity-25 pointer-events-none z-0"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(181,242,61,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(181,242,61,0.08) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />

          {/* Inner Glow & Frame Highlight on Aperture Window */}
          <motion.div
            animate={{ opacity: stage === 'expanding' ? 0 : 1 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 rounded-[inherit] pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.8),0_0_30px_rgba(181,242,61,0.25)]"
          />

          {/* Bottom Progress Bar & Scroll Hint */}
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{
              opacity: stage === 'expanding' ? 0 : 1,
              y: stage === 'expanding' ? 15 : 0,
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative z-10 mb-8 flex flex-col items-center gap-2 px-6 text-center"
          >
            <div className="w-44 h-1.5 bg-black/80 rounded-full overflow-hidden border border-white/20 p-[1px] shadow-lg">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
                className="h-full bg-mint rounded-full shadow-[0_0_10px_#B5F23D]"
              />
            </div>
            <span className="font-mono-data text-[10px] sm:text-xs font-bold uppercase tracking-widest text-mint/80 animate-pulse">
              Scroll or Tap to Enter
            </span>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
