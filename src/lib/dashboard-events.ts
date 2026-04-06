export type EventStatus = "published" | "hidden" | "cancelled" | "completed"

export type EventDocument = {
  id_documento_evento: number
}

export type DashboardEvent = {
  id: number
  name: string
  date: string
  time: string
  location: string
  category: string
  capacity: number
  ticketsSold: number
  status: EventStatus
  visibility: boolean
  promoter: string
  documentos: EventDocument[]
  destacado: boolean
}

export type EventCategory = {
  id_categoria_evento: number
  nombre: string
}

export type RejectForm = {
  id_evento: number
  motivo_rechazo: string
  rechazado_por: string
}

export type EventCategoryTab = {
  value: string
  label: string
}

export const DEFAULT_REJECT_FORM: RejectForm = {
  id_evento: 0,
  motivo_rechazo: "",
  rechazado_por: "",
}

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null
}

export function getAuthHeaders(contentTypeJson = false, token?: string | null): HeadersInit {
  const headers: HeadersInit = {}
  if (contentTypeJson) {
    headers["Content-Type"] = "application/json"
  }

  const resolvedToken = token ?? getToken()
  if (resolvedToken) {
    headers.Authorization = `Bearer ${resolvedToken}`
  }

  return headers
}

function normalizeStatus(isVisible: boolean): EventStatus {
  return isVisible ? "published" : "hidden"
}

export function mapServerEvent(eventValue: any): DashboardEvent {
  return {
    id: Number(eventValue?.id_evento || 0),
    name: String(eventValue?.nombre_evento || "Sin titulo"),
    date: String(eventValue?.fecha_inicio || eventValue?.fecha_creacion || ""),
    time: String(eventValue?.hora_inicio || ""),
    location: String(eventValue?.sitio?.nombre_sitio || eventValue?.municipio?.nombre_municipio || ""),
    category: String(eventValue?.categoria?.nombre || eventValue?.categoria_nombre || ""),
    capacity: Number(eventValue?.cupo || 0),
    ticketsSold: Number(eventValue?.reservas_asistentes || 0),
    status: normalizeStatus(Boolean(eventValue?.estado)),
    visibility: Boolean(eventValue?.estado),
    promoter: String(eventValue?.creador?.nombres || ""),
    documentos: Array.isArray(eventValue?.documentos) ? eventValue.documentos : [],
    destacado: Boolean(eventValue?.destacado),
  }
}

export async function fetchCurrentUser(token?: string | null) {
  const response = await fetch("/api/me", {
    headers: getAuthHeaders(false, token),
    credentials: "include",
  })

  if (!response.ok) {
    return null
  }

  const data = await response.json().catch(() => ({}))
  return data?.user || null
}

export async function checkEventsPermission(roleId: number, token?: string | null) {
  const response = await fetch(`/api/permissions/check?id_accesibilidad=4&id_rol=${roleId}`, {
    headers: getAuthHeaders(false, token),
    credentials: "include",
  })

  if (!response.ok) {
    return false
  }

  const data = await response.json().catch(() => ({}))
  return Boolean(data?.hasAccess)
}

export async function fetchEvents(token?: string | null) {
  const response = await fetch("/api/events?includeAll=true", {
    headers: getAuthHeaders(false, token),
    credentials: "include",
  })

  if (!response.ok) {
    return [] as DashboardEvent[]
  }

  const data = await response.json().catch(() => ({}))
  const events = Array.isArray(data?.eventos) ? data.eventos : []
  return events.map(mapServerEvent)
}

export async function fetchEventCategories(token?: string | null) {
  const response = await fetch("/api/categoria_evento", {
    headers: getAuthHeaders(false, token),
    credentials: "include",
  })

  if (!response.ok) {
    return [] as EventCategory[]
  }

  const data = await response.json().catch(() => [])
  return Array.isArray(data) ? data : []
}

async function parseErrorMessage(response: Response, fallback: string) {
  const body = await response.json().catch(() => ({}))
  return String(body?.message || fallback)
}

export async function deleteEventById(eventId: number, token?: string | null) {
  const response = await fetch(`/api/events/${eventId}`, {
    method: "DELETE",
    headers: getAuthHeaders(false, token),
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "No se pudo eliminar el evento"))
  }
}

export async function approveEventById(eventId: number, token?: string | null) {
  const response = await fetch(`/api/events/${eventId}/toggle-status`, {
    method: "PUT",
    headers: getAuthHeaders(true, token),
    credentials: "include",
    body: JSON.stringify({ estado: true }),
  })

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "No se pudo validar el evento"))
  }
}

export async function rejectEventById(
  eventId: number,
  payload: { motivo_rechazo: string; rechazado_por: number },
  token?: string | null
) {
  const response = await fetch(`/api/events/${eventId}/toggle-status`, {
    method: "PUT",
    headers: getAuthHeaders(true, token),
    credentials: "include",
    body: JSON.stringify({ estado: false, ...payload }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data?.ok) {
    throw new Error(String(data?.message || "No se pudo rechazar el evento"))
  }
}

export async function toggleDestacadoById(eventId: number, destacado: boolean, token?: string | null) {
  const response = await fetch(`/api/events/${eventId}/toggle-status`, {
    method: "PUT",
    headers: getAuthHeaders(true, token),
    credentials: "include",
    body: JSON.stringify({ destacado }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data?.ok) {
    throw new Error(String(data?.message || "No se pudo actualizar el estado destacado"))
  }
}

export function buildEventCategoryTabs(categories: EventCategory[]): EventCategoryTab[] {
  return [
    { value: "all", label: "Todas las categorias" },
    ...categories.map((category) => ({
      value: category.nombre,
      label: category.nombre,
    })),
  ]
}

export function formatEventDate(value: string) {
  if (!value) return "-"
  const raw = String(value).trim()
  if (raw.includes("T")) return raw.split("T")[0]
  if (raw.includes(" ")) return raw.split(" ")[0]
  return raw
}

export function formatEventTime(value: string) {
  if (!value) return "-"
  const raw = String(value).trim()
  const timePart = raw.includes("T") ? raw.split("T")[1] || "" : raw.includes(" ") ? raw.split(" ")[1] || raw : raw
  const clean = timePart.replace(/Z$/i, "").replace(/\.\d+$/, "")
  if (/^\d{2}:\d{2}$/.test(clean)) return `${clean}:00`
  return clean || "-"
}

export function getStatusColor(status: EventStatus) {
  switch (status) {
    case "published":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
    case "hidden":
      return "bg-muted text-muted-foreground"
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
    case "completed":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function getStatusText(status: EventStatus) {
  switch (status) {
    case "published":
      return "Publicado"
    case "hidden":
      return "Oculto"
    case "cancelled":
      return "Cancelado"
    case "completed":
      return "Completado"
    default:
      return "Desconocido"
  }
}
