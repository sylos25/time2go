"use client"

import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { EventsPreview } from "@/components/events-preview"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-tl from-green-50 via-lime-50 to-green-50">
      <Header />
      <HeroSection />
      <EventsPreview />
      <Footer />
    </main>
  )
}