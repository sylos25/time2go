"use client"

import { useState, useEffect } from "react"
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
  nombre_evento: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_final: string;
  hora_inicio: string;
  hora_final: string;
  dias_semana: string;
  id_usuario: number;
  id_categoria_evento: number;
  id_tipo_evento: number;
  id_municipio: number;
  id_sitio: number;
  id_imagen: number;
  telefono: string;
  costo: number;
  cupo: number;
  estado: boolean;
}

// Esto es para mostrar los eventos debajo del buscador --- En proceso
  const initialEvents: Event[] = []

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
  const [categorias, setCategorias] = useState<{ id_categoria_evento: number; nombre: string }[]>([]);
  const [tiposDeEvento, setTiposDeEvento] = useState<{ id_tipo_evento: number; nombre: string }[]>([]);



  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    nombre_evento: "",
    id_usuario: 0,
    id_categoria_evento: 0,
    id_tipo_evento: 0,
    id_municipio: 0,
    id_sitio: 0,
    descripcion: "",
    telefono: "",
    fecha_inicio: "",
    fecha_final: "",
    dias_semana: "",
    hora_inicio: "",
    hora_final: "",
    costo: 0,
    cupo: 0,
    estado: true,
    id_imagen: 0,
  });

//Para llamar la categría (evento) de la base de datos.
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch("/api/categoria_evento");
        const data = await res.json();
        setCategorias(data);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };
  
    fetchCategorias();
  }, []);
  
