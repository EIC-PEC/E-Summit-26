'use client'

import React, { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

// 5 Stacked horizontal color bands now baked into a raw CSS linear-gradient for 60fps performance

export default function ChevronRouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [displayChildren, setDisplayChildren] = useState(children)
  const [phase, setPhase] = useState<'idle' | 'enter' | 'exit'>('idle')
  const prevPathname = useRef(pathname)

  useEffect(() => {
    if (pathname === prevPathname.current) {
      setDisplayChildren(children)
      return
    }

    prevPathname.current = pathname
    // 1. Cover current route before revealing new one
    setPhase('enter')

    // 2. Once overlay covers screen at 600ms, swap in new children and reset scroll
    const swapTimer = setTimeout(() => {
      setDisplayChildren(children)
      window.scrollTo({ top: 0, behavior: 'auto' })
      setPhase('exit')
    }, 600)

    // 3. Finish transition reveal
    const completeTimer = setTimeout(() => {
      setPhase('idle')
    }, 1300)

    return () => {
      clearTimeout(swapTimer)
      clearTimeout(completeTimer)
    }
  }, [pathname, children])

  // Support same-page anchor link transitions triggered by Nav
  useEffect(() => {
    const handleCustomTrigger = (e: Event) => {
      const customEvt = e as CustomEvent<{ targetId?: string; targetTop?: boolean }>
      setPhase('enter')
      
      setTimeout(() => {
        if (customEvt.detail?.targetTop) {
          window.scrollTo({ top: 0, behavior: 'auto' })
        } else if (customEvt.detail?.targetId) {
          const el = document.getElementById(customEvt.detail.targetId)
          if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' })
        }
        setPhase('exit')
      }, 600)

      setTimeout(() => {
        setPhase('idle')
      }, 1300)
    }

    window.addEventListener('trigger-chevron-transition', handleCustomTrigger)
    return () => window.removeEventListener('trigger-chevron-transition', handleCustomTrigger)
  }, [])

  return (
    <div className="relative min-h-screen w-full">
      {/* Active / Preserved Route Children */}
      {displayChildren}

      {/* ── Single-Layer Hardware Accelerated Transition ── */}
      <AnimatePresence>
        {phase !== 'idle' && (
          <motion.div
            key="chevron-transition-overlay"
            className="fixed inset-0 z-[12000] pointer-events-none overflow-hidden select-none"
            initial={{ y: '100%' }}
            animate={{ y: phase === 'enter' ? '0%' : '-100%' }}
            exit={{ y: '-100%' }}
            transition={{
              duration: 0.6,
              ease: [0.76, 0, 0.24, 1],
            }}
            style={{
              willChange: 'transform',
              background: `linear-gradient(to bottom, 
                #B8F068 0%, #B8F068 20%, 
                #7ED321 20%, #7ED321 40%, 
                #1A4D32 40%, #1A4D32 60%, 
                #0F3022 60%, #0F3022 80%, 
                #07130F 80%, #07130F 100%
              )`,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
