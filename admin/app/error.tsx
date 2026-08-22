'use client';

import React, { useEffect } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin Dashboard Error:', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full rounded-none border border-rose-500/30 bg-[#0E141B] p-8 shadow-2xl space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-none bg-rose-500/20 text-rose-400">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-white">
          SOMETHING WENT WRONG
        </h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          {error.message || 'An unexpected error occurred while loading this section.'}
        </p>
        <button
          onClick={() => reset()}
          className="w-full rounded-none bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
}
