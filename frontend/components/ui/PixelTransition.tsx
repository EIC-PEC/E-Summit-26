'use client'

import React, { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import './PixelTransition.css'

export interface PixelTransitionProps {
  firstContent: React.ReactNode
  secondContent: React.ReactNode;
  gridSize?: number
  pixelColor?: string
  animationStepDuration?: number
  once?: boolean
  aspectRatio?: string
  className?: string
  style?: React.CSSProperties
}

export default function PixelTransition({
  firstContent,
  secondContent,
  gridSize = 7,
  pixelColor = 'currentColor',
  animationStepDuration = 0.3,
  once = false,
  aspectRatio = '100%',
  className = '',
  style = {},
}: PixelTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pixelGridRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLDivElement>(null)
  const delayedCallRef = useRef<ReturnType<typeof gsap.delayedCall> | null>(null)

  const [isActive, setIsActive] = useState(false)

  const isActiveRef = useRef(false)

  const populatePixelsIfNeeded = () => {
    const pixelGridEl = pixelGridRef.current
    if (!pixelGridEl || pixelGridEl.children.length > 0) return

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const pixel = document.createElement('div')
        pixel.classList.add('pixelated-image-card__pixel')
        pixel.style.position = 'absolute'
        pixel.style.display = 'none'
        pixel.style.backgroundColor = pixelColor

        const size = 100 / gridSize
        pixel.style.width = `${size}%`
        pixel.style.height = `${size}%`
        pixel.style.left = `${col * size}%`
        pixel.style.top = `${row * size}%`
        pixelGridEl.appendChild(pixel)
      }
    }
  }

  const animatePixels = (activate: boolean) => {
    populatePixelsIfNeeded()

    const pixelGridEl = pixelGridRef.current
    const activeEl = activeRef.current
    if (!pixelGridEl || !activeEl) return

    const pixels = pixelGridEl.querySelectorAll<HTMLElement>('.pixelated-image-card__pixel')
    if (!pixels.length) return

    gsap.killTweensOf(pixels)
    if (delayedCallRef.current) {
      delayedCallRef.current.kill()
    }

    gsap.set(pixels, { display: 'none' })

    const totalPixels = pixels.length
    const staggerDuration = animationStepDuration / totalPixels

    gsap.to(pixels, {
      display: 'block',
      duration: 0,
      stagger: {
        each: staggerDuration,
        from: 'random',
      },
    })

    delayedCallRef.current = gsap.delayedCall(animationStepDuration, () => {
      activeEl.style.display = activate ? 'block' : 'none'
      activeEl.style.pointerEvents = activate ? 'auto' : 'none'
      const defaultEl = containerRef.current?.querySelector<HTMLElement>('.pixelated-image-card__default')
      if (defaultEl) {
        defaultEl.style.visibility = activate ? 'hidden' : 'visible'
      }
    })

    gsap.to(pixels, {
      display: 'none',
      duration: 0,
      delay: animationStepDuration,
      stagger: {
        each: staggerDuration,
        from: 'random',
      },
    })
  }

  const handleEnter = () => {
    if (!isActiveRef.current) {
      isActiveRef.current = true
      setIsActive(true)
      animatePixels(true)
    }
  }

  const handleLeave = () => {
    if (isActiveRef.current && !once) {
      isActiveRef.current = false
      setIsActive(false)
      animatePixels(false)
    }
  }

  const handleClick = () => {
    if (!isActiveRef.current) {
      isActiveRef.current = true
      setIsActive(true)
      animatePixels(true)
    } else if (!once) {
      isActiveRef.current = false
      setIsActive(false)
      animatePixels(false)
    }
  }

  useEffect(() => {
    return () => {
      if (delayedCallRef.current) {
        delayedCallRef.current.kill()
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden pixelated-image-card ${className}`}
      style={style}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      onClick={handleClick}
      onFocus={handleEnter}
      onBlur={handleLeave}
      tabIndex={0}
    >
      <div style={{ paddingTop: aspectRatio }} />
      <div 
        className="pixelated-image-card__default absolute inset-0 w-full h-full" 
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        aria-hidden={isActive}
      >
        {firstContent}
      </div>
      <div 
        className="pixelated-image-card__active absolute inset-0 w-full h-full z-10" 
        ref={activeRef} 
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2, display: 'none' }}
        aria-hidden={!isActive}
      >
        {secondContent}
      </div>
      <div 
        className="pixelated-image-card__pixels absolute inset-0 w-full h-full pointer-events-none z-20" 
        ref={pixelGridRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 3 }}
      />
    </div>
  )
}
