'use client'

import React from 'react'
import Link from 'next/link'
import { Check, ArrowRight, GraduationCap, Award, Terminal, Crown } from 'lucide-react'
import { STUDENT_PASSES, STUDENT_COMPARISON_FEATURES, StudentPassItem } from './passesData'

const ICON_MAP: Record<string, React.ElementType> = {
  'free-delegate': GraduationCap,
  'all-access': Award,
  hackathon: Terminal,
  'ultimate-combo': Crown,
}

export default function StudentPassesCards() {
  return (
    <div className="space-y-12">
      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {STUDENT_PASSES.map((pass: StudentPassItem) => {
          const Icon = ICON_MAP[pass.id] || Award
          const isFree = pass.priceNumber === 0

          return (
            <div
              key={pass.id}
              className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 border ${
                pass.popular
                  ? 'border-mint bg-[#0D241C] shadow-[0_0_25px_rgba(0,245,212,0.12)]'
                  : 'border-white/10 bg-[#081511] hover:border-white/20 hover:bg-[#0c1f19]'
              }`}
            >
              {pass.badgeText && (
                <span className="absolute -top-3 right-5 px-3 py-1 rounded-full bg-mint text-void font-mono text-[10px] font-black uppercase tracking-wider shadow-sm">
                  {pass.badgeText}
                </span>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
                      pass.popular
                        ? 'border-mint/50 bg-mint/15 text-mint'
                        : 'border-white/10 bg-white/5 text-neutral-300'
                    }`}
                  >
                    <Icon size={20} strokeWidth={2.2} />
                  </div>
                  <span className="font-mono text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                    {pass.tagline}
                  </span>
                </div>

                <h3 className="font-bold text-xl text-white mb-2 leading-snug">
                  {pass.title}
                </h3>

                <div className="flex items-baseline gap-1.5 mb-4">
                  <span
                    className={`font-black font-mono text-3xl sm:text-4xl tracking-tight ${
                      isFree ? 'text-mint' : 'text-white'
                    }`}
                  >
                    {pass.price}
                  </span>
                  <span className="font-mono text-[11px] text-neutral-500 uppercase">
                    / student
                  </span>
                </div>

                {/* Official "What's Included" from syllabus */}
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 mb-5">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
                    What&apos;s Included:
                  </span>
                  <p className="text-xs text-neutral-200 leading-relaxed font-medium">
                    {pass.whatsIncluded}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-2 font-semibold">
                    Key Features:
                  </span>
                  {pass.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2 text-xs text-neutral-300">
                      <Check className="w-3.5 h-3.5 text-mint shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span className="leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-white/5">
                <Link
                  href={`/register?tier=${pass.id}`}
                  className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    pass.popular
                      ? 'bg-mint text-void hover:bg-[#00DFBA] shadow-[0_0_20px_rgba(0,245,212,0.2)]'
                      : isFree
                        ? 'bg-white/10 text-white hover:bg-white/20'
                        : 'bg-white/10 text-white hover:bg-mint hover:text-void'
                  }`}
                >
                  <span>{isFree ? 'Claim Free Pass' : 'Register Now'}</span>
                  <ArrowRight size={14} className="stroke-[2.5]" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="rounded-3xl border border-white/10 bg-[#081511] overflow-hidden p-6 sm:p-8">
        <div className="mb-6">
          <h3 className="font-bold text-lg text-white mb-1">
            Student Pass Comparison
          </h3>
          <p className="text-xs text-neutral-400">
            Compare access across all 4 student ticket categories at PEC E-Summit 2026.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-neutral-400 font-mono uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Summit Deliverable</th>
                <th className="py-3 px-3 text-center">Free Delegate</th>
                <th className="py-3 px-3 text-center">All-Access (₹249)</th>
                <th className="py-3 px-3 text-center">Hackathon (₹350)</th>
                <th className="py-3 px-3 text-center text-mint font-bold">Ultimate (₹499)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {STUDENT_COMPARISON_FEATURES.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3 text-neutral-200 font-sans text-xs">{item.name}</td>
                  <td className="py-3 px-3 text-center">
                    {item.free ? (
                      <Check className="w-4 h-4 text-mint mx-auto" strokeWidth={2.5} />
                    ) : (
                      <span className="text-neutral-600">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {item.allAccess ? (
                      <Check className="w-4 h-4 text-mint mx-auto" strokeWidth={2.5} />
                    ) : (
                      <span className="text-neutral-600">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {item.hackathon ? (
                      <Check className="w-4 h-4 text-mint mx-auto" strokeWidth={2.5} />
                    ) : (
                      <span className="text-neutral-600">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center bg-mint/5">
                    {item.combo ? (
                      <Check className="w-4 h-4 text-mint mx-auto" strokeWidth={2.5} />
                    ) : (
                      <span className="text-neutral-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
