"use client"
import { useState, useEffect } from "react";
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
import { Calendar, MapPin, Users, Search, Filter, Heart, Share2, Star, X, Clock, Info, Plus } from "lucide-react";
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
  id_usuario: number;
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
  const [sitios, setSitios] = useState<{ id_sitio: number; nombre_sitio: string }[]>([]);
  const [busquedaSitio, setBusquedaSitio] = useState("");
  const [busquedaMunicipio, setBusquedaMunicipio] = useState("");
  const [municipios, setMunicipios] = useState([]);
  const [showTelefono2, setShowTelefono2] = useState(false);
  // NOTE: use `events` state (unified) instead of a separate `eventos`
  const [preview, setPreview] = useState<string[]>([]);

const TIPOS_BOLETERIA = [
  "General",
  "Estudiante",
  "Adulto Mayor",
  "VIP",
  "Premium",
  "Acceso Temprano",
  "Familia"
];

const [newEvent, setNewEvent] = useState<any>({
  nombre_evento: "",
  id_usuario: 0,
  id_categoria_evento: 0,
  id_tipo_evento: 0,
  id_municipio: 0,
  id_sitio: 0,
  descripcion: "",
  // use telefones without underscore for form fields; we'll map to backend names on submit
  telefono1: "",
  telefono2: "",
  fecha_inicio: null as Date | null,
  fecha_final: null as Date | null,
  diasSeleccionados: [] as Date[], // array de objetos Date
  hora_inicio: "",
  hora_final: "",
  pago: false,
  costos: [""],
  tiposBoleteria: [""] as string[], // tipos de boletería para cada costo
  linksBoleteria: [""] as string[], // links para comprar boletería (máx 5)
  cupo: "",
  estado: true,
  imagenes: [] as File[], // aquí se guardarán las imágenes seleccionadas
  documento: null,
  highlights: [],
  additionalImages: [],
});

// handler para el campo `cupo`
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  if (value === "") return setNewEvent({ ...newEvent, cupo: "" });
  const num = Number(value);
  if (!Number.isNaN(num)) {
    // limitar entre 1 y 5000
    if (num >= 1 && num <= 5000) setNewEvent({ ...newEvent, cupo: num });
  }
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
  setNewEvent((prev: any) => {
    const selected = prev.diasSeleccionados || [];
    const fechaTime = new Date(fecha).setHours(0, 0, 0, 0);
    const found = selected.find((d: Date) => new Date(d).setHours(0, 0, 0, 0) === fechaTime);
    
    if (found) {
      return { ...prev, diasSeleccionados: selected.filter((d: Date) => new Date(d).setHours(0, 0, 0, 0) !== fechaTime) };
    } else {
      return { ...prev, diasSeleccionados: [...selected, new Date(fecha)] };
    }
  });
};

// Helper para formatear fecha a día completo/mes (acepta Date object)
const formatDia = (date: Date): string => {
  const opciones: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "numeric" };
  return date.toLocaleDateString("es-ES", opciones);
};

  const addCostoField = () => {
    if (newEvent.costos.length < 7) {
      setNewEvent({ ...newEvent, costos: [...newEvent.costos, ""] });
    }
  };

  const updateCosto = (index: number, value: string) => {
    const updatedCostos = [...newEvent.costos];
    updatedCostos[index] = value;
    setNewEvent({ ...newEvent, costos: updatedCostos });
  };

  const removeCostoField = (index: number) => {
    const updatedCostos = newEvent.costos.filter((_, i) => i !== index);
    const updatedTipos = newEvent.tiposBoleteria.filter((_: string, i: number) => i !== index);
    setNewEvent({ ...newEvent, costos: updatedCostos, tiposBoleteria: updatedTipos });
  };

  const removeAllCostos = () => {
    setNewEvent({ ...newEvent, costos: [""], tiposBoleteria: [""] });
  };

  // Obtener tipos disponibles (no seleccionados en otros campos)
  const getAvailableTypes = (currentIndex: number): string[] => {
    const selectedTypes = newEvent.tiposBoleteria.filter((_: string, i: number) => i !== currentIndex);
    return TIPOS_BOLETERIA.filter(tipo => !selectedTypes.includes(tipo));
  };

  // Handlers para links de boletería
  const addLinkBoleteria = () => {
    if (newEvent.linksBoleteria.length < 5) {
      setNewEvent({ ...newEvent, linksBoleteria: [...newEvent.linksBoleteria, ""] });
    }
  };

  const updateLinkBoleteria = (index: number, value: string) => {
    const updatedLinks = [...newEvent.linksBoleteria];
    updatedLinks[index] = value;
    setNewEvent({ ...newEvent, linksBoleteria: updatedLinks });
  };

  const removeLinkBoleteria = (index: number) => {
    const updatedLinks = newEvent.linksBoleteria.filter((_: string, i: number) => i !== index);
    setNewEvent({ ...newEvent, linksBoleteria: updatedLinks });
  };

  const removeAllLinksBoleteria = () => {
    setNewEvent({ ...newEvent, linksBoleteria: [""] });
  };


