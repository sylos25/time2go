import { NextResponse } from "next/server"

import { ensurePlanesAdmin } from "@/app/api/dashboard/planes-organizador/lib/planes-organizador-auth"
import {
  listOrganizerPlans,
  listOrganizerSubscriptions,
  updateOrganizerPlan,
  updateOrganizerSubscriptionStatus,
} from "@/app/api/dashboard/planes-organizador/lib/planes-organizador-repository"
import { isValidSubscriptionState, normalizePositiveInt } from "@/app/api/dashboard/planes-organizador/lib/planes-organizador-utils"

export async function GET(req: Request) {
  const auth = await ensurePlanesAdmin(req)
  if (!auth.ok) return auth.response

  try {
    const [plans, subscriptions] = await Promise.all([
      listOrganizerPlans(),
      listOrganizerSubscriptions(),
    ])

    return NextResponse.json({
      ok: true,
      plans,
      subscriptions,
    })
  } catch (error) {
    console.error("/api/dashboard/planes-organizador GET error:", error)
    return NextResponse.json({ ok: false, message: "Error al cargar planes y suscripciones" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const auth = await ensurePlanesAdmin(req)
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

      const updated = await updateOrganizerPlan({
        idPlan,
        nombrePlan,
        precioCop,
        maxEventosMensuales,
        maxImagenesPorEvento,
        aforoMinimo,
        aforoMaximo,
        permiteDestacado,
        activo,
      })

      if (!updated) {
        return NextResponse.json({ ok: false, message: "Plan no encontrado" }, { status: 404 })
      }

      return NextResponse.json({ ok: true, plan: updated })
    }

    if (action === "updateSubscriptionStatus") {
      const idSuscripcion = normalizePositiveInt(body?.idSuscripcion)
      const estadoSuscripcion = String(body?.estado_suscripcion || "").trim().toLowerCase()

      if (!idSuscripcion || !isValidSubscriptionState(estadoSuscripcion)) {
        return NextResponse.json({ ok: false, message: "Estado o suscripción inválida" }, { status: 400 })
      }

      const updated = await updateOrganizerSubscriptionStatus(idSuscripcion, estadoSuscripcion)

      if (!updated) {
        return NextResponse.json({ ok: false, message: "Suscripción no encontrada" }, { status: 404 })
      }

      return NextResponse.json({ ok: true, subscription: updated })
    }

    return NextResponse.json({ ok: false, message: "Acción no soportada" }, { status: 400 })
  } catch (error) {
    console.error("/api/dashboard/planes-organizador PATCH error:", error)
    return NextResponse.json({ ok: false, message: "Error al actualizar la información" }, { status: 500 })
  }
}
