import crypto from "node:crypto"
import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const runtime = "nodejs"

const EPAYCO_P_CUST_ID_CLIENTE = process.env.EPAYCO_P_CUST_ID_CLIENTE || ""
const IS_PRODUCTION = process.env.NODE_ENV === "production"

type PayloadValue = string | number | boolean | null | undefined

type PayloadMap = Record<string, PayloadValue>

type SubscriptionUpdateRow = {
  id_usuario: number
  id_plan: number
  estado_suscripcion: string
}

type RoleUpdateRow = {
  id_usuario: number
  id_rol_solicitado: number
}

function getPayloadValue(payload: PayloadMap, ...keys: string[]): string {
  for (const key of keys) {
    const value = payload[key]
    if (value != null && String(value).length > 0) {
      return String(value)
    }
  }
  return ""
}

function parseEpaycoStatus(payload: PayloadMap): string {
  const code = Number.parseInt(getPayloadValue(payload, "x_cod_response", "cod_response"), 10)
  const state = getPayloadValue(payload, "x_transaction_state", "transaction_state").toLowerCase()
  const response = getPayloadValue(
    payload,
    "x_response",
    "response",
    "x_response_reason_text",
    "response_reason_text",
  ).toLowerCase()
  const isInsufficientFunds = response.includes("fondos insuficientes") || response.includes("insufficient funds")

  if (Number.isFinite(code)) {
    if (code === 1) return "aprobado"
    if (code === 2) return isInsufficientFunds ? "rechazado" : "error"
    if (code === 3) return "pendiente"
    if (code === 4) return "error"
    if (code === 6) return "anulado"
  }

  if (state === "aceptada" || state === "approved") return "aprobado"
  if (state === "rechazada" || state === "declined") {
    return isInsufficientFunds ? "rechazado" : "error"
  }
  if (state === "fallida" || state === "failed") return "error"
  if (state === "anulada" || state === "voided") return "anulado"
  return "pendiente"
}

function verifyEpaycoSignature(payload: PayloadMap): boolean {
  if (!EPAYCO_P_CUST_ID_CLIENTE) {
    return !IS_PRODUCTION
  }

  const receivedSignature = getPayloadValue(payload, "x_signature", "signature").toLowerCase()
  const refPayco = getPayloadValue(payload, "x_ref_payco", "ref_payco")
  const transactionId = getPayloadValue(payload, "x_transaction_id", "transaction_id")
  const amount = getPayloadValue(payload, "x_amount", "amount")
  const currency = getPayloadValue(payload, "x_currency_code", "currency_code", "currency").toUpperCase()

  if (!receivedSignature || !refPayco || !transactionId || !amount || !currency) {
    return false
  }

  const raw = `${EPAYCO_P_CUST_ID_CLIENTE}^${refPayco}^${transactionId}^${amount}^${currency}`
  const computed = crypto.createHash("md5").update(raw, "utf8").digest("hex")
  return computed === receivedSignature
}

async function parseIncomingPayload(req: Request): Promise<PayloadMap> {
  const contentType = req.headers.get("content-type") || ""

  if (contentType.includes("application/json")) {
    return (await req.json()) as PayloadMap
  }

  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const formData = await req.formData()
    const payload: PayloadMap = {}
    for (const [key, value] of formData.entries()) {
      payload[key] = typeof value === "string" ? value : value.name
    }
    return payload
  }

  const text = await req.text()
  if (!text) return {}

  try {
    return JSON.parse(text) as PayloadMap
  } catch {
    const params = new URLSearchParams(text)
    const payload: PayloadMap = {}
    params.forEach((value, key) => {
      payload[key] = value
    })
    return payload
  }
}

