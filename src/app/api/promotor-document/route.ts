import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { getAuth } from "@/lib/auth"
import { parseCookies } from "@/lib/cookies"
import { verifyToken } from "@/lib/jwt"
import { uploadDocumentBuffer } from "@/lib/document-storage"

export const runtime = "nodejs"

const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024

async function getAuthenticatedUserId(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("authorization") || ""

  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim()
    const payload = verifyToken(token)
    const userIdFromToken = payload?.id_usuario || payload?.numero_documento
    if (payload && userIdFromToken) {
      return String(userIdFromToken)
    }
  }

  const cookieHeader = req.headers.get("cookie")
  if (cookieHeader) {
    const cookies = parseCookies(cookieHeader)
    const token = cookies["token"]
    if (token) {
      const payload = verifyToken(token)
      const userIdFromToken = payload?.id_usuario || payload?.numero_documento
      if (payload && userIdFromToken) {
        return String(userIdFromToken)
      }
    }
  }

  const session = await getAuth().api.getSession({ headers: req.headers as any })
  const sid =
    (session &&
      session.user &&
      ((session.user as any).id_usuario || (session.user as any).numero_documento)) ||
    null

  return sid ? String(sid) : null
}

function isPdf(file: File) {
  const type = (file.type || "").toLowerCase()
  const name = (file.name || "").toLowerCase()
  return type === "application/pdf" || name.endsWith(".pdf")
}

export async function POST(req: Request) {
  const client = await pool.connect()

  try {
    const userId = await getAuthenticatedUserId(req)
    if (!userId) {
      return NextResponse.json({ ok: false, message: "No autenticado" }, { status: 401 })
    }

    const formData = await req.formData()
    const document = formData.get("document")

    if (!document || !(document instanceof File)) {
      return NextResponse.json({ ok: false, message: "Debes seleccionar un archivo PDF" }, { status: 400 })
    }

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

    const documentUrl = uploadResult?.publicUrl || `bucket://${uploadResult.storageKey}`
    if (!documentUrl) {
      return NextResponse.json({ ok: false, message: "No se pudo obtener la URL del documento" }, { status: 500 })
    }

    await client.query(
      `INSERT INTO tabla_documentos_usuarios (url_documento_usuario, id_usuario)
       VALUES ($1, $2)`,
      [documentUrl, userId]
    )

    return NextResponse.json({ ok: true, url: documentUrl })
  } catch (error) {
    console.error("/api/promotor-document POST error:", error)
    return NextResponse.json({ ok: false, message: "Error subiendo documento" }, { status: 500 })
  } finally {
    client.release()
  }
}