const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    let files = Array.from(e.target.files);

    // Limitar cantidad
    if (files.length > 6) {
      alert("Solo puedes subir 6 imágenes por evento.");
      files = files.slice(0, 6);
    }

    // Validar y comprimir
    const compressedFiles = await Promise.all(
      files.map(async (file) => {
        if (file.type !== "image/jpeg") {
          alert("Solo se permiten imágenes en formato JPG.");
          return null;
        }

        const options = {
          maxSizeMB: 2,              // máximo 2 MB
          maxWidthOrHeight: 1280,    // redimensionar si es muy grande
          useWebWorker: true,
        };
        return await imageCompression(file, options);
      })
    );

    // Filtrar nulos (por si algún archivo no era JPG)
    const validFiles = compressedFiles.filter((f): f is File => f !== null);

    // Guardar en el estado del evento
    setNewEvent((prev) => ({ ...prev, imagenes: validFiles }));

    // Generar previews
    const previews = validFiles.map((file) => URL.createObjectURL(file));
    setPreview(previews);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Evento listo para enviar:", newEvent);
    // Aquí podrías hacer un fetch/axios POST al backend
  };

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();
        if (data.ok && Array.isArray(data.eventos)) setEvents(data.eventos);
        else if (Array.isArray(data)) setEvents(data);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };
    fetchEventos();
  }, []);


