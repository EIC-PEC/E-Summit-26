// components/cms/CmsModal.tsx
// Reusable modal shell — handles backdrop, close button.
import React from 'react';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  children: React.ReactNode;
}

export function CmsModal({ open, onClose, title, subtitle, icon, accentColor = '#10B981', children }: Props) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cms-modal-title"
    >
      <div className="w-full max-w-lg max-h-[92vh] flex flex-col rounded-[6px] bg-(--bg-panel) shadow-2xl border border-(--border-panel) overflow-hidden my-auto">
        {/* Modal Sticky Header */}
        <div className="flex items-center justify-between border-b border-(--border-subtle) px-5 py-3.5 bg-(--bg-panel) shrink-0">
          <div className="flex items-center gap-2.5">
            {icon && <span style={{ color: accentColor }}>{icon}</span>}
            <div>
              <h3 id="cms-modal-title" className="text-base font-bold text-(--text-primary) font-rajdhani leading-tight">
                {title}
              </h3>
              {subtitle && <span className="text-xs text-(--text-muted) font-medium block mt-0.5">{subtitle}</span>}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-[4px] p-1.5 text-(--text-muted) hover:bg-(--bg-panel-alt) hover:text-(--text-primary) transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}

