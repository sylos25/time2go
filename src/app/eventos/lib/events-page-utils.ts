import type {
  EventFilters,
  EventCardItem,
  MunicipalityOption,
  RawEvent,
  RawTicketValue,
} from "./events-page-types"

export function formatEventPrice(price: number | string): string {
  if (typeof price === "number") {
    return `$${price.toLocaleString("es-CO")}`
  }
  return String(price)
}

function getMinTicketPrice(values: RawTicketValue[] | undefined): number {
  if (!Array.isArray(values) || values.length === 0) return 0

  const prices = values
    .map((value) => Number(value?.precio_boleto ?? value?.valor ?? 0))
    .filter((price) => Number.isFinite(price) && price > 0)

  return prices.length > 0 ? Math.min(...prices) : 0
}

function normalizeCategoryId(event: RawEvent): number {
  return Number(
    event.id_categoria_evento ||
      event.evento_categoria_id ||
      event.categoria?.id_categoria_evento ||
      0
  )
}

export function normalizeEvent(event: RawEvent): EventCardItem {
  const firstImage =
    Array.isArray(event.imagenes) && event.imagenes.length > 0
      ? event.imagenes[0]?.url_imagen_evento
      : null

  let price: number | string = 0
  if (!event.gratis_pago) {
    price = "Gratis"
  } else {
    price = getMinTicketPrice(event.valores)
  }

  const siteName = String(event.sitio?.nombre_sitio || "").trim()
  const municipalityName = String(event.municipio?.nombre_municipio || "").trim()

  return {
    id_evento: Number(event.id_evento || 0),
    id_publico_evento: event.id_publico_evento ? String(event.id_publico_evento) : null,
    title: String(event.nombre_evento || ""),
    category: String(event.categoria?.nombre || "Sin categoría"),
    description: String(event.descripcion || ""),
    image: firstImage || "/placeholder.svg",
    date: event.fecha_inicio
      ? new Date(event.fecha_inicio).toLocaleDateString("es-CO")
      : "",
    time: event.hora_inicio
      ? `${event.hora_inicio}${event.hora_final ? ` - ${event.hora_final}` : ""}`
      : "",
    location: siteName || municipalityName || "Sitio por confirmar",
    attendees: Number(event.cupo || 0),
    id_categoria_evento: normalizeCategoryId(event),
    price,
    raw: event,
  }
}

function toTimestamp(dateValue: string | undefined | null, endOfDay = false): number | null {
  if (!dateValue) return null

  const safe = String(dateValue).trim()
  if (!safe) return null

  if (/^\d{4}-\d{2}-\d{2}$/.test(safe)) {
    const suffix = endOfDay ? "T23:59:59.999" : "T00:00:00.000"
    const parsed = Date.parse(`${safe}${suffix}`)
    return Number.isNaN(parsed) ? null : parsed
  }

  const parsed = Date.parse(safe)
  if (Number.isNaN(parsed)) return null

  if (!endOfDay) return parsed
  const date = new Date(parsed)
  date.setHours(23, 59, 59, 999)
  return date.getTime()
}

function getNumericPrice(event: EventCardItem): number {
  if (typeof event.price === "number" && Number.isFinite(event.price)) {
    return Math.max(0, event.price)
  }
  return 0
}

function isFreeEvent(event: EventCardItem): boolean {
  if (typeof event.price === "string") {
    return event.price.toLowerCase().includes("gratis")
  }
  return getNumericPrice(event) <= 0
}

function getEventTypeId(event: EventCardItem): number {
  return Number(event.raw?.id_tipo_evento || event.raw?.tipo_evento?.id_tipo_evento || 0)
}

function getMunicipalityId(event: EventCardItem): number {
  return Number(event.raw?.municipio?.id_municipio || 0)
}

