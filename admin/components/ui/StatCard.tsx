import React from 'react';
import { LucideIcon } from 'lucide-react';

export type StatCardVariant = 'mint' | 'cyan' | 'blue' | 'coral' | 'gold' | 'purple' | 'amber' | 'emerald';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    positive?: boolean;
  };
  icon: LucideIcon;
  variant?: StatCardVariant;
  badge?: string;
  accentBadge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  variant = 'mint',
  badge,
  accentBadge,
}) => {
  const displayBadge = badge || accentBadge;

  const variantConfig: Record<string, { cardBg: string; iconBg: string; badgeBg: string; subColor: string }> = {
    mint: {
      cardBg: 'bg-[#4ADE80] text-slate-950', // Solid Vibrant Lime Green
      iconBg: 'bg-black/15 text-slate-950 border border-black/10',
      badgeBg: 'bg-black/15 text-slate-950 border border-black/10',
      subColor: 'text-slate-800',
    },
    emerald: {
      cardBg: 'bg-[#4ADE80] text-slate-950',
      iconBg: 'bg-black/15 text-slate-950 border border-black/10',
      badgeBg: 'bg-black/15 text-slate-950 border border-black/10',
      subColor: 'text-slate-800',
    },
    cyan: {
      cardBg: 'bg-[#38BDF8] text-slate-950', // Solid Vibrant Sky Blue
      iconBg: 'bg-black/15 text-slate-950 border border-black/10',
      badgeBg: 'bg-black/15 text-slate-950 border border-black/10',
      subColor: 'text-slate-800',
    },
    blue: {
      cardBg: 'bg-[#38BDF8] text-slate-950', // Solid Vibrant Sky Blue
      iconBg: 'bg-black/15 text-slate-950 border border-black/10',
      badgeBg: 'bg-black/15 text-slate-950 border border-black/10',
      subColor: 'text-slate-800',
    },
    coral: {
      cardBg: 'bg-[#FB923C] text-slate-950', // Solid Vibrant Coral Orange
      iconBg: 'bg-black/15 text-slate-950 border border-black/10',
      badgeBg: 'bg-black/15 text-slate-950 border border-black/10',
      subColor: 'text-slate-800',
    },
    gold: {
      cardBg: 'bg-[#FDE047] text-slate-950', // Solid Vibrant Canary Yellow
      iconBg: 'bg-black/15 text-slate-950 border border-black/10',
      badgeBg: 'bg-black/15 text-slate-950 border border-black/10',
      subColor: 'text-slate-800',
    },
    amber: {
      cardBg: 'bg-[#FDE047] text-slate-950',
      iconBg: 'bg-black/15 text-slate-950 border border-black/10',
      badgeBg: 'bg-black/15 text-slate-950 border border-black/10',
      subColor: 'text-slate-800',
    },
    purple: {
      cardBg: 'bg-[#C084FC] text-slate-950', // Solid Vibrant Lilac Purple
      iconBg: 'bg-black/15 text-slate-950 border border-black/10',
      badgeBg: 'bg-black/15 text-slate-950 border border-black/10',
      subColor: 'text-slate-800',
    },
  };

  const current = variantConfig[variant] || variantConfig.mint;

  return (
    <div
      className={`relative overflow-hidden rounded-[4px] p-5 transition-transform duration-150 hover:scale-[1.01] ${current.cardBg}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-900">{title}</p>
          <h3 className="mt-2 text-2xl lg:text-3xl font-extrabold tracking-tight font-rajdhani text-slate-950">
            {value}
          </h3>
          {subtitle && (
            <p className={`mt-1 text-xs font-semibold ${current.subColor}`}>{subtitle}</p>
          )}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-[4px] ${current.iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {(trend || displayBadge) && (
        <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3 text-xs">
          {trend ? (
            <span className="font-extrabold text-slate-950">
              {trend.positive ? '↑' : '↓'} {trend.value}
            </span>
          ) : (
            <span />
          )}

          {displayBadge && (
            <span className={`text-[11px] px-2 py-0.5 rounded-[4px] font-extrabold tracking-wide uppercase ${current.badgeBg}`}>
              {displayBadge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
