'use client';

import React, { useState } from 'react';
import { Plus, Trash2, ImagePlus, Pencil } from 'lucide-react';
import { ImageDropzone } from '../ui/ImageDropzone';
import { CmsModal } from './CmsModal';
import { PortfolioEventMedia } from '../../lib/types';
import { api, ApiError } from '../../lib/api';

export const PORTFOLIO_EVENT_LIST = [
  { id: 'corporate-workshops', number: '01', title: 'Corporate Workshops', category: 'Industry Workshop' },
  { id: 'internship-job-fair', number: '02', title: 'Internship & Job Fair', category: 'Talent & Hiring' },
  { id: 'rd-conclave', number: '03', title: 'R&D Conclave', category: 'Deep Tech & Research' },
  { id: 'ipl-auction', number: '04', title: 'IPL Auction Simulation', category: 'Strategy Competition' },
  { id: 'ignite', number: '05', title: 'Ignite Pitch Stage', category: 'Innovation Showcase' },
  { id: 'treasure-hunt', number: '06', title: 'Campus Treasure Hunt', category: 'Team Exploration' },
  { id: 'baazar', number: '07', title: 'Baazar Campus Market', category: 'Venture Exhibition' },
  { id: 'bizquiz-saasc', number: '08', title: 'BizQuiz with SAASC', category: 'Business Quiz' },
  { id: 'additional-quiz-saasc', number: '09', title: 'SAASC Knowledge Quiz', category: 'Thematic Quiz' },
  { id: 'campus-ambassador', number: '10', title: 'Campus Ambassador Net', category: 'Student Outreach' },
  { id: 'expert-speakers', number: '11', title: 'Expert Speaker Sessions', category: 'Keynotes & Panels' },
  { id: 'funding-conclave', number: '12', title: 'Funding Conclave (TTM)', category: 'Capital & Mentorship' },
  { id: 'case-competition', number: '13', title: 'Executive Case Competition', category: 'Strategy & Analysis' },
];

interface Props {
  portfolioMedia: PortfolioEventMedia[];
  onPortfolioMediaChange: (media: PortfolioEventMedia[]) => void;
}

export function EventsMediaManager({ portfolioMedia, onPortfolioMediaChange }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<(typeof PORTFOLIO_EVENT_LIST)[0] | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openModal = (evt: (typeof PORTFOLIO_EVENT_LIST)[0], currentUrl = '') => {
    setSelectedEvent(evt);
    setImageUrl(currentUrl);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    if (!imageUrl) {
      alert('Please upload an image or enter an image URL.');
      return;
    }
    setIsSubmitting(true);
    try {
      const updated = await api.setPortfolioImage(selectedEvent.id, imageUrl);
      const filtered = portfolioMedia.filter((p) => p.eventId !== selectedEvent.id);
      onPortfolioMediaChange([...filtered, updated]);
      setModalOpen(false);
      setImageUrl('');
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to save event photo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to remove the image for this event?')) return;
    try {
      await api.deletePortfolioImage(eventId);
      onPortfolioMediaChange(portfolioMedia.filter((p) => p.eventId !== eventId));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to delete event image.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {PORTFOLIO_EVENT_LIST.map((evt) => {
          const media = portfolioMedia.find((m) => m.eventId === evt.id);
          return (
            <div
              key={evt.id}
              className="group relative rounded-2xl border border-(--border-panel) bg-(--bg-panel) overflow-hidden flex flex-col justify-between hover:border-(--border-panel-elevated) transition-all min-h-55 shadow-sm"
            >
              {media?.imageUrl ? (
                <>
                  <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                    <img
                      src={media.imageUrl}
                      alt={evt.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/10">
                      #{evt.number}
                    </span>
                    <button
                      onClick={() => handleDelete(evt.id)}
                      className="absolute top-2.5 right-2.5 rounded-lg bg-black/70 backdrop-blur-md p-1.5 text-neutral-300 hover:text-rose-500 border border-white/10 transition-colors"
                      title="Delete photo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="p-3 flex items-center justify-between gap-2 border-t border-(--border-subtle) bg-(--bg-panel)">
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-(--text-primary) truncate">
                        {evt.title}
                      </h4>
                      <span className="text-[10px] text-(--text-muted) block">
                        {evt.category}
                      </span>
                    </div>

                    <button
                      onClick={() => openModal(evt, media.imageUrl)}
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold shrink-0"
                    >
                      Change
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => openModal(evt, '')}
                  className="flex flex-col items-center justify-center p-6 text-center space-y-2 border-2 border-dashed border-(--border-subtle) bg-(--bg-panel-alt) rounded-2xl hover:border-emerald-500/50 hover:bg-(--bg-panel-elevated) transition-all h-full w-full"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-(--bg-panel) border border-(--border-subtle) text-(--text-muted) group-hover:text-emerald-500">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-(--text-primary) block">
                      #{evt.number} {evt.title}
                    </span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      + Add Poster
                    </span>
                  </div>
                </button>
              )}
            </div>
          );
        })}
      </div>

      <CmsModal
        open={modalOpen && !!selectedEvent}
        onClose={() => setModalOpen(false)}
        title="Insert Event Photo"
        subtitle={selectedEvent ? `#${selectedEvent.number} · ${selectedEvent.title}` : undefined}
        icon={<ImagePlus className="h-5 w-5" />}
        accentColor="#10B981"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <ImageDropzone
            label="Event Card Image Asset *"
            folder="events"
            aspectRatio="video"
            value={imageUrl}
            onChange={(url) => setImageUrl(url)}
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
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-bold text-slate-950 transition-all shadow-sm disabled:opacity-60 uppercase tracking-wider"
            >
              {isSubmitting ? 'Saving Picture...' : 'Insert Event Picture'}
            </button>
          </div>
        </form>
      </CmsModal>
    </div>
  );
}
