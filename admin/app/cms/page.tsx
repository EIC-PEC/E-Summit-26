'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, CalendarDays, Mic2 } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { 
  ScheduleItem, 
  SpeakerItem 
} from '../../lib/types';
import { api, ApiError } from '../../lib/api';
import { ScheduleManager } from '../../components/cms/ScheduleManager';
import { SpeakersManager } from '../../components/cms/SpeakersManager';

type CmsTab = 'SCHEDULE' | 'SPEAKERS';

export default function ScheduleCmsPage() {
  const [activeTab, setActiveTab] = useState<CmsTab>('SCHEDULE');
  
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [speakers, setSpeakers] = useState<SpeakerItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const bundle = await api.getBundle();
      setScheduleItems(bundle.scheduleItems || []);
      setSpeakers(bundle.speakers || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load schedule data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Single Clean Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-(--border-subtle) pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">
              Schedule &amp; Speakers
            </h1>
            <p className="text-xs text-(--text-muted) mt-0.5">
              Publish and update Day 1 &amp; Day 2 timeline sessions, tracks, venues, and keynote speakers.
            </p>
          </div>

          <div className="flex rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) p-1 gap-1">
            <button
              onClick={() => setActiveTab('SCHEDULE')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'SCHEDULE'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-(--text-secondary) hover:text-(--text-primary)'
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Timeline ({scheduleItems.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('SPEAKERS')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'SPEAKERS'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-(--text-secondary) hover:text-(--text-primary)'
              }`}
            >
              <Mic2 className="h-3.5 w-3.5" />
              <span>Speakers ({speakers.length})</span>
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
            <span>Loading live schedule &amp; speaker data from database...</span>
          </div>
        ) : (
          <>
            {activeTab === 'SCHEDULE' && (
              <ScheduleManager 
                scheduleItems={scheduleItems} 
                onScheduleItemsChange={setScheduleItems} 
              />
            )}

            {activeTab === 'SPEAKERS' && (
              <SpeakersManager 
                speakers={speakers} 
                onSpeakersChange={setSpeakers} 
              />
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
