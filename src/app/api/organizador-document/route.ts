import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { getRequesterIdLenient } from "@/lib/auth-request"

export const runtime = "nodejs"

const ORGANIZER_ROLE_ID = 2
const EPAYCO_PUBLIC_KEY = process.env.EPAYCO_PUBLIC_KEY || ""
const EPAYCO_TEST_MODE = (process.env.EPAYCO_TEST_MODE || "true").toLowerCase() === "true"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

type OrganizerPlanRow = {
  id_plan: number
  nombre_plan: string
  precio_cop: number
  max_eventos_mensuales: number
  max_imagenes_por_evento: number
  aforo_minimo: number
  aforo_maximo: number
  permite_destacado: boolean
}

export async function GET(req: Request) {
  const requesterId = await getRequesterIdLenient(req)
  if (!requesterId) {
    return NextResponse.json({ ok: false, message: "No autenticado" }, { status: 401 })
  }

  const client = await pool.connect()
  try {
    const plansRes = await client.query<OrganizerPlanRow>(
      `SELECT
         id_plan,
         nombre_plan,
         precio_cop,
         max_eventos_mensuales,
         max_imagenes_por_evento,
         aforo_minimo,
         aforo_maximo,
         permite_destacado
       FROM tabla_planes_organizador
       WHERE activo = TRUE
       ORDER BY id_plan ASC`,
    )

    return NextResponse.json({ ok: true, plans: plansRes.rows })
  } catch (error) {
    console.error("/api/organizador-document GET error:", error)
    return NextResponse.json({ ok: false, message: "Error consultando planes" }, { status: 500 })
  } finally {
    client.release()
  }
}

export async function POST(req: Request) {
  const client = await pool.connect()

  try {
    const userId = await getRequesterIdLenient(req)
    if (!userId) {
      return NextResponse.json({ ok: false, message: "No autenticado" }, { status: 401 })
    }

    const formData = await req.formData()
    const selectedPlanId = Number(formData.get("id_plan") || 0)

    if (!Number.isInteger(selectedPlanId) || selectedPlanId <= 0) {
      return NextResponse.json({ ok: false, message: "Plan invalido" }, { status: 400 })
    }

    const planRes = await client.query<OrganizerPlanRow>(
      `SELECT
         id_plan,
         nombre_plan,
         precio_cop,
         max_eventos_mensuales,
         max_imagenes_por_evento,
         aforo_minimo,
         aforo_maximo,
         permite_destacado
       FROM tabla_planes_organizador
       WHERE id_plan = $1
         AND activo = TRUE
       LIMIT 1`,
      [selectedPlanId],
    )

    const selectedPlan = planRes.rows[0]
    if (!selectedPlan) {
      return NextResponse.json({ ok: false, message: "El plan seleccionado no esta disponible" }, { status: 400 })
    }

    const paymentReference = `PLAN-${selectedPlan.id_plan}-USR-${userId}-${Date.now()}`

    await client.query(
      `INSERT INTO tabla_suscripciones_organizador (
         id_usuario,
         id_plan,
         referencia_pago,
         monto_pago,
         moneda,
         estado_suscripcion
       ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, selectedPlan.id_plan, paymentReference, selectedPlan.precio_cop, "COP", "pendiente"],
    )

    await client.query(
      `INSERT INTO tabla_cambio_rol_usuario (
         id_usuario,
         id_rol_solicitado,
         url_documento_usuario,
         proveedor_pago,
         referencia_pago,
         monto_pago
       ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, ORGANIZER_ROLE_ID, null, "epayco", paymentReference, selectedPlan.precio_cop],
    )

    if (!EPAYCO_PUBLIC_KEY) {
      return NextResponse.json(
        { ok: false, message: "Falta configurar EPAYCO_PUBLIC_KEY" },
        { status: 500 },
      )
    }

    const amount = Number(selectedPlan.precio_cop).toFixed(2)
    const responseUrl = encodeURIComponent(
      process.env.EPAYCO_RESPONSE_URL ||
      `${SITE_URL}/perfil?pago=resultado&ref=${encodeURIComponent(paymentReference)}`,
    )
    const confirmationUrl = encodeURIComponent(
      process.env.EPAYCO_CONFIRMATION_URL || `${SITE_URL}/api/epayco/webhook`,
    )

    // Redirigir a la página intermedia que carga el SDK de ePayco (checkout.js)
    // ePayco NO acepta parámetros GET directos en su URL de checkout
    const checkoutUrl = new URL(`${SITE_URL}/perfil/pagar`)
    checkoutUrl.searchParams.set("ref", paymentReference)
    checkoutUrl.searchParams.set("amount", amount)
    checkoutUrl.searchParams.set("pk", EPAYCO_PUBLIC_KEY)
    checkoutUrl.searchParams.set("test", EPAYCO_TEST_MODE ? "true" : "false")
    checkoutUrl.searchParams.set("plan", String(selectedPlan.id_plan))
    checkoutUrl.searchParams.set("planName", selectedPlan.nombre_plan)
    checkoutUrl.searchParams.set("response", responseUrl)
    checkoutUrl.searchParams.set("confirmation", confirmationUrl)

    return NextResponse.json({ ok: true, checkout_url: checkoutUrl.toString(), referencia_pago: paymentReference })
  } catch (error) {
    console.error("/api/organizador-document POST error:", error)
    return NextResponse.json({ ok: false, message: "Error iniciando pago" }, { status: 500 })
  } finally {
    client.release()
  }
}
