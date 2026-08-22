'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Ticket,
  LogOut,
  LogIn,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import toast, { Toaster } from 'react-hot-toast'
import { TOAST_STYLE } from '@/lib/constants'
import { useAuth } from '@/context/AuthContext'
import {
  RegistrationRecord,
  createRegistrationRecord,
  getUserRegistrations,
  updateRegistrationRecord,
  deleteRegistrationRecord,
} from '@/lib/registrations'
import { MASTER_EVENTS, EventItem } from '@/data/summitData'
import { useSummitData } from '@/hooks/useSummitData'

import {
  PassTier,
  PASS_TIERS,
  INTEREST_TRACKS,
  RegistrationFormData,
} from './types'
import { AuthGateModal } from './components/AuthGateModal'
import { PassTierCards } from './components/PassTierCards'
import { EventPicker } from './components/EventPicker'
import { CheckoutSummary } from './components/CheckoutSummary'
import { TicketPassModal } from './components/TicketPassModal'
import { MyPassesRoster } from './components/MyPassesRoster'

export default function RegisterClient() {
  const { user, loginWithEmail, registerWithEmail, loginWithGoogle, resetPassword, logout } =
    useAuth()
  const { data: cmsData } = useSummitData()
  const summitDates = cmsData?.siteConfig?.summitDates || 'March 15-16, 2026'

  const [view, setView] = useState<'catalog' | 'checkout' | 'success' | 'passes' | 'auth'>('catalog')
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login')
  const [selectedPassId, setSelectedPassId] = useState('student')
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [eventsList, setEventsList] = useState<EventItem[]>(MASTER_EVENTS)
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>(['ev-1', 'ev-2', 'ev-5'])
  const [selectedTracks, setSelectedTracks] = useState<string[]>([])
  const [myRegistrations, setMyRegistrations] = useState<RegistrationRecord[]>([])
  const [currentBadge, setCurrentBadge] = useState<RegistrationRecord | null>(null)
  const [editingPass, setEditingPass] = useState<RegistrationRecord | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Promo Code
  const [couponCode, setCouponCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)

  // Auth Inputs
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authName, setAuthName] = useState('')

  // Form Inputs
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: '',
    email: '',
    phone: '',
    college: '',
    teamName: '',
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Enforce Step 1: Google Auth Gate if not logged in
  useEffect(() => {
    if (mounted && !user && (view === 'catalog' || view === 'checkout')) {
      setView('auth')
    }
  }, [mounted, user, view])

  // Fetch real events dynamically from MongoDB CMS API with MASTER_EVENTS fallback
  useEffect(() => {
    const loadCmsEvents = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
        const res = await fetch(`${apiUrl}/events`)
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            setEventsList(
              data.map((item: any, idx: number) => ({
                id: item.id || `ev-${idx + 1}`,
                number: item.number || String(idx + 1).padStart(2, '0'),
                title: item.title || item.name || 'Summit Event',
                category: item.category || 'Conference Event',
                eyebrow: item.eyebrow || item.badge || 'SUMMIT TRACK',
                image: item.image || '/gallery/pec_pitch_table.png',
                purpose: item.purpose || item.description || item.desc || '',
                delivery: item.delivery || '',
                expectedParticipation: item.expectedParticipation || '',
                tags: Array.isArray(item.tags) ? item.tags : [],
                partner: item.partner || '',
              }))
            )
          }
        }
      } catch {
        // Fallback gracefully to MASTER_EVENTS
      }
    }
    loadCmsEvents()
  }, [])

  // Pre-fill form when user logs in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.displayName || '',
        email: user.email || prev.email || '',
      }))
    }
  }, [user])

  const fetchRegistrations = useCallback(async () => {
    const records = await getUserRegistrations(user?.uid, user?.email || undefined)
    setMyRegistrations(records)
  }, [user])

  useEffect(() => {
    fetchRegistrations()
  }, [fetchRegistrations])

  const selectedTier: PassTier = PASS_TIERS.find((p) => p.id === selectedPassId) || PASS_TIERS[0]
  const basePrice = selectedTier.fee
  const discountAmount = Math.round((basePrice * discountPercent) / 100)
  const finalPrice = Math.max(0, basePrice - discountAmount)

  const handlePassChange = (newPassId: string) => {
    setSelectedPassId(newPassId)
    const tier = PASS_TIERS.find((p) => p.id === newPassId)
    if (tier?.defaultEventId && !selectedEventIds.includes(tier.defaultEventId)) {
      setSelectedEventIds((prev) => [...prev, tier.defaultEventId!])
    }
  }

  const toggleEvent = (id: string) => {
    setSelectedEventIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const toggleTrack = (track: string) => {
    setSelectedTracks((prev) =>
      prev.includes(track) ? prev.filter((t) => t !== track) : [...prev, track]
    )
  }

  // Filter events based on active category & search query
  const filteredEvents = useMemo(() => {
    return eventsList.filter((ev) => {
      const matchesSearch =
        !searchQuery.trim() ||
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

      if (!matchesSearch) return false

      if (activeCategory === 'all') return true
      const cat = (ev.category + ' ' + ev.eyebrow + ' ' + ev.title).toLowerCase()
      if (activeCategory === 'hackathon') return cat.includes('hack') || cat.includes('code') || cat.includes('tech')
      if (activeCategory === 'pitch') return cat.includes('pitch') || cat.includes('startup') || cat.includes('ignite')
      if (activeCategory === 'finance') return cat.includes('auction') || cat.includes('finance') || cat.includes('ipl')
      if (activeCategory === 'workshops') return cat.includes('conclave') || cat.includes('workshop') || cat.includes('internship') || cat.includes('hunt')
      return true
    })
  }, [eventsList, activeCategory, searchQuery])

  // Apply Coupon
  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase()
    if (!code) {
      toast.error('Please enter a coupon code.', TOAST_STYLE)
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
      const res = await fetch(`${apiUrl}/payments/validate-coupon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, passType: selectedPassId }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.valid) {
          setDiscountPercent(data.discountPercent)
          toast.success(`Coupon applied: ${data.discountPercent}% discount!`, TOAST_STYLE)
          return
        }
      }
    } catch {
      // Fallback local coupon check
    }

    if (code === 'EARLYBIRD' || code === 'PECFAM' || code === 'FREEPASS') {
      setDiscountPercent(100)
      toast.success('Coupon Applied: 100% Discount!', TOAST_STYLE)
    } else if (code === 'STUDENT50') {
      setDiscountPercent(50)
      toast.success('Coupon Applied: 50% Discount!', TOAST_STYLE)
    } else if (code === 'SUMMIT20') {
      setDiscountPercent(20)
      toast.success('Coupon Applied: 20% Discount!', TOAST_STYLE)
    } else {
      toast.error('Invalid or expired coupon code.', TOAST_STYLE)
    }
  }

  // Handle proceed to checkout
  const handleProceedToCheckout = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please sign in with Google to continue.', TOAST_STYLE)
      setView('auth')
      return
    }
    if (!formData.name.trim()) {
      toast.error('Please enter your full name.', TOAST_STYLE)
      return
    }
    if (!formData.email.trim()) {
      toast.error('Please enter your email address.', TOAST_STYLE)
      return
    }
    setView('checkout')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Complete Order
  const handleCompleteOrder = async () => {
    setIsSubmitting(true)
    const toastId = toast.loading('Securing your pass...', TOAST_STYLE)

    try {
      if (finalPrice > 0) {
        let orderData = { id: `order_${Date.now()}`, key_id: 'rzp_test_placeholder' }
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
          const orderRes = await fetch(`${apiUrl}/payments/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: finalPrice,
              passType: selectedPassId,
              email: formData.email,
              name: formData.name,
            }),
          })
          if (orderRes.ok) {
            orderData = await orderRes.json()
          }
        } catch {
          // Fallback
        }

        const isScriptLoaded = await new Promise<boolean>((resolve) => {
          if (typeof window !== 'undefined' && (window as any).Razorpay) {
            resolve(true)
            return
          }
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = () => resolve(true)
          script.onerror = () => resolve(false)
          document.body.appendChild(script)
        })

        if (!isScriptLoaded || !(window as any).Razorpay) {
          toast.dismiss(toastId)
          await finalizeSuccessfulBooking('DEMO_TXN_' + Date.now())
          return
        }

        const options = {
          key: orderData.key_id || 'rzp_test_51MockKey',
          amount: finalPrice * 100,
          currency: 'INR',
          name: 'PEC E-Summit 2026',
          description: `${selectedTier.title} - Official Pass`,
          image: '/eic-logo.png',
          order_id: orderData.id.startsWith('order_') ? undefined : orderData.id,
          handler: async function (response: any) {
            await finalizeSuccessfulBooking(response.razorpay_payment_id || `txn_${Date.now()}`)
          },
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone || '',
          },
          theme: { color: '#B5F23D' },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false)
              toast.dismiss(toastId)
              toast.error('Payment cancelled.', TOAST_STYLE)
            },
          },
        }

        const rzp = new (window as any).Razorpay(options)
        rzp.open()
        toast.dismiss(toastId)
        return
      }

      // Free Pass
      await finalizeSuccessfulBooking(undefined)
      toast.dismiss(toastId)
    } catch (err) {
      console.error(err)
      toast.dismiss(toastId)
      toast.error('Booking failed. Please try again.', TOAST_STYLE)
      setIsSubmitting(false)
    }
  }

  const finalizeSuccessfulBooking = async (paymentId?: string) => {
    try {
      const selectedEventTitles = eventsList
        .filter((ev) => selectedEventIds.includes(ev.id))
        .map((ev) => ev.title)

      const record = await createRegistrationRecord({
        userId: user?.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        college: formData.college || 'PEC Chandigarh',
        category: selectedTier.title,
        tracks: selectedTracks.length > 0 ? selectedTracks : [selectedTier.title],
        selectedEvents: selectedEventTitles,
        amountPaid: finalPrice,
        paymentStatus: finalPrice === 0 ? 'FREE' : 'PAID',
        paymentId,
        teamName: formData.teamName,
      })

      setCurrentBadge(record)
      await fetchRegistrations()
      setView('success')
      toast.success('Your pass is confirmed!', TOAST_STYLE)
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || 'Failed to save booking.', TOAST_STYLE)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auth Submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)

    if (authMode === 'forgot') {
      const res = await resetPassword(authEmail)
      setAuthLoading(false)
      if (res.success) {
        toast.success('Password reset link sent to your email!', TOAST_STYLE)
        setAuthMode('login')
      } else {
        toast.error(res.error || 'Failed to send reset link.', TOAST_STYLE)
      }
      return
    }

    if (authMode === 'signup') {
      const res = await registerWithEmail(authEmail, authPassword, authName)
      setAuthLoading(false)
      if (res.success) {
        toast.success('Account created successfully!', TOAST_STYLE)
        setView('catalog')
      } else {
        toast.error(res.error || 'Failed to create account.', TOAST_STYLE)
      }
      return
    }

    // Login
    const res = await loginWithEmail(authEmail, authPassword)
    setAuthLoading(false)
    if (res.success) {
      toast.success('Welcome back!', TOAST_STYLE)
      setView('catalog')
    } else {
      toast.error(res.error || 'Invalid credentials.', TOAST_STYLE)
    }
  }

  const handleGoogleSignIn = async () => {
    setAuthLoading(true)
    const res = await loginWithGoogle()
    setAuthLoading(false)
    if (res.success) {
      toast.success('Signed in with Google!', TOAST_STYLE)
      setView('catalog')
    } else {
      toast.error(res.error || 'Google sign-in failed.', TOAST_STYLE)
    }
  }

  // Delete Pass
  const handleDeletePass = async (ticketId: string) => {
    if (!window.confirm('Are you sure you want to cancel this pass?')) {
      return
    }

    try {
      await deleteRegistrationRecord(ticketId)
      if (currentBadge?.id === ticketId) {
        setCurrentBadge(null)
      }
      await fetchRegistrations()
      toast.success('Booking cancelled.', TOAST_STYLE)
    } catch {
      toast.error('Failed to cancel booking.', TOAST_STYLE)
    }
  }

  // Instagram Story Badge Export
  const handleExportInstagramStory = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1920
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const bgGradient = ctx.createLinearGradient(0, 0, 0, 1920)
    bgGradient.addColorStop(0, '#0B1410')
    bgGradient.addColorStop(0.5, '#13221C')
    bgGradient.addColorStop(1, '#070A09')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, 1080, 1920)

    ctx.textAlign = 'center'
    ctx.fillStyle = '#B5F23D'
    ctx.font = 'bold 36px monospace'
    ctx.fillText('PEC E-SUMMIT 2026', 540, 220)

    ctx.fillStyle = '#FAFAFA'
    ctx.font = '900 84px sans-serif'
    ctx.fillText('OFFICIAL SUMMIT', 540, 320)

    ctx.fillStyle = '#B5F23D'
    ctx.font = '900 84px sans-serif'
    ctx.fillText('ENTRY PASS', 540, 410)

    const cardX = 100
    const cardY = 490
    const cardW = 880
    const cardH = 1080

    ctx.save()
    ctx.beginPath()
    ctx.rect(cardX, cardY, cardW, cardH)
    ctx.fillStyle = '#13221C'
    ctx.fill()
    ctx.lineWidth = 2
    ctx.strokeStyle = 'rgba(181, 242, 61, 0.3)'
    ctx.stroke()
    ctx.restore()

    const categoryText = currentBadge?.category || 'SUMMIT PASS'
    ctx.fillStyle = 'rgba(181, 242, 61, 0.15)'
    ctx.beginPath()
    ctx.rect(540 - 180, cardY + 60, 360, 60)
    ctx.fill()
    ctx.strokeStyle = '#B5F23D'
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.fillStyle = '#B5F23D'
    ctx.font = 'bold 26px monospace'
    ctx.fillText(categoryText.toUpperCase(), 540, cardY + 100)

    const nameText = (currentBadge?.name || formData.name || 'ATTENDEE NAME').toUpperCase()
    ctx.fillStyle = '#FAFAFA'
    ctx.font = '900 68px sans-serif'
    ctx.fillText(nameText, 540, cardY + 230)

    const collegeText = (
      currentBadge?.college ||
      formData.college ||
      'PUNJAB ENGINEERING COLLEGE'
    ).toUpperCase()
    ctx.fillStyle = '#94A3B8'
    ctx.font = 'bold 28px monospace'
    ctx.fillText(collegeText, 540, cardY + 290)

    const link = document.createElement('a')
    link.download = `PEC_ESummit_Pass_${currentBadge?.id || '2026'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <main className="min-h-screen bg-[#0B1410] text-[#E2E8F0] flex flex-col justify-between selection:bg-mint/30 selection:text-white font-body antialiased">
      <Toaster position="top-center" />

      {/* ── TOP HEADER / MINIMALIST NAVIGATION ── */}
      <header className="w-full border-b border-white/[0.08] bg-[#0B1410]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors group shrink-0 whitespace-nowrap"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform text-neutral-400 shrink-0" />
            <span className="hidden sm:inline">Back to E-Summit &apos;26</span>
            <span className="sm:hidden text-xs">Back</span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {!mounted ? (
              <div className="w-16 h-7" />
            ) : user ? (
              <div className="flex items-center gap-1.5 bg-[#13221C] border border-white/10 rounded-md px-2 py-1 text-xs text-neutral-300">
                <span className="font-medium max-w-[80px] sm:max-w-[120px] truncate text-neutral-200 text-[11px] sm:text-xs">
                  {user.displayName || user.email?.split('@')[0]}
                </span>

                <button
                  type="button"
                  onClick={() => setView(view === 'passes' ? 'catalog' : 'passes')}
                  className={`px-2 py-0.5 rounded text-[11px] sm:text-xs font-semibold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                    view === 'passes'
                      ? 'bg-mint text-void font-bold'
                      : 'bg-white/10 text-white hover:bg-white/15'
                  }`}
                >
                  <Ticket size={11} className="shrink-0" />
                  <span className="hidden sm:inline">My Passes</span>
                  <span>({myRegistrations.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => logout()}
                  title="Sign Out"
                  className="p-0.5 rounded hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors shrink-0 cursor-pointer"
                >
                  <LogOut size={12} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login')
                  setView('auth')
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 hover:bg-white/10 px-2.5 py-1 text-xs font-medium text-white transition-all shrink-0 whitespace-nowrap cursor-pointer"
              >
                <LogIn size={13} className="text-mint shrink-0" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── BODY CONTENT ── */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 pb-28 relative z-10">
        <AnimatePresence mode="wait">
          {/* VIEW: AUTH MODAL */}
          {view === 'auth' && (
            <AuthGateModal
              authMode={authMode}
              setAuthMode={setAuthMode}
              authEmail={authEmail}
              setAuthEmail={setAuthEmail}
              authPassword={authPassword}
              setAuthPassword={setAuthPassword}
              authName={authName}
              setAuthName={setAuthName}
              authLoading={authLoading}
              handleAuthSubmit={handleAuthSubmit}
              handleGoogleSignIn={handleGoogleSignIn}
            />
          )}

          {/* VIEW: PASS CATALOG */}
          {view === 'catalog' && (
            <motion.div
              key="catalog-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#13221C] border border-white/10 text-[11px] font-medium text-neutral-300 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
                  <span>{summitDates} • PEC Chandigarh</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Get Your Summit Pass
                </h1>
                <p className="text-xs text-neutral-400 max-w-xl">
                  Choose your pass tier, select your event tracks, and complete your registration in under 2 minutes.
                </p>
              </div>

              <form onSubmit={handleProceedToCheckout} className="space-y-6">
                {/* 1. Pass Tier Cards */}
                <PassTierCards
                  selectedPassId={selectedPassId}
                  onSelectPass={handlePassChange}
                />

                {/* 2. Events & Workshops Picker */}
                <EventPicker
                  eventsList={eventsList}
                  filteredEvents={filteredEvents}
                  selectedEventIds={selectedEventIds}
                  toggleEvent={toggleEvent}
                  onSelectAll={() => setSelectedEventIds(eventsList.map((e) => e.id))}
                  onClearAll={() => setSelectedEventIds([])}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                />

                {/* 3. Contact Details Form */}
                <div className="space-y-2.5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded bg-white/10 text-white text-[10px] flex items-center justify-center font-mono font-bold">
                      3
                    </span>
                    <span>Your Contact Details</span>
                  </h2>

                  <div className="rounded-lg border border-white/10 bg-[#13221C] p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-medium text-neutral-300">
                          Full Name <span className="text-mint">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Aryan Sharma"
                          className="w-full rounded-md border border-white/10 bg-[#0B1410] px-3 py-2 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-mint transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-medium text-neutral-300">
                          Email Address <span className="text-mint">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="e.g. aryan@college.edu or gmail.com"
                          className="w-full rounded-md border border-white/10 bg-[#0B1410] px-3 py-2 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-mint transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-medium text-neutral-300">
                          WhatsApp / Contact Number
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full rounded-md border border-white/10 bg-[#0B1410] px-3 py-2 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-mint transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-medium text-neutral-300">
                          College / Institution
                        </label>
                        <input
                          type="text"
                          value={formData.college}
                          onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                          placeholder="e.g. Punjab Engineering College"
                          className="w-full rounded-md border border-white/10 bg-[#0B1410] px-3 py-2 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-mint transition-colors"
                        />
                      </div>

                      {(selectedPassId === 'founder' || selectedPassId === 'hackathon') && (
                        <div className="space-y-1 sm:col-span-2">
                          <label className="block text-[11px] font-medium text-neutral-300">
                            Team / Startup Name (Optional)
                          </label>
                          <input
                            type="text"
                            value={formData.teamName}
                            onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                            placeholder="e.g. Team ByteMasters"
                            className="w-full rounded-md border border-white/10 bg-[#0B1410] px-3 py-2 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-mint transition-colors"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. Topics of Interest */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-white/10 text-white text-[10px] flex items-center justify-center font-mono font-bold">
                        4
                      </span>
                      <span>Topics You Care About</span>
                    </h2>
                    <span className="text-[11px] text-neutral-500 font-mono">Optional</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {INTEREST_TRACKS.map((track) => {
                      const isSelected = selectedTracks.includes(track)
                      return (
                        <button
                          type="button"
                          key={track}
                          onClick={() => toggleTrack(track)}
                          className={`text-xs px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-mint bg-mint/10 text-mint font-medium'
                              : 'border-white/10 bg-white/5 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <span>{track}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* STICKY BOTTOM ACTION BAR */}
                <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B1410]/95 backdrop-blur-md border-t border-white/10 py-3 shadow-2xl">
                  <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-[11px] text-neutral-400 block">
                          Selected: <span className="text-white font-semibold">{selectedTier.title}</span>
                          <span className="text-neutral-500 text-[10px] ml-1">({selectedEventIds.length} events)</span>
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs text-neutral-500">Total:</span>
                          <span className="font-mono text-sm sm:text-base font-bold text-mint">
                            {basePrice === 0 ? 'FREE' : `₹${basePrice}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2 rounded-md bg-mint hover:bg-white text-void text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 shadow-sm active:scale-98 cursor-pointer"
                    >
                      <span>Continue to Summary</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}

          {/* VIEW: CHECKOUT & PAYMENT */}
          {view === 'checkout' && (
            <CheckoutSummary
              selectedTier={selectedTier}
              eventsList={eventsList}
              selectedEventIds={selectedEventIds}
              formData={formData}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              discountPercent={discountPercent}
              applyCoupon={applyCoupon}
              basePrice={basePrice}
              discountAmount={discountAmount}
              finalPrice={finalPrice}
              isSubmitting={isSubmitting}
              handleCompleteOrder={handleCompleteOrder}
              onBackToEdit={() => setView('catalog')}
            />
          )}

          {/* VIEW: SUCCESS / QR TICKET BADGE */}
          {view === 'success' && currentBadge && (
            <TicketPassModal
              currentBadge={currentBadge}
              summitDates={summitDates}
              onExportInstagramStory={handleExportInstagramStory}
              onPrint={() => window.print()}
              onEdit={(pass) => setEditingPass(pass)}
              onViewPasses={() => setView('passes')}
              totalPassesCount={myRegistrations.length}
            />
          )}

          {/* VIEW: MY PASSES ROSTER */}
          {view === 'passes' && (
            <MyPassesRoster
              myRegistrations={myRegistrations}
              onBookAnother={() => setView('catalog')}
              onViewBadge={(pass) => {
                setCurrentBadge(pass)
                setView('success')
              }}
              onDeletePass={handleDeletePass}
              editingPass={editingPass}
              setEditingPass={setEditingPass}
              handleSaveEdit={async (e) => {
                e.preventDefault()
                if (!editingPass) return
                setIsSubmitting(true)
                try {
                  await updateRegistrationRecord(editingPass.id, {
                    name: editingPass.name,
                    phone: editingPass.phone,
                    college: editingPass.college,
                  })
                  await fetchRegistrations()
                  if (currentBadge?.id === editingPass.id) {
                    setCurrentBadge({ ...currentBadge, ...editingPass })
                  }
                  setEditingPass(null)
                  toast.success('Pass updated successfully!', TOAST_STYLE)
                } catch {
                  toast.error('Failed to update pass.', TOAST_STYLE)
                } finally {
                  setIsSubmitting(false)
                }
              }}
              isSubmitting={isSubmitting}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.08] py-4 text-center text-xs text-neutral-500 font-mono">
        PEC Entrepreneurship &amp; Incubation Cell • Sector 12, Chandigarh
      </footer>
    </main>
  )
}
