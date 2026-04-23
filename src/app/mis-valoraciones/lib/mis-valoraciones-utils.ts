import type { Valoracion } from "@/app/mis-valoraciones/lib/mis-valoraciones-types"

export function normalizeValoracion(value: unknown): Valoracion | null {
  if (!value || typeof value !== "object") return null

  const raw = value as Record<string, unknown>
  const id_valoracion = Number(raw.id_valoracion || 0)
  if (!Number.isFinite(id_valoracion) || id_valoracion <= 0) return null

  return {
    id_valoracion,
    valoracion: Number(raw.valoracion || 0),
    comentario: raw.comentario ? String(raw.comentario) : null,
    fecha_creacion: String(raw.fecha_creacion || ""),
    id_publico_evento: raw.id_publico_evento ? String(raw.id_publico_evento) : undefined,
    id_evento: Number(raw.id_evento || 0) || undefined,
    nombre_evento: String(raw.nombre_evento || "Evento"),
    fecha_inicio: String(raw.fecha_inicio || ""),
    hora_inicio: String(raw.hora_inicio || ""),
    imagen_evento: raw.imagen_evento ? String(raw.imagen_evento) : null,
  }
}

export function normalizeValoraciones(values: unknown[] | undefined): Valoracion[] {
  if (!Array.isArray(values)) return []
  return values
    .map(normalizeValoracion)
    .filter((value): value is Valoracion => Boolean(value))
}

export function getAverageRating(values: Valoracion[]): string {
  if (values.length === 0) return "0.0"
  const total = values.reduce((acc, item) => acc + item.valoracion, 0)
  return (total / values.length).toFixed(1)
}

export function getSummaryText(loading: boolean, count: number): string {
  if (loading) return "Cargando..."
  if (count === 0) return "Aun no has valorado ningun evento."

  return `Tienes ${count} valoracion${count !== 1 ? "es" : ""} registrada${count !== 1 ? "s" : ""}.`
}

export function getEventPathId(valoracion: Valoracion): string {
  if (valoracion.id_publico_evento) return valoracion.id_publico_evento
  return String(valoracion.id_evento || "")
}

export function formatEventDateTime(fechaInicio: string, horaInicio?: string): string {
  const dateText = fechaInicio
    ? new Date(fechaInicio).toLocaleDateString("es-CO", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Fecha por confirmar"

  const timeText = horaInicio ? ` · ${horaInicio.slice(0, 5)}` : ""
  return `${dateText}${timeText}`
}

export function formatCreatedDate(value: string): string {
  if (!value) return ""
  return new Date(value).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
