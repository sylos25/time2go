import type { EventData } from "./event-landing-types"

export type CalendarDayCell = {
  key: string
  dayLabel: string
  isEventDay: boolean
}

export function parseSiteCoordinate(value: unknown): number | null {
  if (value == null) return null
  if (typeof value === "number" && Number.isFinite(value)) return value
  const textValue = String(value).trim().replace(",", ".")
  if (!textValue) return null
  const parsed = Number.parseFloat(textValue)
  return Number.isFinite(parsed) ? parsed : null
}

export function formatDate(value: unknown): string {
  if (!value) return "—"
  try {
    const date = new Date(String(value))
    const day = date.getUTCDate()
    const month = date.getUTCMonth() + 1
    const year = date.getUTCFullYear()
    return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`
  } catch {
    return String(value)
  }
}

export function formatLongDate(value: unknown): string {
  if (!value) return "—"
  try {
    return new Date(String(value)).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return String(value)
  }
}

export function formatShortDate(value: unknown): string {
  if (!value) return "—"
  try {
    return new Date(String(value)).toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
    })
  } catch {
    return String(value)
  }
}

export function formatTime(value: string | Date | null | undefined): string {
  if (!value) return "—"
  try {
    if (value instanceof Date) {
      return value.toTimeString().slice(0, 5)
    }
    const timeParts = String(value).trim().split(":")
    return timeParts.slice(0, 2).join(":")
  } catch {
    return String(value)
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value)
}

export function slugify(value: string): string {
  return (
    String(value || "evento")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "evento"
  )
}

function normalizeDateKey(value: string | number | Date): string | null {
  try {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  } catch {
    return null
  }
}

export function getEventDateKeys(event: EventData): Set<string> {
  const keys = new Set<string>()

  if (event.fecha_inicio) {
    const startDate = new Date(event.fecha_inicio)
    const endDate = event.fecha_fin ? new Date(event.fecha_fin) : startDate

    for (const date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const key = normalizeDateKey(date)
      if (key) keys.add(key)
    }
  }

  const eventDays = Array.isArray(event.dias_evento)
    ? event.dias_evento
    : Array.isArray(event.dias)
      ? event.dias
      : []

  for (const day of eventDays) {
    const key = normalizeDateKey(day)
    if (key) keys.add(key)
  }

  return keys
}

export function buildCalendarDayCells(event: EventData): CalendarDayCell[] {
  const eventDateKeys = getEventDateKeys(event)
  const eventDates = Array.from(eventDateKeys).map((key) => new Date(key))
  if (eventDates.length === 0) return []

  const minDate = new Date(Math.min(...eventDates.map((date) => date.getTime())))
  const displayMonth = minDate.getMonth()
  const displayYear = minDate.getFullYear()
  const firstDayOfMonth = new Date(displayYear, displayMonth, 1)
  const startingDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate()

  const cells: CalendarDayCell[] = []

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dayKey = `${displayYear}-${String(displayMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    cells.push({
      key: dayKey,
      dayLabel: String(day),
      isEventDay: eventDateKeys.has(dayKey),
    })
  }

  for (let emptyIndex = 0; emptyIndex < startingDayOfWeek; emptyIndex += 1) {
    cells.unshift({
      key: `empty-${emptyIndex}`,
      dayLabel: "",
      isEventDay: false,
    })
  }

  return cells
}
