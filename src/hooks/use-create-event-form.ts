"use client"

import { useEffect, useState } from "react"

export interface EventoInfoItem {
  detalle: string
  obligatorio: boolean
}

export interface BoletaItem {
  nombre_boleto: string
  precio_boleto: string
  servicio: string
}

export interface NewEventState {
  nombre_evento: string
  pulep_evento: string
  responsable_evento: string
  id_usuario: string
  id_categoria_evento: number
  id_tipo_evento: number
  id_sitio: number
  descripcion: string
  informacion_adicional_items: EventoInfoItem[]
  telefono1: string
  telefono2: string
  telefono_principal: "1" | "2"
  fecha_inicio: Date | null
  fecha_final: Date | null
  hora_inicio: string
  hora_final: string
  pago: boolean
  reservar_anticipado: boolean
  boletas: BoletaItem[]
  cupo: string
  estado: boolean
  imagenes: File[]
  imagenPrincipalIndex: number
  documento: File | null
}

export interface CreateEventFormErrors {
  nombre_evento?: string
  pulep_evento?: string
  responsable_evento?: string
  id_categoria_evento?: string
  id_tipo_evento?: string
  id_sitio?: string
  descripcion?: string
  informacion_adicional_items?: string
  telefono1?: string
  telefono2?: string
  fecha_inicio?: string
  fecha_final?: string
  hora_inicio?: string
  hora_final?: string
  cupo?: string
  boletas?: string
  imagenes?: string
  documento?: string
  general?: string
}

const ALPHANUM_SPACE_REGEX = /^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ ]+$/
const TEXT_WITH_PUNCT_REGEX = /^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ .,;:()"'¿?¡!\-_/\n\r]+$/

const normalizeSingleLineSpacing = (value: string) =>
  value.replace(/\s+/g, " ").replace(/^\s+/, "")

export const sanitizeAlphanumSpace = (value: string, maxLength?: number) => {
  const sanitized = normalizeSingleLineSpacing(
    value.replace(/[^A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ ]/g, ""),
  )

  return typeof maxLength === "number" ? sanitized.slice(0, maxLength) : sanitized
}

