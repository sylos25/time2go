import { useEffect, useState } from "react"
import type {
  Evento,
  Categoria,
  TipoEvento,
  Sitio,
  Boleta,
  EventoInfoItem,
  FormDataState,
  FormErrors,
  UseEditEventModalArgs,
  UseEditEventModalReturn,
  ImagenEvento,
} from "@/types/event-edit"

export type { EventoInfoItem, FormDataState, FormErrors, UseEditEventModalArgs }

type BoleteDefinition = {
  nombre_boleto: string
  precio_boleto: string | number
  servicio: string | number
}

const ALPHANUM_SPACE_REGEX = /^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ ]+$/
const TEXT_WITH_PUNCT_REGEX = /^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ .,;:()"'¿?¡!\-_\/\n\r]+$/

const initialFormData: FormDataState = {
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
  telefono_principal: "1",
  gratis_pago: false,
  reservar_anticipado: false,
}

const sanitizeAlphanumSpace = (value: string) =>
  value.replace(/[^A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ ]/g, "")

const sanitizeTextWithPunct = (value: string) =>
  value.replace(/[^A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ .,;:()"'¿?¡!\-_\/\n\r]/g, "")

export function useEditEventModal({ isOpen, event, onClose, onSave }: UseEditEventModalArgs): UseEditEventModalReturn {
  const [formData, setFormData] = useState<FormDataState>(initialFormData)
  const [showTelefono2, setShowTelefono2] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [documento, setDocumento] = useState<File | null>(null)
  const [existingImages, setExistingImages] = useState<ImagenEvento[]>([])
  const [newPrincipalImageIndex, setNewPrincipalImageIndex] = useState<number | null>(null)
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([])
  const [categories, setCategories] = useState<Categoria[]>([])
  const [eventTypes, setEventTypes] = useState<TipoEvento[]>([])
  const [sites, setSites] = useState<Sitio[]>([])
  const [busquedaSitio, setBusquedaSitio] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [boletas, setBoletas] = useState<BoleteDefinition[]>([
    { nombre_boleto: "", precio_boleto: "", servicio: "" },
  ])
  const [informacionAdicionalItems, setInformacionAdicionalItems] = useState<EventoInfoItem[]>([
    { detalle: "", obligatorio: true },
  ])
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const setFieldError = (field: keyof FormErrors, message: string) => {
    setFormErrors((prev) => ({ ...prev, [field]: message }))
  }

  const clearFieldError = (field: keyof FormErrors) => {
    setFormErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }))
  }

  const mapEventToForm = (source: Evento) => {
    const telefono2 = source.telefono_2 || ""
    setFormData({
      nombre_evento: source.nombre_evento || source.name || "",
      pulep_evento: source.pulep_evento || "",
      responsable_evento: source.responsable_evento || "",
      descripcion: source.descripcion || "",
      fecha_inicio: source.fecha_inicio ? String(source.fecha_inicio).slice(0, 10) : String(source.date || "").slice(0, 10),
      fecha_fin: source.fecha_fin ? String(source.fecha_fin).slice(0, 10) : "",
      hora_inicio: source.hora_inicio || source.time || "",
      hora_final: source.hora_final || "",
      cupo: source.cupo?.toString() || source.capacity?.toString() || "",
      id_categoria_evento: String(source.id_categoria_evento || source.evento_categoria_id || "") || "",
      id_tipo_evento: String(source.id_tipo_evento || source.evento_tipo_id || "") || "",
      id_sitio: String(source.id_sitio || "") || "",
      telefono_1: source.telefono_1 || "",
      telefono_2: telefono2,
      telefono_principal: telefono2 ? "2" : "1",
      gratis_pago: source.gratis_pago || false,
      reservar_anticipado: source.reservar_anticipado || false,
    })
    setShowTelefono2(Boolean(telefono2))

    const initialImages = (source.imagenes || []).map((img, index) => ({
      ...img,
      principal: Boolean(img.principal || img.principale || (index === 0 && !(source.imagenes || []).some((i) => i.principal || i.principale))),
      orden: Number(img.orden || img.order || index + 1),
    }))
    setExistingImages(initialImages)
    setBusquedaSitio(source.sitio?.nombre_sitio || source.nombre_sitio || source.nombre || "")

    if (source.valores && Array.isArray(source.valores) && source.valores.length > 0) {
      setBoletas(
        source.valores.map((v: Boleta) => ({
          nombre_boleto: v.nombre_boleto || v.nombre_categoria_boleto || "",
          precio_boleto: String(v.precio_boleto ?? v.valor ?? ""),
          servicio: String(v.servicio ?? ""),
        })),
      )
    } else {
      setBoletas([{ nombre_boleto: "", precio_boleto: "", servicio: "" }])
    }

    if (source.informacion_importante?.detalle) {
      const detalleBruto = String(source.informacion_importante.detalle)
      const parsedItems = detalleBruto
        .split("\n")
        .map((line: string) => line.replace(/^\s*\d+\.\s*/, "").trim())
        .filter(Boolean)
        .map((detalle: string): EventoInfoItem => ({
          detalle,
          obligatorio: Boolean(source.informacion_importante?.obligatorio),
        }))

      setInformacionAdicionalItems(parsedItems.length > 0 ? parsedItems : [{ detalle: "", obligatorio: true }])
    } else {
      setInformacionAdicionalItems([{ detalle: "", obligatorio: true }])
    }
  }

  const loadEventData = async () => {
    setLoading(true)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const headers: Record<string, string> = {}
      if (token) headers.Authorization = `Bearer ${token}`

      const response = await fetch(`/api/events?id=${event.id_evento || event.id}&includeAll=true`, {
        headers,
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json() as { event: Evento }
        mapEventToForm(data.event || event)
      } else {
        mapEventToForm(event)
      }

      setImages([])
      setDocumento(null)
      setNewPrincipalImageIndex(null)
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
      const headers: Record<string, string> = {}
      if (token) headers.Authorization = `Bearer ${token}`

      const catRes = await fetch("/api/categoria_evento", { headers })
      if (catRes.ok) {
        const data = (await catRes.json()) as Categoria[]
        setCategories(data || [])
      }

      const sitesRes = await fetch("/api/llamar_sitio?nombre_sitio=", { headers })
      if (sitesRes.ok) {
        const data = (await sitesRes.json()) as Sitio[]
        setSites(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error("Error loading dropdown data", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && event) {
      void loadEventData()
      void loadDropdownData()
    }
  }, [isOpen, event])

  useEffect(() => {
    const fetchSitios = async () => {
      if (!busquedaSitio || busquedaSitio.length < 2 || formData.id_sitio) return
      try {
        const res = await fetch(`/api/llamar_sitio?nombre_sitio=${encodeURIComponent(busquedaSitio)}`)
        const data = (await res.json()) as Sitio[]
        setSites(Array.isArray(data) ? data : [])
      } catch {
        setSites([])
      }
    }

    void fetchSitios()
  }, [busquedaSitio, formData.id_sitio])

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const catId = formData.id_categoria_evento
        if (!catId) {
          setEventTypes([])
          return
        }
        const res = await fetch(`/api/tipo_evento?categoriaId=${catId}`)
        const data = (await res.json()) as TipoEvento[]
        setEventTypes(Array.isArray(data) ? data : [])
      } catch {
        setEventTypes([])
      }
    }

    void fetchTypes()
  }, [formData.id_categoria_evento])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any
    let nextValue = value

    if (name === "nombre_evento" || name === "responsable_evento") {
      nextValue = sanitizeAlphanumSpace(value).slice(0, 40)
      clearFieldError(name)
    } else if (name === "pulep_evento") {
      nextValue = String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)
      clearFieldError("pulep_evento")
    } else if (name === "descripcion") {
      nextValue = sanitizeTextWithPunct(value).slice(0, 100)
      clearFieldError("descripcion")
    } else if (name === "telefono_1" || name === "telefono_2") {
      nextValue = String(value || "").replace(/[^0-9]/g, "").slice(0, 10)
      clearFieldError(name)
    } else if (name === "cupo") {
      nextValue = String(value || "").replace(/[^0-9]/g, "")
      clearFieldError("cupo")
    } else {
      clearFieldError(name as keyof FormErrors)
    }

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : nextValue,
      }

      if (name === "telefono_2" && nextValue === "" && prev.telefono_principal === "2") {
        updated.telefono_principal = "1"
      }

      return updated
    })
  }

  const handleSitioInputChange = (value: string) => {
    clearFieldError("id_sitio")
    setBusquedaSitio(value)
    setFormData((prev) => ({ ...prev, id_sitio: "" }))
  }

  const handleSelectSitio = (sitio: any) => {
    setBusquedaSitio(sitio.nombre_sitio || sitio.nombre)
    setFormData((prev) => ({ ...prev, id_sitio: String(sitio.id_sitio || sitio.id || "") }))
    setSites([])
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const selected = Array.from(files)
    const totalCount = existingImages.length + images.length + selected.length
    if (totalCount > 8) {
      setFieldError("imagenes", "Puedes tener maximo 8 imagenes en total por evento.")
      e.target.value = ""
      return
    }

    clearFieldError("imagenes")
    setImages((prev) => [...prev, ...selected])
    setNewPrincipalImageIndex((prev) => (prev === null ? 0 : prev))
  }

  const removeNewImage = (index: number) => {
    clearFieldError("imagenes")
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index)
      setNewPrincipalImageIndex((current) => {
        if (current === null) return next.length ? 0 : null
        if (next.length === 0) return null
        if (current === index) return 0
        if (current > index) return current - 1
        return Math.min(current, next.length - 1)
      })
      return next
    })
  }

  const removeExistingImage = (imageId: number) => {
    clearFieldError("imagenes")
    setImagesToDelete((prev) => [...prev, imageId])
    setExistingImages((prev) => {
      const filtered = prev.filter((img) => img.id_imagen_evento !== imageId)
      if (filtered.length > 0 && !filtered.some((img) => img.principal)) {
        filtered[0] = { ...filtered[0], principal: true }
      }
      return filtered
    })
  }

  const setExistingPrincipalImage = (imageId: number) => {
    setNewPrincipalImageIndex(null)
    setExistingImages((prev) =>
      prev.map((img) => ({
        ...img,
        principal: img.id_imagen_evento === imageId,
      })),
    )
  }

  const setNewPrincipalImage = (index: number) => {
    setNewPrincipalImageIndex(index)
    if (existingImages.length > 0) {
      setExistingImages((prev) => prev.map((img) => ({ ...img, principal: false })))
    }
  }

  const setPagoEventType = (isPaid: boolean) => {
    clearFieldError("boletas")
    setFormData((prev) => ({
      ...prev,
      gratis_pago: isPaid,
      reservar_anticipado: false,
    }))

    if (!isPaid) {
      setBoletas([{ nombre_boleto: "", precio_boleto: "", servicio: "" }])
    }
  }

  const setReservaAnticipada = (value: boolean) => {
    setFormData((prev) => ({ ...prev, reservar_anticipado: value }))
  }

  const updateBoleta = (index: number, field: string, value: string) => {
    setBoletas((prev) => {
      const copy = [...prev]
      let nextValue = value
      if (field === "nombre_boleto") {
        nextValue = sanitizeAlphanumSpace(value)
      } else {
        nextValue = String(value || "").replace(/[^0-9]/g, "")
      }
      clearFieldError("boletas")
      copy[index] = { ...copy[index], [field]: nextValue }
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
    clearFieldError("informacion_adicional_items")
    setInformacionAdicionalItems((prev) => [...prev, { detalle: "", obligatorio: false }])
  }

  const updateInfoItem = (index: number, field: keyof EventoInfoItem, value: string | boolean) => {
    setInformacionAdicionalItems((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        [field]: field === "detalle" ? sanitizeTextWithPunct(String(value || "")) : value,
      }
      clearFieldError("informacion_adicional_items")
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
      setFormErrors({})

      const nombreEvento = String(formData.nombre_evento || "").trim()
      const responsable = String(formData.responsable_evento || "").trim()
      const descripcion = String(formData.descripcion || "").trim()
      const cupoValue = Number(String(formData.cupo || ""))
      const infoValidItems = (informacionAdicionalItems || []).filter((item) => item.detalle?.trim())

      if (!nombreEvento || nombreEvento.length < 6 || nombreEvento.length > 40 || !ALPHANUM_SPACE_REGEX.test(nombreEvento)) {
        setFieldError("nombre_evento", "El nombre del evento debe tener entre 6 y 40 caracteres y solo usar letras y numeros.")
        return
      }

      if (formData.pulep_evento && !/^[A-Z0-9]{6,8}$/.test(String(formData.pulep_evento).toUpperCase())) {
        setFieldError("pulep_evento", "El codigo PULEP debe tener entre 6 y 8 caracteres y solo usar letras mayusculas y numeros.")
        return
      }

      if (!responsable || responsable.length < 6 || responsable.length > 40 || !ALPHANUM_SPACE_REGEX.test(responsable)) {
        setFieldError("responsable_evento", "El responsable debe tener entre 6 y 40 caracteres y solo usar letras y numeros.")
        return
      }

      if (!descripcion || descripcion.length < 10 || descripcion.length > 100 || !TEXT_WITH_PUNCT_REGEX.test(descripcion)) {
        setFieldError("descripcion", "La descripcion debe tener entre 10 y 100 caracteres y solo usar caracteres permitidos.")
        return
      }

      if (!formData.id_categoria_evento) {
        setFieldError("id_categoria_evento", "Debes seleccionar una categoria.")
        return
      }

      if (!formData.id_tipo_evento) {
        setFieldError("id_tipo_evento", "Debes seleccionar un tipo de evento.")
        return
      }

      if (!formData.id_sitio) {
        setFieldError("id_sitio", "Debes seleccionar un sitio.")
        return
      }

      if (!formData.telefono_1 || String(formData.telefono_1).length !== 10 || Number(formData.telefono_1) <= 2999999999) {
        setFieldError("telefono_1", "El telefono debe tener 10 digitos y ser valido.")
        return
      }

      if (formData.telefono_2 && (String(formData.telefono_2).length !== 10 || Number(formData.telefono_2) <= 2999999999)) {
        setFieldError("telefono_2", "El telefono 2 debe tener 10 digitos y ser valido.")
        return
      }

      if (formData.telefono_principal === "2" && !formData.telefono_2) {
        setFieldError("telefono_2", "Debes registrar el telefono 2 para marcarlo como principal.")
        return
      }

      if (!formData.fecha_inicio) {
        setFieldError("fecha_inicio", "Debes seleccionar una fecha de inicio.")
        return
      }

      if (!formData.fecha_fin) {
        setFieldError("fecha_fin", "Debes seleccionar una fecha final.")
        return
      }

      if (!formData.hora_inicio) {
        setFieldError("hora_inicio", "Debes seleccionar una hora de inicio.")
        return
      }

      if (!formData.hora_final) {
        setFieldError("hora_final", "Debes seleccionar una hora final.")
        return
      }

      if (infoValidItems.length === 0) {
        setFieldError("informacion_adicional_items", "Debes registrar al menos un item de informacion adicional.")
        return
      }

      for (const infoItem of infoValidItems) {
        const detalle = String(infoItem.detalle || "").trim()
        if (detalle.length < 10 || detalle.length > 40 || !TEXT_WITH_PUNCT_REGEX.test(detalle)) {
          setFieldError("informacion_adicional_items", "Cada item debe tener entre 10 y 40 caracteres y solo usar caracteres permitidos.")
          return
        }
      }

      if (!Number.isInteger(cupoValue) || cupoValue < 20 || cupoValue > 5000) {
        setFieldError("cupo", "El aforo debe ser un numero entero entre 20 y 5000.")
        return
      }

      if (Boolean(formData.gratis_pago)) {
        const boletasValidas = (boletas || []).filter(
          (b) => String(b.nombre_boleto || "").trim() || String(b.precio_boleto || "").trim() || String(b.servicio || "").trim(),
        )

        if (boletasValidas.length === 0) {
          setFieldError("boletas", "Debes definir al menos una boleta para eventos de pago.")
          return
        }

        for (const boleta of boletasValidas) {
          const nombreBoleto = String(boleta.nombre_boleto || "").trim()
          const precio = Number(String(boleta.precio_boleto || ""))
          const servicio = String(boleta.servicio || "").trim() ? Number(String(boleta.servicio || "")) : 0

          if (nombreBoleto.length < 3 || !ALPHANUM_SPACE_REGEX.test(nombreBoleto)) {
            setFieldError("boletas", "El nombre de la boleta debe tener minimo 3 caracteres y solo usar letras y numeros.")
            return
          }
          if (!Number.isInteger(precio) || precio <= 0 || precio > 500000000) {
            setFieldError("boletas", "El precio debe ser un entero positivo y no mayor a 500.000.000.")
            return
          }
          if (!Number.isInteger(servicio) || servicio < 0 || servicio > 500000000) {
            setFieldError("boletas", "El cargo por servicio debe ser un entero entre 0 y 500.000.000.")
            return
          }
        }
      }

      const submitFormData = new FormData()
      submitFormData.append("nombre_evento", nombreEvento)
      submitFormData.append("pulep_evento", String(formData.pulep_evento || "").toUpperCase())
      submitFormData.append("responsable_evento", responsable)
      submitFormData.append("descripcion", descripcion)
      submitFormData.append("fecha_inicio", formData.fecha_inicio || "")
      submitFormData.append("fecha_fin", formData.fecha_fin || "")
      submitFormData.append("hora_inicio", formData.hora_inicio || "")
      submitFormData.append("hora_final", formData.hora_final || "")
      submitFormData.append("cupo", String(cupoValue || 0))
      submitFormData.append("id_categoria_evento", String(formData.id_categoria_evento || 0))
      submitFormData.append("id_tipo_evento", String(formData.id_tipo_evento || 0))
      submitFormData.append("id_sitio", String(formData.id_sitio || 0))
      submitFormData.append("telefono_1", formData.telefono_1 || "")
      submitFormData.append("telefono_2", formData.telefono_2 || "")
      submitFormData.append("telefono_principal", formData.telefono_2 ? formData.telefono_principal : "1")
      submitFormData.append("gratis_pago", String(Boolean(formData.gratis_pago)))
      submitFormData.append("reservar_anticipado", String(Boolean(formData.reservar_anticipado)))

      submitFormData.append(
        "informacion_adicional_items",
        JSON.stringify(
          (informacionAdicionalItems || [])
            .filter((item) => item.detalle?.trim())
            .map((item) => ({ detalle: item.detalle.trim(), obligatorio: Boolean(item.obligatorio) })),
        ),
      )

      images.forEach((img) => {
        submitFormData.append("additionalImages", img)
      })

      if (documento) {
        submitFormData.append("documento", documento)
      }

      submitFormData.append(
        "boletas",
        JSON.stringify(
          (boletas || []).map((b) => ({
            nombre_boleto: String(b.nombre_boleto || "").trim(),
            precio_boleto: String(b.precio_boleto || "").replace(/[^0-9]/g, ""),
            servicio: String(b.servicio || "").replace(/[^0-9]/g, ""),
          })),
        ),
      )

      submitFormData.append("imagesToDelete", JSON.stringify(imagesToDelete))

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const headers: any = {}
      if (token) headers.Authorization = `Bearer ${token}`

      const response = await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers,
        body: submitFormData,
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        const message = String(payload?.message || "Error al guardar los cambios del evento")
        const lowerMessage = message.toLowerCase()
        if (lowerMessage.includes("imagen")) {
          setFormErrors((prev) => ({ ...prev, imagenes: message }))
        } else if (lowerMessage.includes("document")) {
          setFormErrors((prev) => ({ ...prev, documento: message }))
        } else {
          setFormErrors((prev) => ({ ...prev, general: message }))
        }
        return
      }

      const updatedData = await response.json()
      await onSave(updatedData)
      onClose()
    } catch (err) {
      console.error("Error saving event", err)
      setFormErrors((prev) => ({ ...prev, general: "Error al guardar los cambios del evento" }))
    } finally {
      setIsSaving(false)
    }
  }

  return {
    formData,
    formErrors,
    isSaving,
    loading,
    categories,
    eventTypes,
    sites,
    busquedaSitio,
    showTelefono2,
    boletas,
    informacionAdicionalItems,
    images,
    newPrincipalImageIndex,
    documento,
    existingImages,
    handleInputChange,
    handleSitioInputChange,
    handleSelectSitio,
    setShowTelefono2,
    setPagoEventType,
    setReservaAnticipada,
    clearFieldError,
    handleImageUpload,
    setDocumento,
    setExistingPrincipalImage,
    setNewPrincipalImage,
    removeNewImage,
    removeExistingImage,
    updateBoleta,
    addBoletaField,
    removeBoletaField,
    removeAllBoletas,
    addInfoItem,
    updateInfoItem,
    removeInfoItem,
    handleSave,
  }
}

