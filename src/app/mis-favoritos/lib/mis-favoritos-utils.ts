import type { FavoriteEvent, RawEvent } from "@/app/mis-favoritos/lib/mis-favoritos-types"

function toNumberList(values: unknown[] | undefined): number[] {
  if (!Array.isArray(values)) return []

  return values
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value))
}

function getEventPrice(event: RawEvent): number | string {
  if (event.gratis_pago !== true) {
    return "Gratis"
  }

  const validPrices = Array.isArray(event.valores)
    ? event.valores
        .map((value) => Number(value?.precio_boleto ?? value?.valor ?? 0))
        .filter((value) => Number.isFinite(value) && value > 0)
    : []

  return validPrices.length > 0 ? Math.min(...validPrices) : 0
}

export function normalizeFavoriteEvent(event: RawEvent): FavoriteEvent {
  const firstImage =
    Array.isArray(event.imagenes) && event.imagenes.length > 0
      ? event.imagenes[0]?.url_imagen_evento || null
      : null

  return {
    id_evento: Number(event.id_evento || 0),
    id_publico_evento: event.id_publico_evento,
    nombre_evento: String(event.nombre_evento || "Evento sin nombre"),
    descripcion: String(event.descripcion || ""),
    fecha_inicio: String(event.fecha_inicio || ""),
    hora_inicio: event.hora_inicio ? String(event.hora_inicio) : undefined,
    categoria: String(event.categoria?.nombre || event.categoria_nombre || "Sin categoria"),
    location: String(
      event.sitio?.nombre_sitio ||
        event.nombre_sitio ||
        event.municipio?.nombre_municipio ||
        event.nombre_municipio ||
        "Ubicacion no disponible"
    ),
    attendees: Number(event.cupo || 0),
    price: getEventPrice(event),
    image: firstImage,
  }
}

export function filterFavoriteEvents(allEvents: RawEvent[], favoriteIds: number[]): FavoriteEvent[] {
  return allEvents
    .filter((event) => favoriteIds.includes(Number(event?.id_evento || 0)))
    .map(normalizeFavoriteEvent)
}

export function formatFavoritesSummary(isLoading: boolean, count: number): string {
  if (isLoading) return "Cargando..."
  if (count === 0) return "Aun no has guardado eventos como favoritos."

  const suffix = count !== 1 ? "s" : ""
  return `Tienes ${count} evento${suffix} guardado${suffix} en favoritos.`
}

export function formatDisplayPrice(price: number | string): string {
  if (typeof price !== "number") return String(price)
  return `$${price.toLocaleString("es-CO")}`
}

export function getFavoriteIds(values: unknown[] | undefined): number[] {
  return toNumberList(values)
}