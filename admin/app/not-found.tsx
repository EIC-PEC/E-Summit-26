'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#090D11] text-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full rounded-none border border-white/10 bg-[#0E141B] p-8 shadow-2xl space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-none bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="text-4xl font-extrabold text-white">404</div>
        <h2 className="text-base font-bold text-white uppercase tracking-wider">
          PAGE NOT FOUND
        </h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          The requested page does not exist or has been relocated in the PEC E-Summit 2026 portal.
        </p>
        <Link
          href="/"
          className="inline-flex w-full items-center justify-center gap-2 rounded-none bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-all shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