//Para llamar los sitios de la base de datos.
  useEffect(() => {
    const fetchSitios = async () => {
      if (!busquedaSitio || busquedaSitio.length < 2 || newEvent.id_sitio) return;
      try {
        const res = await fetch(`/api/llamar_sitio?nombre_sitio=${encodeURIComponent(busquedaSitio)}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setSitios(data);
        } else {
          setSitios([]);
        }
      } catch (error) {
        console.error("Error al buscar sitios:", error);
        setSitios([]);
      }
    };
    fetchSitios();
  }, [busquedaSitio]);

//Para llamar los municipios de la base de datos.
  useEffect(() => {
    if (newEvent.id_sitio) {
      fetch(`/api/municipios?sitioId=${newEvent.id_sitio}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.length > 0) {
            // Autorrellena con el primer municipio
            setBusquedaMunicipio(data[0].nombre_municipio);
            setNewEvent({ ...newEvent, id_municipio: data[0].id_municipio });
          } else {
            // Si no hay municipios, deja vacío pero bloqueado
            setBusquedaMunicipio("");
            setNewEvent({ ...newEvent, id_municipio: 0 });
          }
        })
        .catch((err) => console.error("Error cargando municipios:", err));
    } else {
      setBusquedaMunicipio("");
      setNewEvent({ ...newEvent, id_municipio: 0 });
    }
  }, [newEvent.id_sitio]);


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
      if (!newEvent.id_categoria_evento || newEvent.id_categoria_evento === 0) {
        setTiposDeEvento([]); return;}
  
      try {
        const res = await fetch(`/api/tipo_evento?categoriaId=${newEvent.id_categoria_evento}`);
        const data = await res.json();
        setTiposDeEvento(Array.isArray(data) ? data : []);
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
  try {
    const formData = new FormData();

    // Campos del evento (mapeo seguro desde los campos del formulario)
    formData.append("nombre_evento", newEvent.nombre_evento || "");
    formData.append("descripcion", newEvent.descripcion || "");
    // Convertir Date a formato YYYY-MM-DD string para el backend
    const fechaInicioStr = newEvent.fecha_inicio ? newEvent.fecha_inicio.toISOString().split('T')[0] : "";
    const fechaFinalStr = newEvent.fecha_final ? newEvent.fecha_final.toISOString().split('T')[0] : "";
    formData.append("fecha_inicio", fechaInicioStr);
    formData.append("fecha_fin", fechaFinalStr);
    formData.append("hora_inicio", newEvent.hora_inicio || "");
    formData.append("hora_final", newEvent.hora_final || "");
    // Convertir diasSeleccionados (Date[]) a formato YYYY-MM-DD string array
    const diasStrings = (newEvent.diasSeleccionados || []).map((d: Date) => d.toISOString().split('T')[0]);
    formData.append("dias_semana", JSON.stringify(diasStrings));
    formData.append("id_usuario", String(newEvent.id_usuario || 0));
    formData.append("id_categoria_evento", String(newEvent.id_categoria_evento || 0));
    formData.append("id_tipo_evento", String(newEvent.id_tipo_evento || 0));
    formData.append("id_municipio", String(newEvent.id_municipio || 0));
    formData.append("id_sitio", String(newEvent.id_sitio || 0));
    // transform phone fields to backend expected names
    formData.append("telefono_1", newEvent.telefono1 || newEvent.telefono_1 || "");
    formData.append("telefono_2", newEvent.telefono2 || newEvent.telefono_2 || "");
    formData.append("costo", String(newEvent.costo || 0));
    formData.append("cupo", String(newEvent.cupo || 0));
    formData.append("estado", String(newEvent.estado ?? true));

    // Imágenes (array de File)
    (newEvent.imagenes || []).forEach((file: File) => {
      formData.append("additionalImages", file);
    });

    const res = await fetch("/api/events", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Error al crear el evento");

    const data = await res.json();

    // Actualizar lista de eventos
    setEvents((prev) => [...prev, data]);

    setShowAddEventForm(false);

    // Reset del formulario (manteniendo la misma forma que el estado inicial)
    setNewEvent({
      nombre_evento: "",
      id_usuario: 0,
      id_categoria_evento: 0,
      id_tipo_evento: 0,
      id_municipio: 0,
      id_sitio: 0,
      descripcion: "",
      telefono1: "",
      telefono2: "",
      fecha_inicio: null,
      fecha_final: null,
      diasSeleccionados: [],
      hora_inicio: "",
      hora_final: "",
      costo: 0,
      cupo: "",
      estado: true,
      imagenes: [],
      documento: null,
      costos: [""],
      tiposBoleteria: [""],
      linksBoleteria: [""],
      highlights: [],
      additionalImages: [],
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
  
  // Evento expandido: support backend `id_evento` or frontend `id`
  const expandedEvent = expandedEventId
    ? events.find((e: any) => (e.id_evento ?? e.id) === expandedEventId)
    : null;
  

  
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
                      placeholder="Nombre completo del evento."
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Nombre del Promotor *</Label>
                    <Input
                      id="title"
                      value={newEvent.id_usuario}
                      onChange={(e) => setNewEvent({ ...newEvent, id_usuario: Number(e.target.value) })}
                      placeholder="12345"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2 ">
                    <Label htmlFor="id_tipo_evento">Categoría del Evento</Label>
                    <Select
                      value={String(newEvent.id_categoria_evento || 0)}
                      onValueChange={(value) =>setNewEvent({ ...newEvent, id_categoria_evento: Number(value), id_tipo_evento: 0 })
                      }
                    >
                      <SelectTrigger className="rounded-xl cursor-pointer">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                      <SelectItem value="0">Selecciona una categoría</SelectItem>
                      {categorias.map((cat) => (
                        <SelectItem 
                          className="rounded-xl cursor-pointer"
                          key={cat.id_categoria_evento} value={String(cat.id_categoria_evento)}>
                            {cat.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Tipo de Evento</Label>
                    <Select
                        value={String(newEvent.id_tipo_evento || 0)}
                        onValueChange={(value) =>
                          setNewEvent({ ...newEvent, id_tipo_evento: Number(value) })
                        }
                        disabled={!tiposDeEvento.length}
                      >
                        <SelectTrigger className="rounded-xl cursor-pointer">
                          <SelectValue placeholder="Selecciona un tipo de evento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">(Selecciona un tipo)</SelectItem>
                          {tiposDeEvento.map((tipo) => (
                            <SelectItem 
                              className="rounded-xl cursor-pointer"
                              key={tipo.id_tipo_evento} value={String(tipo.id_tipo_evento)}>
                                {tipo.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  </div>

                  <div className="space-y-2 relative">
                    <Label htmlFor="sitio">Sitio</Label>
                    <Input
                      id="sitio"
                      value={busquedaSitio}
                      onChange={(e) => {
                        setBusquedaSitio(e.target.value);
                        setNewEvent({ ...newEvent, id_sitio: 0 });
                      }}
                      placeholder="Escribe el nombre del sitio donde será el evento"
                      className="rounded-xl"
                    />
                    {sitios.length > 0 && (
                      <ul className="absolute z-10 bg-white border rounded-xl mt-1 w-full max-h-60 overflow-y-auto shadow-lg">
                        {sitios.map((sitio) => (
                          <li
                            key={sitio.id_sitio}
                            onClick={() => {
                              setBusquedaSitio(sitio.nombre_sitio);
                              setNewEvent({ ...newEvent, id_sitio: sitio.id_sitio });
                              setSitios([]);
                            }}
                            className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                          >
                            {sitio.nombre_sitio}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="space-y-2 ">
                    <Label htmlFor="municipio">Municipio</Label>
                    <Input
                      id="municipio"
                      value={busquedaMunicipio}
                      readOnly={!!newEvent.id_sitio} // bloquea edición si ya hay sitio seleccionado
                      placeholder="Ciudad del lugar donde se hará el evento."
                      className="rounded-xl cursor-default "
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullDescription">Descripción</Label>
                  <Textarea
                    id="fullDescription"
                    value={newEvent.descripcion}
                    onChange={(e) => setNewEvent({ ...newEvent, descripcion: e.target.value })}
                    placeholder="Descripción detallada del evento"
                    className="rounded-xl min-h-[100px]"
                  />
                  
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono1">Teléfono del organizador del evento</Label>
                  <Input
                    id="telefono1"
                    value={newEvent.telefono1}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d{0,10}$/.test(value)) {
                        setNewEvent({ ...newEvent, telefono1: value });
                      }
                    }}
                    placeholder="Teléfono 1"
                    className="rounded-xl"
                    maxLength={10}
                    inputMode="numeric"
                    pattern="\d*"
                  />
                </div>
                {!showTelefono2 && (
                    <Button
                          type="button"
                          onClick={() => setShowTelefono2(true)}
                          className="cursor-pointer rounded-md border px-2 py-1 bg-blue-500 text-white text-sm hover:bg-blue-600 w-60 text-center"
                        >
                      + Agregar otro teléfono
                    </Button>
                  )}
                  {showTelefono2 && (
                    <div className="space-y-2">
                      <Label htmlFor="telefono2">Segundo teléfono del organizador del evento</Label>
                      <Input
                        id="telefono2"
                        value={newEvent.telefono2 || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d{0,10}$/.test(value)) {
                            setNewEvent({ ...newEvent, telefono2: value });
                          }
                        }}
                        placeholder="Teléfono 2"
                        className="rounded-xl"
                        maxLength={10}
                        inputMode="numeric"
                        pattern="\d*"
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          setShowTelefono2(false);
                          setNewEvent({ ...newEvent, telefono2: "" }); // limpiar al quitar
                        }}
                        className="cursor-pointer rounded-md border px-2 py-1 bg-red-500 text-white text-sm hover:bg-blue-600 w-60 text-center"
                      >
                        – Quitar teléfono
                      </Button>
                    </div>
                  )}


              <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fecha_inicio">Fecha de inicio del evento</Label>
                      <DatePicker
                        id="fecha_inicio"
                        selected={newEvent.fecha_inicio}
                        onChange={(date) => setNewEvent({ ...newEvent, fecha_inicio: date })}
                        dateFormat="dd/MM/yyyy"
                        minDate={new Date()}
                        placeholderText="01/01/2025"
                        className="cursor-pointer w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fecha_final">Fecha final del evento</Label>
                      <DatePicker
                        id="fecha_final"
                        selected={newEvent.fecha_final}
                        onChange={(date) =>
                          setNewEvent({
                            ...newEvent,
                            fecha_final: date,
                            diasSeleccionados: []
                          })
                        }
                        dateFormat="dd/MM/yyyy"
                        minDate={newEvent.fecha_inicio || new Date()} 
                        placeholderText="31/12/2025"
                        className="cursor-pointer w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                      />
                    </div>
                </div>


                <div className="space-y-2">
                  <Label htmlFor="title">Días en los que se puede asistir al evento *</Label>
                  <div className="p-4 border rounded-xl bg-gray-50">
                    {generarRangoDias(newEvent.fecha_inicio, newEvent.fecha_final).length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {generarRangoDias(newEvent.fecha_inicio, newEvent.fecha_final).map((fecha) => {
                            const fechaTime = new Date(fecha).setHours(0, 0, 0, 0);
                            const isSelected = newEvent.diasSeleccionados.some((d: Date) => new Date(d).setHours(0, 0, 0, 0) === fechaTime);                           
                            return (
                              <label
                                key={fecha.toISOString().split('T')[0]}
                                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                  isSelected
                                    ? "bg-blue-100 border-blue-500"
                                    : "bg-white border-gray-300 hover:border-blue-300"
                                }`}
                              >
                                <span className="text-xs font-semibold text-gray-700">{formatDia(fecha)}</span>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleDiaSeleccionado(fecha)}
                                  className="w-5 h-5 cursor-pointer"
                                />
                              </label>
                            );
                          })}
                        </div>
                        <p className="text-xs text-gray-600 text-center">
                          Seleccionados: {newEvent.diasSeleccionados.length} día(s)
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Selecciona primero las fechas de inicio y fin</p>
                    )}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="time">Hora de inicio</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newEvent.hora_inicio}
                      onChange={(e) => setNewEvent({ ...newEvent, hora_inicio: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Hora final</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newEvent.hora_final}
                      onChange={(e) => setNewEvent({ ...newEvent, hora_final: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>
                

                <div className="space-y-4 p-4 border rounded-lg shadow-md">
                  <div className="flex gap-6 items-center ">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="tipoEntrada"
                        checked={!newEvent.pago}
                        onChange={() =>
                          setNewEvent({
                            ...newEvent,
                            pago: false,
                            costos: [""],
                            tiposBoleteria: [""],
                            linksBoleteria: [""]
                          })
                        }
                      />
                      Gratis
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="tipoEntrada"
                        checked={newEvent.pago}
                        onChange={() => setNewEvent({ ...newEvent, pago: true })}/>
                      Pago
                    </label>
                  </div>
                  {newEvent.pago && (
                    <div className="space-y-4 p-4 border rounded-lg shadow-md">
                      <h2 className="text-lg font-semibold cursor-default">Valores de la entrada</h2>
                       <p className="text-xs text-gray-600 italic -translate-y-3 cursor-default"> 
                          Agrega los tipos de boletas y los precios de cada una de las boletas al evento.
                        </p>
                        {newEvent.costos.map((costo, index) => (
                          <div key={index} className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <select
                                value={newEvent.tiposBoleteria[index] || ""}
                                  onChange={(e) => {
                                    const updatedTipos = [...newEvent.tiposBoleteria];
                                    updatedTipos[index] = e.target.value;
                                    setNewEvent({ ...newEvent, tiposBoleteria: updatedTipos });
                                  }}
                          className="rounded-xl border px-3 py-2 w-40 cursor-pointer">
                            <option value="">Selecciona tipo</option>
                              {getAvailableTypes(index).map((tipo) => (
                                <option key={tipo} value={tipo}>
                                  {tipo}
                                </option>
                              ))}
                            {newEvent.tiposBoleteria[index] && (
                              <option value={newEvent.tiposBoleteria[index]}>
                                {newEvent.tiposBoleteria[index]}
                              </option>
                            )}
                          </select>
                          <NumericFormat
                              value={costo}
                              prefix="$"
                              thousandSeparator="."
                              decimalSeparator=","
                              onValueChange={(values) => updateCosto(index, values.value)}
                              placeholder="$100.000"
                              className="rounded-xl border px-2 py-1 flex-1"
                              disabled={!newEvent.pago}/>
                          {newEvent.costos.length > 1 && newEvent.pago && (
                              <button
                                type="button"
                                onClick={() => removeCostoField(index)}
                                className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 cursor-pointer">
                                Quitar
                              </button>
                          )}
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between items-center gap-3">
                        <div className="flex gap-2 ">
                          <button
                            type="button"
                            onClick={addCostoField}
                            disabled={newEvent.costos.length >= 7}
                            className={`px-3 py-1 rounded-md text-white ${
                              newEvent.costos.length >= 7
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                            }`}>
                          + Añadir campo
                          </button>
                          {newEvent.costos.length >= 2 && (
                            <button
                              type="button"
                              onClick={removeAllCostos}
                              className="px-3 py-1 rounded-md text-white bg-red-600 hover:bg-red-700 cursor-pointer">
                              Eliminar todos
                            </button>
                          )}
                        </div>
                        <span className="text-sm text-gray-600">
                          {newEvent.costos.length}/7 campos usados
                        </span>
                      </div>
                    </div>
                  )}               


                {newEvent.pago && (
                  <div className="space-y-4 p-4 border rounded-lg shadow-md bg-white-50 cursor-default">
                    <h2 className="text-lg font-semibold">
                      Links de la boletería.
                    </h2>
                    <p className="text-xs text-gray-600 italic -translate-y-3 cursor-default"> 
                      Agrega los links donde los usuarios pueden comprar la entrada al evento.
                    </p>
                  {newEvent.linksBoleteria.map((link, index) => (
                    <div key={index} className="flex items-center gap-2 -translate-y-3 ">
                      <Input
                        type="url"
                        value={link}
                        onChange={(e) => updateLinkBoleteria(index, e.target.value)}
                        placeholder="https://example.com/tickets"
                        className="rounded-xl flex-1"/>
                    {newEvent.linksBoleteria.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLinkBoleteria(index)}
                        className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-800 whitespace-nowrap cursor-pointer">
                        Quitar
                      </button>)}
                    </div>
                  ))}
                    <div className="flex justify-between items-center gap-3 -translate-y-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={addLinkBoleteria}
                          disabled={newEvent.linksBoleteria.length >= 5}
                          className={`px-3 py-1 rounded-md text-white ${
                            newEvent.linksBoleteria.length >= 5
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                          }`}>
                        + Añadir link     
                        </button>
                        {newEvent.linksBoleteria.length >= 2 && (
                          <button
                            type="button"
                            onClick={removeAllLinksBoleteria}
                            className="px-3 py-1 rounded-md text-white bg-red-600 hover:bg-red-700 cursor-pointer">
                            Eliminar todos
                          </button>
                        )}
                      </div>
                      <span className="text-sm text-gray-600">
                        {newEvent.linksBoleteria.length}/5 links
                      </span>
                    </div>
                  </div>
                )}
                </div>



              <div className="space-y-2">
                    <label htmlFor="attendees" className="block font-medium">
                      Aforo del evento
                    </label>
                    <input
                      id="attendees"
                      type="number"
                      min={1}
                      max={5000}
                      value={newEvent.cupo === "" ? "" : newEvent.cupo}
                      onChange={handleChange}
                      placeholder="100"
                      className="rounded-xl border px-2 py-1 w-full"
                    />
                    <p className="text-sm text-gray-500">
                      Ingrese un número entre 1 y 5000
                    </p>
                  </div>

                <div className="flex flex-col space-y-2">
                  <label htmlFor="imagenes" className="font-medium">
                    Imágenes del evento
                  </label>

                  <label
                    htmlFor="imagenes"
                    className="cursor-pointer rounded-md border px-2 py-1 bg-blue-500 text-white text-sm hover:bg-blue-600 w-60 text-center"
                  >
                    Cargar imágenes
                  </label>

                <input
                  id="imagenes"
                  type="file"
                  multiple
                  accept="image/jpeg"
                  className="hidden"
                  onChange={(e) => {
                    if (!e.target.files) return;
                    let files = Array.from(e.target.files);

                    // Limitar a máximo 6
                    if (files.length > 6) {
                      alert("Solo puedes subir hasta 6 imágenes por evento.");
                      setNewEvent((prev) => ({ ...prev, imagenes: [] }));
                      setPreview([]); // limpia las previews
                      return; // salir de la función
                    }

                    // Si cumple la regla → guardar y mostrar previews
                    setNewEvent((prev) => ({ ...prev, imagenes: files }));

                    const previews = files.map((file) => URL.createObjectURL(file));
                    setPreview(previews);
                  }}
                />
                  {preview.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {preview.map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          alt={`preview-${i}`}
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  <label htmlFor="documento" className="font-medium">
                    Permiso del IMCT
                  </label>

                  {/* Botón estilizado */}
                  <label
                    htmlFor="documento"
                    className="cursor-pointer rounded-md border px-3 py-1 bg-blue-500 text-white text-sm hover:bg-blue-600 w-60 text-center"
                  >
                    Cargar PDF
                  </label>

                  {/* Input oculto */}
                  <input
                    id="documento"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (!e.target.files) return;
                      const file = e.target.files[0];

                      // Validar que sea PDF
                      if (file && file.type !== "application/pdf") {
                        alert("Solo se permiten archivos PDF.");
                        return;
                      }

                      // Guardar en tu estado
                      setNewEvent((prev) => ({ ...prev, documento: file }));
                    }}
                  />

                  {/* Mostrar nombre del archivo */}
                  {newEvent.documento && (
                    <p className="text-sm text-gray-600 mt-2">
                      Archivo seleccionado: {newEvent.documento.name}
                    </p>
                  )}
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
                key={event.id_evento ?? event.id}
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
                      onClick={() => handleEventExpand(event.id_evento ?? event.id)}
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
