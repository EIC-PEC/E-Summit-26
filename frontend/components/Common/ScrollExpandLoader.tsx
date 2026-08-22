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
  const [stage, setStage] = useState<'loading' | 'expanding' | 'done'>('loading')

  useEffect(() => {
    window.__SCROLL_LOADER_ACTIVE__ = true
    document.body.classList.add('loader-active')
    window.dispatchEvent(new CustomEvent('scroll-loader-state', { detail: { active: true } }))

    const preventDefault = (e: Event) => e.preventDefault()
    const preventKeys = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.code)) {
        e.preventDefault()
      }
    }

    window.addEventListener('wheel', preventDefault, { passive: false })
    window.addEventListener('touchmove', preventDefault, { passive: false })
    window.addEventListener('keydown', preventKeys, { passive: false })

    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = '0px'
    document.body.style.width = '100%'
    window.scrollTo(0, 0)

    const unlock = () => {
      setStage('done')
      window.__SCROLL_LOADER_ACTIVE__ = false
      document.body.classList.remove('loader-active')
      window.dispatchEvent(new CustomEvent('scroll-loader-state', { detail: { active: false } }))
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.removeEventListener('wheel', preventDefault)
      window.removeEventListener('touchmove', preventDefault)
      window.removeEventListener('keydown', preventKeys)
    }

    // Progress bar fills for 1.6s, then the aperture blasts open
    const t1 = setTimeout(() => setStage('expanding'), 1600)

    // Notify navbar to fade in mid-expansion
    const t2 = setTimeout(() => {
      window.__SCROLL_LOADER_ACTIVE__ = false
      document.body.classList.remove('loader-active')
      window.dispatchEvent(new CustomEvent('scroll-loader-state', { detail: { active: false } }))
    }, 2200)

    // Kill the overlay after expansion completes + a tiny buffer
    const t3 = setTimeout(unlock, 2700)

    // Failsafe: switching tabs/windows unlocks instantly
    const onHide = () => { if (document.hidden) unlock() }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('blur', unlock)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('blur', unlock)
      unlock()
    }
  }, [])

  if (stage === 'done') return null

  return (
    <AnimatePresence>
      {/* Full-screen lime overlay — aperture window punches a hole through it via box-shadow */}
      <motion.div
        key="loader-overlay"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden pointer-events-none"
      >
        {/*
          The aperture punch-out:
          - scaleX + scaleY animates on the GPU compositor thread (no layout, no paint)
          - box-shadow of 9999px creates the lime green mask around it
          - transformOrigin: center keeps it expanding from the middle
        */}
        <motion.div
          initial={{ scaleX: 0.68, scaleY: 0.62, borderRadius: '24px' }}
          animate={
            stage === 'expanding'
              ? { scaleX: 2.0, scaleY: 2.0, borderRadius: '0px' }
              : { scaleX: 0.68, scaleY: 0.62, borderRadius: '24px' }
          }
          transition={{
            duration: 1.1,
            ease: [0.76, 0, 0.24, 1],
          }}
          className="relative flex items-end justify-center border-2 border-black/30"
          style={{
            width: '100vw',
            height: '100vh',
            transformOrigin: 'center center',
            willChange: 'transform',
            boxShadow: '0 0 0 9999px #7ED321',
          }}
        >
          {/* Ambient grid on the lime mask — positioned relative to viewport not aperture */}
          <div
            className="absolute pointer-events-none"
            style={{
              inset: '-9999px',
              backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.2) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
              opacity: 0.15,
            }}
          />

          {/* Inset vignette on the aperture frame — fades out before expansion */}
          <motion.div
            animate={{ opacity: stage === 'expanding' ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 rounded-[inherit] pointer-events-none shadow-[inset_0_0_50px_rgba(0,0,0,0.6)]"
          />

          {/* Progress bar — uses scaleX so no layout is triggered per frame */}
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{
              opacity: stage === 'expanding' ? 0 : 1,
              y: stage === 'expanding' ? 16 : 0,
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative z-10 mb-8"
          >
            <div className="w-48 h-1.5 bg-black/70 rounded-full overflow-hidden border border-white/20 shadow-lg">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1] }}
                className="h-full bg-mint rounded-full origin-left shadow-[0_0_10px_#7ED321]"
                style={{ willChange: 'transform' }}
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
