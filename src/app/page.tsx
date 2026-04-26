"use client"

import { useState } from "react"

import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
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

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex-1">
        <HeroSection />
        <EventsPreview />
      </div>
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        isLogin={isLogin}
        onToggleMode={() => setIsLogin((prev) => !prev)}
      />
      <Footer />
    </main>
  )
}