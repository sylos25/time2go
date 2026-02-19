"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, X } from "lucide-react";
import { NumericFormat } from "react-number-format";
// imageCompression removed — file upload UI simplified
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface ImagenEvento {
  id_imagen_evento: number;
  url_imagen_evento: string;
}

export default function CrearEventoPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [categorias, setCategorias] = useState<{ id_categoria_evento: number; nombre: string }[]>([]);
  const [tiposDeEvento, setTiposDeEvento] = useState<{ id_tipo_evento: number; nombre: string }[]>([]);
  const [sitios, setSitios] = useState<{ id_sitio: number; nombre_sitio: string }[]>([]);
  const [busquedaSitio, setBusquedaSitio] = useState("");
  const [busquedaMunicipio, setBusquedaMunicipio] = useState("");
  const [municipios, setMunicipios] = useState([]);
  const [showTelefono2, setShowTelefono2] = useState(false);
  // image preview state removed (no image upload in simplified form)
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    nombre_evento?: string;
    pulep_evento?: string;
    responsable_evento?: string;
    id_categoria_evento?: string;
    id_tipo_evento?: string;
    id_sitio?: string;
    descripcion?: string;
    informacion_adicional?: string;
    telefono1?: string;
    telefono2?: string;
    fecha_inicio?: string;
    fecha_final?: string;
    hora_inicio?: string;
    hora_final?: string;
    cupo?: string;
    boletas?: string;
    imagenes?: string;
    documento?: string;
    general?: string;
  }>({});

  const setFieldError = (field: keyof typeof formErrors, message: string) => {
    setFormErrors({ [field]: message });
  };

  const clearFieldError = (field: keyof typeof formErrors) => {
    setFormErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
  };

  const [newEvent, setNewEvent] = useState<any>({
    nombre_evento: "",
    pulep_evento: "",
    responsable_evento: "",
    id_usuario: "",
    id_categoria_evento: 0,
    id_tipo_evento: 0,
    id_sitio: 0,
    descripcion: "",
    informacion_adicional: "",
    telefono1: "",
    telefono2: "",
    fecha_inicio: null as Date | null,
    fecha_final: null as Date | null,
    diasSeleccionados: [] as Date[],
    hora_inicio: "",
    hora_final: "",
    pago: false,
    reservar_anticipado: false,
    boletas: [{ nombre_boleto: "", precio_boleto: "", servicio: "" }],
    linksBoleteria: [""] as string[],
    cupo: "",
    estado: false,
    imagenes: [] as File[],
    documento: null,
    highlights: [],
    additionalImages: [],
  });

  // Handler para el campo `cupo`
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") return setNewEvent({ ...newEvent, cupo: "" });
    const num = Number(value);
    if (!Number.isNaN(num)) {
      if (num >= 1 && num <= 5000) setNewEvent({ ...newEvent, cupo: num });
    }
  };

  // Generar rango de fechas entre fecha_inicio y fecha_final
  const generarRangoDias = (inicio: Date | null, fin: Date | null): Date[] => {
    if (!inicio || !fin) return [];
    const diasArray: Date[] = [];
    const current = new Date(inicio);
    current.setHours(0, 0, 0, 0);
    const end = new Date(fin);
    end.setHours(0, 0, 0, 0);
    
    while (current <= end) {
      diasArray.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return diasArray;
  };

  // Toggle selección de un día
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

  // Helper para formatear fecha
  const formatDia = (date: Date): string => {
    const opciones: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "numeric" };
    return date.toLocaleDateString("es-ES", opciones);
  };

  // Handlers para boletas (tabla_boleteria)
  const addBoletaField = () => {
    if (newEvent.boletas.length < 12) {
      setNewEvent({ ...newEvent, boletas: [...newEvent.boletas, { nombre_boleto: "", precio_boleto: "", servicio: "" }] });
    }
  };

  const updateBoleta = (index: number, field: string, value: string) => {
    const updatedBoletas = [...newEvent.boletas];
    updatedBoletas[index][field] = value;
    setNewEvent({ ...newEvent, boletas: updatedBoletas });
  };

  const removeBoletaField = (index: number) => {
    const updatedBoletas = newEvent.boletas.filter((_: any, i: number) => i !== index);
    setNewEvent({ ...newEvent, boletas: updatedBoletas });
  };

  const removeAllBoletas = () => {
    setNewEvent((prev: any) => ({ ...prev, boletas: [{ nombre_boleto: "", precio_boleto: "", servicio: "" }] }));
  };

  // ticket link handlers removed from UI (kept as optional server-side field)

  // image upload handler removed (no image upload in simplified form)

  // Fetch categorías
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

  // Authorization: ensure user is authenticated and has permission to create events
  useEffect(() => {
    let cancelled = false;
    const checkAuth = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch('/api/me', { headers, credentials: 'include' });
        if (!res.ok) {
          if (!cancelled) setAuthorized(false);
          return;
        }
        const data = await res.json();
        const roleNum = data?.user?.id_rol !== undefined ? Number(data.user.id_rol) : undefined;
        if (roleNum === undefined || Number.isNaN(roleNum)) {
          if (!cancelled) setAuthorized(false);
          return;
        }

        const permissionRes = await fetch(
          `/api/permissions/check?id_accesibilidad=1&id_rol=${roleNum}`,
          { headers, credentials: 'include' }
        );

        if (!permissionRes.ok) {
          if (!cancelled) setAuthorized(false);
          return;
        }

        const permissionData = await permissionRes.json();
        if (!cancelled) setAuthorized(Boolean(permissionData?.hasAccess));
      } catch (err) {
        console.error('Auth check error', err);
        if (!cancelled) setAuthorized(false);
      }
    }
    checkAuth();
    return () => { cancelled = true }
  }, [router]);

  // Fetch tipos de evento
  useEffect(() => {
    const fetchTiposDeEvento = async () => {
      if (!newEvent.id_categoria_evento || newEvent.id_categoria_evento === 0) {
        setTiposDeEvento([]);
        return;
      }
  
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

  // Fetch sitios
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

  // Fetch municipios
  useEffect(() => {
    if (newEvent.id_sitio) {
      fetch(`/api/municipios?sitioId=${newEvent.id_sitio}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.length > 0) {
            setBusquedaMunicipio(data[0].nombre_municipio);
          } else {
            setBusquedaMunicipio("");
          }
        })
        .catch((err) => console.error("Error cargando municipios:", err));
    } else {
      setBusquedaMunicipio("");
    }
  }, [newEvent.id_sitio]);

  const handleAddEvent = async () => {
    try {
      setFormErrors({});
      setIsLoading(true);

      // Validaciones según la tabla_eventos
      if (!newEvent.nombre_evento || newEvent.nombre_evento.length < 6) {
        setFieldError("nombre_evento", "El nombre del evento debe tener al menos 6 caracteres.");
        return;
      }

      if (!newEvent.pulep_evento || newEvent.pulep_evento.length < 6) {
        setFieldError("pulep_evento", "El código público del evento debe tener al menos 6 caracteres.");
        return;
      }

      if (!newEvent.responsable_evento || newEvent.responsable_evento.length < 6) {
        setFieldError("responsable_evento", "El nombre del responsable debe tener al menos 6 caracteres.");
        return;
      }

      if (!newEvent.descripcion || newEvent.descripcion.length < 10) {
        setFieldError("descripcion", "La descripción debe tener al menos 10 caracteres.");
        return;
      }

      if (!newEvent.informacion_adicional || newEvent.informacion_adicional.length < 100) {
        setFieldError("informacion_adicional", "La información adicional debe tener al menos 100 caracteres.");
        return;
      }

      if (!newEvent.telefono1 || newEvent.telefono1.length !== 10 || Number(newEvent.telefono1) <= 2999999999) {
        setFieldError("telefono1", "El teléfono debe tener 10 dígitos y ser válido (mayor a 2999999999).");
        return;
      }

      if (newEvent.telefono2 && (newEvent.telefono2.length !== 10 || Number(newEvent.telefono2) <= 2999999999)) {
        setFieldError("telefono2", "El teléfono 2 debe tener 10 dígitos y ser válido (mayor a 2999999999).");
        return;
      }

      if (!newEvent.id_categoria_evento || newEvent.id_categoria_evento === 0) {
        setFieldError("id_categoria_evento", "Debes seleccionar una categoría.");
        return;
      }

      if (!newEvent.id_tipo_evento || newEvent.id_tipo_evento === 0) {
        setFieldError("id_tipo_evento", "Debes seleccionar un tipo de evento.");
        return;
      }

      if (!newEvent.id_sitio || newEvent.id_sitio === 0) {
        setFieldError("id_sitio", "Debes seleccionar un sitio.");
        return;
      }

      if (!newEvent.fecha_inicio) {
        setFieldError("fecha_inicio", "Debes seleccionar una fecha de inicio.");
        return;
      }

      if (!newEvent.fecha_final) {
        setFieldError("fecha_final", "Debes seleccionar una fecha final.");
        return;
      }

      if (!newEvent.hora_inicio) {
        setFieldError("hora_inicio", "Debes seleccionar una hora de inicio.");
        return;
      }

      if (!newEvent.hora_final) {
        setFieldError("hora_final", "Debes seleccionar una hora final.");
        return;
      }

      if (!newEvent.cupo || Number(newEvent.cupo) < 1 || Number(newEvent.cupo) > 5000) {
        setFieldError("cupo", "El aforo debe estar entre 1 y 5000.");
        return;
      }

      // Validaciones para eventos de pago
      if (newEvent.pago) {
        const boletasValidas = newEvent.boletas.filter((b: any) => b.nombre_boleto && b.precio_boleto);
        if (boletasValidas.length === 0) {
          setFieldError("boletas", "Debes definir al menos una boleta con nombre y precio.");
          return;
        }
        
        for (let boleta of boletasValidas) {
          if (boleta.nombre_boleto.length < 3) {
            setFieldError("boletas", "Cada nombre de boleta debe tener al menos 3 caracteres.");
            return;
          }
          if (Number(boleta.precio_boleto) < 0) {
            setFieldError("boletas", "El precio de la boleta no puede ser negativo.");
            return;
          }
          if (boleta.servicio && Number(boleta.servicio) < 0) {
            setFieldError("boletas", "El cargo por servicio no puede ser negativo.");
            return;
          }
        }

        // ticket purchase links are optional in simplified form
      }

      const formData = new FormData();

      formData.append("nombre_evento", newEvent.nombre_evento);
      formData.append("pulep_evento", newEvent.pulep_evento);
      formData.append("responsable_evento", newEvent.responsable_evento);
      formData.append("descripcion", newEvent.descripcion);
      formData.append("informacion_adicional", newEvent.informacion_adicional);
      
      const fechaInicioStr = newEvent.fecha_inicio ? newEvent.fecha_inicio.toISOString().split('T')[0] : "";
      const fechaFinalStr = newEvent.fecha_final ? newEvent.fecha_final.toISOString().split('T')[0] : "";
      formData.append("fecha_inicio", fechaInicioStr);
      formData.append("fecha_fin", fechaFinalStr);
      formData.append("hora_inicio", newEvent.hora_inicio || "");
      formData.append("hora_final", newEvent.hora_final || "");
      
      const diasStrings = (newEvent.diasSeleccionados || []).map((d: Date) => d.toISOString().split('T')[0]);
      formData.append("dias_semana", JSON.stringify(diasStrings));
      
      const storedUserId = localStorage.getItem('userId') || localStorage.getItem('userDocument') || "";
      formData.append("id_usuario", String(newEvent.id_usuario || storedUserId));
      formData.append("id_categoria_evento", String(newEvent.id_categoria_evento || 0));
      formData.append("id_tipo_evento", String(newEvent.id_tipo_evento || 0));
      formData.append("id_sitio", String(newEvent.id_sitio || 0));
      formData.append("telefono_1", newEvent.telefono1 || newEvent.telefono_1 || "");
      formData.append("telefono_2", newEvent.telefono2 || newEvent.telefono_2 || "");
      formData.append("gratis_pago", String(newEvent.pago ?? false));
      formData.append("reservar_anticipado", String(newEvent.reservar_anticipado ?? false));
      
      // Boletas (tabla_boleteria)
      formData.append("boletas", JSON.stringify(newEvent.boletas || []));
      
      // Links de compra (tabla_links) are optional and handled server-side if provided
      
      formData.append("cupo", String(newEvent.cupo || 0));
      formData.append("estado", String(newEvent.estado ?? false));

      (newEvent.imagenes || []).forEach((file: File) => {
        formData.append("additionalImages", file);
      });

      if (newEvent.documento) {
        formData.append("documento", newEvent.documento);
      }

      const res = await fetch("/api/events", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        const message = String(payload?.message || "Error al crear el evento");
        if (message.toLowerCase().includes("imagen")) {
          setFormErrors({ imagenes: message });
        } else if (message.toLowerCase().includes("document")) {
          setFormErrors({ documento: message });
        } else {
          setFormErrors({ general: message });
        }
        return;
      }

      alert("¡Evento creado exitosamente!");
      router.push("/eventos");
    } catch (error) {
      console.error("Error al guardar el evento:", error);
      setFormErrors({ general: "Error al crear el evento. Intenta nuevamente." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header isLoggedIn={true} />
      <main className="flex-grow bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="pt-24 pb-16">
          {authorized === false && (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
                <h2 className="text-2xl font-semibold text-red-600">Acceso denegado</h2>
                <p className="mt-4 text-gray-600">No estás autorizado para crear eventos. Inicia sesión con una cuenta que tenga permisos.</p>
                <div className="mt-6">
                  <Button onClick={() => router.push('/')} className="bg-lime-600 text-white">Volver al inicio</Button>
                </div>
              </div>
            </div>
          )}
          {authorized === null ? (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
              <div className="text-gray-600">Comprobando permisos...</div>
            </div>
          ) : authorized === true ? (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header with back button */}
              <div className="flex items-center gap-4 mb-8">
                <Button
                  onClick={() => router.back()}
                  variant="ghost"
                  className="rounded-full h-10 w-10 p-0 hover:bg-gray-200"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="ml-45 text-center">
                  <h1 className="text-4xl font-bold bg-gradient-to-tr from-fuchsia-700 to-red-600 bg-clip-text text-transparent">Crear Nuevo Evento</h1>
                  <p className="text-gray-600 mt-2">Completa el formulario para crear tu evento</p>
                </div>
              </div>

              {/* Form */}
              <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
              {/* Basic Info */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Nombre del Evento</Label>
                  <Input
                    id="title"
                    value={newEvent.nombre_evento}
                    onChange={(e) => {
                      clearFieldError("nombre_evento");
                      setNewEvent({ ...newEvent, nombre_evento: e.target.value });
                    }}
                    placeholder="Nombre completo del evento (mínimo 6 caracteres)"
                    className="rounded-xl"
                  />
                  {formErrors.nombre_evento && (
                    <p className="text-xs text-red-600">{formErrors.nombre_evento}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pulep_evento">PULEP del evento</Label>
                  <Input
                    id="pulep_evento"
                    value={newEvent.pulep_evento}
                    onChange={(e) => {
                      clearFieldError("pulep_evento");
                      setNewEvent({ ...newEvent, pulep_evento: e.target.value });
                    }}
                    placeholder="Código único (mínimo 6 caracteres)"
                    className="rounded-xl"
                  />
                  <p className="text-xs text-gray-500">Este código identifica públicamente tu evento</p>
                  {formErrors.pulep_evento && (
                    <p className="text-xs text-red-600">{formErrors.pulep_evento}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsable_evento">Nombre de la entidad responsable del evento</Label>
                  <Input
                    id="responsable_evento"
                    value={newEvent.responsable_evento}
                    onChange={(e) => {
                      clearFieldError("responsable_evento");
                      setNewEvent({ ...newEvent, responsable_evento: e.target.value });
                    }}
                    placeholder="Nombre completo (mínimo 6 caracteres)"
                    className="rounded-xl"
                  />
                  {formErrors.responsable_evento && (
                    <p className="text-xs text-red-600">{formErrors.responsable_evento}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="id_tipo_evento">Categoría del Evento</Label>
                    <Select
                      value={String(newEvent.id_categoria_evento || 0)}
                      onValueChange={(value) => {
                        clearFieldError("id_categoria_evento");
                        setNewEvent({ ...newEvent, id_categoria_evento: Number(value), id_tipo_evento: 0 });
                      }}
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
                    {formErrors.id_categoria_evento && (
                      <p className="text-xs text-red-600">{formErrors.id_categoria_evento}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Tipo de Evento</Label>
                    <Select
                      value={String(newEvent.id_tipo_evento || 0)}
                      onValueChange={(value) =>
                        {
                          clearFieldError("id_tipo_evento");
                          setNewEvent({ ...newEvent, id_tipo_evento: Number(value) });
                        }
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
                    {formErrors.id_tipo_evento && (
                      <p className="text-xs text-red-600">{formErrors.id_tipo_evento}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 relative">
                  <Label htmlFor="sitio">Sitio del evento</Label>
                  <Input
                    id="sitio"
                    value={busquedaSitio}
                    onChange={(e) => {
                      clearFieldError("id_sitio");
                      setBusquedaSitio(e.target.value);
                      setNewEvent({ ...newEvent, id_sitio: 0 });
                    }}
                    placeholder="Escribe el nombre del sitio donde será el evento"
                    className="rounded-xl"
                  />
                  {formErrors.id_sitio && (
                    <p className="text-xs text-red-600">{formErrors.id_sitio}</p>
                  )}
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

              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción del evento</Label>
                <Textarea
                  id="description"
                  value={newEvent.descripcion}
                  onChange={(e) => {
                    clearFieldError("descripcion");
                    setNewEvent({ ...newEvent, descripcion: e.target.value });
                  }}
                  placeholder="Descripción breve del evento (mínimo 10 caracteres)"
                  className="rounded-xl min-h-[100px]"
                />
                <p className="text-xs text-gray-500">
                  {newEvent.descripcion.length}/∞ caracteres (mínimo 10)
                </p>
                {formErrors.descripcion && (
                  <p className="text-xs text-red-600">{formErrors.descripcion}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullDescription">Información adicional del evento</Label>
                <Textarea
                  id="fullDescription"
                  value={newEvent.informacion_adicional}
                  onChange={(e) => {
                    clearFieldError("informacion_adicional");
                    setNewEvent({ ...newEvent, informacion_adicional: e.target.value });
                  }}
                  placeholder="Información detallada y adicional del evento (mínimo 100 caracteres). Incluye detalles sobre qué esperar, normas de comportamiento, seguridad, accesibilidad, etc."
                  className="rounded-xl min-h-[150px]"
                />
                <p className="text-xs text-gray-500">
                  {newEvent.informacion_adicional.length}/∞ caracteres (mínimo 100)
                </p>
                {formErrors.informacion_adicional && (
                  <p className="text-xs text-red-600">{formErrors.informacion_adicional}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono1">Teléfono del organizador del evento</Label>
                <Input
                  id="telefono1"
                  value={newEvent.telefono1}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,10}$/.test(value)) {
                      clearFieldError("telefono1");
                      setNewEvent({ ...newEvent, telefono1: value });
                    }
                  }}
                  placeholder="Teléfono 1"
                  className="rounded-xl"
                  maxLength={10}
                  inputMode="numeric"
                  pattern="\d*"
                />
                {formErrors.telefono1 && (
                  <p className="text-xs text-red-600">{formErrors.telefono1}</p>
                )}
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
                        clearFieldError("telefono2");
                        setNewEvent({ ...newEvent, telefono2: value });
                      }
                    }}
                    placeholder="Teléfono 2"
                    className="rounded-xl"
                    maxLength={10}
                    inputMode="numeric"
                    pattern="\d*"
                  />
                  {formErrors.telefono2 && (
                    <p className="text-xs text-red-600">{formErrors.telefono2}</p>
                  )}
                  <Button
                    type="button"
                    onClick={() => {
                      setShowTelefono2(false);
                      setNewEvent({ ...newEvent, telefono2: "" });
                    }}
                    className="cursor-pointer rounded-md border px-2 py-1 bg-red-500 text-white text-sm hover:bg-red-600 w-60 text-center"
                  >
                    – Quitar teléfono
                  </Button>
                </div>
              )}

              {/* Dates and Times */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fecha_inicio">Fecha de inicio del evento</Label>
                  <DatePicker
                    id="fecha_inicio"
                    selected={newEvent.fecha_inicio}
                    onChange={(date) => {
                      clearFieldError("fecha_inicio");
                      setNewEvent({ ...newEvent, fecha_inicio: date });
                    }}
                    dateFormat="dd/MM/yyyy"
                    minDate={new Date()}
                    placeholderText="01/01/2025"
                    className="cursor-pointer w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                  />
                  {formErrors.fecha_inicio && (
                    <p className="text-xs text-red-600">{formErrors.fecha_inicio}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_final">Fecha final del evento</Label>
                  <DatePicker
                    id="fecha_final"
                    selected={newEvent.fecha_final}
                    onChange={(date) =>
                      {
                        clearFieldError("fecha_final");
                        setNewEvent({
                          ...newEvent,
                          fecha_final: date,
                          diasSeleccionados: []
                        })
                      }
                    }
                    dateFormat="dd/MM/yyyy"
                    minDate={newEvent.fecha_inicio || new Date()} 
                    placeholderText="31/12/2025"
                    className="cursor-pointer w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                  />
                  {formErrors.fecha_final && (
                    <p className="text-xs text-red-600">{formErrors.fecha_final}</p>
                  )}
                </div>
              </div>

              {/* Times */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="time">Hora de inicio</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newEvent.hora_inicio}
                    onChange={(e) => {
                      clearFieldError("hora_inicio");
                      setNewEvent({ ...newEvent, hora_inicio: e.target.value });
                    }}
                    className="rounded-xl"
                  />
                  {formErrors.hora_inicio && (
                    <p className="text-xs text-red-600">{formErrors.hora_inicio}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Hora final</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newEvent.hora_final}
                    onChange={(e) => {
                      clearFieldError("hora_final");
                      setNewEvent({ ...newEvent, hora_final: e.target.value });
                    }}
                    className="rounded-xl"
                  />
                  {formErrors.hora_final && (
                    <p className="text-xs text-red-600">{formErrors.hora_final}</p>
                  )}
                </div>
              </div>

              {/* Ticket Type */}
              <div className="space-y-4 p-4 border rounded-lg shadow-md">
                <div className="flex gap-6 items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipoEntrada"
                      checked={!newEvent.pago}
                      onChange={() =>
                        setNewEvent({
                          ...newEvent,
                          pago: false,
                          reservar_anticipado: false,
                          boletas: [{ nombre_boleto: "", precio_boleto: "", servicio: "" }],
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
                      onChange={() => setNewEvent({ ...newEvent, pago: true, reservar_anticipado: false })}
                    />
                    Pago
                  </label>
                </div>

                {!newEvent.pago && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <input
                      id="reservar_anticipado"
                      type="checkbox"
                      checked={newEvent.reservar_anticipado}
                      onChange={(e) => setNewEvent({ ...newEvent, reservar_anticipado: e.target.checked })}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="reservar_anticipado" className="cursor-pointer">
                      <span className="font-medium text-gray-900">¿Se requiere reserva anticipada?</span>
                      <p className="text-xs text-gray-600">Marca esta opción si los usuarios deben reservar entrada antes del evento</p>
                    </label>
                  </div>
                )}

                {newEvent.pago && (
                  <div className="space-y-4 p-4 border rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold cursor-default">Tipos de Boletas y Precios</h2>
                    <p className="text-xs text-gray-600 italic -translate-y-3 cursor-default"> 
                      Define los diferentes tipos de boletas disponibles para tu evento con sus precios. Según tabla_boleteria.
                    </p>
                    {formErrors.boletas && (
                      <p className="text-xs text-red-600">{formErrors.boletas}</p>
                    )}
                    {newEvent.boletas.map((boleta: any, index: number) => (
                      <div key={index} className="space-y-3 p-3 bg-gray-50 rounded-lg">
                        <div className="space-y-2">
                          <Label className="text-xs">Nombre de la boleta *</Label>
                          <Input
                            type="text"
                            value={boleta.nombre_boleto}
                            onChange={(e) => updateBoleta(index, "nombre_boleto", e.target.value)}
                            placeholder="Ej: General, VIP, Early Bird (mínimo 3 caracteres)"
                            className="rounded-xl text-sm"
                          />
                          <p className="text-xs text-gray-500">{boleta.nombre_boleto.length} caracteres</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs">Precio *</Label>
                            <NumericFormat
                              value={boleta.precio_boleto}
                              prefix="$"
                              thousandSeparator="."
                              decimalSeparator=","
                              onValueChange={(values) => updateBoleta(index, "precio_boleto", values.value)}
                              placeholder="$0"
                              className="rounded-xl border px-2 py-1 w-full text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Cargo por servicio (opcional)</Label>
                            <NumericFormat
                              value={boleta.servicio}
                              prefix="$"
                              thousandSeparator="."
                              decimalSeparator=","
                              onValueChange={(values) => updateBoleta(index, "servicio", values.value)}
                              placeholder="$0"
                              className="rounded-xl border px-2 py-1 w-full text-sm"
                            />
                            <p className="text-xs text-gray-500">Cargo adicional por procesamiento/plataforma</p>
                          </div>
                        </div>

                        {newEvent.boletas.length > 1 && newEvent.pago && (
                          <button
                            type="button"
                            onClick={() => removeBoletaField(index)}
                            className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 cursor-pointer text-sm w-full">
                            Quitar
                          </button>
                        )}
                      </div>
                    ))}
                    <div className="flex justify-between items-center gap-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={addBoletaField}
                          disabled={newEvent.boletas.length >= 12}
                          className={`px-3 py-1 rounded-md text-white text-sm ${
                            newEvent.boletas.length >= 12
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                          }`}>
                          + Añadir tipo de boleta
                        </button>
                        {newEvent.boletas.length >= 2 && (
                          <button
                            type="button"
                            onClick={removeAllBoletas}
                            className="px-3 py-1 rounded-md text-white bg-red-600 hover:bg-red-700 cursor-pointer text-sm">
                            Eliminar todas
                          </button>
                        )}
                      </div>
                      <span className="text-sm text-gray-600">
                        {newEvent.boletas.length}/12 tipos de boletas
                      </span>
                    </div>
                  </div>
                )}
              </div>

              

              {/* Capacity */}
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
                  onChange={(e) => {
                    clearFieldError("cupo");
                    handleChange(e);
                  }}
                  placeholder="100"
                  className="rounded-xl border px-2 py-1 w-full"
                />
                <p className="text-sm text-gray-500">
                  Ingrese un número entre 1 y 5000
                </p>
                {formErrors.cupo && (
                  <p className="text-xs text-red-600">{formErrors.cupo}</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="imagenes_evento">Fotos del evento</Label>
                  <Input
                    id="imagenes_evento"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 8) {
                        setFieldError("imagenes", "Puedes cargar maximo 8 imagenes.");
                      }
                      clearFieldError("imagenes");
                      setNewEvent({ ...newEvent, imagenes: files.slice(0, 8) });
                    }}
                    className="rounded-xl"
                  />
                  <p className="text-xs text-gray-500">Se guardan en la tabla_imagenes_eventos</p>
                  {formErrors.imagenes && (
                    <p className="text-xs text-red-600">{formErrors.imagenes}</p>
                  )}
                  {newEvent.imagenes && newEvent.imagenes.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                      {newEvent.imagenes.map((file: File, index: number) => (
                        <div key={`${file.name}-${index}`} className="rounded-xl border bg-white p-2 shadow-sm">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="h-24 w-full rounded-lg object-cover"
                          />
                          <p className="mt-2 text-xs text-gray-600 truncate">{file.name}</p>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (newEvent.imagenes || []).filter((_: File, i: number) => i !== index);
                              setNewEvent({ ...newEvent, imagenes: updated });
                            }}
                            className="mt-2 w-full rounded-md border px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                          >
                            Quitar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500">{(newEvent.imagenes || []).length}/8 imagenes</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documento_evento">Documento del evento</Label>
                  <Input
                    id="documento_evento"
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => {
                      const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                      if (file && file.size > 5 * 1024 * 1024) {
                        setFieldError("documento", "El documento no puede superar 5 MB.");
                        setNewEvent({ ...newEvent, documento: null });
                        return;
                      }
                      clearFieldError("documento");
                      setNewEvent({ ...newEvent, documento: file });
                    }}
                    className="rounded-xl"
                  />
                  <p className="text-xs text-gray-500">Se guarda en la tabla_documentos_eventos</p>
                  {formErrors.documento && (
                    <p className="text-xs text-red-600">{formErrors.documento}</p>
                  )}
                  {newEvent.documento && (
                    <div className="mt-2 rounded-xl border bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{newEvent.documento.name}</p>
                          <p className="text-xs text-gray-600">
                            {(newEvent.documento.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNewEvent({ ...newEvent, documento: null })}
                          className="rounded-md border px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <Button
                  onClick={handleAddEvent}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-700 hover:to-cyan-700 rounded-xl py-6 text-lg font-semibold"
                >
                  {isLoading ? "Creando..." : "Crear Evento"}
                </Button>
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  disabled={isLoading}
                  className="flex-1 rounded-xl py-6 text-lg"
                >
                  Cancelar
                </Button>
              </div>
              {formErrors.general && (
                <p className="text-sm text-red-600">{formErrors.general}</p>
              )}
            </div>
          </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
    );
  }
