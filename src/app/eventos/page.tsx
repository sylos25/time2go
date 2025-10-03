"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AuthModal } from "@/components/auth-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar, MapPin, Users, Search, Filter, Heart, Share2, Star, X, Clock, Info, Plus } from "lucide-react"

interface Event {
  id: number
  title: string
  description: string
  fullDescription: string
  date: string
  time: string
  location: string
  price: number
  category: string
  image: string
  additionalImages: string[]
  attendees: number
  rating: number
  featured: boolean
  duration: string
  organizer: string
  highlights: string[]
}

const initialEvents: Event[] = [
  {
    id: 1,
    title: "Festival de la carranga",
    description: "Música folclórica y tradiciones colombianas",
    fullDescription:
      "Celebración de la música carranguera colombiana con los mejores exponentes del género. Un evento que reúne tradición, alegría campesina y el inconfundible sonido de la guitarra, el tiple y las coplas picarescas del altiplano cundiboyacense.",
    date: "2025-10-15",
    time: "20:00",
    location: "Teatro Santander, Bucaramanga",
    price: 7200,
    category: "Música",
    image: "/images/carranga1.jpg?height=300&width=400",
    additionalImages: [
      "/images/carranga2.jpg?height=400&width=600",
      "/images/carranga3.jpg?height=400&width=600",
      "/images/carranga4.jpg?height=400&width=600",
    ],
    attendees: 2000,
    rating: 4.9,
    featured: true,
    duration: "4 horas",
    organizer: "Fundación Cultural Santander",
    highlights: ["Artistas nacionales", "Musica tradicional", "Bebidas Tradicionales", "Ambiente familiar"],
  },
  {
    id: 2,
    title: "Exposición cultural ",
    description: "Obras de artistas emergentes y establecidos",
    fullDescription:
      "Descubre las últimas tendencias del arte contemporáneo en esta exposición que presenta obras de más de 50 artistas nacionales e internacionales. La muestra incluye pinturas, esculturas, instalaciones digitales y arte interactivo. Una oportunidad única para conectar con el arte actual y conocer a los artistas en persona durante las charlas programadas.",
    date: "2026-01-12",
    time: "10:00",
    location: "Museo Nacional de Arte, Piedecuesta",
    price: 5000,
    category: "Arte",
    image: "/images/img10.jpg?height=300&width=400",
    additionalImages: [
      "/images/art-gallery.jpg?height=400&width=600",
      "/images/art-sculptures.jpg?height=400&width=600",
      "/images/art-interactive.jpg?height=400&width=600",
    ],
    attendees: 800,
    rating: 4.6,
    featured: false,
    duration: "Todo el día",
    organizer: "Museo Nacional de Arte",
    highlights: ["50+ artistas", "Arte interactivo", "Charlas con artistas", "Instalaciones digitales"],
  },
  {
    id: 3,
    title: "Festival Gastronómico",
    description: "Sabores del mundo en un solo lugar",
    fullDescription:
      "Un viaje culinario extraordinario que te llevará por los sabores más exquisitos del mundo. Más de 30 chefs reconocidos presentarán sus especialidades en vivo. Incluye degustaciones, talleres de cocina, maridajes con vinos y cervezas artesanales. Perfecto para foodies y amantes de la gastronomía internacional.",
    date: "2025-09-25",
    time: "12:00",
    location: "Plaza Central, Bucaramanga",
    price: 2500,
    category: "Gastronomía",
    image: "/images/img8.jpg?height=300&width=400",
    additionalImages: [
      "/images/food-festival.jpg?height=400&width=600",
      "/images/chef-cooking.jpg?height=400&width=600",
      "/images/food-tasting.jpg?height=400&width=600",
    ],
    attendees: 2000,
    rating: 4.9,
    featured: true,
    duration: "8 horas",
    organizer: "Asociación Gastronómica Regional",
    highlights: ["30+ chefs reconocidos", "Talleres de cocina", "Maridajes premium", "Cocina en vivo"],
  },
  {
    id: 4,
    title: "Concierto de Rock Nacional",
    description: "Las mejores bandas de rock del país",
    fullDescription:
      "La noche más rockera del año llega con las bandas más importantes del rock nacional. Un lineup espectacular que incluye tanto leyendas como nuevos talentos del rock colombiano. Escenario principal con sistema de sonido de última generación, efectos visuales impresionantes y una experiencia que hará vibrar a todos los asistentes.",
    date: "2024-05-01",
    time: "21:00",
    location: "CenFer, Bucaramanga",
    price: 60000,
    category: "Música",
    image: "/images/rock-concert.jpg?height=300&width=400",
    additionalImages: [
      "/images/rock-stage.jpg?height=400&width=600",
      "/images/rock-crowd.jpg?height=400&width=600",
      "/images/rock-lights.jpg?height=400&width=600",
    ],
    attendees: 5000,
    rating: 4.7,
    featured: false,
    duration: "6 horas",
    organizer: "Rock Nacional Productions",
    highlights: ["Bandas legendarias", "Sonido profesional", "Efectos visuales", "Nuevos talentos"],
  },
  {
    id: 5,
    title: "Teatro politico: La Madriguera",
    description: "Tragedia política con humor negro y sátira corrosiva.",
    fullDescription:
      "Una comedia trágica con humor negro y corrosivo que muestra el ocaso del dictador Eutimio Matamoros, asediado por las fuerzas revolucionarias. En tiempos de dictadura, el presidente y su secretario privado se refugian en el palacio presidencial mientras una multitud enardecida los acecha",
    date: "2025-08-20",
    time: "20:00",
    location: "Teatro Colón, Bucaramanga",
    price: 8000,
    category: "Teatro",
    image: "/images/experimental-theater.jpg?height=300&width=400",
    additionalImages: [
      "/images/hamlet-stage.jpg?height=400&width=600",
      "/images/teatroa.jpg?height=400&width=600",
      "/images/shakespeare-costume.jpg?height=400&width=600",
    ],
    attendees: 500,
    rating: 4.5,
    featured: false,
    duration: "3 horas",
    organizer: "Compañía Nacional de Teatro",
    highlights: ["Elenco internacional", "Vestuario de época", "Escenografía única", "Obra clásica"],
  },
  {
    id: 6,
    title: "Feria de Tecnología",
    description: "Las últimas innovaciones tecnológicas",
    fullDescription:
      "Descubre el futuro de la tecnología en esta feria que reúne a las empresas más innovadoras del sector. Exhibiciones de inteligencia artificial, realidad virtual, robótica y startups emergentes. Incluye conferencias magistrales, demostraciones en vivo y oportunidades de networking con líderes de la industria tech.",
    date: "2025-11-10",
    time: "09:00",
    location: "NeoMundo, Bucaramanga",
    price: 3000,
    category: "Tecnología",
    image: "/images/tecnologia.jpg?height=300&width=400",
    additionalImages: [
      "/images/tech-expo.jpg?height=400&width=600",
      "/images/vr-demo.jpg?height=400&width=600",
      "/images/ai-robots.jpg?height=400&width=600",
    ],
    attendees: 1500,
    rating: 4.4,
    featured: true,
    duration: "10 horas",
    organizer: "TechColombia",
    highlights: ["IA y Robótica", "Realidad virtual", "Startups innovadoras", "Networking tech"],
  },
]

