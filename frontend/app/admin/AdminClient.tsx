'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  QrCode,
  Megaphone,
  ArrowLeft,
  RefreshCw,
  Eye,
  Check,
  Shield,
  Layers,
  ChevronRight,
  X,
  ExternalLink,
  Table as TableIcon,
  LayoutGrid,
  Sparkles,
  Ticket,
  SlidersHorizontal,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import toast, { Toaster } from 'react-hot-toast'
import { TOAST_STYLE } from '@/lib/constants'
import { MASTER_EVENTS, EventItem } from '@/data/summitData'
import {
  RegistrationRecord,
  getLocalRegistrations,
  saveLocalRegistrations,
  deleteRegistrationRecord,
  updateRegistrationRecord,
} from '@/lib/registrations'

type TabType = 'overview' | 'events' | 'delegates' | 'checkin' | 'announcements'

export default function AdminClient() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [delegates, setDelegates] = useState<RegistrationRecord[]>([])
  const [events, setEvents] = useState<EventItem[]>(MASTER_EVENTS)
  const [isLoading, setIsLoading] = useState(false)
  const [eventViewMode, setEventViewMode] = useState<'table' | 'grid'>('table')
  const [mounted, setMounted] = useState(false)

  // Delegate Filtering & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPassTier, setFilterPassTier] = useState<string>('ALL')
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('ALL')

  // Event Filtering & Search
  const [eventSearchQuery, setEventSearchQuery] = useState('')
  const [eventCategoryFilter, setEventCategoryFilter] = useState<string>('ALL')

  // Slide-over Drawer for Event (Add / Edit)
  const [isEventDrawerOpen, setIsEventDrawerOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null)
  const [eventFormData, setEventFormData] = useState<Partial<EventItem>>({
    title: '',
    category: 'Competition',
    eyebrow: 'SUMMIT EVENT',
    purpose: '',
    delivery: 'Live Presentation & Pitching',
    expectedParticipation: '150+ Participants',
    tags: [],
    partner: '',
  })
  const [tagInput, setTagInput] = useState('')

  // Announcement Banner State
  const [announcementText, setAnnouncementText] = useState(
    'Welcome to PEC E-Summit 2026! Hackathon check-in begins at 09:00 AM in the Main Auditorium.'
  )
  const [isAnnouncementActive, setIsAnnouncementActive] = useState(true)

  // QR Check-In Scanner State
  const [manualTicketInput, setManualTicketInput] = useState('')
  const [scannedResult, setScannedResult] = useState<RegistrationRecord | null>(null)
  const [checkInError, setCheckInError] = useState<string | null>(null)
  const [checkedInList, setCheckedInList] = useState<string[]>([])

  // Edit Delegate Modal
  const [editingDelegate, setEditingDelegate] = useState<RegistrationRecord | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Load initial delegates & events
  const loadData = async () => {
    setIsLoading(true)
    try {
      const local = getLocalRegistrations()
      setDelegates(local)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
      const res = await fetch(`${apiUrl}/events`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setEvents(
            data.map((item: any, idx: number) => ({
              id: item.id || `ev-${idx + 1}`,
              number: item.number || String(idx + 1).padStart(2, '0'),
              title: item.title || item.name || 'Summit Event',
              category: item.category || 'Conference Event',
              eyebrow: item.eyebrow || item.badge || 'SUMMIT TRACK',
              image: item.image || '/gallery/pec_pitch_table.png',
              purpose: item.purpose || item.description || '',
              delivery: item.delivery || 'Live evaluation',
              expectedParticipation: item.expectedParticipation || '100+ Participants',
              tags: Array.isArray(item.tags) ? item.tags : [],
              partner: item.partner || '',
            }))
          )
        }
      }
    } catch {
      // Fallback to local
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // ── CSV EXPORT ──
  const handleExportCSV = () => {
    if (filteredDelegates.length === 0) {
      toast.error('No delegates found to export.', TOAST_STYLE)
      return
    }

    const headers = [
      'Ticket ID',
      'Name',
      'Email',
      'Phone',
      'College',
      'Pass Tier',
      'Selected Events',
      'Amount Paid',
      'Payment Status',
      'Registration Date',
    ]

    const rows = filteredDelegates.map((d) => [
      d.id,
      `"${d.name.replace(/"/g, '""')}"`,
      `"${d.email}"`,
      `"${d.phone || ''}"`,
      `"${(d.college || '').replace(/"/g, '""')}"`,
      `"${d.category}"`,
      `"${(d.selectedEvents || []).join('; ')}"`,
      d.amountPaid ?? 0,
      d.paymentStatus || 'FREE',
      `"${d.date}"`,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `PEC_Summit_Attendees_${new Date().toISOString().slice(0, 10)}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success(`Exported ${filteredDelegates.length} records to CSV!`, TOAST_STYLE)
  }

  // ── OPEN DRAWER FOR ADD / EDIT ──
  const handleOpenAddEvent = () => {
    setEditingEvent(null)
    setEventFormData({
      title: '',
      category: 'Competition',
      eyebrow: 'SUMMIT TRACK',
      purpose: '',
      delivery: 'Live Presentation & Judging',
      expectedParticipation: '150+ Attendees',
      tags: ['E-Summit'],
      partner: '',
    })
    setIsEventDrawerOpen(true)
  }

  const handleOpenEditEvent = (ev: EventItem) => {
    setEditingEvent(ev)
    setEventFormData({
      title: ev.title,
      category: ev.category,
      eyebrow: ev.eyebrow,
      purpose: ev.purpose,
      delivery: ev.delivery || '',
      expectedParticipation: ev.expectedParticipation || '',
      tags: ev.tags || [],
      partner: ev.partner || '',
    })
    setIsEventDrawerOpen(true)
  }

  // ── ADD / UPDATE EVENT ──
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventFormData.title?.trim()) {
      toast.error('Event title is required.', TOAST_STYLE)
      return
    }

    if (editingEvent) {
      const updated = events.map((ev) =>
        ev.id === editingEvent.id
          ? {
              ...ev,
              ...eventFormData,
              title: eventFormData.title || ev.title,
              category: eventFormData.category || ev.category,
              eyebrow: eventFormData.eyebrow || ev.eyebrow,
              purpose: eventFormData.purpose || ev.purpose,
              delivery: eventFormData.delivery || ev.delivery,
              expectedParticipation: eventFormData.expectedParticipation || ev.expectedParticipation,
              tags: eventFormData.tags || ev.tags,
              partner: eventFormData.partner || ev.partner,
            }
          : ev
      )
      setEvents(updated)
      toast.success('Event updated successfully.', TOAST_STYLE)
    } else {
      const newId = `ev-${events.length + 1}`
      const created: EventItem = {
        id: newId,
        number: String(events.length + 1).padStart(2, '0'),
        title: eventFormData.title.trim(),
        category: eventFormData.category || 'Competition',
        eyebrow: eventFormData.eyebrow || 'SUMMIT TRACK',
        image: '/gallery/pec_pitch_table.png',
        purpose: eventFormData.purpose?.trim() || 'Summit competition and interactive session.',
        delivery: eventFormData.delivery?.trim() || 'Live Presentation & Pitching',
        expectedParticipation: eventFormData.expectedParticipation || '150+ Attendees',
        tags: eventFormData.tags && eventFormData.tags.length > 0 ? eventFormData.tags : ['E-Summit'],
        partner: eventFormData.partner || '',
      }
      setEvents([...events, created])
      toast.success('New event created in CMS!', TOAST_STYLE)
    }

    setIsEventDrawerOpen(false)
  }

  const handleDeleteEvent = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event from the schedule?')) return
    setEvents(events.filter((ev) => ev.id !== id))
    toast.success('Event deleted from CMS.', TOAST_STYLE)
  }

  // ── CHECK-IN VERIFICATION ──
  const handleVerifyCheckIn = (ticketIdToLookup: string) => {
    const queryStr = ticketIdToLookup.trim().toUpperCase()
    if (!queryStr) {
      setCheckInError('Please enter a valid Ticket ID or Email.')
      return
    }

    const found = delegates.find(
      (d) => d.id.toUpperCase() === queryStr || d.email.toUpperCase() === queryStr
    )

    if (found) {
      setScannedResult(found)
      setCheckInError(null)
      if (!checkedInList.includes(found.id)) {
        setCheckedInList((prev) => [found.id, ...prev])
      }
      toast.success(`Check-In Verified: ${found.name}`, TOAST_STYLE)
    } else {
      setScannedResult(null)
      setCheckInError(`No registration record found for: ${queryStr}`)
      toast.error('Pass not found in database.', TOAST_STYLE)
    }
  }

  // ── FILTERED DATA ──
  const filteredDelegates = delegates.filter((d) => {
    const matchesSearch =
      !searchQuery.trim() ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.college && d.college.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesTier =
      filterPassTier === 'ALL' || d.category.toLowerCase().includes(filterPassTier.toLowerCase())

    const matchesPayment =
      filterPaymentStatus === 'ALL' || (d.paymentStatus || 'FREE') === filterPaymentStatus

    return matchesSearch && matchesTier && matchesPayment
  })

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      !eventSearchQuery.trim() ||
      ev.title.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
      ev.category.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
      ev.purpose.toLowerCase().includes(eventSearchQuery.toLowerCase())

    const matchesCat =
      eventCategoryFilter === 'ALL' ||
      ev.category.toLowerCase().includes(eventCategoryFilter.toLowerCase())

    return matchesSearch && matchesCat
  })

  // Metrics
  const totalRevenue = delegates.reduce((sum, d) => sum + (d.amountPaid || 0), 0)
  const paidCount = delegates.filter((d) => d.paymentStatus === 'PAID').length
  const freeCount = delegates.filter((d) => !d.paymentStatus || d.paymentStatus === 'FREE').length

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'events', label: 'Events & Schedule', icon: Calendar, badge: events.length },
    { id: 'delegates', label: 'Attendees & Passes', icon: Users, badge: delegates.length },
    { id: 'checkin', label: 'Live QR Check-In', icon: QrCode },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
  ]

  return (
    <div className="min-h-screen bg-[#07110C] text-neutral-100 flex selection:bg-mint/30 selection:text-white font-body antialiased">
      <Toaster position="top-center" />

      {/* ── LEFT FIXED SIDEBAR ── */}
      <aside className="w-64 border-r border-white/10 bg-[#060D09] flex flex-col justify-between shrink-0 fixed inset-y-0 left-0 z-30">
        <div className="p-4 space-y-6">
          {/* Top Brand Header */}
          <div className="flex items-center justify-between px-2 pt-1">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-mint text-black flex items-center justify-center font-bold font-mono text-sm shadow-md">
                PEC
              </div>
              <div>
                <span className="font-display text-sm font-bold text-white block leading-none">
                  E-Summit &apos;26
                </span>
                <span className="text-[10px] text-neutral-500 font-mono mt-0.5 block">
                  Admin Console
                </span>
              </div>
            </Link>
          </div>

          {/* System Status Pill */}
          <div className="mx-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
              <span className="text-neutral-300 font-medium">System Online</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-500">v2.4</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <span className="text-[10px] uppercase font-semibold text-neutral-500 px-3 tracking-wider block mb-2">
              Management
            </span>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-mint text-black font-semibold shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-semibold ${
                        isActive ? 'bg-black/20 text-black' : 'bg-white/10 text-neutral-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Profile & Public Link */}
        <div className="p-4 border-t border-white/10 space-y-3 bg-[#050B07]">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/5 text-xs text-neutral-300 hover:text-white transition-all"
          >
            <span>Public Website</span>
            <ExternalLink size={13} className="text-neutral-500" />
          </Link>

          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs text-mint">
                SA
              </div>
              <div className="leading-tight">
                <span className="text-xs font-medium text-white block">Super Admin</span>
                <span className="text-[10px] text-neutral-500">admin@pec.ac.in</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── RIGHT MAIN CONTENT AREA ── */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 border-b border-white/10 bg-[#07110C]/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Link href="/" className="hover:text-white transition-colors">
              E-Summit &apos;26
            </Link>
            <span>/</span>
            <span className="text-white font-medium capitalize">
              {activeTab === 'overview' && 'Overview'}
              {activeTab === 'events' && 'Events & Schedule CMS'}
              {activeTab === 'delegates' && 'Attendees & Passes'}
              {activeTab === 'checkin' && 'Live Check-In Desk'}
              {activeTab === 'announcements' && 'Announcements & Ticker'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-neutral-300 transition-colors"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin text-mint' : ''} />
              <span>Refresh</span>
            </button>

            {activeTab === 'events' && (
              <button
                type="button"
                onClick={handleOpenAddEvent}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-mint hover:bg-white text-black text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
              >
                <Plus size={14} />
                <span>New Event</span>
              </button>
            )}

            {activeTab === 'delegates' && (
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-mint hover:bg-white text-black text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
              >
                <Download size={14} />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl w-full">
          <AnimatePresence mode="wait">
            {/* ══════════════════════════════════════════════════════════════
                VIEW: OVERVIEW / METRICS
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'overview' && (
              <motion.div
                key="tab-overview"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-6"
              >
                <div>
                  <h1 className="font-display text-2xl font-bold text-white">Event Dashboard</h1>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Real-time metrics, registration breakdown, and attendance analytics.
                  </p>
                </div>

                {/* 4 Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-2xl border border-white/10 bg-[#0B1511] p-5 space-y-1.5">
                    <span className="text-[11px] font-medium text-neutral-400">Total Registered</span>
                    <div className="flex items-baseline justify-between">
                      <span className="font-display text-2xl font-bold text-white">
                        {delegates.length}
                      </span>
                      <span className="text-[11px] font-medium text-mint bg-mint/10 px-2 py-0.5 rounded-full">
                        Live Sync
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0B1511] p-5 space-y-1.5">
                    <span className="text-[11px] font-medium text-neutral-400">Total Revenue</span>
                    <div className="flex items-baseline justify-between">
                      <span className="font-display text-2xl font-bold text-mint">
                        ₹{totalRevenue.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] text-neutral-400">{paidCount} Paid</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0B1511] p-5 space-y-1.5">
                    <span className="text-[11px] font-medium text-neutral-400">Active Competitions</span>
                    <div className="flex items-baseline justify-between">
                      <span className="font-display text-2xl font-bold text-white">
                        {events.length}
                      </span>
                      <span className="text-[11px] text-neutral-400">Scheduled</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0B1511] p-5 space-y-1.5">
                    <span className="text-[11px] font-medium text-neutral-400">Check-Ins Completed</span>
                    <div className="flex items-baseline justify-between">
                      <span className="font-display text-2xl font-bold text-white">
                        {checkedInList.length}
                      </span>
                      <span className="text-[11px] text-mint">
                        {delegates.length > 0
                          ? `${Math.round((checkedInList.length / delegates.length) * 100)}%`
                          : '0%'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Event Popularity Breakdown */}
                <div className="rounded-2xl border border-white/10 bg-[#0B1511] p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-base font-bold text-white">
                      Track & Event Registrations
                    </h2>
                    <span className="text-xs text-neutral-400 font-mono">
                      {events.length} active tracks
                    </span>
                  </div>

                  <div className="space-y-4">
                    {events.map((ev) => {
                      const count = delegates.filter(
                        (d) =>
                          d.selectedEvents &&
                          d.selectedEvents.some((name) =>
                            name.toLowerCase().includes(ev.title.toLowerCase())
                          )
                      ).length
                      const pct = delegates.length > 0 ? Math.round((count / delegates.length) * 100) : 0

                      return (
                        <div key={ev.id} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-white font-medium">{ev.title}</span>
                            <span className="text-neutral-400 font-mono">
                              {count} attendees ({pct}%)
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className="h-full bg-mint rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(3, pct)}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                VIEW: EVENTS & SCHEDULE CMS
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'events' && (
              <motion.div
                key="tab-events"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-5"
              >
                {/* Header & Controls Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-display text-2xl font-bold text-white">
                      Events & Competitions ({events.length})
                    </h1>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Create, update, or remove events synced across the fest platform.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => setEventViewMode('table')}
                        className={`p-1.5 rounded-md transition-colors ${
                          eventViewMode === 'table'
                            ? 'bg-mint text-black'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                        title="Table View"
                      >
                        <TableIcon size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEventViewMode('grid')}
                        className={`p-1.5 rounded-md transition-colors ${
                          eventViewMode === 'grid'
                            ? 'bg-mint text-black'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                        title="Grid View"
                      >
                        <LayoutGrid size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
                    />
                    <input
                      type="text"
                      value={eventSearchQuery}
                      onChange={(e) => setEventSearchQuery(e.target.value)}
                      placeholder="Search events by title, category, keywords..."
                      className="w-full rounded-xl border border-white/10 bg-[#0B1511] px-3 py-2 pl-9 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-mint"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
                    {['ALL', 'Competition', 'Conclave', 'Keynote', 'Interactive'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setEventCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                          eventCategoryFilter === cat
                            ? 'bg-mint text-black font-semibold'
                            : 'bg-[#0B1511] border border-white/10 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table View */}
                {eventViewMode === 'table' ? (
                  <div className="rounded-2xl border border-white/10 bg-[#0B1511] overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                            <th className="py-3 px-4">#</th>
                            <th className="py-3 px-4">Event Title</th>
                            <th className="py-3 px-4">Category</th>
                            <th className="py-3 px-4">Capacity</th>
                            <th className="py-3 px-4">Tags</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredEvents.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-12 text-center text-neutral-500">
                                No events found matching your search.
                              </td>
                            </tr>
                          ) : (
                            filteredEvents.map((ev) => (
                              <tr
                                key={ev.id}
                                className="hover:bg-white/[0.02] transition-colors group"
                              >
                                <td className="py-3.5 px-4 font-mono text-neutral-400">
                                  {ev.number}
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="font-semibold text-white block">{ev.title}</span>
                                  <span className="text-[11px] text-neutral-400 line-clamp-1">
                                    {ev.purpose}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-neutral-300 font-medium">
                                    {ev.category}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-neutral-400">
                                  {ev.expectedParticipation || '100+ Attendees'}
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="flex flex-wrap gap-1">
                                    {(ev.tags || []).slice(0, 2).map((tag) => (
                                      <span
                                        key={tag}
                                        className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-neutral-400"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditEvent(ev)}
                                      className="p-1.5 rounded-lg border border-white/10 hover:border-white/30 text-neutral-400 hover:text-white"
                                      title="Edit Event"
                                    >
                                      <Edit3 size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteEvent(ev.id)}
                                      className="p-1.5 rounded-lg border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 text-neutral-400 hover:text-red-400"
                                      title="Delete Event"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* Grid View */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {filteredEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="rounded-2xl border border-white/10 bg-[#0B1511] p-4 flex flex-col justify-between gap-3 hover:border-white/20 transition-all shadow-md"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-semibold text-mint">
                              {ev.number}. {ev.eyebrow}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditEvent(ev)}
                                className="p-1 rounded text-neutral-400 hover:text-white"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteEvent(ev.id)}
                                className="p-1 rounded text-neutral-400 hover:text-red-400"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <h3 className="font-display text-sm font-bold text-white leading-snug">
                            {ev.title}
                          </h3>
                          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                            {ev.purpose}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400">
                          <span>{ev.category}</span>
                          <span className="font-mono text-neutral-500">
                            {ev.expectedParticipation || '100+'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                VIEW: DELEGATES & ATTENDEES ROSTER
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'delegates' && (
              <motion.div
                key="tab-delegates"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-5"
              >
                <div>
                  <h1 className="font-display text-2xl font-bold text-white">
                    Attendee Directory & Passes ({delegates.length})
                  </h1>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Real-time roster of confirmed delegates, pass tiers, and payment records.
                  </p>
                </div>

                {/* Filter Toolbar */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search attendees by name, email, ticket ID, college..."
                      className="w-full rounded-xl border border-white/10 bg-[#0B1511] px-3 py-2 pl-9 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-mint"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                      value={filterPassTier}
                      onChange={(e) => setFilterPassTier(e.target.value)}
                      className="rounded-xl border border-white/10 bg-[#0B1511] px-3 py-2 text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="ALL">All Passes</option>
                      <option value="Student">Student Pass</option>
                      <option value="Hackathon">Hackathon Pass</option>
                      <option value="Pitch">Pitch Pass</option>
                      <option value="Ambassador">Ambassador Pass</option>
                    </select>

                    <select
                      value={filterPaymentStatus}
                      onChange={(e) => setFilterPaymentStatus(e.target.value)}
                      className="rounded-xl border border-white/10 bg-[#0B1511] px-3 py-2 text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="ALL">All Status</option>
                      <option value="PAID">Paid Only</option>
                      <option value="FREE">Free Pass</option>
                    </select>
                  </div>
                </div>

                {/* Data Table */}
                <div className="rounded-2xl border border-white/10 bg-[#0B1511] overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                          <th className="py-3 px-4">Ticket ID</th>
                          <th className="py-3 px-4">Attendee</th>
                          <th className="py-3 px-4">Contact</th>
                          <th className="py-3 px-4">College</th>
                          <th className="py-3 px-4">Pass Tier</th>
                          <th className="py-3 px-4">Payment</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredDelegates.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-neutral-500">
                              No registrations match your search filters.
                            </td>
                          </tr>
                        ) : (
                          filteredDelegates.map((d) => (
                            <tr key={d.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-mint">{d.id}</td>
                              <td className="py-3.5 px-4">
                                <span className="font-semibold text-white block">{d.name}</span>
                                {d.teamName && (
                                  <span className="text-[10px] text-neutral-400">
                                    Team: {d.teamName}
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-neutral-300">
                                <div>{d.email}</div>
                                {d.phone && (
                                  <div className="text-[10px] text-neutral-500">{d.phone}</div>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-neutral-400 truncate max-w-[150px]">
                                {d.college || 'PEC Chandigarh'}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-neutral-300 font-medium">
                                  {d.category}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                    d.paymentStatus === 'PAID'
                                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                      : 'bg-white/5 text-neutral-400'
                                  }`}
                                >
                                  {d.paymentStatus === 'PAID' ? `PAID: ₹${d.amountPaid}` : 'FREE'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setEditingDelegate(d)}
                                    className="p-1.5 rounded-lg border border-white/10 hover:border-white/30 text-neutral-400 hover:text-white"
                                    title="Edit Attendee"
                                  >
                                    <Edit3 size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      if (!window.confirm(`Cancel registration for ${d.name}?`)) return
                                      await deleteRegistrationRecord(d.id)
                                      await loadData()
                                      toast.success('Registration cancelled.', TOAST_STYLE)
                                    }}
                                    className="p-1.5 rounded-lg border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 text-neutral-400 hover:text-red-400"
                                    title="Delete Pass"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                VIEW: LIVE QR CHECK-IN DESK
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'checkin' && (
              <motion.div
                key="tab-checkin"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-6 max-w-4xl"
              >
                <div>
                  <h1 className="font-display text-2xl font-bold text-white">
                    Live Check-In Desk
                  </h1>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Scan delegate QR codes or verify ticket IDs at the registration entrance.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Scanner / Input Box */}
                  <div className="rounded-2xl border border-white/10 bg-[#0B1511] p-5 space-y-4">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      Scan or Enter Ticket ID
                    </h2>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleVerifyCheckIn(manualTicketInput)
                      }}
                      className="space-y-3"
                    >
                      <div className="relative">
                        <QrCode
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
                        />
                        <input
                          type="text"
                          required
                          value={manualTicketInput}
                          onChange={(e) => setManualTicketInput(e.target.value)}
                          placeholder="e.g. PEC-260001 or email"
                          className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 pl-10 text-xs text-white uppercase placeholder:text-neutral-500 outline-none focus:border-mint font-mono"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-mint hover:bg-white text-black text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5"
                      >
                        <Check size={14} />
                        <span>Verify & Check In</span>
                      </button>
                    </form>

                    {checkInError && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                        {checkInError}
                      </div>
                    )}
                  </div>

                  {/* Verified Ticket Preview */}
                  <div className="rounded-2xl border border-white/10 bg-[#0B1511] p-5 flex flex-col justify-between gap-4">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      Verification Result
                    </h2>

                    {scannedResult ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5 text-emerald-400">
                          <CheckCircle2 size={20} />
                          <span className="text-sm font-bold">Pass Verified Successfully</span>
                        </div>

                        <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-[10px] text-neutral-400 uppercase">Attendee</span>
                            <span className="text-xs font-bold text-white">{scannedResult.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[10px] text-neutral-400 uppercase">Ticket ID</span>
                            <span className="text-xs font-mono font-bold text-mint">
                              {scannedResult.id}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[10px] text-neutral-400 uppercase">Pass Tier</span>
                            <span className="text-xs text-neutral-200">{scannedResult.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[10px] text-neutral-400 uppercase">College</span>
                            <span className="text-xs text-neutral-300">{scannedResult.college}</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-mint/10 border border-mint/20 text-center text-xs text-mint font-semibold">
                          Authorized for Summit Badge & Entry Kit
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10 text-neutral-500 text-xs">
                        Scan or enter a pass ID to view credentials.
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Check-Ins Roster */}
                {checkedInList.length > 0 && (
                  <div className="rounded-2xl border border-white/10 bg-[#0B1511] p-5 space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      Recent Check-Ins ({checkedInList.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {checkedInList.map((id) => (
                        <span
                          key={id}
                          className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-mint"
                        >
                          {id}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                VIEW: ANNOUNCEMENTS & LIVE TICKER
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'announcements' && (
              <motion.div
                key="tab-announcements"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-6 max-w-2xl"
              >
                <div>
                  <h1 className="font-display text-2xl font-bold text-white">
                    Live Ticker & Alerts
                  </h1>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Broadcast urgent updates, schedule shifts, or sponsor spotlights directly on the homepage banner.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0B1511] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white">Enable Homepage Banner</span>
                    <button
                      type="button"
                      onClick={() => setIsAnnouncementActive(!isAnnouncementActive)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        isAnnouncementActive ? 'bg-mint' : 'bg-white/15'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-black absolute top-1 transition-transform ${
                          isAnnouncementActive ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-medium text-neutral-300">
                      Ticker Announcement Message
                    </label>
                    <textarea
                      rows={3}
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-mint resize-none"
                    />
                  </div>

                  {/* Banner Live Preview */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-semibold text-neutral-500 block">
                      Live Preview
                    </span>
                    <div className="rounded-xl border border-mint/20 bg-mint/5 p-3 flex items-center gap-2.5 text-xs text-mint">
                      <Megaphone size={14} className="shrink-0" />
                      <span className="font-medium truncate">{announcementText}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toast.success('Announcement updated on homepage!', TOAST_STYLE)}
                    className="px-4 py-2 rounded-xl bg-mint hover:bg-white text-black text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    Publish Announcement
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* ── SLIDE-OVER DRAWER FOR ADD / EDIT EVENT ── */}
      <AnimatePresence>
        {isEventDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-[#09140E] border-l border-white/15 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                  <h2 className="font-display text-lg font-bold text-white">
                    {editingEvent ? 'Edit Event' : 'Create New Event'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsEventDrawerOpen(false)}
                    className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form id="event-form" onSubmit={handleSaveEvent} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-neutral-300">
                      Event Title <span className="text-mint">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={eventFormData.title}
                      onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                      placeholder="e.g. 24-Hour AI Sprint"
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-mint"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-neutral-300">Category</label>
                      <select
                        value={eventFormData.category}
                        onChange={(e) =>
                          setEventFormData({ ...eventFormData, category: e.target.value })
                        }
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-2.5 py-2 text-xs text-white outline-none focus:border-mint"
                      >
                        <option value="Competition">Competition</option>
                        <option value="Conclave">Conclave</option>
                        <option value="Keynote">Keynote</option>
                        <option value="Interactive">Interactive</option>
                        <option value="Workshop">Workshop</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-neutral-300">
                        Eyebrow / Track
                      </label>
                      <input
                        type="text"
                        value={eventFormData.eyebrow}
                        onChange={(e) =>
                          setEventFormData({ ...eventFormData, eyebrow: e.target.value })
                        }
                        placeholder="SUMMIT TRACK"
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-mint"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-neutral-300">
                      Purpose & Description
                    </label>
                    <textarea
                      rows={3}
                      value={eventFormData.purpose}
                      onChange={(e) => setEventFormData({ ...eventFormData, purpose: e.target.value })}
                      placeholder="Explain what happens in this event..."
                      className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-white outline-none focus:border-mint resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-neutral-300">
                      Capacity / Expected Participation
                    </label>
                    <input
                      type="text"
                      value={eventFormData.expectedParticipation}
                      onChange={(e) =>
                        setEventFormData({
                          ...eventFormData,
                          expectedParticipation: e.target.value,
                        })
                      }
                      placeholder="e.g. 150+ Teams"
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-mint"
                    />
                  </div>
                </form>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEventDrawerOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-neutral-400 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="event-form"
                  className="px-5 py-2 rounded-xl bg-mint hover:bg-white text-black text-xs font-bold uppercase tracking-wider shadow-md transition-all"
                >
                  Save Event
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── EDIT ATTENDEE MODAL ── */}
      <AnimatePresence>
        {editingDelegate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0B1511] p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-display text-base font-bold text-white">Edit Attendee Record</h3>
                <button
                  type="button"
                  onClick={() => setEditingDelegate(null)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
                >
                  <X size={16} />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (!editingDelegate) return
                  await updateRegistrationRecord(editingDelegate.id, {
                    name: editingDelegate.name,
                    phone: editingDelegate.phone,
                    college: editingDelegate.college,
                  })
                  await loadData()
                  setEditingDelegate(null)
                  toast.success('Attendee record updated!', TOAST_STYLE)
                }}
                className="space-y-3"
              >
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-neutral-300">Name</label>
                  <input
                    type="text"
                    required
                    value={editingDelegate.name}
                    onChange={(e) =>
                      setEditingDelegate({ ...editingDelegate, name: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-mint"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-neutral-300">
                    College / University
                  </label>
                  <input
                    type="text"
                    value={editingDelegate.college}
                    onChange={(e) =>
                      setEditingDelegate({ ...editingDelegate, college: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-mint"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-neutral-300">Phone</label>
                  <input
                    type="tel"
                    value={editingDelegate.phone || ''}
                    onChange={(e) =>
                      setEditingDelegate({ ...editingDelegate, phone: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-mint"
                  />
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingDelegate(null)}
                    className="px-4 py-2 rounded-xl border border-white/10 text-neutral-400 hover:text-white text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-mint hover:bg-white text-black text-xs font-bold uppercase tracking-wider shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
