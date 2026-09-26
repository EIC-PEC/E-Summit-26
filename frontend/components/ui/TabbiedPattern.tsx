'use client'

import { useEffect, useRef } from 'react'
import { createPattern } from 'tabbied'

export interface TabbiedPatternProps {
  pattern: any
  seed?: string
  palette?: string[]
  density?: number
  options?: Record<string, any>
  className?: string
  fit?: 'grid' | 'cover' | 'fixed'
}

export default function TabbiedPattern({
  pattern,
  seed = '0000',
  palette,
  density = 0.5,
  options,
  className = 'w-full h-full',
  fit = 'grid',
}: TabbiedPatternProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = containerRef.current
    if (!host) return

    const controller = createPattern(host, {
      pattern,
      seed,
      palette,
      density,
      options,
      fit,
    })

    return () => {
      controller.destroy()
    }
  }, [pattern, seed, palette, density, options, fit])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ backgroundColor: palette?.[0] }}
      aria-hidden="true"
    />
  )
}
