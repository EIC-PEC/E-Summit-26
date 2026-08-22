'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck,
  Loader2,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { ApiError } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setError('');

    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invalid admin credentials or connection error.');
    } finally {
      setLoading(false);
    }
  };

  const fillDefaultCredentials = () => {
    setEmail('admin@pecsummit.com');
    setPassword('PecSummit@2026');
  };

  return (
    <div className="min-h-screen bg-(--bg-void) text-(--text-primary) flex flex-col justify-center items-center px-4 py-10 relative">
      <div className="w-full max-w-sm space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[4px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-[4px] bg-(--bg-panel-alt) px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border border-(--border-subtle)">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ADMIN CONSOLE
          </div>
          <h1 className="text-xl font-bold tracking-tight text-(--text-primary) font-rajdhani">
            PEC E-SUMMIT 2026
          </h1>
          <p className="text-xs text-(--text-muted) font-medium">
            Administrative &amp; Operations Control Panel
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-[4px] border border-(--border-panel) bg-(--bg-panel) p-6 shadow-xl space-y-5">
          <form onSubmit={handleManualLogin} className="space-y-3.5">
            <div>
              <label className="text-xs text-(--text-muted) block mb-1.5 font-bold">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-(--text-muted)" />
                <input
                  type="email"
                  required
                  placeholder="admin@pecsummit.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-[4px] border border-(--border-panel) bg-(--bg-panel-alt) py-2.5 pl-9 pr-3 text-xs text-(--text-primary) placeholder-(--text-muted) focus:border-emerald-500 focus:outline-none transition-colors font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-(--text-muted) block mb-1.5 font-bold">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-(--text-muted)" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-[4px] border border-(--border-panel) bg-(--bg-panel-alt) py-2.5 pl-9 pr-3 text-xs text-(--text-primary) placeholder-(--text-muted) focus:border-emerald-500 focus:outline-none transition-colors font-medium"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-600 dark:text-rose-400 text-center bg-rose-500/10 p-2.5 rounded-[4px] border border-rose-500/20 font-medium">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[4px] bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 uppercase tracking-wider"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Admin</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Pre-seeded Single Super Admin Quick Fill */}
          <div className="pt-4 border-t border-(--border-subtle) space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-(--text-muted) uppercase tracking-wider text-[10px]">
                Default Seeded Account
              </span>
              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                PecSummit@2026
              </span>
            </div>

            <button
              type="button"
              onClick={fillDefaultCredentials}
              className="w-full rounded-[4px] border border-(--border-subtle) bg-(--bg-panel-alt) p-2.5 text-left hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-emerald-500/10 text-emerald-500">
                  <KeyRound className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-(--text-primary) group-hover:text-emerald-500">
                    Fill Admin Credentials
                  </div>
                  <div className="text-[10px] text-(--text-muted) font-mono">
                    admin@pecsummit.com
                  </div>
                </div>
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-[3px] border border-emerald-500/20">
                1-Click
              </span>
            </button>
          </div>
        </div>

        {/* Security watermark footer */}
        <div className="text-center text-[10px] text-(--text-muted) font-medium">
          PEC E-Summit 2026 &bull; Authorized Admin Access Only &bull; Sector 12, Chandigarh
        </div>
      </div>
    </div>
  );
}
