"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { X, Upload, Loader } from "lucide-react"

interface EditEventModalProps {
  isOpen: boolean
  onClose: () => void
  event: any
  onSave: (updatedEvent: any) => Promise<void>
}

interface EventoInfoItem {
  detalle: string
  obligatorio: boolean
}

export function EditEventModal({ isOpen, onClose, event, onSave }: EditEventModalProps) {
  const [formData, setFormData] = useState({
    nombre_evento: "",
    pulep_evento: "",
    responsable_evento: "",
    descripcion: "",
    fecha_inicio: "",
    fecha_fin: "",
    hora_inicio: "",
    hora_final: "",
    cupo: "",
    id_categoria_evento: "",
    id_tipo_evento: "",
    id_sitio: "",
    telefono_1: "",
    telefono_2: "",
    gratis_pago: false,
    reservar_anticipado: false,
  })

  const [images, setImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<any[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [eventTypes, setEventTypes] = useState<any[]>([])
  const [sites, setSites] = useState<any[]>([])
  const [busquedaSitio, setBusquedaSitio] = useState<string>("")
  const [busquedaMunicipio, setBusquedaMunicipio] = useState<string>("")
  const [municipalities, setMunicipalities] = useState<any[]>([])
  const [boletas, setBoletas] = useState<Array<{ nombre_boleto: string; precio_boleto: string; servicio: string }>>([
    { nombre_boleto: "", precio_boleto: "", servicio: "" },
  ])
  const [informacionAdicionalItems, setInformacionAdicionalItems] = useState<EventoInfoItem[]>([
    { detalle: "", obligatorio: true },
  ])
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen && event) {
      loadEventData()
      loadDropdownData()
    }
  }, [isOpen, event])

  // Fetch sitios as user types (like crear page)
  useEffect(() => {
    const fetchSitios = async () => {
      if (!busquedaSitio || busquedaSitio.length < 2 || formData.id_sitio) return;
      try {
        const res = await fetch(`/api/llamar_sitio?nombre_sitio=${encodeURIComponent(busquedaSitio)}`)
        const data = await res.json()
        setSites(Array.isArray(data) ? data : [])
      } catch (e) {
        setSites([])
      }
    }
    fetchSitios()
  }, [busquedaSitio, formData.id_sitio])

  // When id_sitio changes, try to load municipios (like crear page)
  useEffect(() => {
    const fetchMunicipios = async () => {
      if (!formData.id_sitio) {
        setBusquedaMunicipio("")
        setMunicipalities([])
        return
      }
      try {
        const res = await fetch(`/api/municipios?sitioId=${formData.id_sitio}`)
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setBusquedaMunicipio(data[0].nombre_municipio || "")
          setMunicipalities(data)
        } else {
          setBusquedaMunicipio("")
          setMunicipalities([])
        }
      } catch (e) {
        console.error('Error cargando municipios:', e)
        setBusquedaMunicipio("")
        setMunicipalities([])
      }
    }
    fetchMunicipios()
  }, [formData.id_sitio])

  const loadEventData = async () => {
    setLoading(true)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const headers: any = {}
      if (token) headers["Authorization"] = `Bearer ${token}`

      // Fetch the full event data from API
      const response = await fetch(`/api/events?id=${event.id}&includeAll=true`, {
        headers,
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        const fullEvent = data.event || event

        setFormData({
          nombre_evento: fullEvent.nombre_evento || event.name || "",
          pulep_evento: fullEvent.pulep_evento || "",
          responsable_evento: fullEvent.responsable_evento || "",
          descripcion: fullEvent.descripcion || "",
          fecha_inicio: fullEvent.fecha_inicio ? String(fullEvent.fecha_inicio).slice(0, 10) : (event.date || ""),
          fecha_fin: fullEvent.fecha_fin ? String(fullEvent.fecha_fin).slice(0, 10) : "",
          hora_inicio: fullEvent.hora_inicio || event.time || "",
          hora_final: fullEvent.hora_final || "",
          cupo: fullEvent.cupo?.toString() || event.capacity?.toString() || "",
          id_categoria_evento: String(fullEvent.id_categoria_evento || fullEvent.evento_categoria_id || "") || "",
          id_tipo_evento: String(fullEvent.id_tipo_evento || fullEvent.evento_tipo_id || "") || "",
          id_sitio: String(fullEvent.id_sitio) || "",
          telefono_1: fullEvent.telefono_1 || "",
          telefono_2: fullEvent.telefono_2 || "",
          gratis_pago: fullEvent.gratis_pago || false,
          reservar_anticipado: fullEvent.reservar_anticipado || false,
        })

        setExistingImages(fullEvent.imagenes || [])
        // set search strings for sitio/municipio to show in inputs
        setBusquedaSitio(fullEvent.nombre_sitio || fullEvent.nombre || "")
        setBusquedaMunicipio(fullEvent.nombre_municipio || "")
        if (fullEvent.valores && Array.isArray(fullEvent.valores) && fullEvent.valores.length > 0) {
          setBoletas(
            fullEvent.valores.map((v: any) => ({
              nombre_boleto: v.nombre_boleto || v.nombre_categoria_boleto || "",
              precio_boleto: String(v.precio_boleto ?? v.valor ?? ""),
              servicio: String(v.servicio ?? ""),
            }))
          )
        } else {
          setBoletas([{ nombre_boleto: "", precio_boleto: "", servicio: "" }])
        }

        if (fullEvent.informacion_importante?.detalle) {
          const detalleBruto = String(fullEvent.informacion_importante.detalle)
          const parsedItems = detalleBruto
            .split("\n")
            .map((line: string) => line.replace(/^\s*\d+\.\s*/, "").trim())
            .filter(Boolean)
            .map((detalle: string) => ({
              detalle,
              obligatorio: Boolean(fullEvent.informacion_importante?.obligatorio),
            }))
          setInformacionAdicionalItems(parsedItems.length > 0 ? parsedItems : [{ detalle: "", obligatorio: true }])
        } else {
          setInformacionAdicionalItems([{ detalle: "", obligatorio: true }])
        }
      } else {
        // Use the event data passed as prop if API call fails
        setFormData({
          nombre_evento: event.name || "",
          pulep_evento: event.pulep_evento || "",
          responsable_evento: event.responsable_evento || "",
          descripcion: event.descripcion || "",
          fecha_inicio: event.date ? String(event.date).slice(0, 10) : "",
          fecha_fin: event.fecha_fin ? String(event.fecha_fin).slice(0, 10) : "",
          hora_inicio: event.time || "",
          hora_final: event.hora_final || "",
          cupo: event.capacity?.toString() || "",
          id_categoria_evento: String(event.id_categoria_evento || event.evento_categoria_id || "") || "",
          id_tipo_evento: String(event.id_tipo_evento || event.evento_tipo_id || "") || "",
          id_sitio: String(event.id_sitio) || "",
          telefono_1: event.telefono_1 || "",
          telefono_2: event.telefono_2 || "",
          gratis_pago: event.gratis_pago || false,
          reservar_anticipado: event.reservar_anticipado || false,
        })

        setExistingImages(event.imagenes || [])
        setBusquedaSitio(event.nombre_sitio || event.nombre || "")
        setBusquedaMunicipio(event.nombre_municipio || "")
        setBoletas(
          event.valores && Array.isArray(event.valores) && event.valores.length > 0
            ? event.valores.map((v: any) => ({
                nombre_boleto: v.nombre_boleto || v.nombre_categoria_boleto || "",
                precio_boleto: String(v.precio_boleto ?? v.valor ?? ""),
                servicio: String(v.servicio ?? ""),
              }))
            : [{ nombre_boleto: "", precio_boleto: "", servicio: "" }]
        )

        if (event.informacion_importante?.detalle) {
          const detalleBruto = String(event.informacion_importante.detalle)
          const parsedItems = detalleBruto
            .split("\n")
            .map((line: string) => line.replace(/^\s*\d+\.\s*/, "").trim())
            .filter(Boolean)
            .map((detalle: string) => ({
              detalle,
              obligatorio: Boolean(event.informacion_importante?.obligatorio),
            }))
          setInformacionAdicionalItems(parsedItems.length > 0 ? parsedItems : [{ detalle: "", obligatorio: true }])
        } else {
          setInformacionAdicionalItems([{ detalle: "", obligatorio: true }])
        }
      }

      setImages([])
      setImagesToDelete([])
    } catch (err) {
      console.error("Error loading event data", err)
    } finally {
      setLoading(false)
    }
  }

  const loadDropdownData = async () => {
    setLoading(true)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const headers: any = {}
      if (token) headers["Authorization"] = `Bearer ${token}`

      // Load categories (event categories)
      const catRes = await fetch("/api/categoria_evento", { headers })
      if (catRes.ok) {
        const data = await catRes.json()
        setCategories(data || [])
      }

      // Load sites
      const sitesRes = await fetch("/api/llamar_sitio?nombre_sitio=", { headers })
      if (sitesRes.ok) {
        const data = await sitesRes.json()
        setSites(Array.isArray(data) ? data : [])
      }

      // Load municipalities (fallback to all)
      const municipalitiesRes = await fetch("/api/municipios", { headers })
      if (municipalitiesRes.ok) {
        const data = await municipalitiesRes.json()
        setMunicipalities(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error("Error loading dropdown data", err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch event types when category changes
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const catId = formData.id_categoria_evento
        if (!catId) return setEventTypes([])
        const res = await fetch(`/api/tipo_evento?categoriaId=${catId}`)
        const data = await res.json()
        setEventTypes(Array.isArray(data) ? data : [])
      } catch (e) {
        setEventTypes([])
      }
    }
    fetchTypes()
  }, [formData.id_categoria_evento])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setImages((prev) => [...prev, ...Array.from(files)])
    }
  }

  const removeNewImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (imageId: number) => {
    setImagesToDelete((prev) => [...prev, imageId])
    setExistingImages((prev) => prev.filter((img) => img.id_imagen_evento !== imageId))
  }

  const updateBoleta = (index: number, field: "nombre_boleto" | "precio_boleto" | "servicio", value: string) => {
    setBoletas((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  const addBoletaField = () => {
    if (boletas.length >= 12) return
    setBoletas((prev) => [...prev, { nombre_boleto: "", precio_boleto: "", servicio: "" }])
  }

  const removeBoletaField = (index: number) => {
    setBoletas((prev) => prev.filter((_, i) => i !== index))
  }

  const removeAllBoletas = () => {
    setBoletas([{ nombre_boleto: "", precio_boleto: "", servicio: "" }])
  }

  const addInfoItem = () => {
    if (informacionAdicionalItems.length >= 20) return
    setInformacionAdicionalItems((prev) => [...prev, { detalle: "", obligatorio: false }])
  }

  const updateInfoItem = (index: number, field: keyof EventoInfoItem, value: string | boolean) => {
    setInformacionAdicionalItems((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const removeInfoItem = (index: number) => {
    setInformacionAdicionalItems((prev) => {
      const updated = prev.filter((_, i) => i !== index)
      return updated.length > 0 ? updated : [{ detalle: "", obligatorio: true }]
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const submitFormData = new FormData()

      submitFormData.append("nombre_evento", formData.nombre_evento || "")
      submitFormData.append("pulep_evento", formData.pulep_evento || "")
      submitFormData.append("responsable_evento", formData.responsable_evento || "")
      submitFormData.append("descripcion", formData.descripcion || "")
      submitFormData.append("fecha_inicio", formData.fecha_inicio || "")
      submitFormData.append("fecha_fin", formData.fecha_fin || "")
      submitFormData.append("hora_inicio", formData.hora_inicio || "")
      submitFormData.append("hora_final", formData.hora_final || "")
      submitFormData.append("cupo", String(formData.cupo || 0))
      submitFormData.append("id_categoria_evento", String(formData.id_categoria_evento || 0))
      submitFormData.append("id_tipo_evento", String(formData.id_tipo_evento || 0))
      submitFormData.append("id_sitio", String(formData.id_sitio || 0))
      submitFormData.append("telefono_1", formData.telefono_1 || "")
      submitFormData.append("telefono_2", formData.telefono_2 || "")
      submitFormData.append("gratis_pago", String(Boolean(formData.gratis_pago)))
      submitFormData.append("reservar_anticipado", String(Boolean(formData.reservar_anticipado)))

      submitFormData.append(
        "informacion_adicional_items",
        JSON.stringify(
          (informacionAdicionalItems || [])
            .filter((item) => item.detalle?.trim())
            .map((item) => ({ detalle: item.detalle.trim(), obligatorio: Boolean(item.obligatorio) }))
        )
      )

      // Add new images
      images.forEach((img) => {
        submitFormData.append("additionalImages", img)
      })

      submitFormData.append("boletas", JSON.stringify(boletas || []))

      // Add images to delete
      submitFormData.append("imagesToDelete", JSON.stringify(imagesToDelete))

      // Call the API
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const headers: any = {}
      if (token) headers["Authorization"] = `Bearer ${token}`

      const response = await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers,
        body: submitFormData,
      })

      if (!response.ok) {
        throw new Error("Failed to save event")
      }

      const updatedData = await response.json()
      await onSave(updatedData)
      onClose()
    } catch (err) {
      console.error("Error saving event", err)
      alert("Error al guardar los cambios del evento")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Evento: {formData.nombre_evento}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nombre del evento */}
          <div>
            <Label htmlFor="nombre_evento">Nombre del Evento</Label>
            <Input
              id="nombre_evento"
              name="nombre_evento"
              value={formData.nombre_evento}
              onChange={handleInputChange}
              placeholder="Nombre del evento"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pulep_evento">PULEP del evento</Label>
              <Input
                id="pulep_evento"
                name="pulep_evento"
                value={formData.pulep_evento}
                onChange={handleInputChange}
                placeholder="Código PULEP"
              />
            </div>
            <div>
              <Label htmlFor="responsable_evento">Entidad responsable</Label>
              <Input
                id="responsable_evento"
                name="responsable_evento"
                value={formData.responsable_evento}
                onChange={handleInputChange}
                placeholder="Nombre de la entidad responsable"
              />
            </div>
          </div>

          {/* Categoría y tipo de evento */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="id_categoria_evento">Categoría</Label>
              <select
                id="id_categoria_evento"
                name="id_categoria_evento"
                value={formData.id_categoria_evento}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id_categoria_evento || cat.id} value={cat.id_categoria_evento || cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="id_tipo_evento">Tipo de Evento</Label>
              <select
                id="id_tipo_evento"
                name="id_tipo_evento"
                value={formData.id_tipo_evento}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona un tipo</option>
                {eventTypes.map((t) => (
                  <option key={t.id_tipo_evento || t.id} value={t.id_tipo_evento || t.id}>{t.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sitio / Municipio */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 relative">
              <Label htmlFor="sitio">Sitio</Label>
              <Input
                id="sitio"
                value={busquedaSitio}
                onChange={(e) => {
                  setBusquedaSitio(e.target.value)
                  setFormData((prev) => ({ ...prev, id_sitio: "" }))
                }}
                placeholder="Escribe el nombre del sitio donde será el evento"
                className="rounded-lg"
              />
              {sites.length > 0 && (
                <ul className="absolute z-10 bg-white border rounded-lg mt-1 w-full max-h-60 overflow-y-auto shadow-lg">
                  {sites.map((sitio) => (
                    <li
                      key={sitio.id_sitio || sitio.id}
                      onClick={() => {
                        setBusquedaSitio(sitio.nombre_sitio || sitio.nombre)
                        setFormData((prev) => ({ ...prev, id_sitio: sitio.id_sitio || sitio.id }))
                        setSites([])
                      }}
                      className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                    >
                      {sitio.nombre_sitio || sitio.nombre}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="municipio">Municipio</Label>
              <Input
                id="municipio"
                value={busquedaMunicipio}
                onChange={(e) => setBusquedaMunicipio(e.target.value)}
                readOnly={!!formData.id_sitio}
                placeholder="Ciudad del lugar donde se hará el evento."
                className="rounded-lg cursor-default"
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="fullDescription">Descripción del evento</Label>
            <Textarea
              id="fullDescription"
              value={formData.descripcion}
              onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Descripción detallada del evento"
              className="rounded-xl min-h-[100px]"
            />
          </div>

          <div className="space-y-4 p-4 border rounded-lg shadow-md">
            <div>
              <Label>Información adicional del evento</Label>
              <p className="text-xs text-gray-500 mt-1">
                Registra los datos clave del evento por ítems para mantener una descripción detallada.
              </p>
            </div>

            {informacionAdicionalItems.map((item, index) => (
              <div key={index} className="space-y-3 p-3 bg-gray-50 rounded-lg border">
                <div className="space-y-2">
                  <Label className="text-xs">Detalle importante</Label>
                  <Textarea
                    value={item.detalle}
                    onChange={(e) => updateInfoItem(index, "detalle", e.target.value)}
                    placeholder="Ej: Ingreso desde las 7:00 PM, no se permite reingreso"
                    className="rounded-xl min-h-[90px]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={item.obligatorio}
                      onChange={(e) => updateInfoItem(index, "obligatorio", e.target.checked)}
                      className="w-4 h-4"
                    />
                    Marcado como obligatorio para asistentes
                  </label>

                  {informacionAdicionalItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInfoItem(index)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                    >
                      Quitar
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center gap-3">
              <button
                type="button"
                onClick={addInfoItem}
                disabled={informacionAdicionalItems.length >= 20}
                className={`px-3 py-1.5 rounded-md text-white text-sm ${
                  informacionAdicionalItems.length >= 20 ? "bg-gray-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                + Añadir ítem
              </button>
              <span className="text-sm text-gray-600">{informacionAdicionalItems.length}/20 ítems</span>
            </div>
          </div>

          {/* Telefonos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefono_1">Teléfono del organizador del evento</Label>
              <Input
                id="telefono_1"
                name="telefono_1"
                type="tel"
                value={formData.telefono_1}
                onChange={handleInputChange}
                placeholder="Teléfono 1"
                className="rounded-xl"
                maxLength={10}
                inputMode="numeric"
              />
            </div>
            <div>
              <Label htmlFor="telefono_2">Teléfono 2 (opcional)</Label>
              <Input
                id="telefono_2"
                name="telefono_2"
                type="tel"
                value={formData.telefono_2}
                onChange={handleInputChange}
                placeholder="Teléfono 2"
                className="rounded-xl"
                maxLength={10}
                inputMode="numeric"
              />
            </div>
          </div>

          {/* Fechas */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fecha_inicio">Fecha de inicio del evento</Label>
              <Input
                id="fecha_inicio"
                name="fecha_inicio"
                type="date"
                value={formData.fecha_inicio}
                onChange={handleInputChange}
                className="cursor-pointer w-full rounded-xl border-gray-300 shadow-sm p-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_fin">Fecha final del evento</Label>
              <Input
                id="fecha_fin"
                name="fecha_fin"
                type="date"
                value={formData.fecha_fin}
                onChange={handleInputChange}
                className="cursor-pointer w-full rounded-xl border-gray-300 shadow-sm p-2"
              />
            </div>
          </div>

          {/* Horas */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="hora_inicio">Hora de inicio</Label>
              <Input
                id="hora_inicio"
                name="hora_inicio"
                type="time"
                value={formData.hora_inicio}
                onChange={handleInputChange}
                className="w-full rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hora_final">Hora final</Label>
              <Input
                id="hora_final"
                name="hora_final"
                type="time"
                value={formData.hora_final}
                onChange={handleInputChange}
                className="w-full rounded-xl"
              />
            </div>
          </div>

          {/* Gratis o Pago */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="gratis_pago"
                checked={formData.gratis_pago}
                onChange={handleInputChange}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium">Evento de Pago</span>
            </label>
          </div>

          {!formData.gratis_pago && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-500">
              <input
                id="reservar_anticipado"
                name="reservar_anticipado"
                type="checkbox"
                checked={formData.reservar_anticipado}
                onChange={handleInputChange}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="reservar_anticipado" className="cursor-pointer text-sm font-medium">
                ¿Asistencia únicamente con reserva anticipada?
              </label>
            </div>
          )}

          {/* Boletas (modelo actual del crear) */}
          {formData.gratis_pago && (
            <div className="space-y-4 p-4 border rounded-lg shadow-md">
              <h2 className="text-lg font-semibold">Tipos de Boletas y Precios</h2>
              <p className="text-xs text-gray-600 italic -translate-y-2">
                Define los diferentes tipos de boletas disponibles para tu evento con sus precios.
              </p>

              {boletas.map((boleta, index) => (
                <div key={index} className="space-y-3 p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <Label className="text-xs">Nombre de la boleta</Label>
                    <Input
                      type="text"
                      value={boleta.nombre_boleto}
                      onChange={(e) => updateBoleta(index, "nombre_boleto", e.target.value)}
                      placeholder="Ej: General, VIP, Early Bird, etc."
                      className="rounded-xl text-sm"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Precio</Label>
                      <Input
                        type="number"
                        value={boleta.precio_boleto}
                        onChange={(e) => updateBoleta(index, "precio_boleto", e.target.value)}
                        placeholder="0"
                        className="rounded-xl text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Cargo por servicio (opcional)</Label>
                      <Input
                        type="number"
                        value={boleta.servicio}
                        onChange={(e) => updateBoleta(index, "servicio", e.target.value)}
                        placeholder="0"
                        className="rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  {boletas.length > 1 && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeBoletaField(index)}
                        className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                      >
                        Quitar
                      </button>
                    </div>
                  )}
                </div>
              ))}

              <div className="flex justify-between items-center gap-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addBoletaField}
                    disabled={boletas.length >= 12}
                    className={`px-3 py-1.5 rounded-md text-white text-sm ${
                      boletas.length >= 12 ? "bg-gray-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    + Añadir tipo de boleta
                  </button>
                  {boletas.length >= 2 && (
                    <button
                      type="button"
                      onClick={removeAllBoletas}
                      className="px-3 py-1.5 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                    >
                      Eliminar todas
                    </button>
                  )}
                </div>
                <span className="text-sm text-gray-600">{boletas.length}/12 tipos de boletas</span>
              </div>
            </div>
          )}

          {/* Aforo */}
          <div className="space-y-2">
            <Label htmlFor="cupo">Aforo del evento</Label>
            <Input
              id="cupo"
              name="cupo"
              type="number"
              min={1}
              max={5000}
              value={formData.cupo}
              onChange={handleInputChange}
              placeholder="100"
              className="rounded-xl"
            />
            <p className="text-sm text-gray-500">Ingresa un número entre 1 y 5000</p>
          </div>

          {/* Imágenes existentes */}
          {existingImages.length > 0 && (
            <div>
              <Label>Imágenes Actuales</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {existingImages.map((img) => (
                  <div key={img.id_imagen_evento} className="relative group">
                    <img
                      src={img.url_imagen_evento}
                      alt="Evento"
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.id_imagen_evento)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nuevas imágenes */}
          <div>
            <Label htmlFor="images">Agregar Nuevas Imágenes</Label>
            <div className="mt-2 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors">
              <input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label htmlFor="images" className="flex flex-col items-center cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-600">Haz clic para seleccionar imágenes</span>
              </label>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`Nueva ${index}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
