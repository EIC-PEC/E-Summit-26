'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Pencil, MapPin, CalendarDays, Clock, Building } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { CmsModal } from './CmsModal';
import { VenueLocationPicker } from './VenueLocationPicker';
import { ScheduleItem, ScheduleItemInput } from '../../lib/types';
import { api, ApiError } from '../../lib/api';

const INPUT_CLS =
  'w-full rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) p-2.5 text-xs text-(--text-primary) focus:border-emerald-500/50 focus:outline-none';

const KNOWN_VENUES = [
  { venueId: 'main-auditorium', venueName: 'Main Auditorium (CCA)', building: 'CCA Building', lat: 30.765515, lng: 76.784260, tag: 'Main Stage' },
  { venueId: 'senate', venueName: 'PEC Senate Hall', building: 'PEC Senate Hall', lat: 30.7670, lng: 76.7872, tag: 'Senate Hall' },
  { venueId: 'siemens_coe', venueName: 'Siemens Center of Excellence', building: 'Siemens Center of Excellence', lat: 30.7682, lng: 76.7890, tag: 'Hacker Lab' },
  { venueId: 'expo-hall', venueName: 'Expo Hall (SPIC Centre)', building: 'SPIC Centre', lat: 30.765833, lng: 76.785850, tag: 'Expo Grounds' },
  { venueId: 'main-gate', venueName: 'Main Gate (Gate 1)', building: 'Campus Entrance - Gate 1', lat: 30.763153, lng: 76.783675, tag: 'Entry Gate' },
  { venueId: 'student-center', venueName: 'Student Center (PEC Market)', building: 'PEC Market Area', lat: 30.766326, lng: 76.783485, tag: 'Student Center' },
  { venueId: 'oat', venueName: 'PEC Open Air Theatre', building: 'Open Air Theatre', lat: 30.7662, lng: 76.7875, tag: 'OAT Arena' },
];

const TAG_BADGE_MAP: Record<string, 'mint' | 'blue' | 'coral' | 'gold' | 'muted'> = {
  'Main Stage': 'mint',
  'Hacker Lab': 'blue',
  'Senate Hall': 'coral',
  'Expo Grounds': 'gold',
  'Entry Gate': 'muted',
  'Student Center': 'gold',
  'OAT Arena': 'mint',
};

