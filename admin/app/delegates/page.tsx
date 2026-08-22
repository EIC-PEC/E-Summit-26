'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Search, 
  Download, 
  CheckCircle2, 
  Eye, 
  RefreshCw, 
  X, 
  Printer,
  Users,
  Check,
  QrCode,
} from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../lib/api';
import { Registration } from '../../lib/types';

export default function DelegatesPage() {
  const [delegates, setDelegates] = useState<Registration[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(25);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [passFilter, setPassFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedDelegate, setSelectedDelegate] = useState<Registration | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchDelegates = useCallback(async (targetPage = page) => {
    setLoading(true);
    const params: {
      page?: number;
      limit?: number;
      search?: string;
      passType?: string;
      isCheckedIn?: boolean;
    } = {
      page: targetPage,
      limit,
    };

    if (search.trim()) params.search = search.trim();
    if (passFilter !== 'ALL') params.passType = passFilter;
    if (statusFilter === 'CHECKED_IN') params.isCheckedIn = true;
    if (statusFilter === 'NOT_CHECKED_IN') params.isCheckedIn = false;

    try {
      const res = await api.getDelegates(params);
      setDelegates(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages || 1);
      setPage(targetPage);
    } finally {
      setLoading(false);
    }
  }, [search, passFilter, statusFilter, limit, page]);

  useEffect(() => {
    fetchDelegates(1);
  }, [passFilter, statusFilter, limit]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDelegates();
  };

  const handleToggleOverride = async (reg: Registration) => {
    setUpdatingId(reg.id);
    const res = await api.toggleCheckInOverride(reg.id);
    if (res.success) {
      setDelegates((prev) =>
        prev.map((d) => (d.id === reg.id ? { ...d, isCheckedIn: res.isCheckedIn } : d))
      );
      if (selectedDelegate && selectedDelegate.id === reg.id) {
        setSelectedDelegate({ ...selectedDelegate, isCheckedIn: res.isCheckedIn });
      }
    }
    setUpdatingId(null);
  };

  const exportToCsv = () => {
    const headers = ['Pass ID', 'Name', 'Email', 'Phone', 'College', 'Pass Type', 'Amount Paid (INR)', 'Checked In', 'Registered At'];
    const rows = delegates.map((d) => [
      d.passId,
      `"${d.user.name}"`,
      d.user.email,
      d.user.phone || 'N/A',
      `"${d.user.college || 'N/A'}"`,
      d.passType,
      d.amountPaid,
      d.isCheckedIn ? 'YES' : 'NO',
      new Date(d.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pec_summit_delegates_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Top Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-(--border-subtle) pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Live Roster
              </span>
              <span className="text-xs text-(--text-muted) font-mono">
                {total.toLocaleString()} total attendees
              </span>
            </div>
            <h1 className="text-2xl font-bold text-(--text-primary) tracking-tight">
              Delegates &amp; Pass Manager
            </h1>
            <p className="text-xs text-(--text-muted) mt-0.5">
              Verify registrations, inspect digital passes, and record gate check-ins.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={exportToCsv}
              className="flex items-center gap-1.5 rounded-lg border border-(--border-panel) bg-(--bg-panel-alt) px-3 py-1.5 text-xs font-semibold text-(--text-secondary) hover:text-(--text-primary) hover:border-(--border-panel-elevated) transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => fetchDelegates()}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-sm transition-all uppercase tracking-wider"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center gap-2.5">
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-(--text-muted)" />
            <input
              type="text"
              placeholder="Search by attendee name, email, or pass ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-(--border-panel) bg-(--bg-panel-alt) py-2 pl-9 pr-3 text-xs text-(--text-primary) placeholder:text-(--text-muted) focus:border-emerald-500/50 focus:outline-none"
            />
          </form>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Pass Type Filter */}
            <select
              value={passFilter}
              onChange={(e) => setPassFilter(e.target.value)}
              className="rounded-lg border border-(--border-panel) bg-(--bg-panel-alt) py-2 px-3 text-xs text-(--text-primary) focus:border-emerald-500/50 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Pass Tiers</option>
              <option value="GENERAL_ACCESS">General Access</option>
              <option value="STUDENT_PASS">Student Pass</option>
              <option value="VIP_FOUNDER">Startup Pitch Pass</option>
              <option value="HACKATHON_PASS">Hackathon Pass</option>
              <option value="ALL_ACCESS">All Access VIP</option>
            </select>

            {/* Check-In Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-(--border-panel) bg-(--bg-panel-alt) py-2 px-3 text-xs text-(--text-primary) focus:border-emerald-500/50 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Gate Statuses</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="NOT_CHECKED_IN">Pending Entry</option>
            </select>
          </div>
        </div>

        {/* Datatable */}
        <div className="rounded-xl border border-(--border-panel) bg-(--bg-panel) overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-(--text-secondary)">
              <thead className="border-b border-(--border-subtle) bg-(--bg-panel-alt) text-[11px] uppercase tracking-wider text-(--text-muted) font-semibold">
                <tr>
                  <th className="py-3 px-4">Pass ID / Attendee</th>
                  <th className="py-3 px-4">College / Institute</th>
                  <th className="py-3 px-4">Pass Tier</th>
                  <th className="py-3 px-4">Gate Status</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border-subtle)">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-(--text-muted)">
                      Loading delegate records...
                    </td>
                  </tr>
                ) : delegates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-(--text-muted)">
                      No matching attendees found.
                    </td>
                  </tr>
                ) : (
                  delegates.map((d) => (
                    <tr key={d.id} className="hover:bg-(--bg-panel-alt) transition-colors">
                      {/* Attendee */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-(--bg-panel-alt) border border-(--border-panel) text-(--text-primary) font-bold text-xs">
                            {d.user.name ? d.user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-(--text-primary)">{d.user.name}</div>
                            <div className="text-[10px] text-(--text-muted)">{d.user.email}</div>
                            <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{d.passId}</div>
                          </div>
                        </div>
                      </td>

                      {/* College */}
                      <td className="py-3 px-4 text-(--text-secondary)">
                        {d.user.college || 'Punjab Engineering College'}
                      </td>

                      {/* Pass Tier */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-(--text-secondary) font-medium">
                          {d.passType.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Gate Status */}
                      <td className="py-3 px-4">
                        {d.isCheckedIn ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                            Checked In
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-white/5 text-(--text-muted) text-[10px]">
                            Pending Entry
                          </span>
                        )}
                      </td>

                      {/* Payment */}
                      <td className="py-3 px-4">
                        {d.amountPaid > 0 ? (
                          <div className="space-y-0.5">
                            <span className="font-semibold text-(--text-primary)">₹{d.amountPaid}</span>
                            <span className="block text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                              PAID
                            </span>
                          </div>
                        ) : (
                          <span className="text-(--text-muted) text-[11px]">FREE</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => setSelectedDelegate(d)}
                          className="inline-flex items-center gap-1 rounded-md bg-(--bg-panel-alt) border border-(--border-subtle) px-2 py-1 text-xs text-(--text-secondary) hover:text-(--text-primary) transition-colors"
                          title="Preview Pass"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Pass</span>
                        </button>

                        <button
                          onClick={() => handleToggleOverride(d)}
                          disabled={updatingId === d.id}
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs border transition-colors font-medium ${
                            d.isCheckedIn
                              ? 'border-rose-500/30 text-rose-500 hover:bg-rose-500/10'
                              : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                          title="Toggle Check-In Status"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          <span>{d.isCheckedIn ? 'Revoke' : 'Check In'}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-(--border-subtle) bg-(--bg-panel) text-xs text-(--text-secondary)">
            <div className="flex items-center gap-2">
              <span className="text-(--text-muted)">Rows per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-md border border-(--border-subtle) bg-(--bg-panel-alt) px-2 py-1 text-xs text-(--text-primary) focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-(--text-muted) ml-2">
                Showing {total === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(total, page * limit)} of {total} delegates
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => fetchDelegates(page - 1)}
                disabled={page <= 1 || loading}
                className="rounded-md border border-(--border-subtle) bg-(--bg-panel-alt) px-2.5 py-1 text-xs text-(--text-primary) hover:border-(--border-panel) disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-2 text-(--text-secondary)">
                Page <strong className="text-(--text-primary)">{page}</strong> of <strong className="text-(--text-primary)">{totalPages}</strong>
              </span>
              <button
                onClick={() => fetchDelegates(page + 1)}
                disabled={page >= totalPages || loading}
                className="rounded-md border border-(--border-subtle) bg-(--bg-panel-alt) px-2.5 py-1 text-xs text-(--text-primary) hover:border-(--border-panel) disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Interactive E-Badge Modal */}
        {selectedDelegate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="relative w-full max-w-sm rounded-2xl border border-(--border-panel) bg-(--bg-panel) p-5 shadow-2xl space-y-4">
              <button
                onClick={() => setSelectedDelegate(null)}
                className="absolute right-3.5 top-3.5 rounded-lg p-1 text-(--text-muted) hover:bg-(--bg-panel-alt) hover:text-(--text-primary) transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="text-center space-y-1">
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Official Delegate Pass
                </span>
                <h3 className="text-base font-bold text-(--text-primary) mt-1">
                  PEC E-Summit 2026
                </h3>
                <p className="text-[11px] text-(--text-muted)">
                  March 15-16, 2026 • PEC Chandigarh
                </p>
              </div>

              {/* Pass Card Preview */}
              <div className="rounded-xl border border-(--border-subtle) bg-(--bg-panel-alt) p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] uppercase text-(--text-muted) font-semibold block">
                      Attendee Name
                    </span>
                    <h4 className="text-sm font-bold text-(--text-primary)">
                      {selectedDelegate.user.name}
                    </h4>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                      {selectedDelegate.user.email}
                    </p>
                    <p className="text-[11px] text-(--text-muted) mt-0.5">
                      {selectedDelegate.user.college || 'Punjab Engineering College'}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-300">
                    {selectedDelegate.passType.replace('_', ' ')}
                  </span>
                </div>

                {/* QR Code Box */}
                <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border border-(--border-subtle) shadow-sm">
                  <div className="h-28 w-28 p-1 flex items-center justify-center">
                    <QrCode className="w-full h-full text-black" />
                  </div>
                  <span className="mt-1 text-[11px] font-bold tracking-wider text-slate-900 font-mono">
                    {selectedDelegate.passId}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[10px] text-(--text-muted) border-t border-(--border-subtle) pt-2">
                  <span>SECURE GATE PASS</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {selectedDelegate.isCheckedIn ? 'CHECKED IN' : 'VALID'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleOverride(selectedDelegate)}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 uppercase tracking-wider ${
                    selectedDelegate.isCheckedIn
                      ? 'bg-rose-500/15 border border-rose-500/30 text-rose-500 hover:bg-rose-500/25'
                      : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>
                    {selectedDelegate.isCheckedIn ? 'Revoke Check-In' : 'Authorize Gate Entry'}
                  </span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="rounded-lg border border-(--border-panel) bg-(--bg-panel-alt) p-2 text-(--text-secondary) hover:text-(--text-primary)"
                  title="Print Pass"
                >
                  <Printer className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