//Para llamar el tipo (evento) de la base de datos.
  useEffect(() => {
    const fetchTiposDeEvento = async () => {
      if (!newEvent.id_categoria_evento) return;
  
      try {
        const res = await fetch(`/api/tipo_evento?categoriaId=${newEvent.id_categoria_evento}`);
        const data = await res.json();
        setTiposDeEvento(data);
      } catch (error) {
        console.error("Error al cargar tipos de evento:", error);
      }
    };
  
    fetchTiposDeEvento();
  }, [newEvent.id_categoria_evento]);
  

  const openAuthModal = (loginMode = true) => {
    setIsLogin(loginMode)
    setAuthModalOpen(true)
  }

  const handleEventExpand = (eventId: number) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId)
  }

  const handleAddEvent = async () => {
    const eventToAdd: Partial<Event> = {
      nombre_evento: newEvent.nombre_evento || "",
      descripcion: newEvent.descripcion || "",
      fecha_inicio: newEvent.fecha_inicio || "",
      fecha_final: newEvent.fecha_final || "", // puedes calcularla con duration si lo deseas
      hora_inicio: newEvent.hora_inicio || "",
      hora_final: newEvent.hora_final || "",
      dias_semana: "", // si aplica
      id_usuario: id_usuario,
      id_categoria_evento: 0,
      id_tipo_evento: mapCategoryToTipoId(newEvent.category || "Música"),
      id_municipio: mapLocationToMunicipioId(newEvent.location || ""),
      id_sitio: 0,
      id_imagen: 0,
      telefono: "",
      costo: newEvent.costo || 0,
      cupo: newEvent.cupo || 0,
      estado: newEvent.estado || true,
    };
  
    try {
      const res = await fetch("/api/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventToAdd),
      });
  
      if (!res.ok) throw new Error("Error al crear el evento");
  
      const eventoCreado = await res.json();
      setEvents((prev) => [...prev, eventoCreado]);
      setShowAddEventForm(false);
  
      // Reset form adaptado
      setNewEvent({
        nombre_evento: "",
        id_usuario: 0,
        id_categoria_evento: 0,
        id_tipo_evento: 0,
        id_municipio: 0,
        id_sitio: 0,
        descripcion: "",
        telefono: "",
        fecha_inicio: "",
        fecha_final: "",
        dias_semana: "",
        hora_inicio: "",
        hora_final: "",
        costo: 0,
        cupo: 0,
        estado: true,
        id_imagen: 0,
      });
    } catch (error) {
      console.error("Error al guardar el evento:", error);
    }
  };
  
  // Funciones de mapeo
  function mapCategoryToTipoId(category: string): number {
    const categorias = {
      Música: 1,
      Arte: 2,
      Teatro: 3,
      Gastronomía: 4,
      Tecnología: 5,
    };
    return categorias[category] || 0;
  }
  
  function mapLocationToMunicipioId(location: string): number {
    const municipios = {
      Bogotá: 1,
      Medellín: 2,
      Bucaramanga: 3,
      Cali: 4,
      Cartagena: 5,
    };
    return municipios[location] || 0;
  }
  
  // Puedes conservar estas funciones si aún usas campos visuales
  const updateHighlight = (index: number, value: string) => {
    const updatedHighlights = [...(newEvent.highlights || [])];
    updatedHighlights[index] = value;
    setNewEvent({ ...newEvent, highlights: updatedHighlights });
  };
  
  const updateAdditionalImage = (index: number, value: string) => {
    const updatedImages = [...(newEvent.additionalImages || [])];
    updatedImages[index] = value;
    setNewEvent({ ...newEvent, additionalImages: updatedImages });
  };
  
  // Categorías visuales para filtros
  const categories = ["all", "Música", "Arte", "Teatro", "Gastronomía", "Tecnología"];
  
  // Filtro visual (puedes mantenerlo si usas tarjetas de eventos)
  const filteredEvents = events
    .filter((event) => {
      const matchesSearch =
        event.nombre_evento.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" ||
        mapCategoryToTipoId(selectedCategory) === event.id_tipo_evento;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price":
          return a.costo - b.costo;
        case "attendees":
          return b.cupo - a.cupo;
        default:
          return new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime();
      }
    });
  
  // Eventos destacados (si decides mantener rating visual)
  const topRatedEvents = events.slice(0, 3); // puedes ordenar por cupo o costo si no usas rating
  
  // Evento expandido
  const expandedEvent = expandedEventId ? events.find((e) => e.id === expandedEventId) : null;
  

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
                    <Label htmlFor="title">Nombre del Evento *</Label>
                    <Input
                      id="title"
                      value={newEvent.nombre_evento}
                      onChange={(e) => setNewEvent({ ...newEvent, nombre_evento: e.target.value })}
                      placeholder="Ej: Festival de Música"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Nombre del Promotor *</Label>
                    <Input
                      id="title"
                      value={newEvent.id_usuario}
                      onChange={(e) => setNewEvent({ ...newEvent, id_usuario: e.target.value })}
                      placeholder="Ej: Auto"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="id_tipo_evento">Categoría del Evento *</Label>
                    <Select
                      value={String(newEvent.id_categoria_evento || 0)}
                      onValueChange={(value) =>setNewEvent({ ...newEvent, id_categoria_evento: Number(value) })
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                      <SelectItem value="0">Selecciona una categoría</SelectItem>
                      {categorias.map((cat) => (
                        <SelectItem key={cat.id_categoria_evento} value={String(cat.id_categoria_evento)}>
                          {cat.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Tipo de Evento *</Label>
                    <Select
                        value={String(newEvent.id_tipo_evento || 0)}
                        onValueChange={(value) =>
                          setNewEvent({ ...newEvent, id_tipo_evento: Number(value) })
                        }
                        disabled={!tiposDeEvento.length}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Selecciona un tipo de evento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">(Selecciona un tipo)</SelectItem>
                          {tiposDeEvento.map((tipo) => (
                            <SelectItem key={tipo.id_tipo_evento} value={String(tipo.id_tipo_evento)}>
                              {tipo.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Sitio *</Label>
                    <Input
                      id="title"
                      value={newEvent.id_sitio}
                      onChange={(e) => setNewEvent({ ...newEvent, id_sitio: e.target.value })}
                      placeholder="Ej: Neomundo"
                      className="rounded-xl"
                    />
                  </div>

                  
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullDescription">Descripción *</Label>
                  <Textarea
                    id="fullDescription"
                    value={newEvent.descripcion}
                    onChange={(e) => setNewEvent({ ...newEvent, descripcion: e.target.value })}
                    placeholder="Descripción detallada del evento"
                    className="rounded-xl min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="title">Teléfono de los organizadores *</Label>
                    <Input
                      id="title"
                      value={newEvent.telefono}
                      onChange={(e) => setNewEvent({ ...newEvent, telefono: e.target.value })}
                      placeholder="Ej: 3121234567"
                      className="rounded-xl"
                    />
                  </div>


                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha en la que inicia el evento*</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newEvent.fecha_inicio}
                      onChange={(e) => setNewEvent({ ...newEvent, fecha_inicio: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha en la que termina el evento*</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newEvent.fecha_final}
                      onChange={(e) => setNewEvent({ ...newEvent, fecha_final: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Dias al que se puede asistir al evento *</Label>
                    <Input
                      id="title"
                      value={newEvent.dias_semana}
                      onChange={(e) => setNewEvent({ ...newEvent, dias_semana: e.target.value })}
                      placeholder="Ej: Lunes, Martes, Miercoles..."
                      className="rounded-xl"
                    />
                  </div>


                  <div className="space-y-2">
                    <Label htmlFor="time">Hora de inicio*</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newEvent.hora_inicio}
                      onChange={(e) => setNewEvent({ ...newEvent, hora_inicio: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Hora final *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newEvent.hora_final}
                      onChange={(e) => setNewEvent({ ...newEvent, hora_final: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  
                </div>

                <div className="grid md:grid-cols-2 gap-6">

                <div className="space-y-2">
                    <Label htmlFor="category">Modo de acceder (temporal)*</Label>
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
                  
                <div className="space-y-2">
                    <Label htmlFor="title">Valor de la entrada (tabla_costos)*</Label>
                    <Input
                      id="title"
                      value={newEvent.costo}
                      onChange={(e) => setNewEvent({ ...newEvent, costo: e.target.value })}
                      placeholder="Ej: 100.000"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="attendees">Aforo del evento</Label>
                    <Input
                      id="attendees"
                      type="number"
                      value={newEvent.cupo}
                      onChange={(e) => setNewEvent({ ...newEvent, cupo: Number(e.target.value) })}
                      placeholder="0"
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
