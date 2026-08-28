'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Ticket, Sparkles, ArrowUpRight, Play } from 'lucide-react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import NextImage from 'next/image'
import { useSiteConfig } from '@/hooks/useSummitData'

// ─── Sequence constants — must match scripts/convert-frames.mjs ───────────────
const TOTAL_RAW_FRAMES = 600
const FRAME_STEP = 4
const FRAME_COUNT = Math.floor(TOTAL_RAW_FRAMES / FRAME_STEP) // 150
const FRAMES_PER_SHEET = 25
const SHEET_COUNT = Math.ceil(FRAME_COUNT / FRAMES_PER_SHEET) // 6

interface FrameManifest {
  cellWidth: number
  cellHeight: number
  frameCount: number
  framesPerSheet: number
  sheetCols: number
  sheetCount: number
}

const getRawFrameNum = (i: number) => Math.min(TOTAL_RAW_FRAMES, i * FRAME_STEP + 1)
const padFrame = (n: number) => String(n).padStart(4, '0')

// ─── Support detection (evaluated once at module scope, client-only) ──────────
const supportsOffscreenCanvas =
  typeof window !== 'undefined' &&
  typeof OffscreenCanvas !== 'undefined' &&
  typeof Worker !== 'undefined'

export default function NewHero() {
  const { siteConfig } = useSiteConfig()
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Worker path refs
  const workerRef = useRef<Worker | null>(null)
  const usingWorkerRef = useRef(false)
  // bitmaprenderer context — used to display ImageBitmaps sent back from the worker
  const bitmapCtxRef = useRef<ImageBitmapRenderingContext | null>(null)

  // Main-thread fallback refs (only populated when worker is unavailable)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const sheetsRef = useRef<(ImageBitmap | null)[]>(new Array(SHEET_COUNT).fill(null))
  const lowresRef = useRef<(ImageBitmap | null)[]>(new Array(FRAME_COUNT).fill(null))
  const manifestRef = useRef<FrameManifest | null>(null)

  const currentFrameRef = useRef(0)
  const isVisibleRef = useRef(true)
  const dimensionsRef = useRef({ w: 0, h: 0 })

  // Spring physics — decouples target (raw scroll) from display (spring-interpolated)
  // Stiffness: how aggressively the display frame chases the target
  // Damping:   how quickly velocity bleeds out (lower = more elastic overshoot)
  const SPRING_STIFFNESS = 0.13
  const SPRING_DAMPING = 0.80
  const targetFrameRef = useRef(0)      // float — raw scroll-mapped position
  const displayFrameRef = useRef(0)     // float — spring-interpolated
  const springVelRef = useRef(0)        // current spring velocity
  const lastDispatchedRef = useRef(-1)  // avoid re-sending unchanged frames
  const rafRef = useRef<number | null>(null)

  // ─── Scroll progress ─────────────────────────────────────────────────────────
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const initialOpacity = useTransform(scrollYProgress, [0, 0.16], [1, 0])
  const initialVisibility = useTransform(scrollYProgress, [0.16, 0.17], ['visible', 'hidden'])
  const mainContentOpacity = useTransform(scrollYProgress, [0.16, 0.28, 0.80, 0.95], [0, 1, 1, 0])
  const mainContentScale = useTransform(scrollYProgress, [0.16, 0.28, 0.80, 0.95], [0.95, 1, 1, 1.05])
  const mainContentVisibility = useTransform(
    scrollYProgress,
    [0.15, 0.16, 0.95, 0.96],
    ['hidden', 'visible', 'visible', 'hidden']
  )
  const endBlur = useTransform(scrollYProgress, [0.75, 0.96], ['blur(0px)', 'blur(24px)'])
  const endBlackenOpacity = useTransform(scrollYProgress, [0.75, 0.96], [0, 0.95])

  // ─── Main-thread fallback rendering ──────────────────────────────────────────
  const nearestLowres = useCallback((target: number): ImageBitmap | null => {
    const list = lowresRef.current
    if (list[target]) return list[target]
    for (let off = 1; off < FRAME_COUNT; off++) {
      if (target - off >= 0 && list[target - off]) return list[target - off]
      if (target + off < FRAME_COUNT && list[target + off]) return list[target + off]
    }
    return null
  }, [])

  const renderFrameFallback = useCallback((index: number) => {
    // Worker owns the canvas after transferControlToOffscreen — bail immediately
    if (usingWorkerRef.current) return
    const canvas = canvasRef.current
    if (!canvas || !isVisibleRef.current) return
    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext('2d', { alpha: true })
      if (ctxRef.current) {
        ctxRef.current.imageSmoothingEnabled = true
        ctxRef.current.imageSmoothingQuality = 'high'
      }
    }
    const ctx = ctxRef.current
    if (!ctx || !manifestRef.current) return

    const w = dimensionsRef.current.w || canvas.width || 1280
    const h = dimensionsRef.current.h || canvas.height || 720

    const drawCoverFit = (src: ImageBitmap, sx: number, sy: number, sw: number, sh: number) => {
      const ratio = Math.max(w / sw, h / sh)
      const dx = (w - sw * ratio) / 2
      const dy = (h - sh * ratio) / 2
      ctx.clearRect(0, 0, w, h)
      ctx.drawImage(src, sx, sy, sw, sh, dx, dy, sw * ratio, sh * ratio)
    }

    const manifest = manifestRef.current
    const sheetIdx = Math.floor(index / FRAMES_PER_SHEET)
    const sheet = sheetsRef.current[sheetIdx]

    if (sheet) {
      const cell = index % FRAMES_PER_SHEET
      const col = cell % manifest.sheetCols
      const row = Math.floor(cell / manifest.sheetCols)
      drawCoverFit(sheet, col * manifest.cellWidth, row * manifest.cellHeight, manifest.cellWidth, manifest.cellHeight)
      return
    }

    const lr = nearestLowres(index)
    if (lr) drawCoverFit(lr, 0, 0, lr.width, lr.height)
  }, [nearestLowres])

  // ─── IntersectionObserver — pause rendering when off-screen ──────────────────
  useEffect(() => {
    const target = containerRef.current
    if (!target) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting
        if (!entry.isIntersecting) return
        if (usingWorkerRef.current && workerRef.current) {
          workerRef.current.postMessage({ type: 'visibility', visible: true })
        } else {
          renderFrameFallback(currentFrameRef.current)
        }
      },
      { threshold: 0 }
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [renderFrameFallback])

  // ─── EFFECT 2: Worker init via ImageBitmap transfer (no canvas ownership transfer) ───
  // The worker maintains its own internal OffscreenCanvas and sends back rendered
  // frames as ImageBitmap objects. The main thread displays them via bitmaprenderer.
  // This avoids canvas.transferControlToOffscreen() which breaks React StrictMode.
  useEffect(() => {
    if (!supportsOffscreenCanvas) return
    const canvas = canvasRef.current
    if (!canvas) return

    // bitmaprenderer context — nearly zero-cost display of GPU textures
    const bitmapCtx = canvas.getContext('bitmaprenderer')
    if (!bitmapCtx) return // browser doesn't support bitmaprenderer, fall back
    bitmapCtxRef.current = bitmapCtx

    const worker = new Worker('/workers/hero-renderer.js')
    workerRef.current = worker
    usingWorkerRef.current = true

    // Worker sends back rendered frames as ImageBitmap
    worker.onmessage = ({ data }) => {
      if (data.type === 'frame_bitmap' && bitmapCtxRef.current) {
        bitmapCtxRef.current.transferFromImageBitmap(data.bitmap)
      }
    }

    fetch('/sequence/manifest.json')
      .then((r) => r.json())
      .then((manifest: FrameManifest) => {
        const isAndroid = /android/i.test(navigator.userAgent)
        const dpr = Math.min(window.devicePixelRatio || 1, isAndroid ? 1.15 : 1.5)
        const w = Math.round(window.innerWidth * dpr)
        const h = Math.round(window.innerHeight * dpr)
        dimensionsRef.current = { w, h }
        worker.postMessage({ type: 'init', manifest, width: w, height: h })
      })
      .catch(() => {
        // Manifest not yet generated — fall back to main-thread rendering
        usingWorkerRef.current = false
        bitmapCtxRef.current = null
        worker.terminate()
        workerRef.current = null
      })

    return () => {
      usingWorkerRef.current = false
      bitmapCtxRef.current = null
      worker.postMessage({ type: 'destroy' })
      worker.terminate()
    }
  }, [])

  // ─── EFFECT 3: Main-thread manifest + low-res loading (fallback only) ────────
  useEffect(() => {
    if (usingWorkerRef.current) return
    let isMounted = true

    const init = async () => {
      try {
        const res = await fetch('/sequence/manifest.json')
        if (isMounted && res.ok) manifestRef.current = await res.json()
      } catch {}

      for (let b = 0; b < FRAME_COUNT; b += 20) {
        if (!isMounted) break
        await Promise.all(
          Array.from({ length: Math.min(20, FRAME_COUNT - b) }, async (_, j) => {
            const i = b + j
            const frameStr = padFrame(getRawFrameNum(i))
            try {
              const r = await fetch(`/sequence/vdo1-lowres/output_${frameStr}.webp`, { cache: 'force-cache' })
              if (!r.ok || !isMounted) return
              lowresRef.current[i] = await createImageBitmap(await r.blob())
              if (i === 0 || i === currentFrameRef.current) renderFrameFallback(currentFrameRef.current)
            } catch {}
          })
        )
      }
    }

    init()
    return () => { isMounted = false }
  }, [renderFrameFallback])

  // ─── EFFECT 4: Main-thread sprite sheet loading (fallback only) ───────────────
  useEffect(() => {
    if (usingWorkerRef.current) return
    let isMounted = true

    const loadSheet = async (s: number) => {
      try {
        const res = await fetch(`/sequence/vdo1-sheets/sheet_${String(s).padStart(2, '0')}.webp`, { cache: 'force-cache' })
        if (!res.ok || !isMounted) return
        sheetsRef.current[s] = await createImageBitmap(await res.blob())
        if (Math.floor(currentFrameRef.current / FRAMES_PER_SHEET) === s) {
          renderFrameFallback(currentFrameRef.current)
        }
      } catch {}
    }

    const timer = setTimeout(async () => {
      await loadSheet(0)
      if (!isMounted) return
      await Promise.all(Array.from({ length: SHEET_COUNT - 1 }, (_, i) => loadSheet(i + 1)))
    }, 300)

    return () => { isMounted = false; clearTimeout(timer) }
  }, [renderFrameFallback])

  // ─── EFFECT 5: Canvas resize + DPR scaling ────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      const isAndroid = /android/i.test(navigator.userAgent)
      const dpr = Math.min(window.devicePixelRatio || 1, isAndroid ? 1.15 : 1.5)
      const w = Math.round(window.innerWidth * dpr)
      const h = Math.round(window.innerHeight * dpr)
      dimensionsRef.current = { w, h }

      if (usingWorkerRef.current && workerRef.current) {
        workerRef.current.postMessage({ type: 'resize', width: w, height: h })
      } else {
        const canvas = canvasRef.current
        if (!canvas) return
        canvas.width = w
        canvas.height = h
        ctxRef.current = null // force context re-init
        renderFrameFallback(currentFrameRef.current)
      }
    }

    handleResize()
    const onFocus = () => {
      if (usingWorkerRef.current && workerRef.current) {
        workerRef.current.postMessage({ type: 'visibility', visible: true })
      } else {
        renderFrameFallback(currentFrameRef.current)
      }
    }
    window.addEventListener('resize', handleResize, { passive: true })
    window.addEventListener('focus', onFocus, { passive: true })
    document.addEventListener('visibilitychange', onFocus, { passive: true })
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [renderFrameFallback])

  // ─── Spring physics rAF loop ──────────────────────────────────────────────────
  // Runs every frame. Pulls displayFrame toward targetFrame with a spring equation.
  // This gives scroll-velocity-sensitive momentum: fast scrolls build speed and
  // coast past the target slightly (elastic feel) before settling.
  useEffect(() => {
    const tick = () => {
      if (isVisibleRef.current) {
        const diff = targetFrameRef.current - displayFrameRef.current
        springVelRef.current = (springVelRef.current + diff * SPRING_STIFFNESS) * SPRING_DAMPING
        displayFrameRef.current = Math.max(
          0,
          Math.min(FRAME_COUNT - 1, displayFrameRef.current + springVelRef.current)
        )

        const frame = Math.round(displayFrameRef.current)
        if (frame !== lastDispatchedRef.current) {
          lastDispatchedRef.current = frame
          currentFrameRef.current = frame
          if (usingWorkerRef.current && workerRef.current) {
            workerRef.current.postMessage({ type: 'frame', index: frame })
          } else {
            renderFrameFallback(frame)
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [renderFrameFallback])

  // ─── Scroll → target frame (raw, unsmoothed — spring loop handles display) ────
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    // Store as float for smooth spring interpolation (no rounding here)
    targetFrameRef.current = Math.min(FRAME_COUNT - 1, Math.max(0, latest * (FRAME_COUNT - 1)))
  })

  return (
    <section
      id="esummit-hero"
      ref={containerRef}
      className="relative h-[270vh] md:h-[350vh] bg-void"
      aria-label="PEC E-Summit Hero"
    >
      <div className="sticky top-0 z-0 flex h-screen w-full items-center justify-center overflow-hidden">
        {/* Priority fallback image — visible until first canvas frame paints */}
        <div className="absolute inset-0 z-[-1] w-full h-full">
          <NextImage
            src="/sequence/vdo1/output_0001.png"
            alt="E-Summit Hero Background"
            fill
            priority
            className="object-cover"
          />
        </div>

        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-0 h-full w-full"
          style={{ willChange: 'transform', transform: 'translate3d(0,0,0)', touchAction: 'pan-y' }}
        />

        {/* Ambient radial dark scrim */}
        <div
          className="z-1 pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(7,11,8,0.45) 0%, rgba(7,11,8,0.88) 100%)',
          }}
        />

        {/* End-of-sequence blur + blacken overlay */}
        <motion.div
          className="z-2 pointer-events-none absolute inset-0 bg-void"
          style={{ opacity: endBlackenOpacity, filter: endBlur, willChange: 'opacity, filter', transform: 'translateZ(0)' }}
        />

        {/* Initial hero title — fades out as user starts scrolling */}
        <motion.div
          initial={{ opacity: 1 }}
          style={{ opacity: initialOpacity, visibility: initialVisibility }}
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
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative mt-3 sm:mt-4 w-full max-w-[90vw] font-mono-data text-[10px] sm:text-sm md:text-base font-bold uppercase tracking-[0.15em] sm:tracking-widest text-white/80 drop-shadow-[0_4px_20px_rgba(0,0,0,1)] text-center"
          >
            Chandigarh&apos;s Launchpad <span className="hidden sm:inline">for Founders</span>
            <span className="inline sm:hidden"><br />for Founders</span>
          </motion.p>
        </motion.div>

        {/* Pinned hero content — visible and centered through the scroll journey */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          style={{ opacity: mainContentOpacity, scale: mainContentScale, visibility: mainContentVisibility }}
          className="pointer-events-auto absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center sm:px-6"
        >
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:gap-6 text-center">
            <h2
              className="mb-1 sm:mb-2 max-w-3xl font-display font-black uppercase leading-[1.08] tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]"
              style={{ fontSize: 'clamp(1.25rem, 4.2vw, 3.25rem)' }}
            >
              <span className="text-gradient-white">WHERE IDEAS MEET</span>{' '}
              <span className="text-gradient-mint">CAPITAL</span>
              <br />
              <span className="text-gradient-white">&amp; BUILD THE</span>{' '}
              <span className="text-gradient-mint">FUTURE</span>
            </h2>

            <p className="mb-3 max-w-xl font-body text-xs font-normal leading-relaxed text-gray-300 drop-shadow-md sm:text-sm md:text-base">
              {siteConfig?.heroSubtitle && siteConfig.heroSubtitle !== 'IGNITING ENTREPRENEURSHIP & INNOVATION'
                ? siteConfig.heroSubtitle
                : "North India's largest student entrepreneurship summit at Punjab Engineering College. Join 3,000+ founders, investors, and builders for 2 days of keynotes, high-stakes pitches, and hackathons."}
            </p>

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
                  <Play size={14} strokeWidth={1.5} className="text-mint fill-mint/30 group-hover:animate-pulse" />
                  <span>WATCH TEASER</span>
                </a>
              ) : (
                <a
                  href="/#event-portfolio"
                  className="btn-dark-gradient group relative inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-full px-6 font-mono-data text-xs font-bold uppercase tracking-wider text-primary backdrop-blur-md transition-all hover:scale-105 hover:border-mint"
                >
                  <Sparkles size={15} strokeWidth={1.5} className="text-mint group-hover:animate-pulse" />
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
