import crypto from "node:crypto"
import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { getRequesterIdLenient } from "@/lib/auth-request"
import { uploadDocumentBuffer } from "@/lib/document-storage"

export const runtime = "nodejs"

const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024
const DEFAULT_WOMPI_AMOUNT_COP = Number(process.env.PROMOTOR_ROLE_WOMPI_AMOUNT_COP || "50000")
const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY || ""
const WOMPI_INTEGRITY_SECRET = process.env.WOMPI_INTEGRITY_SECRET || ""
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

function isPdf(file: File) {
  const type = (file.type || "").toLowerCase()
  const name = (file.name || "").toLowerCase()
  return type === "application/pdf" || name.endsWith(".pdf")
}

export async function POST(req: Request) {
  const client = await pool.connect()

  try {
    const userId = getRequesterIdLenient(req)
    if (!userId) {
      return NextResponse.json({ ok: false, message: "No autenticado" }, { status: 401 })
    }

    const formData = await req.formData()
    const document = formData.get("document")
    const requestedRoleId = Number(formData.get("id_rol_solicitado") || 2)

    // Document is optional — only validate and upload if provided
    let documentUrl: string | null = null
    if (document instanceof File) {
      if (!isPdf(document)) {
        return NextResponse.json({ ok: false, message: "Solo se permite formato PDF" }, { status: 400 })
      }
      if (document.size > MAX_PDF_SIZE_BYTES) {
        return NextResponse.json({ ok: false, message: "El archivo supera el máximo de 5 MB" }, { status: 400 })
      }
      const buffer = Buffer.from(await document.arrayBuffer())
      const uploadResult = await uploadDocumentBuffer({
        buffer,
        contentType: "application/pdf",
        originalFileName: document.name || "documento.pdf",
        eventId: userId,
      })
      documentUrl = uploadResult?.publicUrl || `bucket://${uploadResult.storageKey}` || null
    }

    const paymentReference = `PROM-${userId}-${Date.now()}`

    await client.query(
      `INSERT INTO tabla_cambio_rol_usuario (
         id_usuario,
         id_rol_solicitado,
         url_documento_usuario,
         referencia_pago,
         monto_pago
       ) VALUES ($1, $2, $3, $4, $5)`,
      [userId, requestedRoleId, documentUrl, paymentReference, DEFAULT_WOMPI_AMOUNT_COP]
    )

    // Build Wompi checkout URL with integrity hash
    // SHA256(reference + amount_in_cents + currency + integrity_secret)
    const amountInCents = DEFAULT_WOMPI_AMOUNT_COP * 100
    const currency = "COP"
    const integrityInput = `${paymentReference}${amountInCents}${currency}${WOMPI_INTEGRITY_SECRET}`
    const integrityHash = crypto.createHash("sha256").update(integrityInput, "utf8").digest("hex")

    const redirectUrl = `${SITE_URL}/perfil?pago=resultado&ref=${encodeURIComponent(paymentReference)}`
    const checkoutUrl = new URL("https://checkout.wompi.co/p/")
    checkoutUrl.searchParams.set("public-key", WOMPI_PUBLIC_KEY)
    checkoutUrl.searchParams.set("currency", currency)
    checkoutUrl.searchParams.set("amount-in-cents", String(amountInCents))
    checkoutUrl.searchParams.set("reference", paymentReference)
    checkoutUrl.searchParams.set("signature:integrity", integrityHash)
    checkoutUrl.searchParams.set("redirect-url", redirectUrl)

    return NextResponse.json({ ok: true, checkout_url: checkoutUrl.toString(), referencia_pago: paymentReference })
  } catch (error) {
    console.error("/api/promotor-document POST error:", error)
    return NextResponse.json({ ok: false, message: "Error subiendo documento" }, { status: 500 })
  } finally {
    client.release()
  }
}
