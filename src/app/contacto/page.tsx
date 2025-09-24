"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AuthModal } from "@/components/auth-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Phone, MapPin, Clock, Send, Users, Building } from "lucide-react"

interface ContactInfo {
  icon: React.ElementType
  title: string
  details: string[]
  color: string
}

const contactInfo: ContactInfo[] = [
  {
    icon: Mail,
    title: "Email",
    details: ["info@time2go.com", "soporte@time2go.com"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Phone,
    title: "Teléfono",
    details: ["+52 55 1234 5678", "+52 55 8765 4321"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: MapPin,
    title: "Oficina Principal",
    details: ["Av. Reforma 123, Col. Centro", "Bucaramanga, 06000"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Clock,
    title: "Horarios",
    details: ["Lun - Vie: 9:00 AM - 6:00 PM", "Sáb: 10:00 AM - 2:00 PM"],
    color: "from-blue-500 to-cyan-500",
  },
]

const departments = [
  { value: "general", label: "Consulta General" },
  { value: "soporte", label: "Soporte Técnico" },
  { value: "eventos", label: "Organización de Eventos" },
  { value: "ventas", label: "Ventas y Partnerships" },
  { value: "prensa", label: "Prensa y Medios" },
]

const faqs = [
  {
    question: "¿Cómo puedo crear un evento en Time2Go?",
    answer:
      "Puedes crear un evento registrándote como organizador y siguiendo nuestro proceso guiado de creación de eventos.",
  },
  {
    question: "¿Qué comisión cobra Time2Go?",
    answer: "Cobramos una comisión del 5% por ticket vendido, más las tarifas de procesamiento de pago.",
  },
  {
    question: "¿Puedo cancelar mi ticket?",
    answer:
      "Las políticas de cancelación dependen del organizador del evento. Revisa los términos específicos de cada evento.",
  },
  {
    question: "¿Ofrecen soporte 24/7?",
    answer:
      "Nuestro soporte está disponible de lunes a viernes de 9 AM a 6 PM. Para emergencias, contáctanos por email.",
  },
]

export default function ContactoPage() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
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
    // Handle form submission
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header onAuthClick={openAuthModal} />

      {/* Hero Section */}
      <section className="pt-16 lg:pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4">
              Ponte en
              <span className="block bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                Contacto
              </span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              ¿Tienes preguntas, sugerencias o necesitas ayuda? Nuestro equipo está listo para asistirte
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {contactInfo.map((info, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-white/50"
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${info.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <info.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{info.title}</h3>
                  <div className="space-y-1">
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-gray-600 text-sm">
                        {detail}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form and Map */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/50">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                  <Send className="w-6 h-6 mr-2 text-blue-600" />
                  Envíanos un mensaje
                </CardTitle>
                <p className="text-gray-600">Completa el formulario y te responderemos lo antes posible</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo *</Label>
                      <Input
                        id="name"
                        placeholder="Tu nombre"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
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
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        placeholder="+52 55 1234 5678"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 ">
                      <Label htmlFor="department">Departamento *</Label>
                      <Select
                        value={formData.department}
                        onValueChange={(value) => handleInputChange("department", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un departamento" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.value} value={dept.value}>
                              {dept.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje *</Label>
                    <Textarea
                      id="message"
                      placeholder="Describe tu consulta o mensaje..."
                      rows={5}
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-700 hover:to-cyan-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Enviar mensaje
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Map and Additional Info */}
            <div className="space-y-6">
              {/* Quick Contact Options */}
              <Card className=" w-fit bg-white/100 backdrop-blur-sm border-white/50">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Otras formas de contacto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-green-50 transition-colors cursor-pointer">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Centro de ayuda</p>
                      <p className="text-sm text-gray-600">Guías y tutoriales</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Para empresas</p>
                      <p className="text-sm text-gray-600">Soluciones corporativas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Preguntas Frecuentes</h2>
            <p className="text-lg text-gray-600">Encuentra respuestas rápidas a las consultas más comunes</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border-white/50">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
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
