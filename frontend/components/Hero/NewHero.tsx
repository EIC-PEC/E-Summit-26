'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Ticket, Calendar, MapPin, Sparkles, ArrowUpRight, ChevronDown, Play } from 'lucide-react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { FEST_META } from '@/lib/data'
import { useSiteConfig } from '@/hooks/useSummitData'

const TOTAL_RAW_FRAMES = 360
const FRAME_STEP = 2 // Sample every 2nd frame => ~180 dense, smooth frames
const FRAME_COUNT = Math.floor(TOTAL_RAW_FRAMES / FRAME_STEP)

export default function NewHero() {
  const { siteConfig } = useSiteConfig()
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const imagesRef = useRef<(HTMLImageElement | null)[]>([])
  const currentFrameRef = useRef(0)
  const targetFrameRef = useRef(0)
  const isVisibleRef = useRef(true)
  const isLoopingRef = useRef(false)
  const dimensionsRef = useRef({ w: 0, h: 0 })
  const rafIdRef = useRef<number | null>(null)

  // Track scroll progress throughout the Hero section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Initial title fades out smoothly (0% -> 16%)
  const initialOpacity = useTransform(scrollYProgress, [0, 0.16], [1, 0])
  const initialVisibility = useTransform(scrollYProgress, [0.16, 0.17], ['visible', 'hidden'])

  // Main hero content fades in at 0.16, STAYS FULLY VISIBLE & PINNED from 0.28 to 0.80, then fades out at 0.95
  const mainContentOpacity = useTransform(scrollYProgress, [0.16, 0.28, 0.80, 0.95], [0, 1, 1, 0])
  const mainContentScale = useTransform(
    scrollYProgress,
    [0.16, 0.28, 0.80, 0.95],
    [0.95, 1, 1, 1.05]
  )
  const mainContentVisibility = useTransform(scrollYProgress, [0.15, 0.16, 0.95, 0.96], ['hidden', 'visible', 'visible', 'hidden'])

  // Soothing end-of-video blur & blackening overlay when video completes
  const endBlur = useTransform(scrollYProgress, [0.75, 0.96], ['blur(0px)', 'blur(24px)'])
  const endBlackenOpacity = useTransform(scrollYProgress, [0.75, 0.96], [0, 0.95])

  // Get nearest loaded image so canvas never freezes during rapid scrubbing
  const getLoadedImage = (targetIndex: number): HTMLImageElement | null => {
    const list = imagesRef.current
    if (!list || list.length === 0) return null

    const exact = list[targetIndex]
    if (exact && exact.complete && exact.naturalWidth > 0) {
      return exact
    }

    for (let offset = 1; offset < FRAME_COUNT; offset++) {
      const prev = targetIndex - offset
      const next = targetIndex + offset
      if (prev >= 0 && list[prev]?.complete && (list[prev]?.naturalWidth || 0) > 0) {
        return list[prev]
      }
      if (next < FRAME_COUNT && list[next]?.complete && (list[next]?.naturalWidth || 0) > 0) {
        return list[next]
      }
    }
    return null
  }

  // Draw current frame on HTML5 canvas with cached dimensions (zero layout thrashing)
  const renderFrame = (index: number) => {
    if (!isVisibleRef.current) return

    const canvas = canvasRef.current
    if (!canvas) return

    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext('2d', { alpha: false })
      if (ctxRef.current) {
        ctxRef.current.imageSmoothingEnabled = true
        ctxRef.current.imageSmoothingQuality = 'medium'
      }
    }
    const ctx = ctxRef.current
    if (!ctx) return

    const img = getLoadedImage(index)
    if (!img) return

    const w = dimensionsRef.current.w || canvas.width || 300
    const h = dimensionsRef.current.h || canvas.height || 150

    const hRatio = w / img.width
    const vRatio = h / img.height
    const ratio = Math.max(hRatio, vRatio)

    const centerShift_x = (w - img.width * ratio) / 2
    const centerShift_y = (h - img.height * ratio) / 2

    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      centerShift_x,
      centerShift_y,
      img.width * ratio,
      img.height * ratio
    )
  }

  // Continuous Smooth LERP Loop for buttery 60-120fps motion on mobile & desktop
  const tick = () => {
    if (!isVisibleRef.current) {
      isLoopingRef.current = false
      return
    }

    const current = currentFrameRef.current
    const target = targetFrameRef.current
    const diff = target - current

    if (Math.abs(diff) > 0.05) {
      // Smooth exponential damping factor (0.16 gives realistic fluid inertia)
      const nextFrame = current + diff * 0.16
      currentFrameRef.current = nextFrame
      renderFrame(Math.round(nextFrame))
      rafIdRef.current = requestAnimationFrame(tick)
    } else {
      if (Math.round(current) !== Math.round(target)) {
        currentFrameRef.current = target
        renderFrame(Math.round(target))
      }
      isLoopingRef.current = false
    }
  }

  const startLoop = () => {
    if (!isLoopingRef.current) {
      isLoopingRef.current = true
      rafIdRef.current = requestAnimationFrame(tick)
    }
  }

  // IntersectionObserver to pause rendering loop when scrolled offscreen
  useEffect(() => {
    const target = containerRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting
        if (entry.isIntersecting) {
          renderFrame(Math.round(currentFrameRef.current))
        }
      },
      { threshold: 0 }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  // Progressive 2-Pass Preloader for instant startup & ultra-dense high FPS
  useEffect(() => {
    let isMounted = true
    const loadedImages: (HTMLImageElement | null)[] = new Array(FRAME_COUNT).fill(null)
    imagesRef.current = loadedImages

    // Pass 1: Load Keyframes first (every 4th step) for instant responsiveness
    const loadFrame = (i: number) => {
      const rawFrameNum = Math.min(TOTAL_RAW_FRAMES, i * FRAME_STEP + 1)
      const frameStr = String(rawFrameNum).padStart(4, '0')
      const img = new Image()
      img.src = `/sequence/vdo1/output_${frameStr}.png`
      img.onload = () => {
        if (!isMounted) return
        loadedImages[i] = img
        if (i === 0 || Math.abs(i - currentFrameRef.current) <= 2) {
          renderFrame(Math.round(currentFrameRef.current))
        }
      }
    }

    // Load keyframes first
    for (let i = 0; i < FRAME_COUNT; i += 4) {
      loadFrame(i)
    }

    // Pass 2: Asynchronously backfill all remaining frames in idle time
    const timer = setTimeout(() => {
      if (!isMounted) return
      for (let i = 0; i < FRAME_COUNT; i++) {
        if (i % 4 !== 0) {
          loadFrame(i)
        }
      }
    }, 150)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [])

  // Handle window resize & DPR scaling with performance clamping (max DPR 1.5 on mobile)
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (canvas) {
        const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 1.5)
        const w = window.innerWidth
        const h = window.innerHeight
        canvas.width = Math.round(w * dpr)
        canvas.height = Math.round(h * dpr)
        dimensionsRef.current = { w: canvas.width, h: canvas.height }
        if (ctxRef.current) {
          ctxRef.current.imageSmoothingEnabled = true
          ctxRef.current.imageSmoothingQuality = 'medium'
        }
        renderFrame(Math.round(currentFrameRef.current))
      }
    }

    handleResize()
    const handleReactivate = () => {
      renderFrame(Math.round(currentFrameRef.current))
    }
    window.addEventListener('resize', handleResize, { passive: true })
    window.addEventListener('focus', handleReactivate, { passive: true })
    document.addEventListener('visibilitychange', handleReactivate, { passive: true })
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('focus', handleReactivate)
      document.removeEventListener('visibilitychange', handleReactivate)
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [])

  // Scrub canvas video frames on scroll via buttery LERP engine
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const target = Math.min(FRAME_COUNT - 1, Math.max(0, latest * (FRAME_COUNT - 1)))
    targetFrameRef.current = target
    startLoop()
  })

  return (
    <section
      id="esummit-hero"
      ref={containerRef}
      className="relative h-[270vh] md:h-[350vh] bg-void"
      aria-label="PEC E-Summit Hero"
    >
      {/* Sticky Fullscreen Container — Pins Canvas and Content during entire scroll */}
      <div className="sticky top-0 z-0 flex h-screen w-full items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-0 h-full w-full object-cover"
          style={{ willChange: 'transform', transform: 'translateZ(0)' }}
        />{/* Ambient Dark Scrim Radial Gradient */}
        <div
          className="z-1 pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(7,11,8,0.45) 0%, rgba(7,11,8,0.88) 100%)',
          }}
        />

        {/* Soothing End-of-Video Blur & Blackening Layer */}
        <motion.div
          className="z-2 pointer-events-none absolute inset-0 bg-void"
          style={{
            opacity: endBlackenOpacity,
            filter: endBlur,
            backdropFilter: endBlur,
          }}
        />

        {/* Initial Viewport Hero Banner Overlay */}
        <motion.div
          initial={{ opacity: 1 }}
          style={{ opacity: initialOpacity, visibility: initialVisibility }}
          className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center"
        >
          {/* Subtle central dark burst for text contrast */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.6)_0%,transparent_40%)] sm:bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.4)_0%,transparent_50%)]" />

          <h1 
            className="relative font-display font-black leading-none tracking-tighter drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)] flex items-baseline justify-center gap-2 sm:gap-4"
            style={{ fontSize: 'clamp(2.5rem, 9.5vw, 8.5rem)' }}
          >
            <span className="text-gradient-white">E-SUMMIT</span> <span className="text-gradient-mint">&apos;26</span>
          </h1>

          <p className="relative mt-4 max-w-2xl font-mono-data text-sm sm:text-base md:text-lg font-bold uppercase tracking-widest text-gradient-white drop-shadow-[0_2px_15px_rgba(0,0,0,1)]">
            Chandigarh&apos;s Launchpad for Founders
          </p>
        </motion.div>

        {/* Pinned Main Hero Content Overlay — Stays 100% visible & centered throughout middle scroll range (0.28 -> 0.80) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          style={{ opacity: mainContentOpacity, scale: mainContentScale, visibility: mainContentVisibility }}
          className="pointer-events-auto absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center sm:px-6"
        >
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:gap-6 text-center">

            {/* Main Headline — Iconic 2-Line Multi-Tone Headline */}
            <h2 
              className="mb-1 sm:mb-2 max-w-3xl font-display font-black uppercase leading-[1.08] tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]"
              style={{ fontSize: 'clamp(1.25rem, 4.2vw, 3.25rem)' }}
            >
              <span className="text-gradient-white">WHERE IDEAS MEET</span> <span className="text-gradient-mint">CAPITAL</span>
              <br />
              <span className="text-gradient-white">&amp; BUILD THE</span> <span className="text-gradient-mint">FUTURE</span>
            </h2>

            {/* Subtitle Paragraph */}
            <p className="mb-3 max-w-xl font-body text-xs font-normal leading-relaxed text-gray-300 drop-shadow-md sm:text-sm md:text-base">
              {siteConfig?.heroSubtitle && siteConfig.heroSubtitle !== 'IGNITING ENTREPRENEURSHIP & INNOVATION'
                ? siteConfig.heroSubtitle
                : "North India's largest student entrepreneurship summit at Punjab Engineering College. Join 3,000+ founders, investors, and builders for 2 days of keynotes, high-stakes pitches, and hackathons."}
            </p>

            {/* Action CTAs — Consistent 3D Beveled Buttons */}
            <div className="mb-1 flex w-full flex-wrap items-center justify-center gap-3">
              <Link
                href="/register"
                className="btn-mint-gradient group relative inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-full px-6 font-mono-data text-xs font-bold uppercase tracking-wider text-void transition-transform hover:scale-105"
              >
                <Ticket size={15} strokeWidth={1.5} />
                <span>GET PASSES</span>
                <ArrowUpRight
                  size={15}
                  strokeWidth={1.5}
                  className="opacity-70 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                />
              </Link>

              {siteConfig?.heroVideoUrl ? (
                <a
                  href={siteConfig.heroVideoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-dark-gradient group relative inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-full px-6 font-mono-data text-xs font-bold uppercase tracking-wider text-primary backdrop-blur-md transition-all hover:scale-105 hover:border-mint"
                >
                  <Play
                    size={14}
                    strokeWidth={1.5}
                    className="text-mint fill-mint/30 group-hover:animate-pulse"
                  />
                  <span>WATCH TEASER</span>
                </a>
              ) : (
                <a
                  href="/#event-portfolio"
                  className="btn-dark-gradient group relative inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-full px-6 font-mono-data text-xs font-bold uppercase tracking-wider text-primary backdrop-blur-md transition-all hover:scale-105 hover:border-mint"
                >
                  <Sparkles
                    size={15}
                    strokeWidth={1.5}
                    className="text-mint group-hover:animate-pulse"
                  />
                  <span>EXPLORE TRACKS</span>
                </a>
              )}
            </div>


          </div>
        </motion.div>
      </div>
    </section>
  )
}
