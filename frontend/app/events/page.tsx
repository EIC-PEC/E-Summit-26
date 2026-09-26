import React from 'react'
import EventPortfolioShowcase from '@/components/EventPortfolio'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function EventsPage() {
  return (
    <main className="bg-section-2 min-h-screen overflow-x-clip pb-12">
      <Nav />
      <EventPortfolioShowcase />
      <Footer />
    </main>
  )
}
