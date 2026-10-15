import type { Metadata } from 'next'
import ProfileClient from './ProfileClient'

export const metadata: Metadata = {
  title: 'My Profile — PEC E-Summit 2026',
  description: 'Manage your registered events, startup pass requests, and attendee profile for PEC E-Summit 2026.',
}

export default function ProfilePage() {
  return <ProfileClient />
}
