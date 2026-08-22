'use client'

import { useEffect } from 'react'

export default function ServiceWorkerCleanup() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Unregister all old service workers
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister().catch(() => {})
          }
        }).catch(() => {})
      }

      // 2. Flush any bloated image caches that exceeded storage quotas
      if ('caches' in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            if (key.includes('workbox') || key.includes('precache') || key.includes('next-pwa') || key.includes('images')) {
              caches.delete(key).catch(() => {})
            }
          }
        }).catch(() => {})
      }
    }
  }, [])

  return null
}
