"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthModal } from "@/components/auth-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin, Users, Search, Filter, Heart, Share2, Star, X, Clock, Info } from "lucide-react";
import { NumericFormat } from "react-number-format";
import imageCompression from "browser-image-compression";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface ImagenEvento {
  id_imagen_evento: number;
  url_imagen_evento: string;
}

interface Event {
  id_evento: number;                // PK del evento
  nombre_evento: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;                // corregido: antes tenías fecha_final
  hora_inicio: string;
  hora_final: string;
  dias_semana?: string;             // opcional si no lo usas en BD
  numero_documento?: string;
  id_categoria_evento: number;
  id_tipo_evento: number;
  id_municipio: number;
  id_sitio: number;
  telefono_1: string;               // corregido: antes tenías telefono1
  telefono_2?: string;              // opcional
  costo: number;
  cupo: number | "";
  estado: boolean;
  imagenes: {                       // relación con tabla_imagenes_eventos
    id_imagen_evento: number;
    url_imagen_evento: string;
  }[];
}

// Esto es para mostrar los eventos debajo del buscador --- En proceso
  const initialEvents: Event[] = []

export default function EventosPage() {
  const [events, setEvents] = useState<any[]>(initialEvents)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [expandedEventId, setExpandedEventId] = useState<number | null>(null)

  const router = useRouter();

// handler para el campo `cupo`
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  // This function is kept for potential future use
};

// Generar rango de fechas entre fecha_inicio y fecha_final (retorna Date objects)
const generarRangoDias = (inicio: Date | null, fin: Date | null): Date[] => {
  if (!inicio || !fin) return [];
  const diasArray: Date[] = [];
  const current = new Date(inicio);
  current.setHours(0, 0, 0, 0); // resetea a medianoche
  const end = new Date(fin);
  end.setHours(0, 0, 0, 0);
  
  while (current <= end) {
    diasArray.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return diasArray;
};

// Toggle selección de un día (Date object)
const toggleDiaSeleccionado = (fecha: Date) => {
  // This function is moved to crear page
};

// Helper para formatear fecha a día completo/mes (acepta Date object)
const formatDia = (date: Date): string => {
  const opciones: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "numeric" };
  return date.toLocaleDateString("es-ES", opciones);
};

  // Fetch and normalize events for the UI
  const fetchEventos = async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      const rawEvents = (data && data.ok && Array.isArray(data.eventos)) ? data.eventos : Array.isArray(data) ? data : [];

      const normalized = rawEvents.map((e: any) => {
        // determine first image
        const firstImage = e.imagenes && e.imagenes.length ? e.imagenes[0].url_imagen_evento : null;

        // determine price (show min price if paid, otherwise 'Gratis')
        let price: number | string = 0;
        if (!e.gratis_pago) {
          price = "Gratis";
        } else if (e.valores && e.valores.length) {
          const vals = e.valores.map((v: any) => Number(v.valor || 0)).filter(Boolean);
          price = vals.length ? Math.min(...vals) : 0;
        } else {
          price = 0;
        }

        // date/time formatting
        const date = e.fecha_inicio ? new Date(e.fecha_inicio).toLocaleDateString() : "";
        const time = e.hora_inicio ? `${e.hora_inicio}${e.hora_final ? ` - ${e.hora_final}` : ""}` : "";

        return {
          id_evento: e.id_evento,
          title: e.nombre_evento,
          description: e.descripcion,
          image: firstImage || "/placeholder.svg",
          date,
          time,
          location: e.nombre_sitio || e.nombre_municipio || "",
          attendees: e.cupo ?? 0,
          price,
          raw: e, // keep original for details
        };
      });

      setEvents(normalized);
    } catch (err) {
      console.error("Error fetching events:", err);
      setEvents([]);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);


//Para llamar los sitios de la base de datos.
  useEffect(() => {
    // This effect is moved to crear page
  }, []);

