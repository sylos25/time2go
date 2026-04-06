import type { EventCardItem, RawEvent, RawTicketValue } from "./events-page-types"

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

export function filterAndSortEvents(
  events: EventCardItem[],
  searchTerm: string,
  selectedCategory: string
): EventCardItem[] {
  return events
    .filter((event) => {
      const query = searchTerm.toLowerCase()
      const name = String(event.raw?.nombre_evento || event.title).toLowerCase()
      const description = String(event.raw?.descripcion || event.description).toLowerCase()
      const matchesSearch = name.includes(query) || description.includes(query)
      const matchesCategory =
        selectedCategory === "all" || String(event.id_categoria_evento) === selectedCategory

      return matchesSearch && matchesCategory
    })
    .sort((left, right) => {
      const leftTime = Date.parse(String(left.raw?.fecha_inicio || left.date))
      const rightTime = Date.parse(String(right.raw?.fecha_inicio || right.date))
      const safeLeft = Number.isNaN(leftTime) ? 0 : leftTime
      const safeRight = Number.isNaN(rightTime) ? 0 : rightTime
      return safeLeft - safeRight
    })
}
