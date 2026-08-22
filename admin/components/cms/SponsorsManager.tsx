'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Pencil, ExternalLink, Building2 } from 'lucide-react';
import { ImageDropzone } from '../ui/ImageDropzone';
import { CmsModal } from './CmsModal';
import { SponsorItem, SponsorInput } from '../../lib/types';
import { api, ApiError } from '../../lib/api';

interface Props {
  sponsors: SponsorItem[];
  onSponsorsChange: (s: SponsorItem[]) => void;
}

const INPUT_CLS = 'w-full rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) p-2.5 text-xs text-(--text-primary) focus:border-emerald-500/50 focus:outline-none';
const TOTAL_SLOTS = 12;

export function SponsorsManager({ sponsors, onSponsorsChange }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<SponsorItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<SponsorInput>({ tier: 'gold', name: '', logoUrl: '', websiteUrl: '' });

  const set = (k: keyof SponsorInput, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const openCreateModal = () => {
    setEditingSponsor(null);
    setForm({ tier: 'gold', name: '', logoUrl: '', websiteUrl: '' });
    setModalOpen(true);
  };

  const openEditModal = (sp: SponsorItem) => {
    setEditingSponsor(sp);
    setForm({
      tier: sp.tier,
      name: sp.name,
      logoUrl: sp.logoUrl || '',
      websiteUrl: sp.websiteUrl || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingSponsor) {
        const updated = await api.updateSponsor(editingSponsor.id, {
          ...form,
          logoUrl: form.logoUrl || undefined,
          websiteUrl: form.websiteUrl || undefined,
        });
        onSponsorsChange(sponsors.map((s) => (s.id === editingSponsor.id ? updated : s)));
      } else {
        const created = await api.createSponsor({
          ...form,
          logoUrl: form.logoUrl || undefined,
          websiteUrl: form.websiteUrl || undefined,
        });
        onSponsorsChange([...sponsors, created]);
      }
      setModalOpen(false);
      setEditingSponsor(null);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to save sponsor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this sponsor?')) return;
    try {
      await api.deleteSponsor(id);
      onSponsorsChange(sponsors.filter((s) => s.id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to delete sponsor.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-(--border-subtle)">
        <span className="text-xs text-(--text-muted) font-mono">
          {sponsors.length} of {TOTAL_SLOTS} partner slots active
        </span>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-sm transition-all uppercase tracking-wider"
        >
          <Plus className="h-4 w-4" />
          <span>Add Sponsor</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {Array.from({ length: TOTAL_SLOTS }, (_, i) => {
          const sp = sponsors[i] || null;
          const slotNum = i + 1;
          return (
            <div
              key={sp?.id || `sponsor-slot-${slotNum}`}
              className="group relative rounded-2xl border border-(--border-panel) bg-(--bg-panel) aspect-square flex flex-col justify-between p-3.5 overflow-hidden transition-all hover:border-(--border-panel-elevated) shadow-sm"
            >
              {sp ? (
                <>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-(--text-secondary) uppercase">
                      {sp.tier}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(sp)}
                        className="p-1 rounded-md text-(--text-muted) hover:text-emerald-500 transition-colors"
                        title="Edit sponsor"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(sp.id)}
                        className="p-1 rounded-md text-(--text-muted) hover:text-rose-500 transition-colors"
                        title="Delete sponsor"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center my-auto p-1">
                    {sp.logoUrl ? (
                      <img src={sp.logoUrl} alt={sp.name} className="h-10 max-w-22.5 object-contain drop-shadow-sm" />
                    ) : (
                      <span className="text-xs font-bold text-(--text-primary) text-center line-clamp-1">
                        {sp.name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-(--text-muted) border-t border-(--border-subtle) pt-1">
                    <span className="truncate font-semibold text-white">{sp.name}</span>
                    {sp.websiteUrl && (
                      <a href={sp.websiteUrl} target="_blank" rel="noreferrer" className="text-(--text-muted) hover:text-white transition-colors">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <button
                  onClick={openCreateModal}
                  className="flex h-full w-full flex-col items-center justify-center text-center space-y-1.5 border-2 border-dashed border-(--border-subtle) bg-(--bg-panel-alt) rounded-xl hover:border-emerald-500/50 hover:bg-(--bg-panel-elevated) transition-all p-2"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-(--bg-panel) border border-(--border-subtle) text-(--text-muted) group-hover:text-emerald-500">
                    <Plus className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[11px] text-(--text-muted) font-medium">Slot #{slotNum}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">+ Add</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      <CmsModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingSponsor(null);
        }}
        title={editingSponsor ? 'Edit Partner Sponsor' : 'Add Partner Sponsor'}
        icon={<Building2 className="h-5 w-5" />}
        accentColor="#10B981"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-(--text-primary) mb-1">Sponsor Tier</label>
            <select
              value={form.tier}
              onChange={(e) => set('tier', e.target.value)}
              className={INPUT_CLS}
            >
              <option value="title">Title Sponsor</option>
              <option value="powered_by">Powered By</option>
              <option value="associate">Associate Partner</option>
              <option value="ecosystem">Ecosystem Partner</option>
              <option value="gold">Gold Sponsor</option>
              <option value="silver">Silver Sponsor</option>
              <option value="bronze">Bronze Sponsor</option>
              <option value="media">Media Partner</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-(--text-primary) mb-1">Company / Brand Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Google Cloud, GitHub, Razorpay"
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-(--text-primary) mb-1">Official Website URL</label>
            <input
              type="url"
              value={form.websiteUrl || ''}
              onChange={(e) => set('websiteUrl', e.target.value)}
              placeholder="https://company.com"
              className={INPUT_CLS}
            />
          </div>

          <ImageDropzone
            label="Sponsor Logo (PNG / SVG with transparent background) *"
            folder="sponsors"
            value={form.logoUrl || ''}
            onChange={(url) => set('logoUrl', url)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-(--border-subtle)">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) px-3.5 py-2 text-xs font-semibold text-(--text-secondary) hover:bg-(--bg-panel-elevated) transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-bold text-slate-950 disabled:opacity-50 transition-colors uppercase tracking-wider"
            >
              {isSubmitting ? 'Saving...' : editingSponsor ? 'Update Sponsor' : 'Save Sponsor'}
            </button>
          </div>
        </form>
      </CmsModal>
    </div>
  );
}
