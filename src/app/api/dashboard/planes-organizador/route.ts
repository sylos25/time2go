import { NextResponse } from "next/server"

import pool from "@/lib/db"
import { checkUserPermission, PERMISSION_IDS } from "@/lib/permissions"

type PlanRow = {
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

type SubscriptionRow = {
  id_suscripcion_organizador: number
  id_usuario: number
  nombre_usuario: string
  nombre_plan: string
  estado_suscripcion: string
  monto_pago: string
  fecha_inicio: string | null
  fecha_fin: string | null
}

const SUBSCRIPTION_STATES = new Set([
  "pendiente",
  "activa",
  "vencida",
  "cancelada",
  "rechazada",
  "error",
])

const ensureAdmin = async (req: Request) => {
  const permission = await checkUserPermission(req, PERMISSION_IDS.VER_DASHBOARD)
  if (!permission.hasAccess) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: permission.error || "No autorizado para gestionar planes" },
        { status: permission.error?.includes("autenticado") ? 401 : 403 }
      ),
    }
  }

  if (permission.userRole !== 4) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: "Solo el rol Administrador puede acceder a esta sección" },
        { status: 403 }
      ),
    }
  }

  return { ok: true }
}

function normalizePositiveInt(value: unknown, fallback = 0) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.floor(n)
}

export async function GET(req: Request) {
  const auth = await ensureAdmin(req)
  if (!auth.ok) return auth.response

  try {
    const [plansRes, subscriptionsRes] = await Promise.all([
      pool.query<PlanRow>(
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
      ),
      pool.query<SubscriptionRow>(
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
      ),
    ])

    return NextResponse.json({
      ok: true,
      plans: plansRes.rows || [],
      subscriptions: subscriptionsRes.rows || [],
    })
  } catch (error) {
    console.error("/api/dashboard/planes-organizador GET error:", error)
    return NextResponse.json({ ok: false, message: "Error al cargar planes y suscripciones" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const auth = await ensureAdmin(req)
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const action = String(body?.action || "")

    if (action === "updatePlan") {
      const idPlan = normalizePositiveInt(body?.idPlan)
      const nombrePlan = String(body?.nombre_plan || "").trim()
      const precioCop = normalizePositiveInt(body?.precio_cop)
      const maxEventosMensuales = normalizePositiveInt(body?.max_eventos_mensuales)
      const maxImagenesPorEvento = normalizePositiveInt(body?.max_imagenes_por_evento)
      const aforoMinimo = normalizePositiveInt(body?.aforo_minimo)
      const aforoMaximo = normalizePositiveInt(body?.aforo_maximo)
      const permiteDestacado = Boolean(body?.permite_destacado)
      const activo = Boolean(body?.activo)

      if (!idPlan || nombrePlan.length < 3) {
        return NextResponse.json({ ok: false, message: "Nombre de plan inválido" }, { status: 400 })
      }

      if (precioCop <= 0) {
        return NextResponse.json({ ok: false, message: "Precio inválido" }, { status: 400 })
      }

      if (maxEventosMensuales <= 0 || maxImagenesPorEvento <= 0) {
        return NextResponse.json(
          { ok: false, message: "Los máximos de eventos e imágenes deben ser mayores a cero" },
          { status: 400 }
        )
      }

      if (aforoMinimo < 1 || aforoMaximo < aforoMinimo) {
        return NextResponse.json(
          { ok: false, message: "Aforo mínimo/máximo inválido" },
          { status: 400 }
        )
      }

      const updated = await pool.query<PlanRow>(
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
          nombrePlan,
          precioCop,
          maxEventosMensuales,
          maxImagenesPorEvento,
          aforoMinimo,
          aforoMaximo,
          permiteDestacado,
          activo,
          idPlan,
        ]
      )

      if (!updated.rows.length) {
        return NextResponse.json({ ok: false, message: "Plan no encontrado" }, { status: 404 })
      }

      return NextResponse.json({ ok: true, plan: updated.rows[0] })
    }

    if (action === "updateSubscriptionStatus") {
      const idSuscripcion = normalizePositiveInt(body?.idSuscripcion)
      const estadoSuscripcion = String(body?.estado_suscripcion || "").trim().toLowerCase()

      if (!idSuscripcion || !SUBSCRIPTION_STATES.has(estadoSuscripcion)) {
        return NextResponse.json({ ok: false, message: "Estado o suscripción inválida" }, { status: 400 })
      }

      const updated = await pool.query(
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

      if (!updated.rows.length) {
        return NextResponse.json({ ok: false, message: "Suscripción no encontrada" }, { status: 404 })
      }

      return NextResponse.json({ ok: true, subscription: updated.rows[0] })
    }

    return NextResponse.json({ ok: false, message: "Acción no soportada" }, { status: 400 })
  } catch (error) {
    console.error("/api/dashboard/planes-organizador PATCH error:", error)
    return NextResponse.json({ ok: false, message: "Error al actualizar la información" }, { status: 500 })
  }
}
