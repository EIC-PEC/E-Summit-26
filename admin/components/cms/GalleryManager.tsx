'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Pencil, ImagePlus, Sparkles } from 'lucide-react';
import { ImageDropzone } from '../ui/ImageDropzone';
import { CmsModal } from './CmsModal';
import { GalleryItem, GalleryInput } from '../../lib/types';
import { api, ApiError } from '../../lib/api';

interface Props {
  gallery: GalleryItem[];
  onGalleryChange: (g: GalleryItem[]) => void;
}

const INPUT_CLS = 'w-full rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) p-2.5 text-xs text-(--text-primary) focus:border-emerald-500/50 focus:outline-none';

export function GalleryManager({ gallery, onGalleryChange }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ROW1' | 'ROW2'>('ALL');
  const [form, setForm] = useState<GalleryInput>({
    imageUrl: '',
    title: '',
    slot: 1,
  });

  const openModalForSlot = (slotNum: number) => {
    setIsEditing(false);
    setForm({
      imageUrl: '',
      title: `Showcase Photo #${slotNum}`,
      slot: slotNum,
    });
    setModalOpen(true);
  };

  const openEditModalForSlot = (item: GalleryItem) => {
    setIsEditing(true);
    setForm({
      imageUrl: item.imageUrl,
      title: item.title || `Showcase Photo #${item.slot}`,
      slot: item.slot,
    });
    setModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl) {
      alert('Please upload an image or provide an image URL.');
      return;
    }
    setIsSubmitting(true);
    try {
      const slotNum = Number(form.slot) || 1;
      const created = await api.createGalleryItem({
        imageUrl: form.imageUrl,
        title: form.title || undefined,
        slot: slotNum,
      });
      const filtered = gallery.filter((g) => g.slot !== slotNum);
      onGalleryChange([...filtered, created]);
      setModalOpen(false);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to save gallery photo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    try {
      await api.deleteGalleryItem(id);
      onGalleryChange(gallery.filter((g) => g.id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to delete photo.');
    }
  };

  const renderSlotGrid = (start: number, end: number, rowTitle: string) => {
    const totalSlots = end - start + 1;
    const filledCount = gallery.filter((g) => g.slot !== undefined && g.slot >= start && g.slot <= end).length;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-(--border-subtle)">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-(--text-primary)">{rowTitle}</span>
            <span className="text-[11px] font-mono text-(--text-muted)">
              (Slots #{start} - #{end})
            </span>
          </div>
          <span className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            {filledCount}/{totalSlots} filled
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: totalSlots }, (_, i) => start + i).map((slotNum) => {
            const item = gallery.find((g) => g.slot === slotNum);
            return (
              <div
                key={`slot-${slotNum}`}
                className="group relative rounded-2xl border border-(--border-panel) bg-(--bg-panel) overflow-hidden flex flex-col justify-between hover:border-(--border-panel-elevated) transition-all shadow-sm min-h-47.5"
              >
                {item ? (
                  <>
                    <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                      <img
                        src={item.imageUrl}
                        alt={item.title || `Slot #${slotNum}`}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/10">
                        Slot #{slotNum}
                      </span>
                    </div>

                    <div className="p-3 flex items-center justify-between gap-2 border-t border-(--border-subtle) bg-(--bg-panel)">
                      <span className="text-xs font-semibold text-(--text-primary) truncate">
                        {item.title || `Showcase #${slotNum}`}
                      </span>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEditModalForSlot(item)}
                          className="p-1.5 rounded-lg border border-(--border-subtle) bg-(--bg-panel-alt) text-(--text-muted) hover:text-emerald-500 hover:border-emerald-500/40 transition-colors"
                          title="Edit photo"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg border border-(--border-subtle) bg-(--bg-panel-alt) text-(--text-muted) hover:text-rose-500 hover:border-rose-500/40 transition-colors"
                          title="Delete photo"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => openModalForSlot(slotNum)}
                    className="flex flex-col items-center justify-center p-6 text-center space-y-2 border-2 border-dashed border-(--border-subtle) bg-(--bg-panel-alt) hover:border-emerald-500/50 hover:bg-(--bg-panel-elevated) transition-all rounded-2xl h-full w-full"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-(--bg-panel) border border-(--border-subtle) text-(--text-muted) group-hover:text-emerald-500">
                      <Plus className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-(--text-primary) block">
                        Slot #{slotNum}
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        + Add Photo
                      </span>
                    </div>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Row Filter Pills */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 rounded-lg bg-(--bg-panel-alt) border border-(--border-subtle) p-1">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeFilter === 'ALL'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-(--text-secondary) hover:text-(--text-primary)'
            }`}
          >
            All Marquee Slots (16)
          </button>
          <button
            onClick={() => setActiveFilter('ROW1')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeFilter === 'ROW1'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-(--text-secondary) hover:text-(--text-primary)'
            }`}
          >
            Row 1: Left Marquee (1–8)
          </button>
          <button
            onClick={() => setActiveFilter('ROW2')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeFilter === 'ROW2'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-(--text-secondary) hover:text-(--text-primary)'
            }`}
          >
            Row 2: Right Marquee (9–16)
          </button>
        </div>
      </div>

      {/* Row 1: Left Marquee */}
      {(activeFilter === 'ALL' || activeFilter === 'ROW1') &&
        renderSlotGrid(1, 8, 'Row 1 · Left-Scrolling Marquee')}

      {/* Row 2: Right Marquee */}
      {(activeFilter === 'ALL' || activeFilter === 'ROW2') &&
        renderSlotGrid(9, 16, 'Row 2 · Right-Scrolling Marquee')}

      <CmsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? `Edit Showcase Photo #${form.slot}` : `Insert Photo into Slot #${form.slot}`}
        icon={<ImagePlus className="h-5 w-5" />}
        accentColor="#10B981"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-(--text-primary) mb-1">
              Photo Caption / Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Centenary Hall Auditorium Keynote"
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-(--text-primary) mb-1">
              Marquee Slot Number (1 - 16)
            </label>
            <input
              type="number"
              min={1}
              max={16}
              value={form.slot}
              onChange={(e) => setForm({ ...form, slot: Number(e.target.value) })}
              className={INPUT_CLS}
            />
          </div>

          <ImageDropzone
            label="Showcase Photo File *"
            folder="gallery"
            aspectRatio="video"
            value={form.imageUrl}
            onChange={(url) => setForm({ ...form, imageUrl: url })}
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
              {isSubmitting ? 'Saving Photo...' : isEditing ? 'Update Slot Photo' : 'Save Slot Photo'}
            </button>
          </div>
        </form>
      </CmsModal>
    </div>
  );
}
