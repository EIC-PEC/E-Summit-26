'use client'

import { useEffect } from 'react'
import { RotateCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-[#0B1410] text-[#E2E8F0] flex flex-col items-center justify-center p-6 text-center">
      <div className="space-y-3 max-w-md">
        <span className="font-mono text-xs text-rose-400 font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/20">
          Something went wrong
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Application Error
        </h1>
        <p className="text-xs text-neutral-400">
          An unexpected error occurred while rendering this view.
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-mint hover:bg-white text-void text-xs font-bold transition-colors"
          >
            <RotateCw size={13} />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
