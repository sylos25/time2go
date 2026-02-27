import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getDocumentFromStorage } from "@/lib/document-storage"
import { verifyToken } from "@/lib/jwt"
import { parseCookies } from "@/lib/cookies"

export const runtime = "nodejs"

async function ensureAdminRole(req: NextRequest) {
  const authHeader = (req.headers.get("authorization") || "").trim()
  let userId: string | null = null

  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim()
    const payload = verifyToken(token)
    const userIdFromToken = payload?.id_usuario
    if (payload && userIdFromToken) userId = String(userIdFromToken)
  }

  if (!userId) {
    const cookies = parseCookies(req.headers.get("cookie"))
    const token = cookies["token"]
    if (token) {
      const payload = verifyToken(token)
      const userIdFromToken = payload?.id_usuario
      if (payload && userIdFromToken) userId = String(userIdFromToken)
    }
  }

  if (!userId) return false

  const roleRes = await pool.query(
    "SELECT id_rol FROM tabla_usuarios WHERE id_usuario = $1 LIMIT 1",
    [userId]
  )
  const role = roleRes.rows && roleRes.rows[0] ? Number(roleRes.rows[0].id_rol) : null
  return role === 4
}

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await ensureAdminRole(req)
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const idParam = req.nextUrl.searchParams.get("id")
    const url = req.nextUrl.searchParams.get("url")

    if (idParam) {
      const documentId = Number(idParam)
      if (!Number.isFinite(documentId) || documentId <= 0) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 })
      }

      const docRes = await pool.query(
        `SELECT id_documento_evento,
                url_documento_evento,
                storage_provider,
                storage_key,
                mime_type,
                original_filename
         FROM tabla_documentos_eventos
         WHERE id_documento_evento = $1
         LIMIT 1`,
        [documentId]
      )

      if (!docRes.rows || docRes.rows.length === 0) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 })
      }

      const doc = docRes.rows[0]

      if ((doc.storage_provider === "s3" || doc.storage_provider === "r2") && doc.storage_key) {
        const stored = await getDocumentFromStorage(String(doc.storage_key))
        const filename = String(doc.original_filename || `documento-${documentId}.pdf`).replace(/"/g, "")

        return new NextResponse(new Uint8Array(stored.bytes), {
          headers: {
            "Content-Type": String(doc.mime_type || stored.contentType || "application/pdf"),
            "Content-Disposition": `inline; filename="${filename}"`,
            "Content-Length": String(stored.contentLength),
            "Cache-Control": "private, max-age=3600",
          },
        })
      }

      if (doc.url_documento_evento) {
        const legacyUrl = String(doc.url_documento_evento)
        const external = await fetch(legacyUrl)
        if (!external.ok) {
          return NextResponse.json({ error: "Failed to fetch document" }, { status: 502 })
        }

        const ct = (external.headers.get("content-type") || "").toLowerCase()
        const isPdf = ct.includes("pdf") || legacyUrl.toLowerCase().endsWith(".pdf")
        const contentType = isPdf ? "application/pdf" : external.headers.get("content-type") || "application/octet-stream"
        const filename = String(doc.original_filename || `documento-${documentId}.pdf`).replace(/"/g, "")

        const arrayBuffer = await external.arrayBuffer()
        const uint8 = new Uint8Array(arrayBuffer)

        return new NextResponse(uint8, {
          headers: {
            "Content-Type": contentType,
            "Content-Disposition": `inline; filename="${filename}"`,
            "Content-Length": String(uint8.length),
            "Cache-Control": "private, max-age=3600",
          },
        })
      }

      return NextResponse.json({ error: "Document source unavailable" }, { status: 404 })
    }

    if (!url) {
      return NextResponse.json({ error: "Missing id or url" }, { status: 400 })
    }

    const external = await fetch(url)
    if (!external.ok) {
      return NextResponse.json({ error: "Failed to fetch document" }, { status: 502 })
    }

    // Determine filename and content-type; prefer PDF display
    const ct = (external.headers.get("content-type") || "").toLowerCase()
    const isPdf = ct.includes("pdf") || url.toLowerCase().endsWith(".pdf")
    const contentType = isPdf ? "application/pdf" : external.headers.get("content-type") || "application/octet-stream"

    const pathname = (() => {
      try {
        return new URL(url).pathname
      } catch (e) {
        // fallback
        const m = url.split("/")
        return m[m.length - 1] || "document.pdf"
      }
    })()
    const filename = (pathname && pathname.split("/").pop()) || "document.pdf"
    const disposition = `inline; filename="${filename.replace(/\"/g, '')}"`

    const arrayBuffer = await external.arrayBuffer()
    const uint8 = new Uint8Array(arrayBuffer)

    return new NextResponse(uint8, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": disposition,
        "Content-Length": String(uint8.length),
        "Cache-Control": "private, max-age=3600",
      },
    })
  } catch (err) {
    console.error("Error proxying document:", err)
    return NextResponse.json({ error: "Error proxying document" }, { status: 500 })
  }
}