//Para llamar los municipios de la base de datos.
  useEffect(() => {
    // This effect is moved to crear page
  }, []);


//Para llamar la categría (evento) de la base de datos.
  useEffect(() => {
    // This effect is moved to crear page
  }, []);

//Para cargar las categorías de boletos de la base de datos.
  useEffect(() => {
    // This effect is moved to crear page
  }, []);

//Para traer el nombre del usuario que esta en login al campo nombre del promotor.


  
//Para llamar el tipo (evento) de la base de datos.
  useEffect(() => {
    // This effect is moved to crear page
  }, []);
  

  const openAuthModal = (loginMode = true) => {
    setIsLogin(loginMode)
    setAuthModalOpen(true)
  }

  const handleEventExpand = (eventId: number) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId)
  }

const handleAddEvent = async () => {
  // This function is moved to crear page
};
  
  // Funciones de mapeo
  function mapCategoryToTipoId(category: string): number {
    const categorias: Record<string, number> = {
      Música: 1,
      Arte: 2,
      Teatro: 3,
      Gastronomía: 4,
      Tecnología: 5,
    };
    return categorias[category] || 0;
  }
  
  function mapLocationToMunicipioId(location: string): number {
    const municipios: Record<string, number> = {
      Bogotá: 1,
      Medellín: 2,
      Bucaramanga: 3,
      Cali: 4,
      Cartagena: 5,
    };
    return municipios[location] || 0;
  }
  
  
  // Funciones comentadas - usar cuando sea necesario

  // Fix implicit any in maps elsewhere
  // examples in render: ensure callbacks have typed params
  
  // Categorías visuales para filtros
  const categories = ["all", "Música", "Arte", "Teatro", "Gastronomía", "Tecnología"];
  
  // Filtro visual (puedes mantenerlo si usas tarjetas de eventos)
  const filteredEvents = events
    .filter((event) => {
      const name = String(event.nombre_evento ?? event.title ?? event.raw?.nombre_evento ?? "").toLowerCase();
      const descr = String(event.descripcion ?? event.description ?? event.raw?.descripcion ?? "").toLowerCase();
      const matchesSearch = name.includes(searchTerm.toLowerCase()) || descr.includes(searchTerm.toLowerCase());

      const eventTipo = event.id_tipo_evento ?? event.raw?.id_tipo_evento ?? 0;
      const matchesCategory = selectedCategory === "all" || mapCategoryToTipoId(selectedCategory) === eventTipo;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const toNumberPrice = (x: any) => {
        if (typeof x.price === 'number') return x.price;
        if (x.raw && x.raw.valores && x.raw.valores.length) {
          const vals = x.raw.valores.map((v: any) => Number(v.valor || 0)).filter(Boolean);
          return vals.length ? Math.min(...vals) : 0;
        }
        return 0;
      };

      const toNumberAttendees = (x: any) => Number(x.attendees ?? x.cupo ?? x.raw?.cupo ?? 0);

      const toTime = (x: any) => {
        const maybe = x.raw?.fecha_inicio ?? x.fecha_inicio ?? x.date;
        const t = Date.parse(String(maybe));
        return isNaN(t) ? 0 : t;
      };

      switch (sortBy) {
        case "price":
          return toNumberPrice(a) - toNumberPrice(b);
        case "attendees":
          return toNumberAttendees(b) - toNumberAttendees(a);
        default:
          return toTime(a) - toTime(b);
      }
    });
  
  // Eventos destacados (si decides mantener rating visual)
  const topRatedEvents = events.slice(0, 3); // puedes ordenar por cupo o costo si no usas rating
  
  // Evento expandido: support backend `id_evento` or frontend `id`
  const expandedEvent = expandedEventId
    ? events.find((e: any) => (e.id_evento ?? e.id) === expandedEventId)
    : null;
  

  
  return (
    <main className="min-h-screen bg-gradient-to-tr from-purple-50 via-indigo-50 to-sky-100">
      <Header onAuthClick={openAuthModal} />

      {/* Hero Section */}
      <section className="pt-16 lg:pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Enhanced Search and Filters */}
          <div className="mt-20 bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/60 mb-12 relative">
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
                            key={event.id_evento ?? event.id}
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

      {/* Modal removed - use /eventos/crear route instead */}

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
                  {/* Expanded gallery: show main and thumbnails from raw.imagenes */}
                  {expandedEvent && expandedEvent.raw && expandedEvent.raw.imagenes && expandedEvent.raw.imagenes.length ? (
                    <>
                      <img
                        src={expandedEvent.raw.imagenes[0].url_imagen_evento}
                        alt={expandedEvent.title}
                        className="w-full h-80 object-cover rounded-2xl"
                      />
                      <div className="grid grid-cols-3 gap-3">
                        {expandedEvent.raw.imagenes.map((imgObj: any, index: number) => (
                          <img
                            key={index}
                            src={imgObj.url_imagen_evento || "/placeholder.svg"}
                            alt={`${expandedEvent.title} ${index + 1}`}
                            className="w-full h-24 object-cover rounded-xl"
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <img
                      src="/placeholder.svg"
                      alt={expandedEvent.title}
                      className="w-full h-80 object-cover rounded-2xl"
                    />
                  )}

                  {/* Badge: PAGO / GRATIS */}
                  <span className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${typeof expandedEvent.price === 'number' ? 'bg-red-600 text-white' : 'bg-green-400 text-white'}`}>
                    {typeof expandedEvent.price === 'number' ? 'PAGO' : 'GRATIS'}
                  </span>
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
                      {expandedEvent.highlights.map((highlight: string, index: number) => (
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
                        <span className="text-3xl font-bold text-blue-600">{typeof expandedEvent.price === 'number' ? `$${expandedEvent.price}` : expandedEvent.price}</span>
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

      {/* Tarjetas de presentación de los eventos */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Eventos Disponibles ({filteredEvents.length})
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <Card
                key={event.id_evento ?? event.id}
                className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/90 backdrop-blur-sm border-white/60 rounded-2xl overflow-hidden"
              >
                <div className="relative overflow-hidden">
                  <div className="w-full h-52 bg-gray-100">
                    {event.raw && event.raw.imagenes && event.raw.imagenes.length ? (
                      <>
                        <img
                          src={event.raw.imagenes[0].url_imagen_evento}
                          alt={event.title}
                          className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute bottom-2 left-2 right-2 flex gap-2 overflow-x-auto p-1">
                          {event.raw.imagenes.map((imgObj: any, i: number) => (
                            <img
                              key={i}
                              src={imgObj.url_imagen_evento}
                              alt={`${event.title} ${i + 1}`}
                              className="h-10 w-16 object-cover rounded-md border border-white shadow-sm"
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <img
                        src="/placeholder.svg"
                        alt={event.title}
                        className="w-full h-52 object-cover"
                      />
                    )}

                    {/* Badge: PAGO / GRATIS */}
                    <span className={`absolute top-4 left-4 text-xs font-semibold px-2 py-1 rounded-full ${typeof event.price === 'number' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
                      {typeof event.price === 'number' ? 'PAGO' : 'GRATIS'}
                    </span>
                  </div>

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
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-3" />
                      {event.date} • {event.time}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="rounded-full">
                      {event.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{event.rating}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amber-400 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-3" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-3" />
                      Aforo para {Number(event.attendees ?? event.cupo ?? 0).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-lime-700">{typeof event.price === 'number' ? `$${event.price}` : event.price}</div>
                    <Button
                      onClick={() => (window.location.href = `/eventos/${event.id_evento ?? event.id}`)}
                      className="bg-gradient-to-tr from-violet-600 to-indigo-700 hover:from-blue-700 hover:to-cyan-700 rounded-xl px-6"
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