function getDepartmentId(
  event: EventCardItem,
  municipalityToDepartmentMap: ReadonlyMap<number, number>
): number {
  const direct = Number(
    event.raw?.municipio?.id_departamento ||
      event.raw?.municipio?.departamento?.id_departamento ||
      event.raw?.departamento?.id_departamento ||
      0
  )

  if (direct > 0) return direct

  const municipalityId = getMunicipalityId(event)
  if (municipalityId <= 0) return 0

  return municipalityToDepartmentMap.get(municipalityId) || 0
}

function inDateRange(event: EventCardItem, startDate: string, endDate: string): boolean {
  const eventStart = toTimestamp(event.raw?.fecha_inicio || "")
  if (eventStart === null) return false

  const eventEnd =
    toTimestamp(event.raw?.fecha_fin || "", true) || toTimestamp(event.raw?.fecha_inicio || "", true)
  if (eventEnd === null) return false

  const from = toTimestamp(startDate)
  const to = toTimestamp(endDate, true)

  if (from !== null && eventEnd < from) return false
  if (to !== null && eventStart > to) return false

  return true
}

export function filterAndSortEvents(
  events: EventCardItem[],
  searchTerm: string,
  filters: EventFilters,
  municipalities: MunicipalityOption[]
): EventCardItem[] {
  const query = searchTerm.trim().toLowerCase()
  const municipalityToDepartmentMap = new Map<number, number>()

  municipalities.forEach((municipality) => {
    municipalityToDepartmentMap.set(
      municipality.id_municipio,
      municipality.id_departamento
    )
  })

  const result = events.filter((event) => {
    const name = String(event.raw?.nombre_evento || event.title).toLowerCase()
    const description = String(event.raw?.descripcion || event.description).toLowerCase()
    const municipality = String(event.raw?.municipio?.nombre_municipio || "").toLowerCase()
    const location = String(event.location || "").toLowerCase()
    const typeName = String(event.raw?.tipo_evento?.nombre || "").toLowerCase()
    const categoryName = String(event.raw?.categoria?.nombre || event.category).toLowerCase()

    if (
      query.length > 0 &&
      !name.includes(query) &&
      !description.includes(query) &&
      !municipality.includes(query) &&
      !location.includes(query) &&
      !typeName.includes(query) &&
      !categoryName.includes(query)
    ) {
      return false
    }

    if (filters.categoryId !== null && event.id_categoria_evento !== filters.categoryId) {
      return false
    }

    if (filters.eventTypeId !== null && getEventTypeId(event) !== filters.eventTypeId) {
      return false
    }

    if (filters.departmentId !== null) {
      const eventDepartment = getDepartmentId(event, municipalityToDepartmentMap)
      if (eventDepartment !== filters.departmentId) {
        return false
      }
    }

    if (filters.municipalityId !== null && getMunicipalityId(event) !== filters.municipalityId) {
      return false
    }

    if (!inDateRange(event, filters.startDate, filters.endDate)) {
      return false
    }

    const free = isFreeEvent(event)
    if (filters.priceMode === "free" && !free) {
      return false
    }

    if (filters.priceMode === "paid" && free) {
      return false
    }

    const price = getNumericPrice(event)
    if (filters.minPrice !== null && price < filters.minPrice) {
      return false
    }

    if (filters.maxPrice !== null && price > filters.maxPrice) {
      return false
    }

    const reservarAnticipado = Boolean(event.raw?.reservar_anticipado)
    if (filters.availability === "with-reservation" && !reservarAnticipado) {
      return false
    }

    if (filters.availability === "without-reservation" && reservarAnticipado) {
      return false
    }

    return true
  })

  return result.sort((left, right) => {
    const leftTime = Date.parse(String(left.raw?.fecha_inicio || left.date))
    const rightTime = Date.parse(String(right.raw?.fecha_inicio || right.date))
    const safeLeft = Number.isNaN(leftTime) ? 0 : leftTime
    const safeRight = Number.isNaN(rightTime) ? 0 : rightTime
    return safeLeft - safeRight
  })
}
