export type AlertaEvento = {
  id_evento: number
  nombre_evento: string
  id_publico_evento: string
  reportes_count: number
}

export type DenunciaRow = {
  id_denuncia_evento: number
  id_usuario: number
  id_evento: number
  estado: string
  descripcion_adicional: string | null
  fecha_creacion: string
  fecha_resolucion: string | null
  revisada_por: number | null
  nombre_evento: string
  id_publico_evento: string
  nombre_motivo: string
  nombre_categoria_denuncia: string
  report_nombres: string
  report_apellidos: string
}

export const ESTADOS_FILTRO = [
  { value: "todas", label: "Todos los estados" },
  { value: "pendiente", label: "Pendiente" },
  { value: "revisando", label: "Revisando" },
  { value: "resuelta", label: "Resuelta" },
  { value: "desestimada", label: "Desestimada" },
]

export const REPORTS_PAGE_SIZE = 20

export function badgeVariant(estado: string) {
  switch (estado) {
    case "pendiente":
      return "outline" as const
    case "revisando":
      return "secondary" as const
    case "resuelta":
      return "default" as const
    case "desestimada":
      return "destructive" as const
    default:
      return "outline" as const
  }
}

function getHeaders(contentTypeJson = false): HeadersInit {
  const headers: HeadersInit = {}
  if (contentTypeJson) {
    headers["Content-Type"] = "application/json"
  }
  return headers
}

type ApiResponse = {
  ok?: boolean
  [key: string]: unknown
}

async function parseJson(response: Response): Promise<ApiResponse> {
  return response.json().catch(() => ({})) as Promise<ApiResponse>
}

export async function fetchDenuncias(params: { page: number; pageSize: number; estado?: string }) {
  const query = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  })

  if (params.estado && params.estado !== "todas") {
    query.set("estado", params.estado)
  }

  const response = await fetch(`/api/dashboard/denuncias-eventos?${query.toString()}`, {
    headers: getHeaders(),
    credentials: "include",
  })

  const data = await parseJson(response)

  if (!response.ok || !data.ok) {
    return {
      denuncias: [] as DenunciaRow[],
      totalPages: 1,
      total: 0,
    }
  }

  return {
    denuncias: Array.isArray(data.denuncias) ? (data.denuncias as DenunciaRow[]) : [],
    totalPages: Number((data as { pagination?: { totalPages?: number } })?.pagination?.totalPages || 1),
    total: Number((data as { pagination?: { total?: number } })?.pagination?.total || 0),
  }
}

export async function fetchAlertas(params: { minCount: number; days: number }) {
  const query = new URLSearchParams({
    minCount: String(params.minCount),
    days: String(params.days),
  })

  const response = await fetch(`/api/dashboard/denuncias-eventos/alertas?${query.toString()}`, {
    headers: getHeaders(),
    credentials: "include",
  })

  const data = await parseJson(response)
  if (!response.ok || !data.ok) {
    return [] as AlertaEvento[]
  }

  return Array.isArray(data.eventos) ? (data.eventos as AlertaEvento[]) : []
}

export async function patchDenunciaEstado(id: number, estado: string) {
  const response = await fetch(`/api/dashboard/denuncias-eventos/${encodeURIComponent(String(id))}`, {
    method: "PATCH",
    headers: getHeaders(true),
    credentials: "include",
    body: JSON.stringify({ estado }),
  })

  const data = await parseJson(response)
  if (!response.ok || !data.ok) {
    return null
  }

  return {
    fecha_resolucion: (data as { denuncia?: { fecha_resolucion?: string | null } })?.denuncia?.fecha_resolucion ?? null,
  }
}

export function normalizeThreshold(value: string, config: { min: number; max: number; fallback: number }) {
  return Math.max(config.min, Math.min(config.max, Math.floor(Number(value)) || config.fallback))
}
