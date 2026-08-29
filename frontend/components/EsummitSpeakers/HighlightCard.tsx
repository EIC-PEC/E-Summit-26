'use client'

import React from 'react'
import { motion, MotionValue } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { DayCard } from './types'

export interface HighlightCardProps {
  card: DayCard
  index: number
  scrollYProgress: MotionValue<number>
  selectedEventId: string | null
  onSelectEvent: (eventId: string) => void
}

export default function HighlightCard({
  card,
  index,
  selectedEventId,
  onSelectEvent,
}: HighlightCardProps) {
  return (
    <div
      className={`w-full lg:sticky ${index > 0 ? 'mt-8 lg:mt-[45vh]' : ''}`}
      style={{
        top: index === 0 ? '5.5rem' : 'calc(5.5rem + 40px)',
        zIndex: 10 + index,
      }}
    >
      <motion.div
        className="flex w-full flex-col justify-between rounded-[32px] border-2 p-6 shadow-2xl sm:rounded-[40px] sm:p-8 h-auto lg:h-[calc(100dvh-5.5rem-90px)] lg:overflow-y-auto"
        style={{
          borderColor: 'rgba(181, 242, 61, 0.35)',
          background: '#07130F',
        }}
      >
        <div>
          {/* Card Header */}
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-4xl font-black text-gradient-mint sm:text-5xl">
                {card.day}
              </span>
              <span className="font-mono-data text-xs font-bold uppercase tracking-wider text-gray-400">
                {card.date}
              </span>
            </div>
            <span className="font-mono-data text-xs font-bold uppercase tracking-widest text-mint">
              Phase {card.num}
            </span>
          </div>

          <h3 className="mb-6 font-display text-xl font-bold sm:text-2xl">
            <span className="text-gradient-white">{card.title}</span>
          </h3>

          {/* Events List */}
          <div className="space-y-1 px-1">
            {card.events.map((ev) => {
              const isSelected = selectedEventId === ev.id
              return (
                <div
                  key={ev.id}
                  onClick={() => onSelectEvent(ev.id)}
                  className={`group flex cursor-pointer items-start py-3.5 px-2 transition-all duration-200 border-b border-white/5 last:border-b-0 ${
                    isSelected ? 'text-[#7ED321]' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0 w-full">
                    {/* Left: Time */}
                    <span
                      className={`shrink-0 pt-0.5 font-mono-data text-xs font-semibold tracking-wider transition-colors ${
                        isSelected ? 'text-[#7ED321]' : 'text-gray-400 group-hover:text-gray-300'
                      }`}
                    >
                      {ev.time}
                    </span>

                    {/* Right: Title & Venue */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full min-w-0 gap-1.5 sm:gap-4">
                      <span
                        className={`font-body text-sm sm:text-base font-medium transition-colors leading-snug ${
                          isSelected ? 'text-white font-bold' : 'text-gray-300 group-hover:text-white'
                        }`}
                      >
                        {ev.title}
                      </span>

                      {/* Venue */}
                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={`font-mono-data text-[10px] uppercase font-bold tracking-wider transition-colors ${
                            isSelected ? 'text-[#7ED321]' : 'text-gray-400 group-hover:text-gray-300'
                          }`}
                        >
                          {ev.tag}
                        </span>
                        <MapPin
                          size={12}
                          className={`transition-colors ${
                            isSelected
                              ? 'fill-[#7ED321] text-[#7ED321]'
                              : 'text-gray-500 group-hover:text-[#7ED321]'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Card Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 font-mono-data text-xs text-gray-400">
          <span>PEC Sector 12, Chandigarh</span>
          <span className="text-[#7ED321]">Click event to inspect venue map</span>
        </div>
      </motion.div>
    </div>
  )
}
