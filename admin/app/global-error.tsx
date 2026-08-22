'use client';

import React from 'react';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#090D11] text-[#F8FAFC] flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md w-full rounded-none border border-rose-500/30 bg-[#0E141B] p-8 text-center shadow-2xl space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-none bg-rose-500/20 text-rose-400 text-2xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            APPLICATION ERROR
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            An unhandled runtime error occurred in the admin portal environment.
          </p>
          <button
            onClick={() => reset()}
            className="w-full rounded-none bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-all shadow-sm"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
