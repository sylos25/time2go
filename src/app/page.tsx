"use client"

import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { EventsPreview } from "@/components/events-preview"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex-1">
        <HeroSection />
        <EventsPreview />
      </div>
      <Footer />
    </main>
  )
}