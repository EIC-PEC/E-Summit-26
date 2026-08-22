'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { AlumniItem } from '../../lib/types';
import { api, ApiError } from '../../lib/api';
import { AlumniManager } from '../../components/cms/AlumniManager';

export default function AlumniManagementPage() {
  const [alumni, setAlumni] = useState<AlumniItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAlumni = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAlumni();
      setAlumni(data || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load alumni profiles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlumni();
  }, [loadAlumni]);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Single Clean Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-(--border-subtle) pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">
              PEC Alumni Founders
            </h1>
            <p className="text-xs text-(--text-muted) mt-0.5">
              Highlight prominent founders, investors, and venture leaders graduated from PEC.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full self-start sm:self-auto">
            {alumni.length} Active Spotlights
          </span>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-500 font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>Loading alumni network from database...</span>
          </div>
        ) : (
          <AlumniManager alumni={alumni} onAlumniChange={setAlumni} />
        )}
      </div>
    </AppShell>
  );
}
