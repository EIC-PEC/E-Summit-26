'use client'

import React from 'react'
import Image from 'next/image'
import { CheckCircle2, Ticket, Sparkles, Download, Edit3 } from 'lucide-react'
import { RegistrationRecord } from '@/lib/registrations'

interface TicketPassModalProps {
  currentBadge: RegistrationRecord
  summitDates: string
  onExportInstagramStory: () => void
  onPrint: () => void
  onEdit: (pass: RegistrationRecord) => void
  onViewPasses: () => void
  totalPassesCount: number
}

export const TicketPassModal: React.FC<TicketPassModalProps> = ({
  currentBadge,
  summitDates,
  onExportInstagramStory,
  onPrint,
  onEdit,
  onViewPasses,
  totalPassesCount,
}) => {
  return (
    <div className="space-y-5 max-w-md mx-auto pt-4">
      <div className="text-center space-y-1">
        <div className="w-9 h-9 rounded-full bg-mint/10 border border-mint/30 text-mint mx-auto flex items-center justify-center">
          <CheckCircle2 size={18} />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Your Pass is Confirmed!
        </h2>
        <p className="text-xs text-neutral-400">
          Save your entry pass or show your QR code at the registration desk.
        </p>
      </div>

      {/* Digital Pass Ticket Card */}
      <div className="rounded-lg border border-white/15 bg-[#13221C] p-4 relative space-y-3.5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="bg-mint text-void p-1 rounded font-bold">
              <Ticket size={13} />
            </div>
            <div>
              <span className="block text-xs font-bold text-white">
                PEC E-SUMMIT 2026
              </span>
              <span className="block text-[10px] text-neutral-400">
                {summitDates} • PEC Chandigarh
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-mint/10 border border-mint/20 text-[10px] font-semibold text-mint font-mono">
            {currentBadge.category}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <div>
              <span className="text-[9px] text-neutral-400 uppercase tracking-wider block font-mono">
                Attendee Name
              </span>
              <h3 className="text-base font-bold text-white mt-0.5 truncate">
                {currentBadge.name}
              </h3>
            </div>

            <div>
              <span className="text-[9px] text-neutral-400 uppercase tracking-wider block font-mono">
                College / Institution
              </span>
              <p className="text-xs text-neutral-300 mt-0.5 truncate">{currentBadge.college}</p>
            </div>

            <div>
              <span className="text-[9px] text-neutral-400 uppercase tracking-wider block font-mono">
                Ticket ID
              </span>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-xs font-bold text-mint">
                {currentBadge.id}
              </span>
            </div>
          </div>

          <div className="p-2 bg-white rounded-md shrink-0 flex flex-col items-center">
            {currentBadge.qrCodeData ? (
              <Image
                src={currentBadge.qrCodeData}
                alt="Check-in QR"
                width={90}
                height={90}
                className="w-20 h-20 object-contain mix-blend-multiply"
                unoptimized
              />
            ) : (
              <div className="w-20 h-20 bg-neutral-200 flex items-center justify-center text-[10px] text-neutral-600 font-mono">
                QR Ready
              </div>
            )}
            <span className="text-[8px] text-neutral-800 font-bold uppercase mt-0.5 font-mono">
              Entry QR
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={onExportInstagramStory}
          className="py-2 px-3 rounded-md bg-mint hover:bg-white text-void text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Sparkles size={13} />
          <span>Story Badge</span>
        </button>

        <button
          type="button"
          onClick={onPrint}
          className="py-2 px-3 rounded-md border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Download size={13} />
          <span>Print Ticket</span>
        </button>

        <button
          type="button"
          onClick={() => onEdit(currentBadge)}
          className="py-2 px-3 rounded-md border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Edit3 size={12} />
          <span>Edit Details</span>
        </button>

        <button
          type="button"
          onClick={onViewPasses}
          className="py-2 px-3 rounded-md border border-white/10 hover:border-white/20 text-neutral-400 hover:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Ticket size={12} />
          <span>My Passes ({totalPassesCount})</span>
        </button>
      </div>
    </div>
  )
}
