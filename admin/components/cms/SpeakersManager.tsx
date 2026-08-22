'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Pencil, Mic2 } from 'lucide-react';
import { ImageDropzone } from '../ui/ImageDropzone';
import { CmsModal } from './CmsModal';
import { SpeakerItem, SpeakerInput } from '../../lib/types';
import { api, ApiError } from '../../lib/api';

const INPUT_CLS =
  'w-full rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) p-2.5 text-xs text-(--text-primary) focus:border-emerald-500/50 focus:outline-none';

interface SpeakersManagerProps {
  speakers: SpeakerItem[];
  onSpeakersChange: (speakers: SpeakerItem[]) => void;
}

export const SpeakersManager: React.FC<SpeakersManagerProps> = ({
  speakers,
  onSpeakersChange,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<SpeakerItem | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<SpeakerInput>({
    name: '',
    title: '',
    bio: '',
    track: '',
    initials: '',
    avatarUrl: '',
    color: '#10B981',
  });

  const openCreateModal = () => {
    setEditingSpeaker(null);
    setForm({
      name: '',
      title: '',
      bio: '',
      track: '',
      initials: '',
      avatarUrl: '',
      color: '#10B981',
    });
    setModalOpen(true);
  };

  const openEditModal = (spk: SpeakerItem) => {
    setEditingSpeaker(spk);
    setForm({
      name: spk.name,
      title: spk.title,
      bio: spk.bio || '',
      track: spk.track || '',
      initials: spk.initials || '',
      avatarUrl: spk.avatarUrl || '',
      color: spk.color || '#10B981',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const initials =
        form.initials ||
        form.name
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();

      if (editingSpeaker) {
        const updated = await api.updateSpeaker(editingSpeaker.id, {
          ...form,
          avatarUrl: form.avatarUrl || undefined,
          initials,
        });
        onSpeakersChange(speakers.map((s) => (s.id === editingSpeaker.id ? updated : s)));
      } else {
        const created = await api.createSpeaker({
          ...form,
          avatarUrl: form.avatarUrl || undefined,
          initials,
        });
        onSpeakersChange([...speakers, created]);
      }
      setModalOpen(false);
      setEditingSpeaker(null);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to save speaker.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this speaker profile?')) return;
    try {
      await api.deleteSpeaker(id);
      onSpeakersChange(speakers.filter((s) => s.id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to delete speaker.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-(--border-subtle)">
        <span className="text-xs text-(--text-muted) font-mono">
          {speakers.length} keynote &amp; panel speakers scheduled
        </span>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-sm transition-all uppercase tracking-wider"
        >
          <Plus className="h-4 w-4" />
          <span>Add Speaker</span>
        </button>
      </div>

      {speakers.length === 0 ? (
        <div className="rounded-2xl border border-(--border-panel) bg-(--bg-panel) p-12 text-center text-xs text-(--text-muted)">
          No speakers uploaded yet. Click &quot;Add Speaker&quot; to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {speakers.map((spk) => (
            <div
              key={spk.id}
              className="rounded-2xl border border-(--border-panel) bg-(--bg-panel) p-4 space-y-3 flex flex-col justify-between hover:border-(--border-panel-elevated) transition-all shadow-sm group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {spk.avatarUrl ? (
                      <img
                        src={spk.avatarUrl}
                        alt={spk.name}
                        className="h-11 w-11 rounded-xl object-cover border border-(--border-subtle)"
                      />
                    ) : (
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-xl text-xs font-bold text-slate-950 shadow-sm"
                        style={{ backgroundColor: spk.color || '#10B981' }}
                      >
                        {spk.initials || spk.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="truncate">
                      <h4 className="text-sm font-bold text-(--text-primary) truncate">
                        {spk.name}
                      </h4>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                        {spk.track}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(spk)}
                      className="text-(--text-muted) hover:text-emerald-500 p-1.5 rounded-lg hover:bg-(--bg-panel-alt) transition-colors"
                      title="Edit Speaker"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(spk.id)}
                      className="text-(--text-muted) hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Delete Speaker"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-(--text-secondary) font-medium leading-tight">
                  {spk.title}
                </p>

                {spk.bio && (
                  <p className="text-xs text-(--text-muted) line-clamp-3 leading-relaxed">
                    {spk.bio}
                  </p>
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
          setEditingSpeaker(null);
        }}
        title={editingSpeaker ? 'Edit Speaker Profile' : 'Add Keynote Speaker'}
        icon={<Mic2 className="h-5 w-5" />}
        accentColor="#10B981"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-(--text-primary) mb-1">Speaker Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Deepinder Goyal"
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-(--text-primary) mb-1">Professional Title &amp; Company *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Founder &amp; CEO, Zomato"
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-(--text-primary) mb-1">Keynote / Session Track</label>
            <input
              type="text"
              value={form.track}
              onChange={(e) => setForm({ ...form, track: e.target.value })}
              placeholder="e.g. Main Stage Keynote, Fintech Panel"
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-(--text-primary) mb-1">Short Biography</label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Notable career background and achievements..."
              className={INPUT_CLS}
            />
          </div>

          <ImageDropzone
            label="Speaker Headshot Image"
            folder="speakers"
            value={form.avatarUrl || ''}
            onChange={(url) => setForm({ ...form, avatarUrl: url })}
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
              disabled={loading}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-bold text-slate-950 disabled:opacity-50 transition-colors uppercase tracking-wider"
            >
              {loading ? 'Saving...' : editingSpeaker ? 'Update Speaker' : 'Add Speaker'}
            </button>
          </div>
        </form>
      </CmsModal>
    </div>
  );
};
