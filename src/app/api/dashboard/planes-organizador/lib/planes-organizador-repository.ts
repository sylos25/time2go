import pool from "@/lib/db"

import type {
  PlanRow,
  SubscriptionRow,
  UpdatePlanInput,
} from "@/app/api/dashboard/planes-organizador/lib/planes-organizador-types"

export async function listOrganizerPlans(): Promise<PlanRow[]> {
  const result = await pool.query<PlanRow>(
    `SELECT
      id_plan,
      nombre_plan,
      precio_cop,
      max_eventos_mensuales,
      max_imagenes_por_evento,
      aforo_minimo,
      aforo_maximo,
      permite_destacado,
      activo
     FROM tabla_planes_organizador
     ORDER BY id_plan ASC`
  )

  return result.rows || []
}

export async function listOrganizerSubscriptions(): Promise<SubscriptionRow[]> {
  const result = await pool.query<SubscriptionRow>(
    `SELECT
      s.id_suscripcion_organizador,
      s.id_usuario,
      TRIM(CONCAT(COALESCE(u.nombres, ''), ' ', COALESCE(u.apellidos, ''))) AS nombre_usuario,
      p.nombre_plan,
      s.estado_suscripcion,
      s.monto_pago::text,
      s.fecha_inicio::text,
      s.fecha_fin::text
     FROM tabla_suscripciones_organizador s
     INNER JOIN tabla_usuarios u ON u.id_usuario = s.id_usuario
     INNER JOIN tabla_planes_organizador p ON p.id_plan = s.id_plan
     ORDER BY s.fecha_creacion DESC, s.id_suscripcion_organizador DESC`
  )

  return result.rows || []
}

export async function updateOrganizerPlan(input: UpdatePlanInput): Promise<PlanRow | null> {
  const result = await pool.query<PlanRow>(
    `UPDATE tabla_planes_organizador
     SET
       nombre_plan = $1,
       precio_cop = $2,
       max_eventos_mensuales = $3,
       max_imagenes_por_evento = $4,
       aforo_minimo = $5,
       aforo_maximo = $6,
       permite_destacado = $7,
       activo = $8,
       fecha_actualizacion = NOW()
     WHERE id_plan = $9
     RETURNING
       id_plan,
       nombre_plan,
       precio_cop,
       max_eventos_mensuales,
       max_imagenes_por_evento,
       aforo_minimo,
       aforo_maximo,
       permite_destacado,
       activo`,
    [
      input.nombrePlan,
      input.precioCop,
      input.maxEventosMensuales,
      input.maxImagenesPorEvento,
      input.aforoMinimo,
      input.aforoMaximo,
      input.permiteDestacado,
      input.activo,
      input.idPlan,
    ]
  )

  return result.rows[0] ?? null
}

export async function updateOrganizerSubscriptionStatus(
  idSuscripcion: number,
  estadoSuscripcion: string
) {
  const result = await pool.query(
    `UPDATE tabla_suscripciones_organizador
     SET
       estado_suscripcion = $1,
       fecha_inicio = CASE
         WHEN $1 = 'activa' THEN COALESCE(fecha_inicio, NOW())
         ELSE fecha_inicio
       END,
       fecha_fin = CASE
         WHEN $1 = 'activa' THEN COALESCE(fecha_inicio, NOW()) + INTERVAL '30 days'
         ELSE fecha_fin
       END,
       fecha_actualizacion = NOW()
     WHERE id_suscripcion_organizador = $2
     RETURNING
       id_suscripcion_organizador,
       estado_suscripcion,
       fecha_inicio::text,
       fecha_fin::text`,
    [estadoSuscripcion, idSuscripcion]
  )

  return result.rows[0] ?? null
}
