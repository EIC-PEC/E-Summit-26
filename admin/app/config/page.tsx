'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Megaphone, 
  Calendar, 
  Sparkles, 
  Share2, 
  Save, 
  RefreshCw, 
  ExternalLink,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Info,
  Ticket,
} from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { api, ApiError } from '../../lib/api';
import { SiteConfig } from '../../lib/types';

type ConfigTab = 'ANNOUNCEMENTS' | 'DATES' | 'HERO' | 'CONTACTS';

const PRESET_ANNOUNCEMENTS = [
  {
    label: 'Closing Tonight',
    badge: 'URGENT',
    text: 'Early Bird Student Passes closing at midnight! Limited slots remaining.',
    link: '/register',
  },
  {
    label: 'Price Hike Notice',
    badge: 'PRICE HIKE',
    text: 'Pass prices will increase by ₹100 starting tomorrow. Grab your tickets now!',
    link: '/register',
  },
  {
    label: 'Speakers Announcement',
    badge: 'LINEUP',
    text: 'Distinguished unicorn founders & startup investors joining PEC E-Summit 2026!',
    link: '/#speakers',
  },
  {
    label: 'Hackathon Registration',
    badge: 'BUILDERS',
    text: '24-Hour Hackathon registrations are now open. Prize pool worth ₹5,00,000.',
    link: '/register',
  },
];

function generateTwoDayDisplayString(startDateIso: string): string {
  if (!startDateIso) return '';
  const d1 = new Date(startDateIso);
  if (isNaN(d1.getTime())) return '';

  const d2 = new Date(d1.getTime() + 24 * 60 * 60 * 1000);

  const m1 = d1.toLocaleString('en-US', { month: 'long' }).toUpperCase();
  const day1 = d1.getDate();
  const y1 = d1.getFullYear();

  const m2 = d2.toLocaleString('en-US', { month: 'long' }).toUpperCase();
  const day2 = d2.getDate();
  const y2 = d2.getFullYear();

  if (y1 !== y2) {
    return `${m1} ${day1}, ${y1} – ${m2} ${day2}, ${y2}`;
  }
  if (m1 !== m2) {
    return `${m1} ${day1} – ${m2} ${day2}, ${y1}`;
  }
  return `${m1} ${day1}–${day2}, ${y1}`;
}

