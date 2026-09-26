import React from 'react'
import FAQ from '@/components/FAQ'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function FAQPage() {
  return (
    <main className="bg-section-1 min-h-screen overflow-x-clip pb-12">
      <Nav />
      <FAQ />
      <Footer hideCTA />
    </main>
  )
}
