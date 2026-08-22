'use client'
// components/EsummitSpeakers/index.tsx
// Highlights section with borderless Leaflet campus map on the left and stacked Day 1 / Day 2 event lists on the right.

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion'
import { MapPin, Navigation, X } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useSchedule, useSummitData } from '@/hooks/useSummitData'

interface EventItem {
  id: string
  time: string
  title: string
  tag: string
  venueId: string
  venueName: string
  building: string
  lat: number
  lng: number
}

interface DayCard {
  num: string
  day: string
  date: string
  title: string
  events: EventItem[]
}

const VENUE_COORDS: Record<string, { venueName: string; building: string; lat: number; lng: number }> = {
  main_stage: { venueName: 'Main Auditorium', building: 'Block A, Sector 12', lat: 30.7672, lng: 76.7874 },
  expo_floor: { venueName: 'Exhibition Grounds', building: 'Central Quadrangle', lat: 30.7668, lng: 76.7869 },
  pitch_room: { venueName: 'EIC Incubator Hall', building: 'Block B, 2nd Floor', lat: 30.7678, lng: 76.7862 },
  hacker_lab: { venueName: 'Computer Center', building: 'IT Complex, 3rd Floor', lat: 30.7662, lng: 76.7878 },
  vip_lounge: { venueName: 'PEC Club Lounge', building: 'North Lawn Pavilion', lat: 30.7682, lng: 76.7870 },
}

const CARDS: DayCard[] = [
  {
    num: '01',
    day: 'DAY 01',
    date: 'MARCH 15, 2026',
    title: 'Inauguration & Pitch Arena',
    events: [
      {
        id: 'd1-ev1',
        time: '09:30 AM',
        title: 'Grand Opening & Keynote Address',
        tag: 'Main Stage',
        venueId: 'main_stage',
        ...VENUE_COORDS.main_stage,
      },
      {
        id: 'd1-ev2',
        time: '11:00 AM',
        title: 'Startup Expo & Founder Alley Launch',
        tag: 'Expo Floor',
        venueId: 'expo_floor',
        ...VENUE_COORDS.expo_floor,
      },
      {
        id: 'd1-ev3',
        time: '02:00 PM',
        title: 'VC Pitch Arena: Qualifying Round',
        tag: 'Pitch Room',
        venueId: 'pitch_room',
        ...VENUE_COORDS.pitch_room,
      },
      {
        id: 'd1-ev4',
        time: '05:00 PM',
        title: '24-Hour National Hackathon Kickoff',
        tag: 'Hacker Lab',
        venueId: 'hacker_lab',
        ...VENUE_COORDS.hacker_lab,
      },
      {
        id: 'd1-ev5',
        time: '08:00 PM',
        title: 'VIP Investor & Founder Networking Dinner',
        tag: 'VIP Lounge',
        venueId: 'vip_lounge',
        ...VENUE_COORDS.vip_lounge,
      },
    ],
  },
  {
    num: '02',
    day: 'DAY 02',
    date: 'MARCH 16, 2026',
    title: 'Hackathon Demos & Grand Finals',
    events: [
      {
        id: 'd2-ev1',
        time: '10:00 AM',
        title: 'DeepTech & GenAI VC Masterclass',
        tag: 'Auditorium',
        venueId: 'main_stage',
        ...VENUE_COORDS.main_stage,
      },
      {
        id: 'd2-ev2',
        time: '12:30 PM',
        title: 'Hackathon Live Project Demos & Judging',
        tag: 'Hacker Lab',
        venueId: 'hacker_lab',
        ...VENUE_COORDS.hacker_lab,
      },
      {
        id: 'd2-ev3',
        time: '03:00 PM',
        title: 'Grand Pitch Finals (₹7.5L Pool)',
        tag: 'Main Stage',
        venueId: 'main_stage',
        ...VENUE_COORDS.main_stage,
      },
      {
        id: 'd2-ev4',
        time: '05:30 PM',
        title: 'Valedictory Keynote & Award Ceremony',
        tag: 'Main Stage',
        venueId: 'main_stage',
        ...VENUE_COORDS.main_stage,
      },
    ],
  },
]

const PEC_CENTER: [number, number] = [30.7673, 76.7871]

