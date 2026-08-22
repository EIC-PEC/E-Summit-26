'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  GraduationCap, 
  FolderGit2, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  Sliders,
} from 'lucide-react';

import { useAuth } from '../../lib/auth-context';
import { Role } from '../../lib/types';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    roles: ['SUPER_ADMIN', 'ORGANIZER', 'VOLUNTEER_CHECKIN', 'INVESTOR', 'DELEGATE'],
  },
  {
    name: 'Delegates & Passes',
    href: '/delegates',
    icon: Users,
    roles: ['SUPER_ADMIN', 'ORGANIZER', 'VOLUNTEER_CHECKIN'],
  },
  {
    name: 'Site Config & Alerts',
    href: '/config',
    icon: Sliders,
    roles: ['SUPER_ADMIN', 'ORGANIZER'],
  },
  {
    name: 'Media & Assets',
    href: '/media',
    icon: FolderGit2,
    roles: ['SUPER_ADMIN', 'ORGANIZER'],
  },
  {
    name: 'Alumni Directory',
    href: '/alumni',
    icon: GraduationCap,
    roles: ['SUPER_ADMIN', 'ORGANIZER', 'DELEGATE'],
  },
  {
    name: 'Schedule & Speakers',
    href: '/cms',
    icon: CalendarDays,
    roles: ['SUPER_ADMIN', 'ORGANIZER'],
  },
];

interface SidebarProps {
  collapsed?: boolean;
  setCollapsed?: React.Dispatch<React.SetStateAction<boolean>> | ((val: boolean) => void);
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed: externalCollapsed,
  setCollapsed: externalSetCollapsed,
}) => {
  const pathname = usePathname();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const setCollapsed = externalSetCollapsed || setInternalCollapsed;
  const { role, logout, user } = useAuth();
  const accessibleNav = NAV_ITEMS.filter((item) => (role ? item.roles.includes(role) : false));

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen border-r border-(--border-panel) bg-(--bg-panel) transition-all duration-200 flex flex-col justify-between overflow-hidden select-none ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Top Header & Toggle */}
      <div className="shrink-0 flex h-16 items-center justify-between px-3.5 border-b border-(--border-subtle) bg-(--bg-panel)">
        {!collapsed ? (
          <>
            <Link href="/" className="flex flex-col truncate group">
              <span className="font-bold text-sm text-(--text-primary) leading-tight tracking-tight">
                PEC E-Summit '26
              </span>
              <span className="text-[10px] text-(--text-muted) uppercase tracking-wider font-semibold">
                Admin Console
              </span>
            </Link>

            <button
              onClick={() => setCollapsed(true)}
              className="h-7 w-7 rounded-lg border border-(--border-subtle) bg-(--bg-panel-alt) text-(--text-muted) hover:bg-(--bg-panel-elevated) hover:text-(--text-primary) flex items-center justify-center transition-colors shrink-0"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setCollapsed(false)}
            className="mx-auto h-8 w-8 rounded-lg border border-(--border-subtle) bg-(--bg-panel-alt) text-(--text-muted) hover:bg-(--bg-panel-elevated) hover:text-(--text-primary) flex items-center justify-center transition-colors"
            title="Expand Sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1 scrollbar-none">
        {accessibleNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (collapsed) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`h-10 w-10 mx-auto rounded-xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'text-(--text-secondary) hover:bg-(--bg-panel-alt) hover:text-(--text-primary)'
                }`}
                title={item.name}
              >
                <Icon className="h-4 w-4" />
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 font-semibold'
                  : 'text-(--text-secondary) hover:bg-(--bg-panel-alt) hover:text-(--text-primary) border border-transparent'
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-(--text-muted)'
                }`}
              />
              <span className="truncate flex-1">{item.name}</span>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-white/10 text-(--text-muted)">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Pinned Bottom User & Links */}
      <div className="shrink-0 border-t border-(--border-subtle) bg-(--bg-panel-alt) p-2.5 space-y-2">
        {!collapsed ? (
          <>
            <a
              href={process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-panel-elevated) transition-colors font-medium border border-transparent hover:border-(--border-subtle)"
            >
              <span>Public Website</span>
              <ExternalLink className="h-3 w-3" />
            </a>

            <div className="flex items-center justify-between pt-2 border-t border-(--border-subtle) px-1">
              <div className="flex items-center gap-2 truncate">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold shrink-0">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'SA'}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold text-(--text-primary) truncate">
                    {user?.name || 'Super Admin'}
                  </span>
                  <span className="text-[10px] text-(--text-muted) truncate uppercase tracking-wider">
                    {(role || 'SUPER_ADMIN').replace('_', ' ')}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-(--text-muted) hover:bg-rose-500/10 hover:text-rose-500 transition-colors shrink-0"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={logout}
            className="h-9 w-9 mx-auto rounded-lg text-(--text-muted) hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
