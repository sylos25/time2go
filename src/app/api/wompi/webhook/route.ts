import crypto from "node:crypto"
import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const runtime = "nodejs"

const WOMPI_EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET || ""
const IS_PRODUCTION = process.env.NODE_ENV === "production"

/**
 * Verifica la firma del webhook de Wompi.
 * SHA256(values_of_properties + timestamp + events_secret)
 */
function verifyWompiSignature(body: Record<string, unknown>, receivedChecksum: string): boolean {
  if (!WOMPI_EVENTS_SECRET) {
    if (IS_PRODUCTION) {
      return false
    }
    return true
  }

  const signature = body.signature as { checksum: string; properties: string[] } | undefined
  const timestamp = body.timestamp as number | undefined

  if (!signature?.properties || timestamp == null) return false

  const transaction = (body.data as { transaction: Record<string, unknown> } | undefined)?.transaction
  if (!transaction) return false

  const values = signature.properties.map((prop) => {
    const key = prop.split(".").slice(1).join(".")
    return String(transaction[key] ?? "")
  })

  const toHash = [...values, String(timestamp), WOMPI_EVENTS_SECRET].join("")
  const computed = crypto.createHash("sha256").update(toHash, "utf8").digest("hex")
  return computed === receivedChecksum
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>

    const signature = body?.signature as { checksum: string; properties: string[] } | undefined
    if (!signature?.checksum) {
      return NextResponse.json({ ok: false, message: "Firma ausente" }, { status: 400 })
    }

    if (!verifyWompiSignature(body, signature.checksum)) {
      return NextResponse.json({ ok: false, message: "Firma inválida" }, { status: 401 })
    }

    // Only handle transaction.updated events
    if (body.event !== "transaction.updated") {
      return NextResponse.json({ ok: true })
    }

    const transaction = (body?.data as { transaction: Record<string, unknown> } | undefined)?.transaction
    if (!transaction) {
      return NextResponse.json({ ok: false, message: "Datos de transacción ausentes" }, { status: 400 })
    }

    const { reference, status, id: transactionId } = transaction as {
      reference: string
      status: string
      id: string
      amount_in_cents: number
    }

    const estadoPago =
      status === "APPROVED"  ? "aprobado"  :
      status === "DECLINED"  ? "rechazado" :
      status === "VOIDED"    ? "anulado"   :
      status === "ERROR"     ? "error"     : "pendiente"

    const client = await pool.connect()
    try {
      const updateResult = await client.query(
        `UPDATE tabla_cambio_rol_usuario
         SET estado_pago          = $1,
             id_transaccion_pago  = $2,
             json_respuesta_pasarela = $3,
             fecha_pago           = NOW(),
             fecha_actualizacion  = NOW()
         WHERE referencia_pago = $4
         RETURNING id_usuario, id_rol_solicitado`,
        [estadoPago, transactionId, JSON.stringify(transaction), reference]
      )

      if (updateResult.rowCount === 0) {
        // Reference not found — could be an unrelated transaction, ignore gracefully
        return NextResponse.json({ ok: true })
      }

      // On approval, promote the user role
      if (status === "APPROVED") {
        const { id_usuario, id_rol_solicitado } = updateResult.rows[0] as {
          id_usuario: number
          id_rol_solicitado: number
        }
        await client.query(
          `UPDATE tabla_usuarios
           SET id_rol = $1, fecha_actualizacion = NOW()
           WHERE id_usuario = $2`,
          [id_rol_solicitado, id_usuario]
        )
      }

      return NextResponse.json({ ok: true })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("/api/wompi/webhook POST error:", error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
