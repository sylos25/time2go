"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { EventsPreview } from "@/components/events-preview"
import { TestimonialsSection } from "@/components/testimonials-section"
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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-violet-100">
      <Header onAuthClick={openAuthModal} />
      <EventsPreview />
      <TestimonialsSection />
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
