'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0B1410] text-[#E2E8F0] flex flex-col items-center justify-center p-6 text-center">
      <div className="space-y-3 max-w-md">
        <span className="font-mono text-xs text-mint font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-mint/10 border border-mint/20">
          404 — Page Not Found
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Lost in Cyberspace?
        </h1>
        <p className="text-xs text-neutral-400">
          The page or pass tier you are looking for does not exist or has moved.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-mint hover:bg-white text-void text-xs font-bold transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Return to E-Summit Home</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
