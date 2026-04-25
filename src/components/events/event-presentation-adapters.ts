import type { EventCardItem, RawEventImage } from "@/app/eventos/lib/events-page-types"
import { formatEventPrice } from "@/app/eventos/lib/events-page-utils"
import { EVENT_PRESENTATION_LABELS } from "@/components/events/event-presentation-constants"

import type {
  EventCardImage,
  EventCardMetaRow,
  EventPresentationCardProps,
} from "@/components/events/event-presentation-card"

type PresentationEvent = EventPresentationCardProps["event"]

export interface FeaturedEvent {
  id: number
  categoryId: number
  idPublico: string | null
  title: string
  description: string
  date: string
  location: string
  attendees: number
  price: number | string
  image: string
  images: EventCardImage[]
  category: string
  eventType?: string | null
  rating?: number | null
  featuredAt?: string | null
  startDateRaw?: string | null
  endDateRaw?: string | null
  startTimeRaw?: string | null
  endTimeRaw?: string | null
}

export type LandingCategory = {
  id: number
  nombre: string
}

export type HomeConfigResponse = {
  ok: boolean
  selectedCategories?: LandingCategory[]
}

export type ServerEventImage = {
  id_imagen_evento?: unknown
  url_imagen_evento?: unknown
}

export type ServerEventPrice = {
  precio_boleto?: unknown
  valor?: unknown
}

export type ServerEvent = {
  estado?: unknown
  id_publico_evento?: unknown
  destacado?: unknown
  id_categoria_evento?: unknown
  evento_categoria_id?: unknown
  categoria?: { id_categoria_evento?: unknown; nombre?: unknown }
  categoria_nombre?: unknown
  imagenes?: ServerEventImage[]
  fecha_inicio?: unknown
  fecha_final?: unknown
  hora_inicio?: unknown
  hora_final?: unknown
  gratis_pago?: unknown
  valores?: ServerEventPrice[]
  id_evento?: unknown
  nombre_evento?: unknown
  descripcion?: unknown
  sitio?: { nombre_sitio?: unknown }
  nombre_sitio?: unknown
  cupo?: unknown
  tipo_evento?: unknown
  tipo?: unknown
  promedio_valoracion?: unknown
  fecha_destacado?: unknown
}

export function mapSelectedCategories(response: HomeConfigResponse): LandingCategory[] {
  if (!Array.isArray(response.selectedCategories)) {
    return []
  }

  return response.selectedCategories
    .map((category) => ({
      id: Number(category.id),
      nombre: String(category.nombre || ""),
    }))
    .filter((category) => category.id > 0 && category.nombre.length > 0)
}

export function extractRawEvents(data: unknown): ServerEvent[] {
  if (data && typeof data === "object") {
    const dataObj = data as { ok?: unknown; eventos?: unknown }
    if (dataObj.ok === true && Array.isArray(dataObj.eventos)) {
      return dataObj.eventos as ServerEvent[]
    }
  }

  if (Array.isArray(data)) {
    return data as ServerEvent[]
  }

  return []
}

export function isFeaturedEventInLanding(
  event: ServerEvent,
  selectedCategoryIds: Set<number>
): boolean {
  if (event?.estado !== true || event?.destacado !== true) {
    return false
  }

  if (selectedCategoryIds.size === 0) {
    return true
  }

  const eventCategoryId = Number(
    event?.id_categoria_evento || event?.evento_categoria_id || event?.categoria?.id_categoria_evento || 0
  )

  return selectedCategoryIds.has(eventCategoryId)
}

