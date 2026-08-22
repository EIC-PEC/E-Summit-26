'use client'

import dynamic from 'next/dynamic'

export interface ScheduleEvent {
  id: string
  time: string
  title: string
  type: string
  track: string | null
  venueId: string
  venueName: string
  building?: string
  lat?: number
  lng?: number
  distance: string
  walkTime: string
}

interface CampusMapProps {
  events: ScheduleEvent[]
  selectedEvent: ScheduleEvent | null
  onSelectEvent: (event: ScheduleEvent | null) => void
  activeDayLabel: string
}

const PecLeafletMap = dynamic(() => import('./PecLeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] sm:h-[600px] lg:h-[640px] rounded-3xl bg-[#080C10] border border-white/10 flex items-center justify-center font-mono-data text-xs text-gray-400">
      Loading PEC Chandigarh Campus Map...
    </div>
  ),
})

export default function CampusMap(props: CampusMapProps) {
  return <PecLeafletMap {...props} />
}
