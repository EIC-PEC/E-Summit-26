import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'mint' | 'blue' | 'coral' | 'gold' | 'muted' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'mint',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const variantStyles = {
    mint: 'bg-(--badge-mint-bg) text-(--badge-mint-text) border border-(--badge-mint-border) font-bold',
    blue: 'bg-(--badge-blue-bg) text-(--badge-blue-text) border border-(--badge-blue-border) font-bold',
    coral: 'bg-(--badge-coral-bg) text-(--badge-coral-text) border border-(--badge-coral-border) font-bold',
    gold: 'bg-(--badge-gold-bg) text-(--badge-gold-text) border border-(--badge-gold-border) font-bold',
    muted: 'bg-(--badge-muted-bg) text-(--badge-muted-text) border border-(--badge-muted-border) font-bold',
    outline: 'bg-transparent text-(--text-secondary) border border-(--border-panel) font-bold',
  };

  const dotColors = {
    mint: 'bg-emerald-500',
    blue: 'bg-sky-500',
    coral: 'bg-rose-500',
    gold: 'bg-amber-500',
    muted: 'bg-zinc-400',
    outline: 'bg-slate-700 dark:bg-white',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[4px] transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-[2px] ${dotColors[variant]}`}
        />
      )}
      {children}
    </span>
  );
};
