export type OrganizerPlan = {
  id_plan: number
  nombre_plan: string
  precio_cop: number
  max_eventos_mensuales: number
  max_imagenes_por_evento: number
  aforo_minimo: number
  aforo_maximo: number
  permite_destacado: boolean
  activo: boolean
}

export type OrganizerSubscription = {
  id_suscripcion_organizador: number
  id_usuario: number
  nombre_usuario: string
  nombre_plan: string
  estado_suscripcion: string
  monto_pago: string
  fecha_inicio: string | null
  fecha_fin: string | null
}

export type PlansDashboardPayload = {
  ok?: boolean
  message?: string
  plans?: OrganizerPlan[]
  subscriptions?: OrganizerSubscription[]
}

export type UpdatePlanInput = {
  idPlan: number
  plan: OrganizerPlan
}

export type UpdateSubscriptionStatusInput = {
  idSuscripcion: number
  estadoSuscripcion: string
}

export type UpdatedSubscriptionResult = {
  id_suscripcion_organizador: number
  estado_suscripcion: string
  fecha_inicio: string | null
  fecha_fin: string | null
}

export const SUBSCRIPTION_STATES = [
  "pendiente",
  "activa",
  "vencida",
  "cancelada",
  "rechazada",
  "error",
] as const
