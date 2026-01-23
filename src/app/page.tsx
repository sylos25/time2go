"use client"

import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { EventsPreview } from "@/components/events-preview"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      <HeroSection />
      <EventsPreview />
      <Footer />
    </main>
  )
}