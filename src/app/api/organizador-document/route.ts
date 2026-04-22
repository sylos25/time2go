import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { getRequesterIdLenient } from "@/lib/auth-request"
import { uploadDocumentBuffer } from "@/lib/document-storage"

export const runtime = "nodejs"

const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024
const DEFAULT_EPAYCO_AMOUNT_COP = Number(
  process.env.ORGANIZADOR_ROLE_EPAYCO_AMOUNT_COP ||
    process.env.ORGANIZADOR_ROLE_WOMPI_AMOUNT_COP ||
    process.env.PROMOTOR_ROLE_WOMPI_AMOUNT_COP ||
    "10000",
)
const EPAYCO_PUBLIC_KEY = process.env.EPAYCO_PUBLIC_KEY || ""
const EPAYCO_TEST_MODE = (process.env.EPAYCO_TEST_MODE || "true").toLowerCase() === "true"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

function isPdf(file: File) {
  const type = (file.type || "").toLowerCase()
  const name = (file.name || "").toLowerCase()
  return type === "application/pdf" || name.endsWith(".pdf")
}

export async function POST(req: Request) {
  const client = await pool.connect()

  try {
    const userId = await getRequesterIdLenient(req)
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

    const paymentReference = `ORG-${userId}-${Date.now()}`

    await client.query(
      `INSERT INTO tabla_cambio_rol_usuario (
         id_usuario,
         id_rol_solicitado,
         url_documento_usuario,
         proveedor_pago,
         referencia_pago,
         monto_pago
       ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, requestedRoleId, documentUrl, "epayco", paymentReference, DEFAULT_EPAYCO_AMOUNT_COP],
    )

    if (!EPAYCO_PUBLIC_KEY) {
      return NextResponse.json(
        { ok: false, message: "Falta configurar EPAYCO_PUBLIC_KEY" },
        { status: 500 },
      )
    }

    const amount = DEFAULT_EPAYCO_AMOUNT_COP.toFixed(2)
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
    checkoutUrl.searchParams.set("response", responseUrl)
    checkoutUrl.searchParams.set("confirmation", confirmationUrl)

    return NextResponse.json({ ok: true, checkout_url: checkoutUrl.toString(), referencia_pago: paymentReference })
  } catch (error) {
    console.error("/api/organizador-document POST error:", error)
    return NextResponse.json({ ok: false, message: "Error subiendo documento" }, { status: 500 })
  } finally {
    client.release()
  }
}
