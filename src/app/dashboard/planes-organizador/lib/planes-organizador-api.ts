import type {
  OrganizerPlan,
  PlansDashboardPayload,
  UpdatePlanInput,
  UpdateSubscriptionStatusInput,
  UpdatedSubscriptionResult,
} from "./planes-organizador-types"

function getAuthHeaders(includeJson = false): HeadersInit {
  const headers: HeadersInit = {}

  if (includeJson) {
    headers["Content-Type"] = "application/json"
  }

  return headers
}

async function parseResponse<T = Record<string, unknown>>(response: Response): Promise<T> {
  return (await response.json().catch(() => ({}))) as T
}

export async function fetchPlansDashboardData() {
  const response = await fetch("/api/dashboard/planes-organizador", {
    headers: getAuthHeaders(),
    credentials: "include",
  })

  const data = await parseResponse<PlansDashboardPayload>(response)
  if (!response.ok || !data.ok) {
    throw new Error(data.message || "No se pudo cargar la sección")
  }

  return {
    plans: Array.isArray(data.plans) ? data.plans : [],
    subscriptions: Array.isArray(data.subscriptions) ? data.subscriptions : [],
  }
}

export async function updateOrganizerPlan({ idPlan, plan }: UpdatePlanInput): Promise<OrganizerPlan> {
  const response = await fetch("/api/dashboard/planes-organizador", {
    method: "PATCH",
    headers: getAuthHeaders(true),
    credentials: "include",
    body: JSON.stringify({
      action: "updatePlan",
      idPlan,
      nombre_plan: plan.nombre_plan,
      precio_cop: plan.precio_cop,
      max_eventos_mensuales: plan.max_eventos_mensuales,
      max_imagenes_por_evento: plan.max_imagenes_por_evento,
      aforo_minimo: plan.aforo_minimo,
      aforo_maximo: plan.aforo_maximo,
      permite_destacado: plan.permite_destacado,
      activo: plan.activo,
    }),
  })

  const data = await parseResponse<{ ok?: boolean; message?: string; plan?: OrganizerPlan }>(response)
  if (!response.ok || !data.ok || !data.plan) {
    throw new Error(data.message || "No se pudo actualizar el plan")
  }

  return data.plan
}

export async function updateOrganizerSubscriptionStatus({
  idSuscripcion,
  estadoSuscripcion,
}: UpdateSubscriptionStatusInput): Promise<UpdatedSubscriptionResult> {
  const response = await fetch("/api/dashboard/planes-organizador", {
    method: "PATCH",
    headers: getAuthHeaders(true),
    credentials: "include",
    body: JSON.stringify({
      action: "updateSubscriptionStatus",
      idSuscripcion,
      estado_suscripcion: estadoSuscripcion,
    }),
  })

  const data = await parseResponse<{
    ok?: boolean
    message?: string
    subscription?: UpdatedSubscriptionResult
  }>(response)

  if (!response.ok || !data.ok || !data.subscription) {
    throw new Error(data.message || "No se pudo actualizar la suscripción")
  }

  return data.subscription
}

export function formatDate(value: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"

  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function formatCop(value: string) {
  const amount = Number(value || "0")
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0)
}
