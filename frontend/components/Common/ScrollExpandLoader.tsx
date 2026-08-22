// components/Common/ScrollExpandLoader.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

declare global {
  interface Window { __SCROLL_LOADER_ACTIVE__?: boolean }
}

export default function ScrollExpandLoader() {
  const [stage, setStage] = useState<'loading' | 'expanding' | 'done'>('loading')

  useEffect(() => {
    window.__SCROLL_LOADER_ACTIVE__ = true
    document.body.classList.add('loader-active')
    window.dispatchEvent(new CustomEvent('scroll-loader-state', { detail: { active: true } }))

    const noScroll = (e: Event) => e.preventDefault()
    const noKeys = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.code)) {
        e.preventDefault()
      }
    }

    window.addEventListener('wheel', noScroll, { passive: false })
    window.addEventListener('touchmove', noScroll, { passive: false })
    window.addEventListener('keydown', noKeys, { passive: false })
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
      window.removeEventListener('wheel', noScroll)
      window.removeEventListener('touchmove', noScroll)
      window.removeEventListener('keydown', noKeys)
    }

    const t1 = setTimeout(() => setStage('expanding'), 1600)

    const t2 = setTimeout(() => {
      window.__SCROLL_LOADER_ACTIVE__ = false
      document.body.classList.remove('loader-active')
      window.dispatchEvent(new CustomEvent('scroll-loader-state', { detail: { active: false } }))
    }, 2000)

    const t3 = setTimeout(unlock, 2600)

    const onHide = () => { if (document.hidden) unlock() }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('blur', unlock)

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3)
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('blur', unlock)
      unlock()
    }
  }, [])

  if (stage === 'done') return null

  return (
    <AnimatePresence>
      {/*
        The expansion works by fading the ENTIRE overlay to opacity:0.
        We never animate width/height/scale — so box-shadow never hits
        the viewport boundary and there is NO flash possible.
        The aperture stays at its rounded shape and gently zooms in as it fades.
      */}
      <motion.div
        key="loader-overlay"
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden pointer-events-none"
        initial={{ opacity: 1 }}
        animate={{
          opacity: stage === 'expanding' ? 0 : 1,
          scale: stage === 'expanding' ? 1.06 : 1,
        }}
        transition={{
          opacity: { duration: 0.75, ease: [0.4, 0, 1, 1] },
          scale: { duration: 0.85, ease: [0.4, 0, 0.2, 1] },
        }}
        style={{ willChange: 'opacity, transform' }}
      >
        {/* Lime aperture frame via box-shadow — this stays static, no scale animation */}
        <div
          className="relative flex items-end justify-center border-2 border-black/25"
          style={{
            width: 'clamp(320px, 68vw, 920px)',
            height: 'clamp(280px, 60vh, 640px)',
            borderRadius: '24px',
            boxShadow: '0 0 0 9999px #7ED321',
            willChange: 'auto',
          }}
        >
          {/* Ambient grid on the lime mask */}
          <div
            className="absolute pointer-events-none"
            style={{
              inset: '-9999px',
              backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.2) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
              opacity: 0.13,
            }}
          />

          {/* Inner vignette on the aperture window */}
          <div className="absolute inset-0 rounded-3xl pointer-events-none shadow-[inset_0_0_60px_rgba(0,0,0,0.65)]" />

          {/* Progress bar — GPU scaleX, no layout cost */}
          <div className="relative z-10 mb-8">
            <div className="w-44 h-[5px] bg-black/60 rounded-full overflow-hidden border border-white/20 shadow-md">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1] }}
                className="h-full bg-mint rounded-full origin-left"
                style={{ willChange: 'transform', boxShadow: '0 0 8px #7ED321' }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
