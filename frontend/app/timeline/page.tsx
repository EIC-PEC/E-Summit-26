import React from 'react'
import Timeline from '@/components/Timeline'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function TimelinePage() {
  return (
    <main className="bg-[#07130F] min-h-screen overflow-x-clip pb-12">
      <Nav />
      <Timeline />
      <Footer hideCTA />
    </main>
  )
}
