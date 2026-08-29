// lib/firebase.ts — Firebase exclusively for Authentication & Analytics
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth'
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Check if valid Firebase configuration is present
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== 'your_firebase_api_key' &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== 'your_project_id'
)

let app: FirebaseApp | null = null
let auth: Auth | null = null
let analytics: Analytics | null = null
let googleProvider: GoogleAuthProvider | null = null

if (typeof window !== 'undefined' || isFirebaseConfigured) {
  try {
    if (isFirebaseConfigured) {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
      auth = getAuth(app)
      googleProvider = new GoogleAuthProvider()
      googleProvider.setCustomParameters({ prompt: 'select_account' })

      if (typeof window !== 'undefined') {
        let initialized = false
        const events = ['scroll', 'pointerdown', 'touchstart', 'keydown']

        const cleanupListeners = () => {
          events.forEach((evt) => window.removeEventListener(evt, initAnalytics))
        }

        const initAnalytics = () => {
          if (initialized) return
          initialized = true
          cleanupListeners()

          isSupported()
            .then((supported: boolean) => {
              if (supported && app) {
                try {
                  analytics = getAnalytics(app)
                } catch (e: unknown) {
                  console.warn('Firebase Analytics context bypassed:', e)
                }
              }
            })
            .catch(() => {})
        }

        events.forEach((evt) => {
          window.addEventListener(evt, initAnalytics, { once: true, passive: true })
        })

        // 6s fallback for idle sessions
        setTimeout(initAnalytics, 6000)
      }
    }
  } catch (error) {
    console.warn('Firebase initialization error:', error)
  }
}

export { app, auth, analytics, googleProvider }
