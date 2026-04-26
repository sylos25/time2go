"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AuthModal } from "@/components/auth-modal"
import { BrandVisionCard } from "@/components/contact/brand-vision-card"
import { ContactFaqsCard } from "@/components/contact/contact-faqs-card"
import { ContactFormCard } from "@/components/contact/contact-form-card"
import { ContactInfoGrid } from "@/components/contact/contact-info-grid"
import { SoftwareFeaturesSection } from "@/components/contact/software-features-section"
import { Card, CardContent } from "@/components/ui/card"
import { useContactForm } from "@/hooks/use-contact-form"
import { contactInfo, faqs, softwareFeatures } from "@/lib/contact-content"

export default function ContactoPage() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const { formData, sending, submitFeedback, handleInputChange, handleSubmit } = useContactForm()

  const openAuthModal = (loginMode = true) => {
    setIsLogin(loginMode)
    setAuthModalOpen(true)
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Formulario de Contacto e Info */}
      <section className="pt-28 lg:pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Formulario */}
            <ContactFormCard
              formData={formData}
              sending={sending}
              submitFeedback={submitFeedback}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
            />

            {/* Info de Contacto y FAQs */}
            <div className="space-y-6">
              {/* Info de contacto */}
              <ContactInfoGrid items={contactInfo} />

              {/* Mapa de ubicación */}
              <Card className="bg-card/90 backdrop-blur-sm border-border rounded-sm overflow-hidden">
                <CardContent className="p-0">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d588.4989388901223!2d-73.11983611242613!3d7.1337252775636975!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e68156f047412a7%3A0xf61352554c2947e2!2sSENA%20Regional%20Oriente%2C%20Bucaramanga%2C%20Santander!5e0!3m2!1ses-419!2sco!4v1768838168494!5m2!1ses-419!2sco"
                    width="100%"
                    height="200"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Ubicación de Time2Go - SENA Regional Oriente"
                    className="w-full"
                  />
                </CardContent>
              </Card>

              {/* FAQs */}
              <ContactFaqsCard items={faqs} />
            </div>
          </div>
        </div>
      </section>

      {/* Características del Software */}
      <SoftwareFeaturesSection items={softwareFeatures} />

      {/* Logo y Visión */}
      <BrandVisionCard />

      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        isLogin={isLogin}
        onToggleMode={() => setIsLogin(!isLogin)}
      />
    </main>
  )
}