function LeafletMapInner({
  selectedEvent,
  activeDayIndex,
  dayEvents,
  onClearSelection,
  onSelectEventId,
}: {
  selectedEvent: EventItem | null
  activeDayIndex: number
  dayEvents: EventItem[]
  onClearSelection: () => void
  onSelectEventId: (id: string) => void
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const markersRef = useRef<Record<string, any>>({})

  useEffect(() => {
    if (mapInstanceRef.current) return

    // Dynamically import leaflet + CSS to avoid SSR issues
    Promise.all([
      import('leaflet'),
      import('leaflet/dist/leaflet.css' as any),
    ]).then(([{ default: L }]) => {
      if (mapInstanceRef.current) return

      const map = L.map(mapContainerRef.current!, {
        center: PEC_CENTER,
        zoom: 16,
        zoomControl: false,
        scrollWheelZoom: false,
        attributionControl: false,
      })

      const tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      L.tileLayer(tileUrl, {
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      mapInstanceRef.current = map
      setMapInstance(map)
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        setMapInstance(null)
      }
    }
  }, [])

  // Sync Markers when dayEvents or mapInstance change
  useEffect(() => {
    const L = typeof window !== 'undefined' ? (window as any).L : null
    if (!mapInstance || !L) return

    console.info('[LeafletMapInner] Day events for markers:', dayEvents)

    // Clear old markers
    Object.values(markersRef.current).forEach((marker) => {
      mapInstance.removeLayer(marker)
    })
    markersRef.current = {}

    // Group events by venueId
    const venueMap = new Map<
      string,
      {
        venueId: string
        venueName: string
        building: string
        lat: number
        lng: number
        events: EventItem[]
      }
    >()

    dayEvents.forEach((ev) => {
      const vKey = ev.venueId || ev.id
      const fallback = VENUE_COORDS[vKey]
      let lat = ev.lat || fallback?.lat || PEC_CENTER[0]
      let lng = ev.lng || fallback?.lng || PEC_CENTER[1]

      if (lat === 0 || lng === 0) {
        lat = fallback?.lat || PEC_CENTER[0]
        lng = fallback?.lng || PEC_CENTER[1]
      }

      const venueName = ev.venueName || fallback?.venueName || 'PEC Venue'
      const building = ev.building || fallback?.building || 'PEC Campus'

      const existing = venueMap.get(vKey)
      if (existing) {
        existing.lat = lat
        existing.lng = lng
        existing.venueName = venueName
        existing.building = building
        existing.events.push(ev)
      } else {
        venueMap.set(vKey, {
          venueId: vKey,
          venueName,
          building,
          lat,
          lng,
          events: [ev],
        })
      }
    })

    venueMap.forEach((vData, vKey) => {
      const customIcon = L.divIcon({
        className: `highlights-marker-${vKey}`,
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            cursor: pointer;
          ">
            <div style="
              width: 32px;
              height: 32px;
              background: #0A110E;
              border: 1.5px solid #7ED321;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #7ED321;
              transition: all 0.3s ease;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      const marker = L.marker([vData.lat, vData.lng], { icon: customIcon }).addTo(mapInstance)

      marker.bindPopup(`
        <div style="padding: 12px 14px; font-family: 'JetBrains Mono', monospace; background: #0A110E; color: #ffffff;">
          <h4 style="margin: 0 0 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #7ED321; letter-spacing: 0.05em;">${vData.venueName}</h4>
          <p style="margin: 0; font-size: 10px; color: #94A3B8; text-transform: uppercase;">${vData.building}</p>
        </div>
      `)

      marker.on('click', () => {
        if (vData.events.length > 0) {
          onSelectEventId(vData.events[0].id)
        }
      })

      markersRef.current[vKey] = marker
    })
  }, [dayEvents, mapInstance])

  useEffect(() => {
    if (!mapInstance) return

    const L = typeof window !== 'undefined' ? (window as any).L : null
    if (!L) return

    if (selectedEvent) {
      const fallback = VENUE_COORDS[selectedEvent.venueId]
      let lat = selectedEvent.lat || fallback?.lat || PEC_CENTER[0]
      let lng = selectedEvent.lng || fallback?.lng || PEC_CENTER[1]

      if (lat === 0 || lng === 0) {
        lat = fallback?.lat || PEC_CENTER[0]
        lng = fallback?.lng || PEC_CENTER[1]
      }

      mapInstance.flyTo([lat, lng], 17, { duration: 1.0, easeLinearity: 0.25 })
      const marker = markersRef.current[selectedEvent.venueId]
      if (marker) marker.openPopup()
    } else {
      // Fit bounds containing all day events to ensure everything is visible
      const points = dayEvents
        .map((ev) => {
          const fallback = VENUE_COORDS[ev.venueId || ev.id]
          let lat = ev.lat || fallback?.lat
          let lng = ev.lng || fallback?.lng
          if (lat === 0 || lng === 0) {
            lat = fallback?.lat
            lng = fallback?.lng
          }
          if (lat && lng) {
            return [lat, lng] as [number, number]
          }
          return null
        })
        .filter((p): p is [number, number] => p !== null)

      if (points.length > 0) {
        const bounds = L.latLngBounds(points)
        mapInstance.fitBounds(bounds, { padding: [50, 50], duration: 1.0 })
      } else {
        mapInstance.flyTo(PEC_CENTER, 16, { duration: 1.0, easeLinearity: 0.25 })
      }
    }
  }, [selectedEvent, activeDayIndex, mapInstance, dayEvents])



  return (
    <div className="relative h-full w-full bg-[#0B1410]">
      <style>{`
        .custom-lime-map {
          background: #0B1410 !important;
        }
        .custom-lime-map .leaflet-tile {
          filter: invert(1) grayscale(1) brightness(0.55) contrast(6) sepia(1) hue-rotate(45deg) saturate(3.5) !important;
        }
        
        /* Brutalist Anti-vibecoded Popup Styles */
        .custom-lime-map .leaflet-popup-content-wrapper {
          background: #0A110E !important;
          border-radius: 0px !important;
          border: 1px solid rgba(181, 242, 61, 0.3) !important;
          box-shadow: 0 15px 35px -10px rgba(0,0,0,0.9) !important;
          padding: 0 !important;
        }
        .custom-lime-map .leaflet-popup-tip {
          background: #0A110E !important;
          border-bottom: 1px solid rgba(181, 242, 61, 0.3) !important;
          border-right: 1px solid rgba(181, 242, 61, 0.3) !important;
          box-shadow: none !important;
        }
        .custom-lime-map .leaflet-popup-content {
          margin: 0 !important;
        }
        .custom-lime-map .leaflet-popup-close-button {
          color: #94A3B8 !important;
          padding: 4px !important;
          font-family: monospace !important;
        }
      `}</style>
      {/* Map with lime-green tint via CSS filter */}
      <div
        ref={mapContainerRef}
        className="h-full w-full z-10 custom-lime-map"
      />

      {/* Floating Info Overlay (Brutalist) */}
      <div className="absolute bottom-6 left-6 right-6 sm:right-auto z-20 sm:w-80 bg-[#0A110E] p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,1)] border border-[rgba(255,255,255,0.05)] border-l-4 border-l-mint">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono-data text-[9px] font-bold uppercase tracking-widest text-mint">
            {selectedEvent ? 'Selected Venue' : `Day 0${activeDayIndex + 1} Venues`}
          </span>
          {selectedEvent && (
            <button
              onClick={onClearSelection}
              className="font-mono-data text-[9px] font-bold text-gray-400 hover:text-white transition-colors"
            >
              [ CLEAR ]
            </button>
          )}
        </div>

        <h4 className="mb-1 font-display text-base font-black text-white uppercase tracking-tight">
          {selectedEvent ? selectedEvent.venueName : 'PEC Campus, Sector 12'}
        </h4>

        <p className="mb-3 font-body text-xs text-gray-400 font-medium">
          {selectedEvent ? selectedEvent.title : 'Interactive Leaflet Campus Map'}
        </p>

        <div className="flex items-center gap-1.5 font-mono-data text-[9px] text-gray-500 font-bold tracking-wider uppercase">
          <MapPin size={10} className="text-[#7ED321]" />
          <span>{selectedEvent ? selectedEvent.building : 'Chandigarh 160012'}</span>
        </div>
      </div>
    </div>
  )
}

const HighlightsCampusMap = dynamic(() => Promise.resolve(LeafletMapInner), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-void font-mono-data text-xs text-gray-400">
      Loading Leaflet Campus Map…
    </div>
  ),
})

function HighlightCard({
  card,
  index,
  scrollYProgress,
  selectedEventId,
  onSelectEvent,
}: {
  card: DayCard
  index: number
  scrollYProgress: any
  selectedEventId: string | null
  onSelectEvent: (eventId: string) => void
}) {
  return (
    <div
      className={`w-full lg:sticky ${index > 0 ? 'mt-8 lg:mt-[45vh]' : ''}`}
      style={{
        top: index === 0 ? '5.5rem' : 'calc(5.5rem + 40px)', // Stack slightly lower for second card
        zIndex: 10 + index,
      }}
    >
      <motion.div
        className="flex w-full flex-col justify-between rounded-[32px] border-2 p-6 shadow-2xl sm:rounded-[40px] sm:p-8
                   h-auto lg:h-[calc(100dvh-5.5rem-90px)] lg:overflow-y-auto"
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
                      <span className={`shrink-0 pt-0.5 font-mono-data text-xs font-semibold tracking-wider transition-colors ${
                        isSelected ? 'text-[#7ED321]' : 'text-gray-400 group-hover:text-gray-300'
                      }`}>
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
                              isSelected ? 'fill-[#7ED321] text-[#7ED321]' : 'text-gray-500 group-hover:text-[#7ED321]'
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

export default function EsummitHighlights() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [activeDayIndex, setActiveDayIndex] = useState(0)

  const { scheduleItems } = useSchedule()
  const { data: summitBundle } = useSummitData()
  const globalDates = summitBundle?.siteConfig?.summitDates || 'MARCH 15–16, 2026'

  // Transform CMS schedule items into the DayCard format expected by HighlightCard
  const cmsCards: DayCard[] = useMemo(() => {
    const days = [1, 2] as const
    return days.map((day) => {
      const dayItems = scheduleItems.filter((s) => s.day === day)
      const firstItem = dayItems[0]
      return {
        num: String(day).padStart(2, '0'),
        day: `DAY 0${day}`,
        date: firstItem?.date || `${globalDates} (Day ${day})`,
        title: day === 1 ? 'Inauguration & Pitch Arena' : 'Hackathon Demos & Grand Finals',
        events: dayItems.map((s) => ({
          id: s.id,
          time: s.time,
          title: s.title,
          tag: s.tag,
          venueId: s.venueId,
          venueName: s.venueName,
          building: s.building,
          lat: s.lat,
          lng: s.lng,
        })),
      }
    })
  }, [scheduleItems, globalDates])

  // Use CMS data if available, fall back to dynamic CARDS with updated dates
  const dynamicFallbackCards = useMemo(() => {
    return CARDS.map((c, idx) => ({
      ...c,
      date: `${globalDates} (Day ${idx + 1})`,
    }))
  }, [globalDates])

  const cards = cmsCards.some((c) => c.events.length > 0) ? cmsCards : dynamicFallbackCards

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (latest < 0.5) {
      if (activeDayIndex !== 0) setActiveDayIndex(0)
    } else {
      if (activeDayIndex !== 1) setActiveDayIndex(1)
    }
  })

  const selectedEvent = selectedEventId
    ? cards.flatMap((c) => c.events).find((e) => e.id === selectedEventId) || null
    : null

  const handleSelectEvent = (id: string) => {
    if (selectedEventId === id) {
      setSelectedEventId(null)
    } else {
      setSelectedEventId(id)
    }
  }

  return (
    <section
      id="timeline"
      ref={containerRef}
      className="esummit-section rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px]
        -mt-10 sm:-mt-12 md:-mt-14 z-10 relative
        px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32 bg-section-1 text-white"
      aria-labelledby="timeline-heading"
    >
      <h2
        id="timeline-heading"
        className="font-display font-black uppercase leading-none tracking-tight text-center mb-12 sm:mb-20 md:mb-24"
        style={{
          fontSize: 'clamp(2.2rem, 8vw, 96px)',
        }}
      >
        <span className="text-gradient-mint">TIMELINE</span>
      </h2>

      {/* 2-Column Responsive Layout */}
      <div className="relative flex flex-col lg:flex-row gap-8 items-start min-h-[150vh]">
        {/* Left Column: Leaflet Map (Responsive Card on mobile, Sticky 50% on desktop) */}
        <div className="w-full lg:w-1/2 h-[320px] sm:h-[420px] lg:h-[80vh] relative lg:sticky lg:top-28 z-30 overflow-hidden rounded-[28px] sm:rounded-[32px]">
          <HighlightsCampusMap
            selectedEvent={selectedEvent}
            activeDayIndex={activeDayIndex}
            dayEvents={cards[activeDayIndex]?.events || []}
            onClearSelection={() => setSelectedEventId(null)}
            onSelectEventId={handleSelectEvent}
          />
        </div>

        {/* Right: Day Cards */}
        <div className="w-full lg:w-1/2 relative">
          {cards.map((card, index) => (
            <HighlightCard
              key={card.num}
              card={card}
              index={index}
              scrollYProgress={scrollYProgress}
              selectedEventId={selectedEventId}
              onSelectEvent={handleSelectEvent}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