export default function SiteConfigPage() {
  const [activeTab, setActiveTab] = useState<ConfigTab>('ANNOUNCEMENTS');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [heroTitle, setHeroTitle] = useState('WHERE IDEAS MEET CAPITAL & BUILD THE FUTURE');
  const [heroSubtitle, setHeroSubtitle] = useState("North India's largest student entrepreneurship summit at Punjab Engineering College. Join 3,000+ founders, investors, and builders for 2 days of keynotes, high-stakes pitches, and hackathons.");
  const [summitDates, setSummitDates] = useState('MARCH 15–16, 2026');
  const [summitVenue, setSummitVenue] = useState('Punjab Engineering College, Sector 12, Chandigarh');
  const [heroVideoUrl, setHeroVideoUrl] = useState('');
  
  // Announcement State
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);
  const [announcementText, setAnnouncementText] = useState('Early Bird Student Passes closing at midnight! Limited slots remaining.');
  const [announcementLink, setAnnouncementLink] = useState('/register');
  const [announcementBadge, setAnnouncementBadge] = useState('URGENT');

  // Countdown & Event Dates
  const [countdownTarget, setCountdownTarget] = useState('2026-03-15T09:00:00');
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Stats & Contacts
  const [statsAttendees, setStatsAttendees] = useState('3000+');
  const [statsSpeakers, setStatsSpeakers] = useState('40+');
  const [statsPrizePool, setStatsPrizePool] = useState('₹15,00,000+');
  const [statsEditions, setStatsEditions] = useState('7th Edition');

  const [contactEmail, setContactEmail] = useState('eic@pec.edu.in');
  const [contactPhone, setContactPhone] = useState('+91 98765 43210');
  const [socialInstagram, setSocialInstagram] = useState('https://instagram.com/eic_pec');
  const [socialLinkedin, setSocialLinkedin] = useState('https://linkedin.com/company/eic-pec');
  const [socialYoutube, setSocialYoutube] = useState('https://youtube.com/@eicpec');

  // Load config from API
  const loadConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cfg = await api.getSiteConfig();
      if (cfg) {
        if (cfg.heroTitle) setHeroTitle(cfg.heroTitle);
        if (cfg.heroSubtitle) setHeroSubtitle(cfg.heroSubtitle);
        if (cfg.summitDates) setSummitDates(cfg.summitDates);
        if (cfg.summitVenue) setSummitVenue(cfg.summitVenue);
        if (cfg.heroVideoUrl) setHeroVideoUrl(cfg.heroVideoUrl);

        if (cfg.announcementText) {
          setAnnouncementText(cfg.announcementText);
          setAnnouncementEnabled(true);
        } else {
          setAnnouncementEnabled(false);
        }
        if (cfg.announcementLink) setAnnouncementLink(cfg.announcementLink);

        const stats = cfg.stats as Record<string, string> | undefined;
        if (stats) {
          if (stats.attendees) setStatsAttendees(stats.attendees);
          if (stats.speakers) setStatsSpeakers(stats.speakers);
          if (stats.prizePool) setStatsPrizePool(stats.prizePool);
          if (stats.editions) setStatsEditions(stats.editions);
          if (stats.countdownTarget) setCountdownTarget(stats.countdownTarget);
        }

        const contacts = cfg.contacts as Record<string, string> | undefined;
        if (contacts) {
          if (contacts.email) setContactEmail(contacts.email);
          if (contacts.phone) setContactPhone(contacts.phone);
          if (contacts.instagram) setSocialInstagram(contacts.instagram);
          if (contacts.linkedin) setSocialLinkedin(contacts.linkedin);
          if (contacts.youtube) setSocialYoutube(contacts.youtube);
        }
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load site configuration.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Calculate live countdown preview
  useEffect(() => {
    const updateCountdown = () => {
      const target = new Date(countdownTarget).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [countdownTarget]);

  // Save changes to API
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSavedSuccess(false);
    try {
      await api.updateSiteConfig({
        heroTitle,
        heroSubtitle,
        summitDates,
        summitVenue,
        heroVideoUrl: heroVideoUrl || undefined,
        announcementText: announcementEnabled ? announcementText : '',
        announcementLink: announcementEnabled ? announcementLink : '',
        stats: {
          attendees: statsAttendees,
          speakers: statsSpeakers,
          prizePool: statsPrizePool,
          editions: statsEditions,
          countdownTarget,
        },
        contacts: {
          email: contactEmail,
          phone: contactPhone,
          instagram: socialInstagram,
          linkedin: socialLinkedin,
          youtube: socialYoutube,
        },
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update site configuration.');
    } finally {
      setSaving(false);
    }
  };

  const applyPreset = (preset: (typeof PRESET_ANNOUNCEMENTS)[0]) => {
    setAnnouncementText(preset.text);
    setAnnouncementLink(preset.link);
    setAnnouncementBadge(preset.badge);
    setAnnouncementEnabled(true);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Single Clean Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-(--border-subtle) pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">
              Site Config &amp; Live Alerts
            </h1>
            <p className="text-xs text-(--text-muted) mt-0.5">
              Manage live announcement banners, countdown event dates, hero branding, and contact channels.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadConfig}
              disabled={loading || saving}
              className="flex items-center gap-1.5 rounded-lg border border-(--border-panel) bg-(--bg-panel-alt) px-3 py-1.5 text-xs text-(--text-secondary) hover:bg-(--bg-panel-elevated) hover:text-(--text-primary) transition-colors disabled:opacity-50 font-semibold"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-4 py-1.5 text-xs font-bold text-slate-950 shadow-sm transition-all uppercase tracking-wider disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-slate-950" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Publish Config</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error / Success Banners */}
        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-500 font-medium">
            {error}
          </div>
        )}

        {savedSuccess && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Site configuration and announcements successfully synced to public website!</span>
          </div>
        )}

        {/* Segmented Navigation Tabs */}
        <div className="flex rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) p-1 gap-1 w-fit overflow-x-auto">
          <button
            onClick={() => setActiveTab('ANNOUNCEMENTS')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'ANNOUNCEMENTS'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-(--text-secondary) hover:text-(--text-primary)'
            }`}
          >
            <Megaphone className="h-3.5 w-3.5" />
            <span>Announcements &amp; Ticker</span>
          </button>

          <button
            onClick={() => setActiveTab('DATES')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'DATES'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-(--text-secondary) hover:text-(--text-primary)'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Countdown &amp; Dates</span>
          </button>

          <button
            onClick={() => setActiveTab('HERO')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'HERO'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-(--text-secondary) hover:text-(--text-primary)'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Hero &amp; Branding</span>
          </button>

          <button
            onClick={() => setActiveTab('CONTACTS')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'CONTACTS'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-(--text-secondary) hover:text-(--text-primary)'
            }`}
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Contacts &amp; Socials</span>
          </button>
        </div>

        {/* ── TAB 1: ANNOUNCEMENTS & TICKER ── */}
        {activeTab === 'ANNOUNCEMENTS' && (
          <div className="space-y-6">
            {/* Live Interactive Preview Box */}
            <div className="rounded-2xl border border-(--border-panel) bg-(--bg-panel) p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-(--text-primary) uppercase tracking-wider">
                  Live Public Banner Preview
                </span>
                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                  announcementEnabled 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-white/5 border-white/10 text-(--text-muted)'
                }`}>
                  {announcementEnabled ? 'BANNER ACTIVE' : 'BANNER HIDDEN'}
                </span>
              </div>

              {/* Banner Simulation */}
              <div className="rounded-xl overflow-hidden border border-emerald-500/20 bg-slate-950 p-3.5 shadow-inner">
                {announcementEnabled ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-[10px] font-bold font-mono">
                        {announcementBadge}
                      </span>
                      <span className="text-zinc-200 font-medium">{announcementText}</span>
                    </div>

                    {announcementLink && (
                      <a
                        href={announcementLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1 text-xs text-white font-semibold transition-colors shrink-0"
                      >
                        <span>Take Action</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="py-2 text-center text-xs text-zinc-500 font-medium">
                    (Announcement Banner is currently disabled and hidden from attendees)
                  </div>
                )}
              </div>
            </div>

            {/* Editor Card */}
            <div className="rounded-2xl border border-(--border-panel) bg-(--bg-panel) p-5 space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-(--border-subtle) pb-3">
                <h3 className="text-sm font-bold text-(--text-primary)">
                  Announcement Controls
                </h3>

                {/* Banner Visibility Switch */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-xs font-semibold text-(--text-secondary)">
                    Display Banner on Public Site
                  </span>
                  <input
                    type="checkbox"
                    checked={announcementEnabled}
                    onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                    className="h-4 w-4 rounded accent-emerald-500 cursor-pointer"
                  />
                </label>
              </div>

              {/* Quick Template Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-(--text-muted) font-semibold uppercase tracking-wider block">
                  Quick Broadcast Presets
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_ANNOUNCEMENTS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="px-3 py-1 rounded-lg border border-(--border-subtle) bg-(--bg-panel-alt) hover:border-emerald-500/40 hover:bg-(--bg-panel-elevated) text-xs text-(--text-secondary) font-medium transition-all flex items-center gap-1.5"
                    >
                      <Flame className="h-3 w-3 text-emerald-500" />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-(--text-primary) mb-1">
                    Announcement Headline / Copy *
                  </label>
                  <textarea
                    rows={2}
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    placeholder="Enter urgent notification or ticket release announcement..."
                    className="w-full rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) p-3 text-xs text-(--text-primary) focus:border-emerald-500/50 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-(--text-primary) mb-1">
                      Action Link / Route URL
                    </label>
                    <input
                      type="text"
                      value={announcementLink}
                      onChange={(e) => setAnnouncementLink(e.target.value)}
                      placeholder="/register or https://..."
                      className="w-full rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) p-2.5 text-xs text-(--text-primary) focus:border-emerald-500/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-(--text-primary) mb-1">
                      Badge Tag Text
                    </label>
                    <input
                      type="text"
                      value={announcementBadge}
                      onChange={(e) => setAnnouncementBadge(e.target.value)}
                      placeholder="URGENT, PRICE HIKE, NOTICE"
                      className="w-full rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) p-2.5 text-xs text-(--text-primary) focus:border-emerald-500/50 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: COUNTDOWN & DATES ── */}
        {activeTab === 'DATES' && (
          <div className="space-y-6">
            {/* Live Countdown Simulation Card */}
            <div className="rounded-2xl border border-(--border-panel) bg-(--bg-panel) p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-(--text-primary) uppercase tracking-wider">
                  Live Countdown Clock Preview
                </span>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  T-MINUS TO SUMMIT
                </span>
              </div>

              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="rounded-xl border border-(--border-subtle) bg-(--bg-panel-alt) p-4">
                  <span className="text-2xl lg:text-3xl font-extrabold text-(--text-primary) font-mono block">
                    {String(timeLeft.days).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-(--text-muted) font-semibold">
                    Days
                  </span>
                </div>

                <div className="rounded-xl border border-(--border-subtle) bg-(--bg-panel-alt) p-4">
                  <span className="text-2xl lg:text-3xl font-extrabold text-(--text-primary) font-mono block">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-(--text-muted) font-semibold">
                    Hours
                  </span>
                </div>

                <div className="rounded-xl border border-(--border-subtle) bg-(--bg-panel-alt) p-4">
                  <span className="text-2xl lg:text-3xl font-extrabold text-(--text-primary) font-mono block">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-(--text-muted) font-semibold">
                    Mins
                  </span>
                </div>

                <div className="rounded-xl border border-(--border-subtle) bg-(--bg-panel-alt) p-4">
                  <span className="text-2xl lg:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono block">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-(--text-muted) font-semibold">
                    Secs
                  </span>
                </div>
              </div>
            </div>

            {/* Date Configuration Fields */}
            <div className="rounded-2xl border border-(--border-panel) bg-(--bg-panel) p-5 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-(--text-primary) border-b border-(--border-subtle) pb-3">
                Summit Schedule &amp; Target Timings
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-(--text-primary) mb-1">
                    Event Start Date &amp; Time (Day 1) *
                  </label>
                  <input
                    type="datetime-local"
                    value={countdownTarget.slice(0, 16)}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCountdownTarget(val);
                      const auto = generateTwoDayDisplayString(val);
                      if (auto) {
                        setSummitDates(auto);
                      }
                    }}
                    className="w-full rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) p-2.5 text-xs text-(--text-primary) focus:border-emerald-500/50 focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-(--text-muted) mt-1 block">
                    Summit start timestamp. Automatically generates Day 1 &amp; Day 2 (+1 day).
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-(--text-primary)">
                      Display Dates String (2-Day Range) *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const auto = generateTwoDayDisplayString(countdownTarget);
                        if (auto) setSummitDates(auto);
                      }}
                      className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                    >
                      Re-calculate (+1 Day)
                    </button>
                  </div>
                  <input
                    type="text"
                    value={summitDates}
                    onChange={(e) => setSummitDates(e.target.value)}
                    placeholder="e.g. SEPTEMBER 20–21, 2026"
                    className="w-full rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) p-2.5 text-xs text-(--text-primary) focus:border-emerald-500/50 focus:outline-none font-bold font-mono"
                  />
                  <span className="text-[10px] text-(--text-muted) mt-1 block">
                    Public text shown on passes, navbar, and hero.
                  </span>
                </div>

                {/* 2-Day Info Banner */}
                <div className="sm:col-span-2 rounded-xl bg-emerald-500/6 border border-emerald-500/20 p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      2-Day Official Summit Schedule:
                    </span>
                    <span className="text-(--text-primary) font-mono font-bold">
                      {summitDates || 'MARCH 15–16, 2026'}
                    </span>
                  </div>
                  <span className="text-[11px] text-(--text-muted)">
                    Day 1 (Start) &rarr; Day 2 (+24 Hours)
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-(--text-primary) mb-1">
                    Primary Campus Venue *
                  </label>
                  <input
                    type="text"
                    value={summitVenue}
                    onChange={(e) => setSummitVenue(e.target.value)}
                    placeholder="Punjab Engineering College, Sector 12, Chandigarh"
                    className="w-full rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) p-2.5 text-xs text-(--text-primary) focus:border-emerald-500/50 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: HERO & BRANDING ── */}
        {activeTab === 'HERO' && (
          <div className="rounded-2xl border border-(--border-panel) bg-(--bg-panel) p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-(--text-primary) border-b border-(--border-subtle) pb-3">
              Hero Section &amp; Public Statistics
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-(--text-primary) mb-1">
                  Hero Main Headline *
                </label>
                <input
                  type="text"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="PEC E-SUMMIT 2026"
                  className="w-full rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) p-2.5 text-xs text-(--text-primary) focus:border-emerald-500/50 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-(--text-primary) mb-1">
                  Hero Tagline / Subtitle *
                </label>
                <input
                  type="text"
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="IGNITING ENTREPRENEURSHIP & INNOVATION"
                  className="w-full rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) p-2.5 text-xs text-(--text-primary) focus:border-emerald-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-(--text-primary) mb-1">
                  Hero Teaser Video URL (YouTube / MP4)
                </label>
                <input
                  type="url"
                  value={heroVideoUrl}
                  onChange={(e) => setHeroVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) p-2.5 text-xs text-(--text-primary) focus:border-emerald-500/50 focus:outline-none"
                />
              </div>

              {/* Numerical stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-(--text-muted) mb-1">
                    Expected Delegates
                  </label>
                  <input
                    type="text"
                    value={statsAttendees}
                    onChange={(e) => setStatsAttendees(e.target.value)}
                    placeholder="3000+"
                    className="w-full rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) p-2 text-xs text-(--text-primary) font-bold text-center"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-(--text-muted) mb-1">
                    Keynote Speakers
                  </label>
                  <input
                    type="text"
                    value={statsSpeakers}
                    onChange={(e) => setStatsSpeakers(e.target.value)}
                    placeholder="40+"
                    className="w-full rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) p-2 text-xs text-(--text-primary) font-bold text-center"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-(--text-muted) mb-1">
                    Prize Pool
                  </label>
                  <input
                    type="text"
                    value={statsPrizePool}
                    onChange={(e) => setStatsPrizePool(e.target.value)}
                    placeholder="₹15L+"
                    className="w-full rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) p-2 text-xs text-(--text-primary) font-bold text-center"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-(--text-muted) mb-1">
                    Summit Edition
                  </label>
                  <input
                    type="text"
                    value={statsEditions}
                    onChange={(e) => setStatsEditions(e.target.value)}
                    placeholder="7th"
                    className="w-full rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) p-2 text-xs text-(--text-primary) font-bold text-center"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: CONTACTS & SOCIALS ── */}
        {activeTab === 'CONTACTS' && (
          <div className="rounded-2xl border border-(--border-panel) bg-(--bg-panel) p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-(--text-primary) border-b border-(--border-subtle) pb-3">
              Organizer Contact &amp; Social Links
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-(--text-primary) mb-1">
                  Official Support Email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="eic@pec.edu.in"
                  className="w-full rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) p-2.5 text-xs text-(--text-primary) focus:border-emerald-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-(--text-primary) mb-1">
                  Helpline Contact Number / WhatsApp
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) p-2.5 text-xs text-(--text-primary) focus:border-emerald-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-(--text-primary) mb-1">
                  Instagram Handle URL
                </label>
                <input
                  type="url"
                  value={socialInstagram}
                  onChange={(e) => setSocialInstagram(e.target.value)}
                  placeholder="https://instagram.com/eic_pec"
                  className="w-full rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) p-2.5 text-xs text-(--text-primary) focus:border-emerald-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-(--text-primary) mb-1">
                  LinkedIn Company URL
                </label>
                <input
                  type="url"
                  value={socialLinkedin}
                  onChange={(e) => setSocialLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/company/eic-pec"
                  className="w-full rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) p-2.5 text-xs text-(--text-primary) focus:border-emerald-500/50 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-(--text-primary) mb-1">
                  YouTube Channel / Video Archive
                </label>
                <input
                  type="url"
                  value={socialYoutube}
                  onChange={(e) => setSocialYoutube(e.target.value)}
                  placeholder="https://youtube.com/@eicpec"
                  className="w-full rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) p-2.5 text-xs text-(--text-primary) focus:border-emerald-500/50 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
