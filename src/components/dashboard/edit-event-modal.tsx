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

export function EditEventModal({ isOpen, onClose, event, onSave }: EditEventModalProps) {
  const [formData, setFormData] = useState({
    nombre_evento: "",
    descripcion: "",
    fecha_inicio: "",
    fecha_fin: "",
    hora_inicio: "",
    hora_final: "",
    cupo: "",
    dias_semana: "",
    fecha_desactivacion: "",
    id_categoria_evento: "",
    id_tipo_evento: "",
    id_sitio: "",
    id_municipio: "",
    telefono_1: "",
    telefono_2: "",
    gratis_pago: false,
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
  const [categoriasBoleto, setCategoriasBoleto] = useState<any[]>([])
  const [costos, setCostos] = useState<string[]>([""])
  const [tiposBoleteria, setTiposBoleteria] = useState<string[]>([""])
  const [linksBoleteria, setLinksBoleteria] = useState<string[]>([""])
  const [diasSeleccionados, setDiasSeleccionados] = useState<Date[]>([])
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
          setFormData((prev) => ({ ...prev, id_municipio: String(data[0].id_municipio) }))
          setMunicipalities(data)
        } else {
          setBusquedaMunicipio("")
          setFormData((prev) => ({ ...prev, id_municipio: "" }))
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
      const response = await fetch(`/api/events?id=${event.id}`, { headers })
      if (response.ok) {
        const data = await response.json()
        const fullEvent = data.event || event

        setFormData({
          nombre_evento: fullEvent.nombre_evento || event.name || "",
          descripcion: fullEvent.descripcion || "",
          fecha_inicio: fullEvent.fecha_inicio || event.date || "",
          fecha_fin: fullEvent.fecha_fin || "",
          hora_inicio: fullEvent.hora_inicio || event.time || "",
          hora_final: fullEvent.hora_final || "",
          cupo: fullEvent.cupo?.toString() || event.capacity?.toString() || "",
          dias_semana: fullEvent.dias_semana ? (typeof fullEvent.dias_semana === 'string' ? fullEvent.dias_semana : JSON.stringify(fullEvent.dias_semana)) : "",
          fecha_desactivacion: fullEvent.fecha_desactivacion ? String(fullEvent.fecha_desactivacion).slice(0, 10) : "",
          id_categoria_evento: String(fullEvent.evento_categoria_id) || "",
          id_tipo_evento: String(fullEvent.evento_tipo_id) || "",
          id_sitio: String(fullEvent.id_sitio) || "",
          id_municipio: String(fullEvent.id_municipio) || "",
          telefono_1: fullEvent.event_telefono_1 || "",
          telefono_2: fullEvent.event_telefono_2 || "",
          gratis_pago: fullEvent.gratis_pago || false,
        })

        setExistingImages(fullEvent.imagenes || [])
        // set search strings for sitio/municipio to show in inputs
        setBusquedaSitio(fullEvent.nombre_sitio || fullEvent.nombre || "")
        setBusquedaMunicipio(fullEvent.nombre_municipio || "")
        // load ticket data if present
        if (fullEvent.valores && Array.isArray(fullEvent.valores) && fullEvent.valores.length > 0) {
          setCostos(fullEvent.valores.map((v: any) => String(v.valor || "")))
          setTiposBoleteria(fullEvent.valores.map((v: any) => v.nombre_categoria_boleto || ""))
        }
        if (fullEvent.links && Array.isArray(fullEvent.links)) {
          setLinksBoleteria(fullEvent.links.map((l: any) => l.link || ""))
        }
        // load diasSeleccionados from dias_semana
        try {
          const ds = fullEvent.dias_semana ? (typeof fullEvent.dias_semana === 'string' ? JSON.parse(fullEvent.dias_semana) : fullEvent.dias_semana) : []
          setDiasSeleccionados(Array.isArray(ds) ? ds.map((d: any) => new Date(d)) : [])
        } catch (e) {
          setDiasSeleccionados([])
        }
      } else {
        // Use the event data passed as prop if API call fails
        setFormData({
          nombre_evento: event.name || "",
          descripcion: event.descripcion || "",
          fecha_inicio: event.date || "",
          fecha_fin: event.fecha_fin || "",
          hora_inicio: event.time || "",
          hora_final: event.hora_final || "",
          cupo: event.capacity?.toString() || "",
          dias_semana: event.dias_semana ? (typeof event.dias_semana === 'string' ? event.dias_semana : JSON.stringify(event.dias_semana)) : "",
          fecha_desactivacion: event.fecha_desactivacion ? String(event.fecha_desactivacion).slice(0, 10) : "",
          id_categoria_evento: String(event.id_categoria_evento) || "",
          id_tipo_evento: String(event.id_tipo_evento) || "",
          id_sitio: String(event.id_sitio) || "",
          id_municipio: String(event.id_municipio) || "",
          telefono_1: event.telefono_1 || "",
          telefono_2: event.telefono_2 || "",
          gratis_pago: event.gratis_pago || false,
        })

        setExistingImages(event.imagenes || [])
        setBusquedaSitio(event.nombre_sitio || event.nombre || "")
        setBusquedaMunicipio(event.nombre_municipio || "")
        // fallback ticket/day data
        setCostos(event.valores ? event.valores.map((v: any) => String(v.valor || "")) : [""])
        setTiposBoleteria(event.valores ? event.valores.map((v: any) => v.nombre_categoria_boleto || "") : [""])
        setLinksBoleteria(event.links ? event.links.map((l: any) => l.link || "") : [""])
        try {
          const ds = event.dias_semana ? (typeof event.dias_semana === 'string' ? JSON.parse(event.dias_semana) : event.dias_semana) : []
          setDiasSeleccionados(Array.isArray(ds) ? ds.map((d: any) => new Date(d)) : [])
        } catch (e) {
          setDiasSeleccionados([])
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

      // Load boleto categories
      const catBRes = await fetch("/api/categoria_boleto", { headers })
      if (catBRes.ok) {
        const data = await catBRes.json()
        setCategoriasBoleto(data || [])
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

  // Days helpers (same as creation)
  const generarRangoDias = (inicioStr: string | null, finStr: string | null): Date[] => {
    if (!inicioStr || !finStr) return []
    const inicio = new Date(inicioStr)
    const fin = new Date(finStr)
    const diasArray: Date[] = []
    const current = new Date(inicio)
    current.setHours(0,0,0,0)
    const end = new Date(fin)
    end.setHours(0,0,0,0)
    while (current <= end) {
      diasArray.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return diasArray
  }

  const toggleDiaSeleccionado = (fecha: Date) => {
    const fechaTime = new Date(fecha).setHours(0,0,0,0)
    setDiasSeleccionados((prev) => {
      const found = prev.find(d => new Date(d).setHours(0,0,0,0) === fechaTime)
      if (found) return prev.filter(d => new Date(d).setHours(0,0,0,0) !== fechaTime)
      return [...prev, new Date(fecha)]
    })
  }

  const formatDia = (date: Date) => {
    const opciones: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "numeric" }
    return date.toLocaleDateString("es-ES", opciones)
  }

  const removeNewImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (imageId: number) => {
    setImagesToDelete((prev) => [...prev, imageId])
    setExistingImages((prev) => prev.filter((img) => img.id_imagen_evento !== imageId))
  }

  // Ticket helpers
  const updateCosto = (index: number, value: string) => {
    setCostos((prev) => {
      const copy = [...prev]
      copy[index] = value
      return copy
    })
  }

  const updateTipo = (index: number, value: string) => {
    setTiposBoleteria((prev) => {
      const copy = [...prev]
      copy[index] = value
      return copy
    })
  }

  const updateLink = (index: number, value: string) => {
    setLinksBoleteria((prev) => {
      const copy = [...prev]
      copy[index] = value
      return copy
    })
  }

  const addTicket = () => {
    setCostos((prev) => [...prev, ""])
    setTiposBoleteria((prev) => [...prev, ""])
    setLinksBoleteria((prev) => [...prev, ""])
  }

  const removeTicket = (index: number) => {
    setCostos((prev) => prev.filter((_, i) => i !== index))
    setTiposBoleteria((prev) => prev.filter((_, i) => i !== index))
    setLinksBoleteria((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const submitFormData = new FormData()

      // Add form fields
      Object.keys(formData).forEach((key) => {
        submitFormData.append(key, String((formData as any)[key]))
      })

      // Add new images
      images.forEach((img) => {
        submitFormData.append("additionalImages", img)
      })

      // ticket fields
      submitFormData.append("costos", JSON.stringify(costos || []))
      submitFormData.append("tiposBoleteria", JSON.stringify(tiposBoleteria || []))
      submitFormData.append("linksBoleteria", JSON.stringify(linksBoleteria || []))

      // dias_semana as JSON of dates
      const diasStrings = (diasSeleccionados || []).map(d => (d instanceof Date) ? d.toISOString().split('T')[0] : String(d))
      submitFormData.append("dias_semana", JSON.stringify(diasStrings))

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

          {/* (Descripción moved below to respect crear layout) */}

          {/* Fechas y horas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
              <Input
                id="fecha_inicio"
                name="fecha_inicio"
                type="date"
                value={formData.fecha_inicio}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="fecha_fin">Fecha de Fin</Label>
              <Input
                id="fecha_fin"
                name="fecha_fin"
                type="date"
                value={formData.fecha_fin}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="hora_inicio">Hora de Inicio</Label>
              <Input
                id="hora_inicio"
                name="hora_inicio"
                type="time"
                value={formData.hora_inicio}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="hora_final">Hora de Fin</Label>
              <Input
                id="hora_final"
                name="hora_final"
                type="time"
                value={formData.hora_final}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Cupo y tipo de evento */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cupo">Cupo</Label>
              <Input
                id="cupo"
                name="cupo"
                type="number"
                value={formData.cupo}
                onChange={handleInputChange}
                placeholder="0"
              />
            </div>
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
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tipo Evento / Sitio / Municipio / Fecha desactivación / Dias */}
          <div className="grid grid-cols-2 gap-4">
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
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            </div>
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
            <div>
              <Label htmlFor="fecha_desactivacion">Fecha Desactivación</Label>
              <Input
                id="fecha_desactivacion"
                name="fecha_desactivacion"
                type="date"
                value={formData.fecha_desactivacion}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="fullDescription">Descripción</Label>
            <Textarea
              id="fullDescription"
              value={formData.descripcion}
              onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Descripción detallada del evento"
              className="rounded-xl min-h-[100px]"
            />
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

          {/* Dates and Day Selection (like crear page) */}
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
                onChange={(e) => {
                  handleInputChange(e as any)
                  // reset diasSeleccionados when range changes
                  setDiasSeleccionados([])
                }}
                className="cursor-pointer w-full rounded-xl border-gray-300 shadow-sm p-2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Días en los que se puede asistir al evento *</Label>
            <div className="p-4 border rounded-xl bg-gray-50">
              {generarRangoDias(formData.fecha_inicio, formData.fecha_fin).length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {generarRangoDias(formData.fecha_inicio, formData.fecha_fin).map((fecha) => {
                      const fechaTime = new Date(fecha).setHours(0, 0, 0, 0)
                      const isSelected = diasSeleccionados.some((d: Date) => new Date(d).setHours(0, 0, 0, 0) === fechaTime)
                      return (
                        <label
                          key={fecha.toISOString().split('T')[0]}
                          className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected ? 'bg-blue-100 border-blue-500' : 'bg-white border-gray-300 hover:border-blue-300'
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
                      )
                    })}
                  </div>
                  <p className="text-xs text-gray-600 text-center">Seleccionados: {diasSeleccionados.length} día(s)</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Selecciona primero las fechas de inicio y fin</p>
              )}
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

          {/* Boletos (solo si es evento de pago) */}
          {formData.gratis_pago && (
            <div>
              <Label>Boletos</Label>
              <div className="space-y-3 mt-2">
                {costos.map((c, i) => (
                  <div key={i} className="grid grid-cols-3 gap-3 items-end">
                    <div>
                      <Label>Categoría</Label>
                      <select
                        value={tiposBoleteria[i] || ""}
                        onChange={(e) => updateTipo(i, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Selecciona categoría</option>
                        {categoriasBoleto.map((cat) => (
                          <option key={cat.id} value={cat.nombre}>
                            {cat.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label>Precio</Label>
                      <Input
                        type="number"
                        value={costos[i] || ""}
                        onChange={(e) => updateCosto(i, e.target.value)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <Label>Link de venta</Label>
                      <Input
                        value={linksBoleteria[i] || ""}
                        onChange={(e) => updateLink(i, e.target.value)}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="col-span-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeTicket(i)}
                        className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                      >
                        Eliminar boleto
                      </button>
                    </div>
                  </div>
                ))}

                <div>
                  <button
                    type="button"
                    onClick={addTicket}
                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Agregar boleto
                  </button>
                </div>
              </div>
            </div>
          )}

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