export function mapServerEventToFeaturedEvent(event: ServerEvent): FeaturedEvent {
  const images = Array.isArray(event.imagenes)
    ? event.imagenes.map((image, index) => ({
        id: String(image.id_imagen_evento || `featured-${index}`),
        url: String(image.url_imagen_evento || "/placeholder.svg"),
        alt: `${String(event.nombre_evento || "Evento")} ${index + 1}`,
      }))
    : []

  const firstImage = images.length > 0 ? images[0].url : "/placeholder.svg"

  const date = event.fecha_inicio
    ? new Date(String(event.fecha_inicio)).toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
      })
    : "Sin fecha"

  let price: number | string = "Gratis"
  if (event.gratis_pago) {
    const prices = Array.isArray(event.valores)
      ? event.valores
          .map((value: ServerEventPrice) => Number(value?.precio_boleto ?? value?.valor ?? 0))
          .filter((value: number) => Number.isFinite(value) && value > 0)
      : []
    price = prices.length ? Math.min(...prices) : 0
  }

  return {
    id: Number(event.id_evento),
    categoryId: Number(
      event.id_categoria_evento || event.evento_categoria_id || event.categoria?.id_categoria_evento || 0
    ),
    idPublico: event.id_publico_evento ? String(event.id_publico_evento) : null,
    title: String(event.nombre_evento || "Evento"),
    description: String(event.descripcion || ""),
    date,
    location: String(event.sitio?.nombre_sitio || event.nombre_sitio || "Ubicacion por confirmar"),
    attendees: Number(event.cupo || 0),
    price,
    image: firstImage,
    images,
    category: String(event.categoria?.nombre || event.categoria_nombre || "Sin categoria"),
    eventType: getEventTypeLabel(event.tipo_evento ?? event.tipo),
    rating: Number.isFinite(Number(event.promedio_valoracion)) ? Number(event.promedio_valoracion) : null,
    featuredAt: event.fecha_destacado ? String(event.fecha_destacado) : null,
    startDateRaw: event.fecha_inicio ? String(event.fecha_inicio) : null,
    endDateRaw: event.fecha_final ? String(event.fecha_final) : null,
    startTimeRaw: event.hora_inicio ? String(event.hora_inicio) : null,
    endTimeRaw: event.hora_final ? String(event.hora_final) : null,
  }
}

export function sortFeaturedEventsByDate(events: FeaturedEvent[]): FeaturedEvent[] {
  return [...events].sort((a, b) => {
    const featuredA = a.featuredAt ? new Date(a.featuredAt).getTime() : 0
    const featuredB = b.featuredAt ? new Date(b.featuredAt).getTime() : 0
    return featuredB - featuredA
  })
}

export function toPresentationEventFromFeatured(event: FeaturedEvent): PresentationEvent {
  return {
    id: event.id,
    title: event.title,
    category: event.category,
    description: event.description,
    location: event.location,
    attendees: event.attendees,
    price: event.price,
    image: event.image,
    rating: event.rating,
  }
}

export function getPreviewMetaRows(event: FeaturedEvent): EventCardMetaRow[] {
  return [
    { icon: "calendar", text: event.date },
    { icon: "mapPin", text: event.location },
    { icon: "users", text: event.attendees.toLocaleString("es-CO") },
  ]
}

export function getPreviewPriceLabel(price: number | string): string {
  return formatEventPrice(price)
}

export function getEventPriceTagLabel(price: number | string): string {
  return typeof price === "number"
    ? EVENT_PRESENTATION_LABELS.tags.paid
    : EVENT_PRESENTATION_LABELS.tags.free
}

function formatDateLabel(value: unknown, fallback = "Por confirmar") {
  if (!value) return fallback
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return fallback
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

function formatTimeLabel(value: unknown, fallback = "Por confirmar") {
  if (!value || typeof value !== "string") return fallback
  const match = value.match(/^(\d{1,2}):(\d{2})/)
  if (!match) return fallback
  let hours = Number(match[1])
  const minutes = match[2]
  if (!Number.isFinite(hours) || hours < 0 || hours > 23) return fallback
  const period = hours >= 12 ? "p.m." : "a.m."
  hours = hours % 12 || 12
  return `${hours}:${minutes} ${period}`
}

function getEventTypeLabel(rawType: unknown): string {
  if (typeof rawType === "string" && rawType.trim().length > 0) {
    return rawType.trim()
  }
  if (rawType && typeof rawType === "object") {
    const eventTypeObj = rawType as Record<string, unknown>
    const candidate =
      eventTypeObj.nombre ?? eventTypeObj.tipo ?? eventTypeObj.descripcion ?? eventTypeObj.label
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim()
    }
  }
  return "Tipo no especificado"
}

