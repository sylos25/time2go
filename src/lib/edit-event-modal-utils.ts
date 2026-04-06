import type {
  Boleta,
  Evento,
  EventoInfoItem,
  FormDataState,
  FormErrors,
  ImagenEvento,
} from "@/types/event-edit"

export type BoleteDefinition = {
  nombre_boleto: string
  precio_boleto: string | number
  servicio: string | number
}

export const ALPHANUM_SPACE_REGEX = /^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ ]+$/
export const TEXT_WITH_PUNCT_REGEX = /^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ .,;:()"'¿?¡!\-_\/\n\r]+$/

export const initialFormData: FormDataState = {
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

export const sanitizeAlphanumSpace = (value: string) =>
  value.replace(/[^A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ ]/g, "")

export const sanitizeTextWithPunct = (value: string) =>
  value.replace(/[^A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ .,;:()"'¿?¡!\-_\/\n\r]/g, "")

export function mapEventToFormState(source: Evento) {
  const telefono2 = source.telefono_2 || ""

  const formData: FormDataState = {
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
  }

  const normalizedImages: ImagenEvento[] = (source.imagenes || []).map((image, index) => ({
    ...image,
    principal: Boolean(
      image.principal || image.principale || (index === 0 && !(source.imagenes || []).some((item) => item.principal || item.principale))
    ),
    orden: Number(image.orden || image.order || index + 1),
  }))

  const boletas: BoleteDefinition[] =
    source.valores && Array.isArray(source.valores) && source.valores.length > 0
      ? source.valores.map((value: Boleta) => ({
          nombre_boleto: value.nombre_boleto || value.nombre_categoria_boleto || "",
          precio_boleto: String(value.precio_boleto ?? value.valor ?? ""),
          servicio: String(value.servicio ?? ""),
        }))
      : [{ nombre_boleto: "", precio_boleto: "", servicio: "" }]

  let informacionAdicionalItems: EventoInfoItem[] = [{ detalle: "", obligatorio: true }]
  if (source.informacion_importante?.detalle) {
    const parsedItems = String(source.informacion_importante.detalle)
      .split("\n")
      .map((line: string) => line.replace(/^\s*\d+\.\s*/, "").trim())
      .filter(Boolean)
      .map((detalle: string): EventoInfoItem => ({
        detalle,
        obligatorio: Boolean(source.informacion_importante?.obligatorio),
      }))

    if (parsedItems.length > 0) {
      informacionAdicionalItems = parsedItems
    }
  }

  return {
    formData,
    showTelefono2: Boolean(telefono2),
    existingImages: normalizedImages,
    busquedaSitio: source.sitio?.nombre_sitio || source.nombre_sitio || source.nombre || "",
    boletas,
    informacionAdicionalItems,
  }
}

export function validateEditEventForm(params: {
  formData: FormDataState
  boletas: BoleteDefinition[]
  informacionAdicionalItems: EventoInfoItem[]
}): { field: keyof FormErrors; message: string } | null {
  const { formData, boletas, informacionAdicionalItems } = params

  const nombreEvento = String(formData.nombre_evento || "").trim()
  if (!nombreEvento || nombreEvento.length < 6 || nombreEvento.length > 40 || !ALPHANUM_SPACE_REGEX.test(nombreEvento)) {
    return {
      field: "nombre_evento",
      message: "El nombre del evento debe tener entre 6 y 40 caracteres y solo usar letras y numeros.",
    }
  }

  if (formData.pulep_evento && !/^[A-Z0-9]{6,8}$/.test(String(formData.pulep_evento).toUpperCase())) {
    return {
      field: "pulep_evento",
      message: "El codigo PULEP debe tener entre 6 y 8 caracteres y solo usar letras mayusculas y numeros.",
    }
  }

  const responsable = String(formData.responsable_evento || "").trim()
  if (!responsable || responsable.length < 6 || responsable.length > 40 || !ALPHANUM_SPACE_REGEX.test(responsable)) {
    return {
      field: "responsable_evento",
      message: "El responsable debe tener entre 6 y 40 caracteres y solo usar letras y numeros.",
    }
  }

  const descripcion = String(formData.descripcion || "").trim()
  if (!descripcion || descripcion.length < 10 || descripcion.length > 100 || !TEXT_WITH_PUNCT_REGEX.test(descripcion)) {
    return {
      field: "descripcion",
      message: "La descripcion debe tener entre 10 y 100 caracteres y solo usar caracteres permitidos.",
    }
  }

  if (!formData.id_categoria_evento) return { field: "id_categoria_evento", message: "Debes seleccionar una categoria." }
  if (!formData.id_tipo_evento) return { field: "id_tipo_evento", message: "Debes seleccionar un tipo de evento." }
  if (!formData.id_sitio) return { field: "id_sitio", message: "Debes seleccionar un sitio." }

  if (!formData.telefono_1 || String(formData.telefono_1).length !== 10 || Number(formData.telefono_1) <= 2999999999) {
    return { field: "telefono_1", message: "El telefono debe tener 10 digitos y ser valido." }
  }

  if (formData.telefono_2 && (String(formData.telefono_2).length !== 10 || Number(formData.telefono_2) <= 2999999999)) {
    return { field: "telefono_2", message: "El telefono 2 debe tener 10 digitos y ser valido." }
  }

  if (formData.telefono_principal === "2" && !formData.telefono_2) {
    return { field: "telefono_2", message: "Debes registrar el telefono 2 para marcarlo como principal." }
  }

  if (!formData.fecha_inicio) return { field: "fecha_inicio", message: "Debes seleccionar una fecha de inicio." }
  if (!formData.fecha_fin) return { field: "fecha_fin", message: "Debes seleccionar una fecha final." }
  if (!formData.hora_inicio) return { field: "hora_inicio", message: "Debes seleccionar una hora de inicio." }
  if (!formData.hora_final) return { field: "hora_final", message: "Debes seleccionar una hora final." }

  const infoValidItems = (informacionAdicionalItems || []).filter((item) => item.detalle?.trim())
  if (infoValidItems.length === 0) {
    return {
      field: "informacion_adicional_items",
      message: "Debes registrar al menos un item de informacion adicional.",
    }
  }

  for (const infoItem of infoValidItems) {
    const detalle = String(infoItem.detalle || "").trim()
    if (detalle.length < 10 || detalle.length > 40 || !TEXT_WITH_PUNCT_REGEX.test(detalle)) {
      return {
        field: "informacion_adicional_items",
        message: "Cada item debe tener entre 10 y 40 caracteres y solo usar caracteres permitidos.",
      }
    }
  }

  const cupoValue = Number(String(formData.cupo || ""))
  if (!Number.isInteger(cupoValue) || cupoValue < 20 || cupoValue > 5000) {
    return {
      field: "cupo",
      message: "El aforo debe ser un numero entero entre 20 y 5000.",
    }
  }

  if (Boolean(formData.gratis_pago)) {
    const boletasValidas = (boletas || []).filter(
      (value) =>
        String(value.nombre_boleto || "").trim() ||
        String(value.precio_boleto || "").trim() ||
        String(value.servicio || "").trim()
    )

    if (boletasValidas.length === 0) {
      return {
        field: "boletas",
        message: "Debes definir al menos una boleta para eventos de pago.",
      }
    }

    for (const boleta of boletasValidas) {
      const nombreBoleto = String(boleta.nombre_boleto || "").trim()
      const precio = Number(String(boleta.precio_boleto || ""))
      const servicio = String(boleta.servicio || "").trim() ? Number(String(boleta.servicio || "")) : 0

      if (nombreBoleto.length < 3 || !ALPHANUM_SPACE_REGEX.test(nombreBoleto)) {
        return {
          field: "boletas",
          message: "El nombre de la boleta debe tener minimo 3 caracteres y solo usar letras y numeros.",
        }
      }

      if (!Number.isInteger(precio) || precio <= 0 || precio > 500000000) {
        return {
          field: "boletas",
          message: "El precio debe ser un entero positivo y no mayor a 500.000.000.",
        }
      }

      if (!Number.isInteger(servicio) || servicio < 0 || servicio > 500000000) {
        return {
          field: "boletas",
          message: "El cargo por servicio debe ser un entero entre 0 y 500.000.000.",
        }
      }
    }
  }

  return null
}

export function buildEditEventFormData(params: {
  formData: FormDataState
  boletas: BoleteDefinition[]
  informacionAdicionalItems: EventoInfoItem[]
  images: File[]
  documento: File | null
  imagesToDelete: number[]
}) {
  const { formData, boletas, informacionAdicionalItems, images, documento, imagesToDelete } = params

  const nombreEvento = String(formData.nombre_evento || "").trim()
  const responsable = String(formData.responsable_evento || "").trim()
  const descripcion = String(formData.descripcion || "").trim()
  const cupoValue = Number(String(formData.cupo || ""))

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
        .map((item) => ({ detalle: item.detalle.trim(), obligatorio: Boolean(item.obligatorio) }))
    )
  )

  images.forEach((image) => {
    submitFormData.append("additionalImages", image)
  })

  if (documento) {
    submitFormData.append("documento", documento)
  }

  submitFormData.append(
    "boletas",
    JSON.stringify(
      (boletas || []).map((boleta) => ({
        nombre_boleto: String(boleta.nombre_boleto || "").trim(),
        precio_boleto: String(boleta.precio_boleto || "").replace(/[^0-9]/g, ""),
        servicio: String(boleta.servicio || "").replace(/[^0-9]/g, ""),
      }))
    )
  )

  submitFormData.append("imagesToDelete", JSON.stringify(imagesToDelete))

  return submitFormData
}