export async function POST(req: Request) {
  try {
    const payload = await parseIncomingPayload(req)

    if (!verifyEpaycoSignature(payload)) {
      return NextResponse.json({ ok: false, message: "Firma invalida" }, { status: 401 })
    }

    const referenciaPago = getPayloadValue(payload, "x_extra1", "x_id_invoice", "id_invoice", "reference")
    if (!referenciaPago) {
      return NextResponse.json({ ok: false, message: "Referencia de pago ausente" }, { status: 400 })
    }

    const estadoPago = parseEpaycoStatus(payload)
    const transactionId = getPayloadValue(payload, "x_transaction_id", "x_ref_payco", "transaction_id")

    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      const suscripcionEstado =
        estadoPago === "aprobado"
          ? "activa"
          : estadoPago === "rechazado"
            ? "rechazada"
            : estadoPago === "anulado"
              ? "cancelada"
              : estadoPago === "error"
                ? "error"
                : "pendiente"

      const suscripcionResult = await client.query<SubscriptionUpdateRow>(
        `UPDATE tabla_suscripciones_organizador s
         SET estado_suscripcion      = CASE
                                         WHEN s.estado_suscripcion = 'activa' THEN 'activa'
                                         ELSE $1
                                       END,
             id_transaccion_pago     = COALESCE($2, s.id_transaccion_pago),
             json_respuesta_pasarela = $3,
             fecha_inicio            = CASE
                                         WHEN s.estado_suscripcion = 'activa' THEN s.fecha_inicio
                                         WHEN $1 = 'activa' THEN NOW()
                                         ELSE s.fecha_inicio
                                       END,
             fecha_fin               = CASE
                                         WHEN s.estado_suscripcion = 'activa' THEN s.fecha_fin
                                         WHEN $1 = 'activa' THEN NOW() + INTERVAL '30 days'
                                         ELSE s.fecha_fin
                                       END,
             fecha_actualizacion     = NOW()
         WHERE s.referencia_pago = $4
         RETURNING s.id_usuario, s.id_plan, s.estado_suscripcion`,
        [suscripcionEstado, transactionId || null, JSON.stringify(payload), referenciaPago],
      )

      const updateResult = await client.query<RoleUpdateRow>(
        `UPDATE tabla_cambio_rol_usuario
         SET estado_pago             = $1,
             id_transaccion_pago     = $2,
             json_respuesta_pasarela = $3,
             fecha_pago              = NOW(),
             fecha_actualizacion     = NOW()
         WHERE referencia_pago = $4
         RETURNING id_usuario, id_rol_solicitado`,
        [estadoPago, transactionId || null, JSON.stringify(payload), referenciaPago],
      )

      const updatedRoleRows = updateResult.rowCount ?? 0
      const updatedSubscriptionRows = suscripcionResult.rowCount ?? 0

      if (updatedRoleRows === 0 && updatedSubscriptionRows === 0) {
        await client.query("COMMIT")
        return NextResponse.json({ ok: true })
      }

      if (estadoPago === "aprobado") {
        const rolRow = updatedRoleRows > 0 ? updateResult.rows[0] : null

        const suscripcionRow = updatedSubscriptionRows > 0 ? suscripcionResult.rows[0] : null

        const idUsuario = suscripcionRow?.id_usuario ?? rolRow?.id_usuario

        if (idUsuario) {
          await client.query(
            `UPDATE tabla_suscripciones_organizador
             SET estado_suscripcion = 'vencida',
                 fecha_actualizacion = NOW()
             WHERE id_usuario = $1
               AND referencia_pago <> $2
               AND estado_suscripcion = 'activa'`,
            [idUsuario, referenciaPago],
          )

          await client.query(
            `UPDATE tabla_usuarios
             SET id_rol = $1, fecha_actualizacion = NOW()
             WHERE id_usuario = $2`,
            [rolRow?.id_rol_solicitado || 2, idUsuario],
          )
        }
      }

      await client.query("COMMIT")

      return NextResponse.json({ ok: true })
    } catch (dbError) {
      await client.query("ROLLBACK")
      throw dbError
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("/api/epayco/webhook POST error:", error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
