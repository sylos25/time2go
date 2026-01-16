"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { EventsPreview } from "@/components/events-preview"
import { Footer } from "@/components/footer"
import { AuthModal } from "@/components/auth-modal"

export default function HomePage() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [isLogin, setIsLogin] = useState(true)

  const openAuthModal = (loginMode = true) => {
    setIsLogin(loginMode)
    setAuthModalOpen(true)
  }

  const closeAuthModal = () => {
    setAuthModalOpen(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header onAuthClick={openAuthModal} />
      <HeroSection />
      <EventsPreview />
      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={closeAuthModal}
        isLogin={isLogin}
        onToggleMode={() => setIsLogin((prev) => !prev)}
      />
    </main>
  )
}