interface ScheduleManagerProps {
  scheduleItems: ScheduleItem[];
  onScheduleItemsChange: (items: ScheduleItem[]) => void;
}

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({
  scheduleItems,
  onScheduleItemsChange,
}) => {
  const [activeDay, setActiveDay] = useState<1 | 2>(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<ScheduleItemInput>({
    day: 1,
    date: 'MARCH 15, 2026',
    time: '09:00 AM',
    title: '',
    tag: 'Main Stage',
    venueId: 'main-auditorium',
    venueName: 'Main Auditorium (CCA)',
    building: 'CCA Building',
    lat: 30.765515,
    lng: 76.784260,
    order: 1,
  });

  const filtered = scheduleItems
    .filter((s) => s.day === activeDay)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleVenuePresetChange = (venueId: string) => {
    const preset = KNOWN_VENUES.find((v) => v.venueId === venueId);
    if (preset) {
      setForm((prev) => ({
        ...prev,
        venueId: preset.venueId,
        venueName: preset.venueName,
        building: preset.building,
        lat: preset.lat,
        lng: preset.lng,
        tag: preset.tag,
      }));
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    const dayDate = activeDay === 1 ? 'MARCH 15, 2026' : 'MARCH 16, 2026';
    const nextOrder = filtered.length + 1;
    const defaultVenue = KNOWN_VENUES[0];

    setForm({
      day: activeDay,
      date: dayDate,
      time: '10:00 AM',
      title: '',
      tag: defaultVenue.tag,
      venueId: defaultVenue.venueId,
      venueName: defaultVenue.venueName,
      building: defaultVenue.building,
      lat: defaultVenue.lat,
      lng: defaultVenue.lng,
      order: nextOrder,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: ScheduleItem) => {
    setEditingItem(item);
    setForm({
      day: item.day,
      date: item.date,
      time: item.time,
      title: item.title,
      tag: item.tag,
      venueId: item.venueId,
      venueName: item.venueName,
      building: item.building,
      lat: item.lat,
      lng: item.lng,
      order: item.order || 1,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingItem) {
        const updated = await api.updateScheduleItem(editingItem.id, {
          ...form,
          day: activeDay,
          date: activeDay === 1 ? 'MARCH 15, 2026' : 'MARCH 16, 2026',
        });
        onScheduleItemsChange(
          scheduleItems.map((s) => (s.id === editingItem.id ? updated : s))
        );
      } else {
        const created = await api.createScheduleItem({
          ...form,
          day: activeDay,
          date: activeDay === 1 ? 'MARCH 15, 2026' : 'MARCH 16, 2026',
        });
        onScheduleItemsChange([...scheduleItems, created]);
      }
      setModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to save schedule session.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this schedule session from the summit timeline?')) return;
    try {
      await api.deleteScheduleItem(id);
      onScheduleItemsChange(scheduleItems.filter((s) => s.id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to delete session.');
    }
  };

  const day1Count = scheduleItems.filter((s) => s.day === 1).length;
  const day2Count = scheduleItems.filter((s) => s.day === 2).length;

  return (
    <div className="space-y-4">
      {/* Day Selector & Add Session Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-(--border-subtle)">
        <div className="flex rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) p-1 gap-1">
          <button
            onClick={() => setActiveDay(1)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeDay === 1
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-(--text-secondary) hover:text-(--text-primary)'
            }`}
          >
            Day 1 &middot; Sun, Mar 15 ({day1Count})
          </button>
          <button
            onClick={() => setActiveDay(2)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeDay === 2
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-(--text-secondary) hover:text-(--text-primary)'
            }`}
          >
            Day 2 &middot; Mon, Mar 16 ({day2Count})
          </button>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-sm transition-all uppercase tracking-wider self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Session</span>
        </button>
      </div>

      {/* Session Cards List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-(--border-panel) bg-(--bg-panel) p-12 text-center text-xs text-(--text-muted)">
            No sessions scheduled for Day {activeDay}. Click &quot;Add Session&quot; to create one.
          </div>
        ) : (
          filtered.map((item, idx) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-(--border-panel) bg-(--bg-panel) hover:border-(--border-panel-elevated) transition-all gap-4 shadow-sm"
            >
              <div className="flex items-start sm:items-center gap-4">
                {/* Time Badge */}
                <div className="min-w-27.5 rounded-xl bg-(--bg-panel-alt) p-2 text-center border border-(--border-subtle)">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block font-mono">
                    {item.time}
                  </span>
                  <span className="text-[10px] text-(--text-muted) font-semibold uppercase tracking-wider">
                    SLOT #{idx + 1}
                  </span>
                </div>

                {/* Session Details */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 uppercase">
                      {item.tag}
                    </span>
                    <span className="text-xs text-(--text-muted)">
                      &bull; {item.venueName}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-(--text-primary)">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-(--text-muted)">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{item.building}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 self-end sm:self-center">
                <button
                  onClick={() => openEditModal(item)}
                  className="p-1.5 rounded-lg border border-(--border-subtle) bg-(--bg-panel-alt) text-(--text-muted) hover:text-emerald-500 transition-colors"
                  title="Edit Slot"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg border border-(--border-subtle) bg-(--bg-panel-alt) text-(--text-muted) hover:text-rose-500 transition-colors"
                  title="Delete Slot"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <CmsModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? 'Edit Schedule Session' : 'Add New Schedule Session'}
        icon={<Clock className="h-5 w-5" />}
        accentColor="#10B981"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-(--text-primary) mb-1">Summit Day *</label>
              <select
                value={form.day}
                onChange={(e) => {
                  const d = Number(e.target.value) as 1 | 2;
                  setForm((p) => ({
                    ...p,
                    day: d,
                    date: d === 1 ? 'MARCH 15, 2026' : 'MARCH 16, 2026',
                  }));
                }}
                className={INPUT_CLS}
              >
                <option value={1}>Day 1 (Sun, Mar 15)</option>
                <option value={2}>Day 2 (Mon, Mar 16)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-(--text-primary) mb-1">Time Range *</label>
              <input
                type="text"
                required
                value={form.time}
                onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
                placeholder="e.g. 10:00 AM - 11:30 AM"
                className={INPUT_CLS}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-(--text-primary) mb-1">Session Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Inaugural Keynote: Scaling India's Next Decacorn"
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-(--text-primary) mb-1">Track / Category Tag *</label>
            <select
              value={form.tag}
              onChange={(e) => setForm((p) => ({ ...p, tag: e.target.value }))}
              className={INPUT_CLS}
            >
              <option value="Main Stage">Main Stage Keynote</option>
              <option value="Hacker Lab">Hacker Lab &amp; Coding</option>
              <option value="Senate Hall">Senate Hall Strategy</option>
              <option value="Expo Grounds">Startup Expo &amp; Showcase</option>
              <option value="OAT Arena">Open Air Arena</option>
              <option value="Student Center">Student Center Hub</option>
              <option value="Entry Gate">Gate &amp; Registration</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-(--text-primary) mb-1">PEC Venue Preset *</label>
            <select
              value={form.venueId}
              onChange={(e) => handleVenuePresetChange(e.target.value)}
              className={INPUT_CLS}
            >
              {KNOWN_VENUES.map((v) => (
                <option key={v.venueId} value={v.venueId}>
                  {v.venueName} &bull; {v.building}
                </option>
              ))}
            </select>
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
              disabled={loading}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-bold text-slate-950 disabled:opacity-50 transition-colors uppercase tracking-wider"
            >
              {loading ? 'Saving...' : editingItem ? 'Update Session' : 'Create Session'}
            </button>
          </div>
        </form>
      </CmsModal>
    </div>
  );
};
