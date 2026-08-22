// components/Common/ScrollExpandLoader.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

declare global {
  interface Window { __SCROLL_LOADER_ACTIVE__?: boolean }
}

// Lime frame dimensions — aperture is 68vw × 62vh centered
const BAND_Y = 19   // top + bottom band height in vh
const BAND_X = 16   // left + right band width in vw

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]
const DURATION = 0.85

// Reusable lime band with the ambient grid baked in
function Band({
  style,
  axis,
  expanding,
}: {
  style: React.CSSProperties
  axis: 'x' | 'y'
  expanding: boolean
}) {
  const GRID = {
    backgroundImage: `
      linear-gradient(to right, rgba(0,0,0,0.25) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0,0,0,0.25) 1px, transparent 1px)
    `,
    backgroundSize: '60px 60px',
  }

  return (
    <motion.div
      className="absolute bg-[#7ED321]"
      style={{ ...style, willChange: 'transform' }}
      initial={{ x: 0, y: 0 }}
      animate={
        axis === 'y'
          ? { y: expanding ? (style.top !== undefined ? '-101%' : '101%') : '0%' }
          : { x: expanding ? (style.left !== undefined ? '-101%' : '101%') : '0%' }
      }
      transition={{ duration: DURATION, ease: EASE }}
    >
      <div className="absolute inset-0 opacity-[0.12]" style={GRID} />
    </motion.div>
  )
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

    // Progress fills for 1.6s then the bands slide off
    const t1 = setTimeout(() => setStage('expanding'), 1600)

    // Notify navbar mid-expansion
    const t2 = setTimeout(() => {
      window.__SCROLL_LOADER_ACTIVE__ = false
      document.body.classList.remove('loader-active')
      window.dispatchEvent(new CustomEvent('scroll-loader-state', { detail: { active: false } }))
    }, 2100)

    // Full unlock after bands clear the screen
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

  const expanding = stage === 'expanding'

  return (
    <AnimatePresence>
      <div
        key="loader-bands"
        className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
      >
        {/*
          4-band iris approach:
          - TOP band covers top BAND_Y vh (full width — owns both top corners)
          - BOTTOM band covers bottom BAND_Y vh (full width — owns both bottom corners)
          - LEFT/RIGHT bands cover ONLY the middle strip (between the two horizontal bands)
          Each band slides off its own edge independently using GPU transform: translate only.
          Zero box-shadow math = zero flash possible.
        */}

        {/* TOP — slides up, full width so it owns the top-left + top-right corners */}
        <Band
          style={{ top: 0, left: 0, right: 0, height: `${BAND_Y}vh` }}
          axis="y"
          expanding={expanding}
        />

        {/* BOTTOM — slides down */}
        <Band
          style={{ bottom: 0, left: 0, right: 0, height: `${BAND_Y}vh` }}
          axis="y"
          expanding={expanding}
        />

        {/* LEFT — middle strip only (corners handled by top/bottom bands) */}
        <Band
          style={{
            top: `${BAND_Y}vh`,
            bottom: `${BAND_Y}vh`,
            left: 0,
            width: `${BAND_X}vw`,
          }}
          axis="x"
          expanding={expanding}
        />

        {/* RIGHT — middle strip only */}
        <Band
          style={{
            top: `${BAND_Y}vh`,
            bottom: `${BAND_Y}vh`,
            right: 0,
            width: `${BAND_X}vw`,
          }}
          axis="x"
          expanding={expanding}
        />

        {/* Cosmetic aperture border + inner vignette around the hero viewport */}
        <motion.div
          className="absolute rounded-3xl border-2 border-black/20 pointer-events-none"
          style={{
            top: `${BAND_Y}vh`,
            bottom: `${BAND_Y}vh`,
            left: `${BAND_X}vw`,
            right: `${BAND_X}vw`,
            boxShadow: 'inset 0 0 60px rgba(0,0,0,0.65)',
          }}
          animate={{ opacity: expanding ? 0 : 1 }}
          transition={{ duration: 0.25 }}
        />

        {/* Progress bar — centered at bottom of aperture opening */}
        <motion.div
          className="absolute flex justify-center"
          style={{
            bottom: `calc(${BAND_Y}vh + 2rem)`,
            left: `${BAND_X}vw`,
            right: `${BAND_X}vw`,
          }}
          animate={{ opacity: expanding ? 0 : 1, y: expanding ? 14 : 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <div className="w-44 h-[5px] bg-black/60 rounded-full overflow-hidden border border-white/20 shadow-md">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1] }}
              className="h-full bg-mint rounded-full origin-left"
              style={{ willChange: 'transform', boxShadow: '0 0 8px #7ED321' }}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
