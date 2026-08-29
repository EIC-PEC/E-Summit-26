'use client'

import { useState, useEffect } from 'react'

export interface NavCountdownProps {
  targetISO: string
}

export default function NavCountdown({ targetISO }: NavCountdownProps) {
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState<{ days: string; hours: string; minutes: string; seconds: string }>({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  })
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    setMounted(true)
    const target = new Date(targetISO)

    const checkState = () => {
      const curNow = Date.now()
      const start = target.getTime()
      const end = start + 2 * 24 * 60 * 60 * 1000 // 2 days duration
      const live = curNow >= start && curNow <= end
      setIsLive(live)

      if (!live) {
        const diff = start - curNow
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24))
          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
          const minutes = Math.floor((diff / (1000 * 60)) % 60)
          const seconds = Math.floor((diff / 1000) % 60)

          const pad = (n: number) => String(n).padStart(2, '0')
          setTimeLeft({
            days: pad(days),
            hours: pad(hours),
            minutes: pad(minutes),
            seconds: pad(seconds),
          })
        } else {
          setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' })
        }
      }
    }

    checkState()
    const timer = setInterval(checkState, 1000)
    return () => clearInterval(timer)
  }, [targetISO])

  if (isLive) {
    return (
      <div className="flex items-center gap-1.5 text-mint select-none uppercase tracking-widest text-[9px] sm:text-xs">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
        </span>
        <span className="font-extrabold text-mint drop-shadow-[0_0_8px_rgba(0,229,153,0.8)]">LIVE</span>
      </div>
    )
  }

  return (
    <div
      className={`flex items-center gap-1 font-mono-data text-[10px] sm:text-xs text-mint [.light_&]:text-[#A0C868] font-bold tabular-nums transition-opacity duration-200 ${
        mounted ? 'opacity-100' : 'opacity-0'
      }`}
      suppressHydrationWarning
    >
      <span suppressHydrationWarning>{timeLeft.days}d</span>
      <span>:</span>
      <span suppressHydrationWarning>{timeLeft.hours}h</span>
      <span>:</span>
      <span suppressHydrationWarning>{timeLeft.minutes}m</span>
      <span>:</span>
      <span className="w-5 inline-block" suppressHydrationWarning>
        {timeLeft.seconds}s
      </span>
    </div>
  )
}
