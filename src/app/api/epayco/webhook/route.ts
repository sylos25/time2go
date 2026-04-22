import crypto from "node:crypto"
import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const runtime = "nodejs"

const EPAYCO_P_CUST_ID_CLIENTE = process.env.EPAYCO_P_CUST_ID_CLIENTE || ""
const IS_PRODUCTION = process.env.NODE_ENV === "production"

type PayloadValue = string | number | boolean | null | undefined

type PayloadMap = Record<string, PayloadValue>

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
  if (Number.isFinite(code)) {
    if (code === 1) return "aprobado"
    if (code === 2) return "rechazado"
    if (code === 3) return "pendiente"
    if (code === 4) return "error"
    if (code === 6) return "anulado"
  }

  const state = getPayloadValue(payload, "x_transaction_state", "transaction_state").toLowerCase()
  if (state === "aceptada" || state === "approved") return "aprobado"
  if (state === "rechazada" || state === "declined") return "rechazado"
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
      const updateResult = await client.query(
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

      if (updateResult.rowCount === 0) {
        return NextResponse.json({ ok: true })
      }

      if (estadoPago === "aprobado") {
        const { id_usuario, id_rol_solicitado } = updateResult.rows[0] as {
          id_usuario: number
          id_rol_solicitado: number
        }

        await client.query(
          `UPDATE tabla_usuarios
           SET id_rol = $1, fecha_actualizacion = NOW()
           WHERE id_usuario = $2`,
          [id_rol_solicitado, id_usuario],
        )
      }

      return NextResponse.json({ ok: true })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("/api/epayco/webhook POST error:", error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
