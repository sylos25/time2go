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
import imageCompression from "browser-image-compression";
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
  const [preview, setPreview] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

    if (files.length > 6) {
      alert("Solo puedes subir 6 imágenes por evento.");
      files = files.slice(0, 6);
    }

    const compressedFiles = await Promise.all(
      files.map(async (file) => {
        if (file.type !== "image/jpeg") {
          alert("Solo se permiten imágenes en formato JPG.");
          return null;
        }

        const options = {
          maxSizeMB: 2,
          maxWidthOrHeight: 1280,
          useWebWorker: true,
        };
        return await imageCompression(file, options);
      })
    );

    const validFiles = compressedFiles.filter((f): f is File => f !== null);
    setNewEvent((prev: any) => ({ ...prev, imagenes: validFiles }));

    const previews = validFiles.map((file) => URL.createObjectURL(file));
    setPreview(previews);
  };

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

  // Authorization: ensure user is authenticated and has role 4 to create events
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
        if (!cancelled) setAuthorized(roleNum === 4);
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
      setIsLoading(true);

      // Validaciones según la tabla_eventos
      if (!newEvent.nombre_evento || newEvent.nombre_evento.length < 6) {
        alert("El nombre del evento debe tener al menos 6 caracteres.");
        return;
      }

      if (!newEvent.pulep_evento || newEvent.pulep_evento.length < 6) {
        alert("El código público del evento debe tener al menos 6 caracteres.");
        return;
      }

      if (!newEvent.responsable_evento || newEvent.responsable_evento.length < 6) {
        alert("El nombre del responsable debe tener al menos 6 caracteres.");
        return;
      }

      if (!newEvent.descripcion || newEvent.descripcion.length < 10) {
        alert("La descripción debe tener al menos 10 caracteres.");
        return;
      }

      if (!newEvent.informacion_adicional || newEvent.informacion_adicional.length < 100) {
        alert("La información adicional debe tener al menos 100 caracteres.");
        return;
      }

      if (!newEvent.telefono1 || newEvent.telefono1.length !== 10 || Number(newEvent.telefono1) <= 2999999999) {
        alert("El teléfono debe tener 10 dígitos y ser válido (mayor a 2999999999).");
        return;
      }

      if (newEvent.telefono2 && (newEvent.telefono2.length !== 10 || Number(newEvent.telefono2) <= 2999999999)) {
        alert("El teléfono 2 debe tener 10 dígitos y ser válido (mayor a 2999999999).");
        return;
      }

      if (!newEvent.id_categoria_evento || newEvent.id_categoria_evento === 0) {
        alert("Debes seleccionar una categoría.");
        return;
      }

      if (!newEvent.id_tipo_evento || newEvent.id_tipo_evento === 0) {
        alert("Debes seleccionar un tipo de evento.");
        return;
      }

      if (!newEvent.id_sitio || newEvent.id_sitio === 0) {
        alert("Debes seleccionar un sitio.");
        return;
      }

      if (!newEvent.fecha_inicio) {
        alert("Debes seleccionar una fecha de inicio.");
        return;
      }

      if (!newEvent.fecha_final) {
        alert("Debes seleccionar una fecha final.");
        return;
      }

      if (!newEvent.hora_inicio) {
        alert("Debes seleccionar una hora de inicio.");
        return;
      }

      if (!newEvent.hora_final) {
        alert("Debes seleccionar una hora final.");
        return;
      }

      if (!newEvent.cupo || Number(newEvent.cupo) < 1 || Number(newEvent.cupo) > 5000) {
        alert("El aforo debe estar entre 1 y 5000.");
        return;
      }

      // Validaciones para eventos de pago
      if (newEvent.pago) {
        const boletasValidas = newEvent.boletas.filter((b: any) => b.nombre_boleto && b.precio_boleto);
        if (boletasValidas.length === 0) {
          alert("Debes definir al menos una boleta con nombre y precio.");
          return;
        }
        
        for (let boleta of boletasValidas) {
          if (boleta.nombre_boleto.length < 3) {
            alert("Cada nombre de boleta debe tener al menos 3 caracteres.");
            return;
          }
          if (Number(boleta.precio_boleto) < 0) {
            alert("El precio de la boleta no puede ser negativo.");
            return;
          }
          if (boleta.servicio && Number(boleta.servicio) < 0) {
            alert("El cargo por servicio no puede ser negativo.");
            return;
          }
        }

        const linksValidos = newEvent.linksBoleteria.filter((l: string) => l && l.trim());
        if (linksValidos.length === 0) {
          alert("Debes agregar al menos un link de compra para eventos de pago.");
          return;
        }
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
      
      // Boletas (tabla_boleteria)
      formData.append("boletas", JSON.stringify(newEvent.boletas || []));
      
      // Links de compra (tabla_links)
      formData.append("linksBoleteria", JSON.stringify(newEvent.linksBoleteria || []));
      
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

      if (!res.ok) throw new Error("Error al crear el evento");

      alert("¡Evento creado exitosamente!");
      router.push("/eventos");
    } catch (error) {
      console.error("Error al guardar el evento:", error);
      alert("Error al crear el evento. Intenta nuevamente.");
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
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">Crear Nuevo Evento</h1>
                  <p className="text-gray-600 mt-2">Completa el formulario para crear tu evento</p>
                </div>
              </div>

              {/* Form */}
              <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
              {/* Basic Info */}
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Nombre del Evento *</Label>
                  <Input
                    id="title"
                    value={newEvent.nombre_evento}
                    onChange={(e) => setNewEvent({ ...newEvent, nombre_evento: e.target.value })}
                    placeholder="Nombre completo del evento (mínimo 6 caracteres)"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pulep_evento">Código público del evento *</Label>
                  <Input
                    id="pulep_evento"
                    value={newEvent.pulep_evento}
                    onChange={(e) => setNewEvent({ ...newEvent, pulep_evento: e.target.value })}
                    placeholder="Código único (mínimo 6 caracteres)"
                    className="rounded-xl"
                  />
                  <p className="text-xs text-gray-500">Este código identifica públicamente tu evento</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsable_evento">Nombre del responsable del evento *</Label>
                  <Input
                    id="responsable_evento"
                    value={newEvent.responsable_evento}
                    onChange={(e) => setNewEvent({ ...newEvent, responsable_evento: e.target.value })}
                    placeholder="Nombre completo (mínimo 6 caracteres)"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="promotor_doc">ID de Usuario del Promotor *</Label>
                  <Input
                    id="promotor_doc"
                    value={newEvent.id_usuario}
                    onChange={(e) => setNewEvent({ ...newEvent, id_usuario: e.target.value })}
                    placeholder="1234567890"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="id_tipo_evento">Categoría del Evento *</Label>
                  <Select
                    value={String(newEvent.id_categoria_evento || 0)}
                    onValueChange={(value) =>setNewEvent({ ...newEvent, id_categoria_evento: Number(value), id_tipo_evento: 0 })}
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
                  <Label htmlFor="category">Tipo de Evento *</Label>
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
                  <Label htmlFor="sitio">Sitio del evento *</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="municipio">Municipio *</Label>
                  <Input
                    id="municipio"
                    value={busquedaMunicipio}
                    onChange={(e) => setBusquedaMunicipio(e.target.value)}
                    readOnly={!!newEvent.id_sitio}
                    placeholder="Ciudad del lugar donde se hará el evento."
                    className="rounded-xl cursor-default"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción del evento *</Label>
                <Textarea
                  id="description"
                  value={newEvent.descripcion}
                  onChange={(e) => setNewEvent({ ...newEvent, descripcion: e.target.value })}
                  placeholder="Descripción breve del evento (mínimo 10 caracteres)"
                  className="rounded-xl min-h-[100px]"
                />
                <p className="text-xs text-gray-500">
                  {newEvent.descripcion.length}/∞ caracteres (mínimo 10)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullDescription">Información adicional del evento *</Label>
                <Textarea
                  id="fullDescription"
                  value={newEvent.informacion_adicional}
                  onChange={(e) => setNewEvent({ ...newEvent, informacion_adicional: e.target.value })}
                  placeholder="Información detallada y adicional del evento (mínimo 100 caracteres). Incluye detalles sobre qué esperar, normas de comportamiento, seguridad, accesibilidad, etc."
                  className="rounded-xl min-h-[150px]"
                />
                <p className="text-xs text-gray-500">
                  {newEvent.informacion_adicional.length}/∞ caracteres (mínimo 100)
                </p>
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

              {/* Times */}
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
                      onChange={() => setNewEvent({ ...newEvent, pago: true })}
                    />
                    Pago
                  </label>
                </div>

                {newEvent.pago && (
                  <div className="space-y-4 p-4 border rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold cursor-default">Tipos de Boletas y Precios</h2>
                    <p className="text-xs text-gray-600 italic -translate-y-3 cursor-default"> 
                      Define los diferentes tipos de boletas disponibles para tu evento con sus precios. Según tabla_boleteria.
                    </p>
                    {newEvent.boletas.map((boleta: any, index: number) => (
                      <div key={index} className="space-y-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Label className="text-xs">Nombre de la boleta *</Label>
                            <Input
                              type="text"
                              value={boleta.nombre_boleto}
                              onChange={(e) => updateBoleta(index, "nombre_boleto", e.target.value)}
                              placeholder="Ej: General, VIP, Early Bird (mínimo 3 caracteres)"
                              className="rounded-xl text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">{boleta.nombre_boleto.length} caracteres</p>
                          </div>
                          <div className="w-32">
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
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex-1">
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
                            <p className="text-xs text-gray-500 mt-1">Cargo adicional por procesamiento/plataforma</p>
                          </div>
                          {newEvent.boletas.length > 1 && newEvent.pago && (
                            <div className="pt-5">
                              <button
                                type="button"
                                onClick={() => removeBoletaField(index)}
                                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 cursor-pointer text-sm">
                                Quitar
                              </button>
                            </div>
                          )}
                        </div>
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

              {/* Ticket Links */}
              {newEvent.pago && (
                <div className="space-y-4 p-4 border rounded-lg shadow-md bg-white-50 cursor-default">
                  <h2 className="text-lg font-semibold">Links de la boletería</h2>
                  <p className="text-xs text-gray-600 italic -translate-y-3 cursor-default"> 
                    Agrega los links donde los usuarios pueden comprar la entrada al evento.
                  </p>
                  {newEvent.linksBoleteria.map((link: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 -translate-y-3">
                      <Input
                        type="url"
                        value={link}
                        onChange={(e) => updateLinkBoleteria(index, e.target.value)}
                        placeholder="https://example.com/tickets"
                        className="rounded-xl flex-1"
                      />
                      {newEvent.linksBoleteria.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLinkBoleteria(index)}
                          className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-800 whitespace-nowrap cursor-pointer">
                          Quitar
                        </button>
                      )}
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
                  onChange={handleChange}
                  placeholder="100"
                  className="rounded-xl border px-2 py-1 w-full"
                />
                <p className="text-sm text-gray-500">
                  Ingrese un número entre 1 y 5000
                </p>
              </div>

              {/* Images */}
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
                  onChange={handleImageUpload}
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

              {/* PDF Document */}
              <div className="flex flex-col space-y-2">
                <label htmlFor="documento" className="font-medium">
                  Permiso del IMCT
                </label>

                <label
                  htmlFor="documento"
                  className="cursor-pointer rounded-md border px-3 py-1 bg-blue-500 text-white text-sm hover:bg-blue-600 w-60 text-center"
                >
                  Cargar PDF
                </label>

                <input
                  id="documento"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (!e.target.files) return;
                    const file = e.target.files[0];

                    if (file && file.type !== "application/pdf") {
                      alert("Solo se permiten archivos PDF.");
                      return;
                    }

                    setNewEvent((prev: any) => ({ ...prev, documento: file }));
                  }}
                />

                {newEvent.documento && (
                  <p className="text-sm text-gray-600 mt-2">
                    Archivo seleccionado: {newEvent.documento.name}
                  </p>
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
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
    );
  }
