'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  Users, 
  IndianRupee, 
  CheckCircle2, 
  Trophy, 
  ArrowUpRight, 
  RefreshCw
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import { api } from '../lib/api';
import { AnalyticsData } from '../lib/types';

export default function DashboardHome() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await api.getAnalytics();
      setData(res);
    } catch {
      // Backend offline or unreachable
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, [loadData]);

  const overview = data?.overview || {
    totalDelegates: 0,
    targetDelegates: 3000,
    totalRevenue: 0,
    totalCheckIns: 0,
    totalTeams: 0,
  };

  const passTypeDistribution = data?.passTypeDistribution || [];
  const collegeBreakdown = data?.collegeBreakdown || [];
  const recentRegistrations = data?.recentRegistrations || [];

  const targetPct = overview.targetPercentage ?? (
    (overview.targetDelegates || 3000) > 0 
      ? Math.min(100, Math.round(((overview.totalDelegates || 0) / (overview.targetDelegates || 3000)) * 100))
      : 0
  );

  const checkInPct = overview.checkInPercentage ?? (
    (overview.totalDelegates || 0) > 0
      ? Math.round(((overview.totalCheckIns || 0) / (overview.totalDelegates || 1)) * 100)
      : 0
  );

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Single Clean Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-(--border-subtle) pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">
              Summit Operations Dashboard
            </h1>
            <p className="text-xs text-(--text-muted) mt-0.5">
              Real-time attendee registrations, gate check-in status, and revenue analytics.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadData}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-lg border border-(--border-panel) bg-(--bg-panel-alt) px-3 py-1.5 text-xs text-(--text-secondary) hover:bg-(--bg-panel-elevated) hover:text-(--text-primary) transition-colors disabled:opacity-50 font-semibold"
              title="Refresh Live Data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Sync Live'}</span>
            </button>

            <Link
              href="/delegates"
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-sm transition-all uppercase tracking-wider"
            >
              <Users className="h-3.5 w-3.5" />
              <span>Delegates Roster</span>
            </Link>
          </div>
        </div>

        {/* 4 Core KPI Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Attendees"
            value={(overview.totalDelegates || 0).toLocaleString()}
            subtitle={`${targetPct}% of ${(overview.targetDelegates || 3000).toLocaleString()} target`}
            icon={Users}
            variant="mint"
            accentBadge={`TARGET ${targetPct}%`}
          />
          <StatCard
            title="Total Revenue"
            value={`₹${(overview.totalRevenue || 0).toLocaleString()}`}
            subtitle="Verified Paid Passes"
            icon={IndianRupee}
            variant="gold"
            accentBadge="REVENUE"
          />
          <StatCard
            title="Gate Check-ins"
            value={(overview.totalCheckIns || 0).toLocaleString()}
            subtitle={`${checkInPct}% of attendees on campus`}
            icon={CheckCircle2}
            variant="blue"
            accentBadge="CHECK-INS"
          />
          <StatCard
            title="Competing Teams"
            value={(overview.totalTeams || 0).toLocaleString()}
            subtitle="Pitch & Hackathon Teams"
            icon={Trophy}
            variant="coral"
            accentBadge={`${overview.totalTeams || 0} TEAMS`}
          />
        </div>

        {/* 2-Column Analytics: Pass Types & College Distribution */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Pass Distribution (2 cols) */}
          <div className="lg:col-span-2 rounded-2xl border border-(--border-panel) bg-(--bg-panel) p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-(--border-subtle) pb-3">
              <h2 className="text-xs font-bold text-(--text-primary) uppercase tracking-wider">
                Pass Tier Distribution
              </h2>
              <span className="text-xs text-(--text-muted) font-mono font-semibold">
                {(overview.totalDelegates || 0).toLocaleString()} Passes Total
              </span>
            </div>

            {/* Live Breakdown Cards */}
            {passTypeDistribution.length === 0 ? (
              <div className="py-12 text-center text-xs text-(--text-muted)">
                {loading ? 'Fetching live registration metrics...' : 'No pass registrations recorded yet in database.'}
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {passTypeDistribution.map((item) => {
                    const pct = (overview.totalDelegates || 0) > 0
                      ? Math.round((item.count / (overview.totalDelegates || 1)) * 100)
                      : 0;

                    return (
                      <div key={item.passType} className="rounded-xl bg-(--bg-panel-alt) p-3.5 border border-(--border-subtle) space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-(--text-primary) capitalize truncate">
                            {item.passType.toLowerCase().replace('_', ' ')}
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{item.count.toLocaleString()} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-(--bg-panel-elevated) overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* College Representation (1 col) */}
          <div className="rounded-2xl border border-(--border-panel) bg-(--bg-panel) p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between border-b border-(--border-subtle) pb-3">
                <h2 className="text-xs font-bold text-(--text-primary) uppercase tracking-wider">
                  Top Colleges
                </h2>
                <span className="text-xs text-(--text-muted) font-mono">
                  {collegeBreakdown.length} Institutions
                </span>
              </div>

              {collegeBreakdown.length === 0 ? (
                <div className="py-12 text-center text-xs text-(--text-muted)">
                  {loading ? 'Loading institutions...' : 'No college affiliation data yet.'}
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {collegeBreakdown.slice(0, 5).map((col, idx) => {
                    const maxCount = collegeBreakdown[0]?.count || 1;
                    const barPct = Math.round((col.count / maxCount) * 100);

                    return (
                      <div key={col.college} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-(--text-secondary) truncate max-w-45 font-medium">
                            {idx + 1}. {col.college}
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{col.count}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-(--bg-panel-elevated) overflow-hidden">
                          <div
                            className="h-full rounded-full bg-sky-500 transition-all duration-500"
                            style={{ width: `${barPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-5 border-t border-(--border-subtle) pt-3">
              <Link
                href="/delegates"
                className="flex items-center justify-between text-xs text-sky-600 dark:text-sky-400 hover:underline font-semibold"
              >
                <span>View all delegate records</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Live Recent Attendee Activity Feed */}
        <div className="rounded-2xl border border-(--border-panel) bg-(--bg-panel) p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-(--border-subtle) pb-3">
            <h2 className="text-xs font-bold text-(--text-primary) uppercase tracking-wider">
              Recent Attendee Registrations
            </h2>
            <Link
              href="/delegates"
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1"
            >
              <span>Explore All</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {recentRegistrations.length === 0 ? (
            <div className="py-12 text-center text-xs text-(--text-muted)">
              {loading ? 'Querying latest registrations...' : 'No registrations recorded in the database yet.'}
            </div>
          ) : (
            <div className="mt-3 divide-y divide-(--border-subtle)">
              {recentRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 gap-2 hover:bg-(--bg-panel-alt) px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--bg-panel-alt) border border-(--border-panel) text-emerald-600 dark:text-emerald-400 text-xs font-bold font-mono">
                      {reg.passId.slice(-3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-(--text-primary)">
                          {reg.delegateName}
                        </span>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                          {reg.passId}
                        </span>
                      </div>
                      <p className="text-[11px] text-(--text-muted)">
                        {reg.delegateEmail} {reg.college ? `• ${reg.college}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-(--text-secondary)">
                      {reg.passType.replace('_', ' ')}
                    </span>

                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      reg.isCheckedIn
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : 'bg-white/5 border-white/10 text-(--text-muted)'
                    }`}>
                      {reg.isCheckedIn ? 'CHECKED IN' : 'REGISTERED'}
                    </span>

                    <span className="text-[11px] text-(--text-muted) min-w-17.5 text-right font-mono">
                      {new Date(reg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
