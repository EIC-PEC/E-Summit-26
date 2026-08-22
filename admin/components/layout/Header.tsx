'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Search, 
  ExternalLink,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { Role } from '../../lib/types';
import { api } from '../../lib/api';

interface HeaderProps {
  onSearchOpen?: () => void;
}

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Overview Dashboard',
  '/delegates': 'Delegates & Passes',
  '/config': 'Site Config & Live Alerts',
  '/media': 'Media & Brand Assets',
  '/alumni': 'Alumni Directory',
  '/cms': 'Schedule & Speakers',
};

const ROLE_LABELS: Record<Role, { label: string; className: string }> = {
  SUPER_ADMIN: { label: 'Super Admin', className: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  ORGANIZER: { label: 'Organizer', className: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20' },
  VOLUNTEER_CHECKIN: { label: 'Gate Volunteer', className: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' },
  INVESTOR: { label: 'Judge / Investor', className: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20' },
  DELEGATE: { label: 'Delegate', className: 'text-(--text-secondary) bg-(--bg-panel-alt) border-(--border-subtle)' },
};

export const Header: React.FC<HeaderProps> = ({ onSearchOpen }) => {
  const pathname = usePathname();
  const { role, user } = useAuth();
  const roleBadge = role ? ROLE_LABELS[role] : null;
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const currentTitle = ROUTE_TITLES[pathname] || 'Control Console';

  useEffect(() => {
    const current = (typeof window !== 'undefined' ? localStorage.getItem('esummit_admin_theme') : 'dark') as 'dark' | 'light' || 'dark';
    setTheme(current);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(current);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('esummit_admin_theme', next);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(next);
    }
  };

  useEffect(() => {
    let mounted = true;
    let timer: NodeJS.Timeout;

    const checkHealth = async () => {
      try {
        const h = await api.getHealth();
        if (mounted) {
          setIsBackendHealthy(h.status === 'ok');
          timer = setTimeout(checkHealth, 20000);
        }
      } catch {
        if (mounted) {
          setIsBackendHealthy(false);
          timer = setTimeout(checkHealth, 5000);
        }
      }
    };

    checkHealth();
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-(--border-panel) bg-(--bg-panel) px-4 lg:px-8 transition-colors">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-(--text-muted) font-medium">Console</span>
        <span className="text-(--text-muted)">/</span>
        <span className="text-(--text-primary) font-semibold">{currentTitle}</span>
      </div>

      {/* Center: Global Search Bar */}
      {onSearchOpen && (
        <button
          onClick={onSearchOpen}
          className="hidden md:flex items-center gap-2.5 rounded-lg border border-(--border-panel) bg-(--bg-panel-alt) px-3.5 py-1.5 text-xs text-(--text-muted) hover:border-emerald-500/50 hover:text-(--text-primary) transition-all font-medium w-64 lg:w-80 justify-between"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-(--text-muted)" />
            <span className="truncate">Search attendees, passes, records...</span>
          </div>
          <kbd className="rounded bg-(--bg-panel-elevated) px-1.5 py-0.5 text-[10px] text-(--text-muted) font-mono border border-(--border-subtle)">
            ⌘K
          </kbd>
        </button>
      )}

      {/* Right: API Status & Theme Switcher */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Backend status dot */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-(--bg-panel-alt) border border-(--border-subtle) text-[11px] font-medium">
          <span 
            className={`h-1.5 w-1.5 rounded-full ${
              isBackendHealthy === true 
                ? 'bg-emerald-500' 
                : isBackendHealthy === false 
                ? 'bg-rose-500' 
                : 'bg-amber-500'
            }`} 
          />
          <span className="text-(--text-muted) hidden sm:inline">API:</span>
          <span className={isBackendHealthy ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-500'}>
            {isBackendHealthy ? 'Connected' : isBackendHealthy === false ? 'Offline' : 'Connecting'}
          </span>
        </div>

        {/* Dark / Light Mode */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-1.5 rounded-lg border border-(--border-subtle) bg-(--bg-panel-alt) text-(--text-secondary) hover:text-emerald-500 hover:border-emerald-500/40 transition-all"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-sky-600" />
          )}
        </button>

        {/* User Role Badge */}
        {roleBadge && (
          <span className={`text-[11px] font-bold rounded-md px-2 py-0.5 border ${roleBadge.className}`}>
            {roleBadge.label}
          </span>
        )}
      </div>
    </header>
  );
};
