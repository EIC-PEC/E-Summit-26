'use client'

import React from 'react'
import { Check } from 'lucide-react'
import { PassTier, PASS_TIERS } from '../types'

interface PassTierCardsProps {
  selectedPassId: string
  onSelectPass: (passId: string) => void
}

export const PassTierCards: React.FC<PassTierCardsProps> = ({
  selectedPassId,
  onSelectPass,
}) => {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-white/10 text-white text-[10px] flex items-center justify-center font-mono font-bold">
            1
          </span>
          <span>Choose Your Ticket Tier</span>
        </h2>
        <span className="text-[11px] text-neutral-500">All passes include summit ID &amp; kit</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {PASS_TIERS.map((tier: PassTier) => {
          const isSelected = selectedPassId === tier.id

          return (
            <div
              key={tier.id}
              onClick={() => onSelectPass(tier.id)}
              className={`relative cursor-pointer rounded-lg border p-3.5 transition-all flex flex-col justify-between gap-3 ${
                isSelected
                  ? 'border-mint bg-[#182A23] shadow-sm'
                  : 'border-white/10 bg-[#13221C] hover:border-white/20 hover:bg-[#182A23]'
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded bg-mint text-void text-[9px] font-bold uppercase tracking-wider">
                  Popular
                </span>
              )}

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                    {tier.tagline}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'border-mint bg-mint text-void'
                        : 'border-white/20'
                    }`}
                  >
                    {isSelected && <Check size={10} strokeWidth={3} />}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">
                  {tier.title}
                </h3>

                <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                  {tier.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-baseline justify-between">
                <span className="text-[10px] text-neutral-500">Registration Fee</span>
                <span
                  className={`text-sm font-bold font-mono ${
                    tier.fee === 0 ? 'text-mint' : 'text-white'
                  }`}
                >
                  {tier.fee === 0 ? 'FREE' : tier.feeLabel}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
