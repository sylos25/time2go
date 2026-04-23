export type PlanRow = {
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

export type SubscriptionRow = {
  id_suscripcion_organizador: number
  id_usuario: number
  nombre_usuario: string
  nombre_plan: string
  estado_suscripcion: string
  monto_pago: string
  fecha_inicio: string | null
  fecha_fin: string | null
}

export type UpdatePlanInput = {
  idPlan: number
  nombrePlan: string
  precioCop: number
  maxEventosMensuales: number
  maxImagenesPorEvento: number
  aforoMinimo: number
  aforoMaximo: number
  permiteDestacado: boolean
  activo: boolean
}