function getEventRating(rawEvent: EventCardItem["raw"]): number {
  const rawRatingCandidates = [
    rawEvent?.promedio_valoracion,
    rawEvent?.promedioValoracion,
    rawEvent?.valoracion_promedio,
    rawEvent?.calificacion_promedio,
    rawEvent?.rating_promedio,
    rawEvent?.rating,
    rawEvent?.valoracion,
  ]
  const numericRating = rawRatingCandidates
    .map((value) => Number(value))
    .find((value) => Number.isFinite(value) && value >= 0)
  return typeof numericRating === "number" ? numericRating : 0
}

function mapEventImages(eventImages: RawEventImage[], title: string): EventCardImage[] {
  return eventImages.map((image, index) => ({
    id: String(image.id_imagen_evento || "img"),
    url: image.url_imagen_evento || "/placeholder.svg",
    alt: `${title} ${index + 1}`,
  }))
}

export type GridPresentationData = {
  event: PresentationEvent
  secondaryBadgeLabel: string
  topLeftTagLabel: string
  metaRows: EventCardMetaRow[]
  imageGallery: EventCardImage[]
  priceLabel: string
}

export function toGridPresentationData(event: EventCardItem): GridPresentationData {
  const eventImages = Array.isArray(event.raw?.imagenes) ? event.raw.imagenes : []
  const startDate = formatDateLabel(event.raw?.fecha_inicio)
  const endDate = formatDateLabel(event.raw?.fecha_final, startDate)
  const startTime = formatTimeLabel(event.raw?.hora_inicio)
  const endTime = formatTimeLabel(event.raw?.hora_final)
  const eventType = getEventTypeLabel(event.raw?.tipo_evento ?? event.raw?.tipo)
  const rating = getEventRating(event.raw)

  return {
    event: {
      id: event.id_evento,
      title: event.title,
      category: event.category,
      description: event.description,
      location: event.location,
      attendees: event.attendees,
      price: event.price,
      image: event.image,
      rating,
    },
    secondaryBadgeLabel: eventType,
    topLeftTagLabel: getEventPriceTagLabel(event.price),
    metaRows: [
      { icon: "calendar", text: `${startDate} - ${endDate}` },
      { icon: "calendar", text: `${startTime} - ${endTime}` },
      {
        icon: "mapPin",
        text: `${EVENT_PRESENTATION_LABELS.location.prefix} ${event.location}`,
      },
      {
        icon: "users",
        text: `${EVENT_PRESENTATION_LABELS.attendees.capacityPrefix} ${Number(event.attendees).toLocaleString("es-CO")}`,
      },
    ],
    imageGallery: mapEventImages(eventImages, event.title),
    priceLabel: formatEventPrice(event.price),
  }
}

export function toGridPresentationDataFromFeaturedEvent(
  event: FeaturedEvent
): GridPresentationData {
  const startDate = formatDateLabel(event.startDateRaw)
  const endDate = formatDateLabel(event.endDateRaw, startDate)
  const startTime = formatTimeLabel(event.startTimeRaw)
  const endTime = formatTimeLabel(event.endTimeRaw)

  return {
    event: toPresentationEventFromFeatured(event),
    secondaryBadgeLabel: event.eventType || "Tipo no especificado",
    topLeftTagLabel: getEventPriceTagLabel(event.price),
    metaRows: [
      { icon: "calendar", text: `${startDate} - ${endDate}` },
      { icon: "calendar", text: `${startTime} - ${endTime}` },
      {
        icon: "mapPin",
        text: `${EVENT_PRESENTATION_LABELS.location.prefix} ${event.location}`,
      },
      {
        icon: "users",
        text: `${EVENT_PRESENTATION_LABELS.attendees.capacityPrefix} ${Number(event.attendees).toLocaleString("es-CO")}`,
      },
    ],
    imageGallery: event.images,
    priceLabel: formatEventPrice(event.price),
  }
}