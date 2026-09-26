import type { Metadata } from 'next'
import ProfileClient from './ProfileClient'

export const metadata: Metadata = {
  title: 'My Profile & Passes — PEC E-Summit 2026',
  description: 'Manage your delegate passes, update your attendee profile, and view your tickets for PEC E-Summit 2026.',
}

export default function ProfilePage() {
  return <ProfileClient />
}