export const sanitizeTextWithPunct = (value: string, maxLength?: number) => {
  const sanitized = value
    .replace(/[^A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ .,;:()"'¿?¡!\-_/\n\r]/g, "")
    .replace(/^\s+/, "")

  return typeof maxLength === "number" ? sanitized.slice(0, maxLength) : sanitized
}

const trimmedLength = (value: string) => value.trim().length

const initialEventState: NewEventState = {
  nombre_evento: "",
  pulep_evento: "",
  responsable_evento: "",
  id_usuario: "",
  id_categoria_evento: 0,
  id_tipo_evento: 0,
  id_sitio: 0,
  descripcion: "",
  informacion_adicional_items: [{ detalle: "", obligatorio: true }],
  telefono1: "",
  telefono2: "",
  telefono_principal: "1",
  fecha_inicio: null,
  fecha_final: null,
  hora_inicio: "",
  hora_final: "",
  pago: false,
  reservar_anticipado: false,
  boletas: [{ nombre_boleto: "", precio_boleto: "", servicio: "" }],
  cupo: "",
  estado: false,
  imagenes: [],
  imagenPrincipalIndex: 0,
  documento: null,
}

export function useCreateEventForm() {
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [categorias, setCategorias] = useState<
    { id_categoria_evento: number; nombre: string }[]
  >([])
  const [tiposDeEvento, setTiposDeEvento] = useState<
    { id_tipo_evento: number; nombre: string }[]
  >([])
  const [sitios, setSitios] = useState<{ id_sitio: number; nombre_sitio: string }[]>([])
  const [busquedaSitio, setBusquedaSitio] = useState("")
  const [debouncedBusquedaSitio, setDebouncedBusquedaSitio] = useState("")
  const [isSitiosOpen, setIsSitiosOpen] = useState(false)
  const [showTelefono2, setShowTelefono2] = useState(false)
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [today, setToday] = useState<Date | null>(null)
  const [newEvent, setNewEvent] = useState<NewEventState>(initialEventState)
  const [formErrors, setFormErrors] = useState<CreateEventFormErrors>({})

  const setFieldError = (field: keyof CreateEventFormErrors, message: string) => {
    setFormErrors({ [field]: message })
  }

  const clearFieldError = (field: keyof CreateEventFormErrors) => {
    setFormErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }))
  }

  useEffect(() => {
    setToday(new Date())
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedBusquedaSitio(busquedaSitio.trim())
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [busquedaSitio])

  const handleCupoChange = (value: string) => {
    if (value === "") {
      setNewEvent((prev) => ({ ...prev, cupo: "" }))
      return
    }

    if (!/^\d*$/.test(value)) return

    const num = Number(value)
    if (num > 5000) return

    setNewEvent((prev) => ({ ...prev, cupo: value }))
  }

  const addBoletaField = () => {
    if (newEvent.boletas.length < 12) {
      setNewEvent((prev) => ({
        ...prev,
        boletas: [
          ...prev.boletas,
          { nombre_boleto: "", precio_boleto: "", servicio: "" },
        ],
      }))
    }
  }

  const updateBoleta = (index: number, field: keyof BoletaItem, value: string) => {
    const updatedBoletas = [...newEvent.boletas]
    if (field === "nombre_boleto") {
      updatedBoletas[index].nombre_boleto = sanitizeAlphanumSpace(value, 30)
    } else if (field === "precio_boleto" || field === "servicio") {
      if (field === "precio_boleto") {
        updatedBoletas[index].precio_boleto = String(value || "").replace(/[^0-9]/g, "")
      } else {
        updatedBoletas[index].servicio = String(value || "").replace(/[^0-9]/g, "")
      }
    } else {
      updatedBoletas[index].nombre_boleto = value
    }
    setNewEvent((prev) => ({ ...prev, boletas: updatedBoletas }))
  }

  const removeBoletaField = (index: number) => {
    const updatedBoletas = newEvent.boletas.filter((_: BoletaItem, i: number) => i !== index)
    setNewEvent((prev) => ({ ...prev, boletas: updatedBoletas }))
  }

  const removeAllBoletas = () => {
    setNewEvent((prev) => ({
      ...prev,
      boletas: [{ nombre_boleto: "", precio_boleto: "", servicio: "" }],
    }))
  }

  const addInfoItem = () => {
    if ((newEvent.informacion_adicional_items || []).length >= 20) return
    setNewEvent((prev) => ({
      ...prev,
      informacion_adicional_items: [
        ...(prev.informacion_adicional_items || []),
        { detalle: "", obligatorio: false },
      ],
    }))
  }

  const updateInfoItem = (
    index: number,
    field: keyof EventoInfoItem,
    value: string | boolean,
  ) => {
    const updated = [...(newEvent.informacion_adicional_items || [])]
    updated[index] = {
      ...updated[index],
      [field]:
        field === "detalle" && typeof value === "string"
          ? sanitizeTextWithPunct(value, 50)
          : value,
    }
    setNewEvent((prev) => ({ ...prev, informacion_adicional_items: updated }))
  }

  const removeInfoItem = (index: number) => {
    const updated = (newEvent.informacion_adicional_items || []).filter(
      (_: EventoInfoItem, i: number) => i !== index,
    )
    setNewEvent((prev) => ({
      ...prev,
      informacion_adicional_items: updated.length
        ? updated
        : [{ detalle: "", obligatorio: true }],
    }))
  }

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch("/api/categoria_evento")
        const data = await res.json()
        setCategorias(data)
      } catch (error) {
        console.error("Error al cargar categorias:", error)
      }
    }
    void fetchCategorias()
  }, [])

  useEffect(() => {
    let cancelled = false
    const checkAuth = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        const headers: Record<string, string> = {}
        if (token) headers.Authorization = `Bearer ${token}`

        const res = await fetch("/api/me", { headers, credentials: "include" })
        if (!res.ok) {
          if (!cancelled) setAuthorized(false)
          return
        }

        const data = await res.json()
        const roleNum =
          data?.user?.id_rol !== undefined ? Number(data.user.id_rol) : undefined
        if (roleNum === undefined || Number.isNaN(roleNum)) {
          if (!cancelled) setAuthorized(false)
          return
        }

        const permissionRes = await fetch(
          `/api/permissions/check?id_accesibilidad=1&id_rol=${roleNum}`,
          { headers, credentials: "include" },
        )

        if (!permissionRes.ok) {
          if (!cancelled) setAuthorized(false)
          return
        }

        const permissionData = await permissionRes.json()
        if (!cancelled) setAuthorized(Boolean(permissionData?.hasAccess))
      } catch (err) {
        console.error("Auth check error", err)
        if (!cancelled) setAuthorized(false)
      }
    }

    void checkAuth()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const fetchTiposDeEvento = async () => {
      if (!newEvent.id_categoria_evento || newEvent.id_categoria_evento === 0) {
        setTiposDeEvento([])
        return
      }

      try {
        const res = await fetch(
          `/api/tipo_evento?categoriaId=${newEvent.id_categoria_evento}`,
        )
        const data = await res.json()
        setTiposDeEvento(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error al cargar tipos de evento:", error)
      }
    }

    void fetchTiposDeEvento()
  }, [newEvent.id_categoria_evento])

  async function refreshSitios(queryOverride?: string) {
    try {
      const query = (queryOverride ?? debouncedBusquedaSitio).trim()
      const url = query
        ? `/api/llamar_sitio?nombre_sitio=${encodeURIComponent(query)}`
        : "/api/llamar_sitio"

      const res = await fetch(url)
      const data = await res.json()
      setSitios(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error al buscar sitios:", error)
      setSitios([])
    }
  }

  useEffect(() => {
    void refreshSitios(debouncedBusquedaSitio)
  }, [debouncedBusquedaSitio])

  const handleAddEvent = async () => {
    try {
      setFormErrors({})
      setIsLoading(true)

      if (
        !newEvent.nombre_evento ||
        trimmedLength(newEvent.nombre_evento) < 6 ||
        trimmedLength(newEvent.nombre_evento) > 40
      ) {
        setFieldError(
          "nombre_evento",
          "El nombre del evento debe tener entre 6 y 40 caracteres.",
        )
        return
      }

      if (!ALPHANUM_SPACE_REGEX.test(newEvent.nombre_evento)) {
        setFieldError(
          "nombre_evento",
          "El nombre del evento solo permite letras y numeros.",
        )
        return
      }

      if (
        newEvent.pulep_evento &&
        (newEvent.pulep_evento.length < 6 || newEvent.pulep_evento.length > 8)
      ) {
        setFieldError(
          "pulep_evento",
          "Si proporcionas el codigo PULEP, debe tener entre 6 y 8 caracteres.",
        )
        return
      }

      if (newEvent.pulep_evento && !/^[A-Z0-9]+$/.test(newEvent.pulep_evento)) {
        setFieldError(
          "pulep_evento",
          "El codigo PULEP solo permite letras mayusculas y numeros.",
        )
        return
      }

      if (
        !newEvent.responsable_evento ||
        trimmedLength(newEvent.responsable_evento) < 6 ||
        trimmedLength(newEvent.responsable_evento) > 40
      ) {
        setFieldError(
          "responsable_evento",
          "El nombre del responsable debe tener entre 6 y 40 caracteres.",
        )
        return
      }

      if (!ALPHANUM_SPACE_REGEX.test(newEvent.responsable_evento)) {
        setFieldError(
          "responsable_evento",
          "El responsable solo permite letras y numeros.",
        )
        return
      }

      if (
        !newEvent.descripcion ||
        trimmedLength(newEvent.descripcion) < 10 ||
        trimmedLength(newEvent.descripcion) > 100
      ) {
        setFieldError("descripcion", "La descripcion debe tener entre 10 y 100 caracteres.")
        return
      }

      if (!TEXT_WITH_PUNCT_REGEX.test(newEvent.descripcion)) {
        setFieldError(
          "descripcion",
          "La descripcion solo permite letras, numeros y signos de puntuacion permitidos.",
        )
        return
      }

      const infoItems = (newEvent.informacion_adicional_items || []).filter(
        (item: EventoInfoItem) => item.detalle?.trim(),
      )

      if (infoItems.length === 0) {
        setFieldError(
          "informacion_adicional_items",
          "Debes registrar al menos un item de informacion adicional.",
        )
        return
      }

      for (const item of infoItems) {
        if (trimmedLength(item.detalle) < 10 || trimmedLength(item.detalle) > 40) {
          setFieldError(
            "informacion_adicional_items",
            "Cada detalle debe tener entre 10 y 40 caracteres.",
          )
          return
        }
        if (!TEXT_WITH_PUNCT_REGEX.test(item.detalle)) {
          setFieldError(
            "informacion_adicional_items",
            "La informacion adicional solo permite letras, numeros y signos de puntuacion permitidos.",
          )
          return
        }
      }

      if (infoItems.length > 20) {
        setFieldError("informacion_adicional_items", "Solo puedes registrar hasta 20 items.")
        return
      }

      if (
        !newEvent.telefono1 ||
        newEvent.telefono1.length !== 10 ||
        Number(newEvent.telefono1) <= 2999999999
      ) {
        setFieldError(
          "telefono1",
          "El telefono debe tener 10 digitos y ser valido (mayor a 2999999999).",
        )
        return
      }

      if (
        newEvent.telefono2 &&
        (newEvent.telefono2.length !== 10 || Number(newEvent.telefono2) <= 2999999999)
      ) {
        setFieldError(
          "telefono2",
          "El telefono 2 debe tener 10 digitos y ser valido (mayor a 2999999999).",
        )
        return
      }

      if (!newEvent.id_categoria_evento || newEvent.id_categoria_evento === 0) {
        setFieldError("id_categoria_evento", "Debes seleccionar una categoria.")
        return
      }

      if (!newEvent.id_tipo_evento || newEvent.id_tipo_evento === 0) {
        setFieldError("id_tipo_evento", "Debes seleccionar un tipo de evento.")
        return
      }

      if (!newEvent.id_sitio || newEvent.id_sitio === 0) {
        setFieldError("id_sitio", "Debes seleccionar un sitio.")
        return
      }

      if (!newEvent.fecha_inicio) {
        setFieldError("fecha_inicio", "Debes seleccionar una fecha de inicio.")
        return
      }

      if (!newEvent.fecha_final) {
        setFieldError("fecha_final", "Debes seleccionar una fecha final.")
        return
      }

      if (!newEvent.hora_inicio) {
        setFieldError("hora_inicio", "Debes seleccionar una hora de inicio.")
        return
      }

      if (!newEvent.hora_final) {
        setFieldError("hora_final", "Debes seleccionar una hora final.")
        return
      }

      if (
        !newEvent.cupo ||
        !Number.isInteger(Number(newEvent.cupo)) ||
        Number(newEvent.cupo) < 20 ||
        Number(newEvent.cupo) > 5000
      ) {
        setFieldError("cupo", "El aforo debe ser un numero entero entre 20 y 5000.")
        return
      }

      if (newEvent.pago) {
        const boletasValidas = newEvent.boletas.filter(
          (b: BoletaItem) => b.nombre_boleto && b.precio_boleto,
        )
        if (boletasValidas.length === 0) {
          setFieldError("boletas", "Debes definir al menos una boleta con nombre y precio.")
          return
        }

        for (const boleta of boletasValidas) {
          if (
            trimmedLength(String(boleta.nombre_boleto || "")) < 3 ||
            trimmedLength(String(boleta.nombre_boleto || "")) > 20
          ) {
            setFieldError(
              "boletas",
              "Cada nombre de boleta debe tener entre 3 y 20 caracteres.",
            )
            return
          }
          if (!ALPHANUM_SPACE_REGEX.test(String(boleta.nombre_boleto || ""))) {
            setFieldError(
              "boletas",
              "El nombre de la boleta solo permite letras y numeros.",
            )
            return
          }
          const precio = Number(boleta.precio_boleto)
          const servicio = boleta.servicio === "" ? 0 : Number(boleta.servicio)
          if (
            !Number.isFinite(precio) ||
            !Number.isInteger(precio) ||
            precio <= 0 ||
            precio > 500000000
          ) {
            setFieldError(
              "boletas",
              "El precio de la boleta debe ser un entero positivo y no mayor a 500.000.000.",
            )
            return
          }
          if (
            !Number.isFinite(servicio) ||
            !Number.isInteger(servicio) ||
            servicio < 0 ||
            servicio > 500000000
          ) {
            setFieldError(
              "boletas",
              "El cargo por servicio debe ser un entero entre 0 y 500.000.000.",
            )
            return
          }
        }
      }

      const formData = new FormData()
      formData.append("nombre_evento", newEvent.nombre_evento)
      formData.append("pulep_evento", newEvent.pulep_evento || "")
      formData.append("responsable_evento", newEvent.responsable_evento)
      formData.append("descripcion", newEvent.descripcion)
      formData.append(
        "informacion_adicional_items",
        JSON.stringify(
          infoItems.map((item: EventoInfoItem) => ({
            detalle: item.detalle.trim(),
            obligatorio: Boolean(item.obligatorio),
          })),
        ),
      )

      const fechaInicioStr = newEvent.fecha_inicio
        ? newEvent.fecha_inicio.toISOString().split("T")[0]
        : ""
      const fechaFinalStr = newEvent.fecha_final
        ? newEvent.fecha_final.toISOString().split("T")[0]
        : ""

      formData.append("fecha_inicio", fechaInicioStr)
      formData.append("fecha_fin", fechaFinalStr)
      formData.append("hora_inicio", newEvent.hora_inicio || "")
      formData.append("hora_final", newEvent.hora_final || "")

      const storedUserId = localStorage.getItem("userId") || ""
      formData.append("id_usuario", String(newEvent.id_usuario || storedUserId))
      formData.append("id_categoria_evento", String(newEvent.id_categoria_evento || 0))
      formData.append("id_tipo_evento", String(newEvent.id_tipo_evento || 0))
      formData.append("id_sitio", String(newEvent.id_sitio || 0))
      formData.append("telefono_1", newEvent.telefono1 || "")
      formData.append("telefono_2", newEvent.telefono2 || "")
      formData.append("telefono_principal", newEvent.telefono_principal || "1")
      formData.append("gratis_pago", String(newEvent.pago ?? false))
      formData.append("reservar_anticipado", String(newEvent.reservar_anticipado ?? false))
      formData.append("boletas", JSON.stringify(newEvent.boletas || []))
      formData.append("cupo", String(newEvent.cupo || 0))
      formData.append("estado", String(newEvent.estado ?? false))

      const safePrincipalIndex =
        (newEvent.imagenes || []).length > 0
          ? Math.min(
              Math.max(Number(newEvent.imagenPrincipalIndex || 0), 0),
              (newEvent.imagenes || []).length - 1,
            )
          : 0

      formData.append(
        "imagenes_meta",
        JSON.stringify(
          (newEvent.imagenes || []).map((_: File, index: number) => ({
            order: index + 1,
            principal: index === safePrincipalIndex,
          })),
        ),
      )

      ;(newEvent.imagenes || []).forEach((file: File) => {
        formData.append("additionalImages", file)
      })

      if (newEvent.documento) {
        formData.append("documento", newEvent.documento)
      }

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const headers: Record<string, string> = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const res = await fetch("/api/events", {
        method: "POST",
        headers,
        body: formData,
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        const message = String(payload?.message || "Error al crear el evento")
        if (message.toLowerCase().includes("imagen")) {
          setFormErrors({ imagenes: message })
        } else if (
          message.toLowerCase().includes("document") ||
          message.toLowerCase().includes("documento")
        ) {
          setFormErrors({ documento: message })
        } else {
          setFormErrors({ general: message })
        }
        return
      }

      setSuccessDialogOpen(true)
    } catch (error) {
      console.error("Error al guardar el evento:", error)
      setFormErrors({ general: "Error al crear el evento. Intenta nuevamente." })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    authorized,
    categorias,
    tiposDeEvento,
    sitios,
    busquedaSitio,
    isSitiosOpen,
    showTelefono2,
    successDialogOpen,
    isLoading,
    today,
    formErrors,
    newEvent,
    setNewEvent,
    setBusquedaSitio,
    setIsSitiosOpen,
    setShowTelefono2,
    setSuccessDialogOpen,
    setFieldError,
    clearFieldError,
    sanitizeAlphanumSpace,
    sanitizeTextWithPunct,
    handleCupoChange,
    addBoletaField,
    updateBoleta,
    removeBoletaField,
    removeAllBoletas,
    addInfoItem,
    updateInfoItem,
    removeInfoItem,
    refreshSitios,
    handleAddEvent,
  }
}
