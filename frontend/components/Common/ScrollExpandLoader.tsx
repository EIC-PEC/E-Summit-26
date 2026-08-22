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

    // Kill overlay after expansion animation finishes
    const t3 = setTimeout(unlock, 2700)

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
      {/*
        Two-layer fix for the "black flash" bug:

        The flash happened because the aperture box-shadow only works as a lime mask
        while the dark div is SMALLER than the viewport. The moment scaleX passes 1.0
        during expansion, the box-shadow falls outside the viewport and the lime
        disappears — briefly revealing the full hero.

        Fix: the outer wrapper (lime mask layer) fades out at exactly the same time
        as the scale crosses 1.0, so the transition is always covered by opacity.
        The aperture scale + outer opacity fade together = seamless reveal.
      */}
      <motion.div
        key="loader-overlay"
        initial={{ opacity: 1 }}
        animate={{ opacity: stage === 'expanding' ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{
          opacity: {
            // Starts fading right as expansion begins, covers the scale-1.0 flash point
            duration: 0.9,
            delay: stage === 'expanding' ? 0.25 : 0,
            ease: 'easeIn',
          },
        }}
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden pointer-events-none"
      >
        {/* Aperture punch-out via box-shadow lime mask — scaleX/scaleY runs on GPU compositor */}
        <motion.div
          initial={{ scaleX: 0.68, scaleY: 0.62, borderRadius: '24px' }}
          animate={
            stage === 'expanding'
              ? { scaleX: 2.2, scaleY: 2.2, borderRadius: '0px' }
              : { scaleX: 0.68, scaleY: 0.62, borderRadius: '24px' }
          }
          transition={{
            duration: 1.0,
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
          {/* Ambient grid lines on lime mask */}
          <div
            className="absolute pointer-events-none"
            style={{
              inset: '-9999px',
              backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.2) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
              opacity: 0.15,
            }}
          />

          {/* Inset vignette on the aperture frame */}
          <motion.div
            animate={{ opacity: stage === 'expanding' ? 0 : 1 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 rounded-[inherit] pointer-events-none shadow-[inset_0_0_50px_rgba(0,0,0,0.6)]"
          />

          {/* Progress bar — scaleX origin-left, zero layout cost */}
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{
              opacity: stage === 'expanding' ? 0 : 1,
              y: stage === 'expanding' ? 16 : 0,
            }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
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