export default function EventosPage() {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [showAddEventForm, setShowAddEventForm] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [expandedEventId, setExpandedEventId] = useState<number | null>(null)

  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: "",
    description: "",
    fullDescription: "",
    date: "",
    time: "",
    location: "",
    price: 0,
    category: "Música",
    image: "",
    additionalImages: ["", "", ""],
    attendees: 0,
    rating: 5.0,
    featured: false,
    duration: "",
    organizer: "",
    highlights: ["", "", "", ""],
  })

  const openAuthModal = (loginMode = true) => {
    setIsLogin(loginMode)
    setAuthModalOpen(true)
  }

  const handleEventExpand = (eventId: number) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId)
  }

  const handleAddEvent = () => {
    const eventToAdd: Event = {
      id: events.length + 1,
      title: newEvent.title || "",
      description: newEvent.description || "",
      fullDescription: newEvent.fullDescription || "",
      date: newEvent.date || "",
      time: newEvent.time || "",
      location: newEvent.location || "",
      price: newEvent.price || 0,
      category: newEvent.category || "Música",
      image: newEvent.image || "/placeholder.svg?height=300&width=400",
      additionalImages: newEvent.additionalImages || ["", "", ""],
      attendees: newEvent.attendees || 0,
      rating: newEvent.rating || 5.0,
      featured: newEvent.featured || false,
      duration: newEvent.duration || "",
      organizer: newEvent.organizer || "",
      highlights: (newEvent.highlights || []).filter((h) => h.trim() !== ""),
    }

    setEvents([...events, eventToAdd])
    setShowAddEventForm(false)

    // Reset form
    setNewEvent({
      title: "",
      description: "",
      fullDescription: "",
      date: "",
      time: "",
      location: "",
      price: 0,
      category: "Música",
      image: "",
      additionalImages: ["", "", ""],
      attendees: 0,
      rating: 5.0,
      featured: false,
      duration: "",
      organizer: "",
      highlights: ["", "", "", ""],
    })
  }

  const updateHighlight = (index: number, value: string) => {
    const updatedHighlights = [...(newEvent.highlights || [])]
    updatedHighlights[index] = value
    setNewEvent({ ...newEvent, highlights: updatedHighlights })
  }

  const updateAdditionalImage = (index: number, value: string) => {
    const updatedImages = [...(newEvent.additionalImages || [])]
    updatedImages[index] = value
    setNewEvent({ ...newEvent, additionalImages: updatedImages })
  }

  const categories = ["all", "Música", "Arte", "Teatro", "Gastronomía", "Tecnología"]

  const filteredEvents = events
    .filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || event.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price":
          return a.price - b.price
        case "rating":
          return b.rating - a.rating
        case "attendees":
          return b.attendees - a.attendees
        default:
          return new Date(a.date).getTime() - new Date(b.date).getTime()
      }
    })

  const topRatedEvents = events.sort((a, b) => b.rating - a.rating).slice(0, 3)

  const expandedEvent = expandedEventId ? events.find((e) => e.id === expandedEventId) : null

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header onAuthClick={openAuthModal} />

      {/* Hero Section */}
      <section className="pt-16 lg:pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Descubre los Mejores
              <span className="block bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                Eventos
              </span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Encuentra experiencias únicas, conecta con tu pasión y reserva tu lugar en los eventos más emocionantes
            </p>
          </div>

          {/* Enhanced Search and Filters */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/60 mb-12 relative">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
                <Input
                  placeholder="¿Qué evento buscas hoy?"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className="pl-12 h-14 text-lg rounded-2xl border-2 border-gray-200 focus:border-blue-500 transition-all duration-300"
                />

                {isSearchFocused && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-[60] overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Eventos mejor valorados</h3>
                      <div className="space-y-3">
                        {topRatedEvents.map((event) => (
                          <div
                            key={event.id}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <img
                              src={event.image || "/placeholder.svg"}
                              alt={event.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">{event.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs font-medium text-gray-600">{event.rating}</span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {event.category}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-sm font-bold text-blue-600">${event.price}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-64 h-14 rounded-2xl border-2 border-gray-200">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "Todas las categorías" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-56 h-14 rounded-2xl border-2 border-gray-200">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Fecha</SelectItem>
                  <SelectItem value="price">Precio</SelectItem>
                  <SelectItem value="rating">Valoración</SelectItem>
                  <SelectItem value="attendees">Popularidad</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {showAddEventForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Crear Nuevo Evento</h2>
                <Button
                  onClick={() => setShowAddEventForm(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full h-10 w-10 p-0"
                  variant="ghost"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título del Evento *</Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="Ej: Festival de Música"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría *</Label>
                    <Select
                      value={newEvent.category}
                      onValueChange={(value) => setNewEvent({ ...newEvent, category: value })}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories
                          .filter((c) => c !== "all")
                          .map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción Corta *</Label>
                  <Input
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Breve descripción del evento"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullDescription">Descripción Completa *</Label>
                  <Textarea
                    id="fullDescription"
                    value={newEvent.fullDescription}
                    onChange={(e) => setNewEvent({ ...newEvent, fullDescription: e.target.value })}
                    placeholder="Descripción detallada del evento"
                    className="rounded-xl min-h-[100px]"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Hora *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duración *</Label>
                    <Input
                      id="duration"
                      value={newEvent.duration}
                      onChange={(e) => setNewEvent({ ...newEvent, duration: e.target.value })}
                      placeholder="Ej: 3 horas"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="location">Ubicación *</Label>
                    <Input
                      id="location"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      placeholder="Ej: Teatro Principal, Bucaramanga"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organizer">Organizador *</Label>
                    <Input
                      id="organizer"
                      value={newEvent.organizer}
                      onChange={(e) => setNewEvent({ ...newEvent, organizer: e.target.value })}
                      placeholder="Nombre del organizador"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio (COP) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newEvent.price}
                      onChange={(e) => setNewEvent({ ...newEvent, price: Number(e.target.value) })}
                      placeholder="0"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="attendees">Asistentes Esperados</Label>
                    <Input
                      id="attendees"
                      type="number"
                      value={newEvent.attendees}
                      onChange={(e) => setNewEvent({ ...newEvent, attendees: Number(e.target.value) })}
                      placeholder="0"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rating">Valoración (1-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={newEvent.rating}
                      onChange={(e) => setNewEvent({ ...newEvent, rating: Number(e.target.value) })}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">URL de Imagen Principal *</Label>
                  <Input
                    id="image"
                    value={newEvent.image}
                    onChange={(e) => setNewEvent({ ...newEvent, image: e.target.value })}
                    placeholder="/images/evento.jpg o URL completa"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>URLs de Imágenes Adicionales (3)</Label>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[0, 1, 2].map((index) => (
                      <Input
                        key={index}
                        value={newEvent.additionalImages?.[index] || ""}
                        onChange={(e) => updateAdditionalImage(index, e.target.value)}
                        placeholder={`Imagen ${index + 1}`}
                        className="rounded-xl"
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Destacados del Evento (4)</Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[0, 1, 2, 3].map((index) => (
                      <Input
                        key={index}
                        value={newEvent.highlights?.[index] || ""}
                        onChange={(e) => updateHighlight(index, e.target.value)}
                        placeholder={`Destacado ${index + 1}`}
                        className="rounded-xl"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={newEvent.featured}
                    onChange={(e) => setNewEvent({ ...newEvent, featured: e.target.checked })}
                    className="h-5 w-5 rounded"
                  />
                  <Label htmlFor="featured" className="cursor-pointer">
                    Marcar como evento destacado
                  </Label>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button
                    onClick={handleAddEvent}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-700 hover:to-cyan-700 rounded-xl py-6 text-lg font-semibold"
                  >
                    Crear Evento
                  </Button>
                  <Button
                    onClick={() => setShowAddEventForm(false)}
                    variant="outline"
                    className="flex-1 rounded-xl py-6 text-lg"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {expandedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <Button
                onClick={() => setExpandedEventId(null)}
                className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-900 rounded-full h-10 w-10 p-0"
                variant="ghost"
              >
                <X className="h-5 w-5" />
              </Button>

              <div className="grid lg:grid-cols-2 gap-8 p-8">
                {/* Left Column - Images */}
                <div className="space-y-4">
                  <img
                    src={expandedEvent.image || "/placeholder.svg"}
                    alt={expandedEvent.title}
                    className="w-full h-80 object-cover rounded-2xl"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    {expandedEvent.additionalImages.map((img, index) => (
                      <img
                        key={index}
                        src={img || "/placeholder.svg"}
                        alt={`${expandedEvent.title} ${index + 1}`}
                        className="w-full h-24 object-cover rounded-xl"
                      />
                    ))}
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline" className="rounded-full text-sm px-3 py-1">
                        {expandedEvent.category}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">{expandedEvent.title}</h1>
                      <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-xl">
                        <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                        <span className="text-xl font-bold text-gray-900">{expandedEvent.rating}</span>
                        <span className="text-sm text-gray-600">/ 5.0</span>
                      </div>
                    </div>
                    <p className="text-lg text-gray-600 leading-relaxed">{expandedEvent.fullDescription}</p>
                  </div>

                  {/* Event Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-semibold text-gray-900">{expandedEvent.date}</div>
                        <div className="text-sm text-gray-600">{expandedEvent.time}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-semibold text-gray-900">Duración</div>
                        <div className="text-sm text-gray-600">{expandedEvent.duration}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-semibold text-gray-900">Ubicación</div>
                        <div className="text-sm text-gray-600">{expandedEvent.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <Users className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-semibold text-gray-900">Asistentes</div>
                        <div className="text-sm text-gray-600">{expandedEvent.attendees.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Lo que incluye</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {expandedEvent.highlights.map((highlight, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          <span className="text-gray-700">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Organizer */}
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Info className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-semibold text-gray-900">Organizado por</div>
                        <div className="text-blue-600">{expandedEvent.organizer}</div>
                      </div>
                    </div>
                  </div>

                  {/* Price and Actions */}
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-blue-600">${expandedEvent.price}</span>
                        <span className="text-gray-600">por persona</span>
                      </div>
                      <div className="flex gap-3">
                        <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-700 hover:to-cyan-700 rounded-xl px-15 py-8 text-lg font-semibold text-white">
                          compra tu entrada
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Events */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Eventos Disponibles ({filteredEvents.length})
            </h2>
            <Button variant="outline" className="bg-white/90 backdrop-blur-sm rounded-xl border-2 hover:bg-white">
              <Filter className="h-4 w-4 mr-2" />
              Más filtros
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <Card
                key={event.id}
                className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/90 backdrop-blur-sm border-white/60 rounded-2xl overflow-hidden"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-9 w-9 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-9 w-9 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="rounded-full">
                      {event.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{event.rating}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-3" />
                      {event.date} • {event.time}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-3" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-3" />
                      {event.attendees.toLocaleString()} asistentes
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-blue-600">${event.price}</div>
                    <Button
                      onClick={() => handleEventExpand(event.id)}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-700 hover:to-cyan-700 rounded-xl px-6"
                    >
                      Detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No se encontraron eventos</h3>
              <p className="text-lg text-gray-600">Intenta con otros términos de búsqueda o filtros</p>
            </div>
          )}
        </div>
      </section>

      <button
        onClick={() => setShowAddEventForm(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full h-16 w-16 flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 z-40"
        aria-label="Agregar nuevo evento"
      >
        <Plus className="h-8 w-8" />
      </button>

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
