import type { MyEventItem, RawMyEvent } from "./mis-eventos-types"

function formatDate(dateValue?: string, hourValue?: string): string {
  if (!dateValue) return "-"

  const dateText = new Date(dateValue).toLocaleDateString("es-ES")
  const hourText = hourValue ? String(hourValue).slice(0, 5) : ""

  return hourText ? `${dateText} · ${hourText}` : dateText
}

function resolveLocation(event: RawMyEvent): string {
  return (
    event.sitio?.nombre_sitio ||
    event.municipio?.nombre_municipio ||
    event.nombre_municipio ||
    "-"
  )
}

export function normalizeMyEvent(event: RawMyEvent): MyEventItem {
  return {
    id: Number(event.id_evento || 0),
    idPublico: event.id_publico_evento ? String(event.id_publico_evento) : null,
    title: String(event.nombre_evento || "Evento sin nombre"),
    imageUrl: String(event.imagenes?.[0]?.url_imagen_evento || ""),
    dateText: formatDate(event.fecha_inicio, event.hora_inicio),
    locationText: resolveLocation(event),
    capacityText: Number(event.cupo || 0).toLocaleString("es-CO"),
  }
}