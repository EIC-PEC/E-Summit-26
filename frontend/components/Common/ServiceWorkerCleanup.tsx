'use client'

import { useEffect } from 'react'

const SEQUENCE_CACHE = 'hero-sequence-v1'
const LEGACY_CACHE_PATTERNS = ['workbox', 'precache', 'next-pwa', 'images', 'next-image']

export default function ServiceWorkerCleanup() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('caches' in window)) return

    // Unregister stale service workers from previous PWA attempts
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.unregister().catch(() => {})
        }
      }).catch(() => {})
    }

    // Flush legacy Workbox / next-pwa caches, but leave our sequence cache intact
    caches.keys().then((keys) => {
      for (const key of keys) {
        const isLegacy = LEGACY_CACHE_PATTERNS.some((p) => key.includes(p))
        if (isLegacy && key !== SEQUENCE_CACHE) {
          caches.delete(key).catch(() => {})
        }
      }
    }).catch(() => {})

    // Prime the hero-sequence-v1 cache with the manifest and first sprite sheet
    // so the second page visit loads them instantly from disk
    const prime = async () => {
      try {
        const cache = await caches.open(SEQUENCE_CACHE)
        const alreadyCached = await cache.match('/sequence/manifest.json')
        if (alreadyCached) return // already primed on a previous visit

        // Sequentially prime the critical assets
        await cache.add('/sequence/manifest.json')
        await cache.add('/sequence/vdo1-sheets/sheet_00.webp')
        await cache.add('/sequence/vdo1-sheets/sheet_01.webp')

        // Defer the remaining 4 sheets and all lowres frames to idle time
        const remaining = [
          ...Array.from({ length: 4 }, (_, i) =>
            `/sequence/vdo1-sheets/sheet_${String(i + 2).padStart(2, '0')}.webp`
          ),
        ]

        const idlePrime = async () => {
          for (const url of remaining) {
            try { await cache.add(url) } catch {}
          }
        }

        if ('requestIdleCallback' in window) {
          requestIdleCallback(idlePrime, { timeout: 5000 })
        } else {
          setTimeout(idlePrime, 2000)
        }
      } catch {}
    }

    // Wait for the page to be interactive before priming to not compete with initial load
    if (document.readyState === 'complete') {
      prime()
    } else {
      window.addEventListener('load', prime, { once: true })
    }
  }, [])

  return null
}
