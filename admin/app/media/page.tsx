'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Image, Sparkles, Building2, Layers } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { GalleryItem, PortfolioEventMedia, SponsorItem } from '../../lib/types';
import { api, ApiError } from '../../lib/api';
import { GalleryManager } from '../../components/cms/GalleryManager';
import { EventsMediaManager } from '../../components/cms/EventsMediaManager';
import { SponsorsManager } from '../../components/cms/SponsorsManager';

export default function MediaUploadCenterPage() {
  const [activeSection, setActiveSection] = useState<'SHOWCASE' | 'EVENTS' | 'SPONSORS'>('SHOWCASE');
  
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [portfolioMedia, setPortfolioMedia] = useState<PortfolioEventMedia[]>([]);
  const [sponsors, setSponsors] = useState<SponsorItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMedia = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const bundle = await api.getBundle();
      setGallery(bundle.gallery || []);
      setPortfolioMedia(bundle.portfolioMedia || []);
      setSponsors(bundle.sponsors || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load media assets.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-(--border-subtle) pb-4">
          <div>
            <h1 className="text-2xl font-bold text-(--text-primary) tracking-tight">
              Media &amp; Brand Assets
            </h1>
            <p className="text-xs text-(--text-muted) mt-0.5">
              Manage marquee photo showcase slots, event cards, and partner sponsor logos.
            </p>
          </div>

          {/* Segmented Tab Controls */}
          <div className="flex items-center rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) p-1 gap-1">
            <button
              onClick={() => setActiveSection('SHOWCASE')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeSection === 'SHOWCASE'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-(--text-secondary) hover:text-(--text-primary)'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Showcase ({gallery.length}/16)</span>
            </button>
            <button
              onClick={() => setActiveSection('EVENTS')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeSection === 'EVENTS'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-(--text-secondary) hover:text-(--text-primary)'
              }`}
            >
              <Image className="h-3.5 w-3.5" />
              <span>Event Cards ({portfolioMedia.length}/13)</span>
            </button>
            <button
              onClick={() => setActiveSection('SPONSORS')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeSection === 'SPONSORS'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-(--text-secondary) hover:text-(--text-primary)'
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Sponsors ({sponsors.length}/12)</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-500 font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>Loading live media assets from database...</span>
          </div>
        ) : (
          <>
            {activeSection === 'SHOWCASE' && (
              <GalleryManager gallery={gallery} onGalleryChange={setGallery} />
            )}
            {activeSection === 'EVENTS' && (
              <EventsMediaManager
                portfolioMedia={portfolioMedia}
                onPortfolioMediaChange={setPortfolioMedia}
              />
            )}
            {activeSection === 'SPONSORS' && (
              <SponsorsManager
                sponsors={sponsors}
                onSponsorsChange={setSponsors}
              />
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
