import type { Categoria, Evento, Sitio, TipoEvento } from "@/types/event-edit"

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null
}

function getAuthHeaders() {
  const headers: Record<string, string> = {}
  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

export async function fetchEventDetail(sourceEvent: Evento): Promise<Evento> {
  const response = await fetch(`/api/events?id=${sourceEvent.id_evento || sourceEvent.id}&includeAll=true`, {
    headers: getAuthHeaders(),
    credentials: "include",
  })

  if (!response.ok) {
    return sourceEvent
  }

  const data = (await response.json().catch(() => ({}))) as { event?: Evento }
  return data.event || sourceEvent
}

export async function fetchCategorias(): Promise<Categoria[]> {
  const response = await fetch("/api/categoria_evento", {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    return []
  }

  const data = (await response.json().catch(() => [])) as Categoria[]
  return Array.isArray(data) ? data : []
}

export async function fetchSitios(nombreSitio: string): Promise<Sitio[]> {
  const query = `/api/llamar_sitio?nombre_sitio=${encodeURIComponent(nombreSitio)}`
  const response = await fetch(query, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    return []
  }

  const data = (await response.json().catch(() => [])) as Sitio[]
  return Array.isArray(data) ? data : []
}

export async function fetchTiposEvento(categoriaId: string): Promise<TipoEvento[]> {
  if (!categoriaId) {
    return []
  }

  const response = await fetch(`/api/tipo_evento?categoriaId=${categoriaId}`)
  if (!response.ok) {
    return []
  }

  const data = (await response.json().catch(() => [])) as TipoEvento[]
  return Array.isArray(data) ? data : []
}

export async function updateEventRequest(eventId: number | string | undefined, body: FormData) {
  const response = await fetch(`/api/events/${eventId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body,
  })

  const payload = await response.json().catch(() => ({}))
  return {
    ok: response.ok,
    payload,
  }
}
