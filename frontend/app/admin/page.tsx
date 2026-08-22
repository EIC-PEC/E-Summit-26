import AdminClient from './AdminClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin CMS & Operations Portal — PEC E-Summit 2026',
  description: 'Manage summit events, delegate registrations, live announcements, and QR check-in operations.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminPage() {
  return <AdminClient />
}
