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
        isSupported()
          .then((supported) => {
            if (supported && app) {
              try {
                analytics = getAnalytics(app)
              } catch (e) {
                console.warn('Firebase Analytics not supported in this storage context:', e)
              }
            }
          })
          .catch((err) => {
            console.warn('Firebase Analytics isSupported check bypassed:', err)
          })
      }
    }
  } catch (error) {
    console.warn('Firebase initialization error:', error)
  }
}

export { app, auth, analytics, googleProvider }
