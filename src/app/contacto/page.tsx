"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AuthModal } from "@/components/auth-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, MapPin, Send, Zap, Shield, BarChart3, Clock, Star, Quote } from "lucide-react"

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    details: ["info@time2go.com", "soporte@time2go.com"],
  },
  {
    icon: MapPin,
    title: "Oficina Principal",
    details: ["Carrera 27 Cl 15 N-s", "Bucaramanga"],
  },
]

const softwareFeatures = [
  {
    icon: Zap,
    title: "Rápido y Eficiente",
    description: "Procesamiento de peticiones en menos de un dia.",
  },
  {
    icon: Shield,
    title: "Seguro y Confiable",
    description: "Encriptación de datos de extremo a extremo y cumplimiento con estándares PCI-DSS.",
  },
  {
    icon: BarChart3,
    title: "Analíticas Avanzadas",
    description: "Dashboard completo con métricas de ventas, asistencia y comportamiento de usuarios.",
  },
  {
    icon: Clock,
    title: "Soporte 24/7",
    description: "Equipo dedicado disponible para resolver cualquier incidencia en minutos.",
  },
]

const testimonials = [
  {
    name: "María González",
    role: "Organizadora de Eventos",
    comment: "Time2Go transformó la manera en que gestionamos nuestros eventos. La plataforma es intuitiva y el soporte es excepcional.",
    rating: 5,
  },
  {
    name: "Carlos Ramírez",
    role: "Director de Festival",
    comment: "Desde que usamos Time2Go, nuestras ventas aumentaron un 40%. La mejor inversión que hemos hecho.",
    rating: 5,
  },
  {
    name: "Ana Martínez",
    role: "Productora Musical",
    comment: "La facilidad de uso y las herramientas de análisis nos ayudan a tomar mejores decisiones para cada evento.",
    rating: 5,
  },
]

const faqs = [
  {
    question: "¿Cómo puedo crear un evento en Time2Go?",
    answer: "Regístrate como organizador y sigue nuestro proceso guiado de creación de eventos en minutos.",
  },
  {
    question: "¿como me registro como organizador?",
    answer: "crea una cuenta y sigue los pasos para tu validación como organizador, nosotro nos encargamos del resto.",
  },
]

export default function ContactoPage() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const openAuthModal = (loginMode = true) => {
    setIsLogin(loginMode)
    setAuthModalOpen(true)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <Header onAuthClick={openAuthModal} />

      {/* Formulario de Contacto e Info */}
      <section className="pt-28 lg:pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Formulario */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/50 rounded-sm">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                  <Send className="w-6 h-6 mr-2 text-purple-600" />
                  Contáctanos
                </h2>
                <p className="text-gray-600 mb-6">Completa el formulario y te responderemos pronto</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre *</Label>
                      <Input
                        id="name"
                        placeholder="Tu nombre"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                        className="rounded-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                        className="rounded-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Asunto *</Label>
                    <Input
                      id="subject"
                      placeholder="¿En qué podemos ayudarte?"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      required
                      className="rounded-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje *</Label>
                    <Textarea
                      id="message"
                      placeholder="Describe tu consulta..."
                      rows={4}
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      required
                      className="rounded-sm"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-sm cursor-pointer"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Enviar mensaje
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Info de Contacto y FAQs */}
            <div className="space-y-6">
              {/* Info de contacto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="bg-white/80 backdrop-blur-sm border-white/50 rounded-sm">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-sm flex items-center justify-center flex-shrink-0">
                          <info.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 mb-1">{info.title}</h3>
                          {info.details.map((detail, idx) => (
                            <p key={idx} className="text-gray-600 text-sm">{detail}</p>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Mapa de ubicación */}
              <Card className="bg-white/80 backdrop-blur-sm border-white/50 rounded-sm overflow-hidden">
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
              <Card className="bg-white/80 backdrop-blur-sm border-white/50 rounded-sm">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Preguntas Frecuentes</h3>
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <div key={index}>
                        <h4 className="font-medium text-gray-900 mb-1">{faq.question}</h4>
                        <p className="text-gray-600 text-sm">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Características del Software */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-8">
            ¿Por qué elegir Time2Go?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {softwareFeatures.map((feature, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border-white/50 rounded-sm">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-sm flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-8">
            Lo que dicen nuestros clientes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border-white/50 rounded-sm">
                <CardContent className="p-6">
                  <Quote className="w-8 h-8 text-purple-400 mb-4" />
                  <p className="text-gray-600 mb-4 italic">"{testimonial.comment}"</p>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Logo y Visión */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-white/80 backdrop-blur-sm border-white/50 rounded-sm">
            <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center mb-6">
                <img src="/images/logo_color.png" 
                    className="mx-auto mb-3 max-w-[250px] max-h-[250px] object-contain" />
              </div>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
                Nuestra visión es revolucionar la industria de eventos, conectando a organizadores y asistentes 
                a través de tecnología innovadora que simplifica cada paso del proceso.
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  +10,000 eventos   
                </span>
                <span>|</span>
                <span>+500,000 usuarios</span>
                <span>|</span>
                <span>+50 ciudades</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

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
