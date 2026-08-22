'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Pencil, GraduationCap, ExternalLink, Sparkles, Award } from 'lucide-react';

import { ImageDropzone } from '../ui/ImageDropzone';
import { CmsModal } from './CmsModal';
import { AlumniItem, AlumniInput } from '../../lib/types';
import { api, ApiError } from '../../lib/api';

interface Props {
  alumni: AlumniItem[];
  onAlumniChange: (a: AlumniItem[]) => void;
}

const INPUT_CLS = 'w-full rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) p-2.5 text-xs text-(--text-primary) focus:border-emerald-500/50 focus:outline-none';

export function AlumniManager({ alumni, onAlumniChange }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAlumni, setEditingAlumni] = useState<AlumniItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<AlumniInput>({
    name: '',
    batch: "PEC '17",
    role: 'Co-Founder & CEO',
    company: '',
    valuation: '',
    achievement: '',
    bio: '',
    imageUrl: '',
    linkedin: '',
  });

  const set = (k: keyof AlumniInput, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const openCreateModal = () => {
    setEditingAlumni(null);
    setForm({
      name: '',
      batch: "PEC '17",
      role: 'Co-Founder & CEO',
      company: '',
      valuation: '',
      achievement: '',
      bio: '',
      imageUrl: '',
      linkedin: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (alm: AlumniItem) => {
    setEditingAlumni(alm);
    setForm({
      name: alm.name,
      batch: alm.batch,
      role: alm.role,
      company: alm.company,
      valuation: alm.valuation || '',
      achievement: alm.achievement,
      bio: alm.bio,
      imageUrl: alm.imageUrl || '',
      linkedin: alm.linkedin || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingAlumni) {
        const updated = await api.updateAlumni(editingAlumni.id, {
          ...form,
          valuation: form.valuation || undefined,
          imageUrl: form.imageUrl || undefined,
          linkedin: form.linkedin || undefined,
        });
        onAlumniChange(alumni.map((a) => (a.id === editingAlumni.id ? updated : a)));
      } else {
        const created = await api.createAlumni({
          ...form,
          valuation: form.valuation || undefined,
          imageUrl: form.imageUrl || undefined,
          linkedin: form.linkedin || undefined,
        });
        onAlumniChange([created, ...alumni]);
      }
      setModalOpen(false);
      setEditingAlumni(null);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to save alumni profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this alumni profile?')) return;
    try {
      await api.deleteAlumni(id);
      onAlumniChange(alumni.filter((a) => a.id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to delete alumni profile.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-(--border-subtle)">
        <span className="text-xs text-(--text-muted) font-mono">
          {alumni.length} alumni founder profiles listed
        </span>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-sm transition-all uppercase tracking-wider"
        >
          <Plus className="h-4 w-4" />
          <span>Add Profile</span>
        </button>
      </div>

      {alumni.length === 0 ? (
        <div className="rounded-2xl border border-(--border-panel) bg-(--bg-panel) p-12 text-center text-xs text-(--text-muted)">
          No alumni profiles uploaded yet. Click &quot;Add Profile&quot; to spotlight notable founders.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {alumni.map((alm) => (
            <div
              key={alm.id}
              className="rounded-2xl border border-(--border-panel) bg-(--bg-panel) p-5 space-y-3.5 flex flex-col justify-between hover:border-(--border-panel-elevated) transition-all shadow-sm group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {alm.imageUrl ? (
                      <img
                        src={alm.imageUrl}
                        alt={alm.name}
                        className="h-12 w-12 rounded-xl object-cover border border-(--border-subtle)"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                        {alm.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-(--text-primary)">
                        {alm.name}
                      </h4>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 block font-semibold">
                        {alm.company} &middot; {alm.batch}
                      </span>
                      <span className="text-[11px] text-(--text-muted)">
                        {alm.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(alm)}
                      className="text-(--text-muted) hover:text-emerald-500 p-1.5 rounded-lg hover:bg-(--bg-panel-alt) transition-colors"
                      title="Edit Profile"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(alm.id)}
                      className="text-(--text-muted) hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Delete Profile"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {alm.valuation && (
                  <div className="px-2.5 py-1 rounded-lg bg-emerald-500/7 border border-emerald-500/20 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 shrink-0" />
                    <span>{alm.valuation}</span>
                  </div>
                )}

                <p className="text-xs text-(--text-muted) line-clamp-3 leading-relaxed">
                  {alm.bio}
                </p>
              </div>

              <div className="border-t border-(--border-subtle) pt-2.5 flex items-center justify-between text-xs">
                <span className="text-[11px] text-(--text-secondary) font-medium flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                  <span>{alm.achievement}</span>
                </span>

                {alm.linkedin && (
                  <a
                    href={alm.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="text-(--text-muted) hover:text-(--text-primary) flex items-center gap-1 text-[11px] font-medium transition-colors"
                  >
                    <span>LinkedIn</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <CmsModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAlumni(null);
        }}
        title={editingAlumni ? 'Edit Alumni Profile' : 'Add Alumni Profile'}
        icon={<GraduationCap className="h-5 w-5" />}
        accentColor="#10B981"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-(--text-primary) mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Sachin Dev Duggal"
              className={INPUT_CLS}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-(--text-primary) mb-1">Batch *</label>
              <input
                type="text"
                required
                value={form.batch}
                onChange={(e) => set('batch', e.target.value)}
                placeholder="e.g. PEC '17"
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-(--text-primary) mb-1">Designation *</label>
              <input
                type="text"
                required
                value={form.role}
                onChange={(e) => set('role', e.target.value)}
                placeholder="e.g. Founder & CEO"
                className={INPUT_CLS}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-(--text-primary) mb-1">Company *</label>
              <input
                type="text"
                required
                value={form.company}
                onChange={(e) => set('company', e.target.value)}
                placeholder="e.g. CARS24"
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-(--text-primary) mb-1">Valuation / Scale Metric</label>
              <input
                type="text"
                value={form.valuation || ''}
                onChange={(e) => set('valuation', e.target.value)}
                placeholder="e.g. $3.3B Unicorn"
                className={INPUT_CLS}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-(--text-primary) mb-1">Key Achievement Badge *</label>
            <input
              type="text"
              required
              value={form.achievement}
              onChange={(e) => set('achievement', e.target.value)}
              placeholder="e.g. Unicorn Founder, Forbes 30 Under 30"
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-(--text-primary) mb-1">Short Biography *</label>
            <textarea
              required
              rows={3}
              value={form.bio}
              onChange={(e) => set('bio', e.target.value)}
              placeholder="Summary of entrepreneurial career and milestones..."
              className={INPUT_CLS}
            />
          </div>

          <ImageDropzone
            value={form.imageUrl || ''}
            onChange={(url) => set('imageUrl', url)}
            folder="alumni"
            label="Alumni Headshot Photo"
          />

          <div>
            <label className="block text-xs font-semibold text-(--text-primary) mb-1">LinkedIn Profile URL</label>
            <input
              type="url"
              value={form.linkedin || ''}
              onChange={(e) => set('linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className={INPUT_CLS}
            />
          </div>

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
              {isSubmitting ? 'Saving...' : editingAlumni ? 'Update Profile' : 'Add Profile'}
            </button>
          </div>
        </form>
      </CmsModal>
    </div>
  );
}
