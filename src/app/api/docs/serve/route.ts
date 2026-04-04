import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import pool from "@/lib/db"
import { getRequesterIdLenient } from "@/lib/auth-request"

export const runtime = "nodejs"

// ── Verificar rol admin ──────────────────────────────────────────────────────
async function ensureAdminRole(req: NextRequest): Promise<boolean> {
  const userId = await getRequesterIdLenient(req)
  if (!userId) return false

  const roleRes = await pool.query(
    "SELECT id_rol FROM tabla_usuarios WHERE id_usuario = $1 LIMIT 1",
    [userId]
  )
  const role = roleRes.rows?.[0] ? Number(roleRes.rows[0].id_rol) : null
  return role === 4
}

// ── Determinar MIME type ─────────────────────────────────────────────────────
function getMimeType(ext: string): string {
  const mimeTypes: Record<string, string> = {
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".bmp": "image/bmp",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xls": "application/vnd.ms-excel",
    ".csv": "text/csv",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".doc": "application/msword",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".ppt": "application/vnd.ms-powerpoint",
    ".txt": "text/plain",
    ".md": "text/markdown",
    ".json": "application/json",
    ".xml": "application/xml",
    ".yaml": "text/yaml",
    ".yml": "text/yaml",
    ".sql": "text/plain",
    ".zip": "application/zip",
    ".rar": "application/x-rar-compressed",
  }
  return mimeTypes[ext.toLowerCase()] || "application/octet-stream"
}

// ── GET: Servir archivo de /docs/ ────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const isAdmin = await ensureAdminRole(req)
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const relativePath = req.nextUrl.searchParams.get("path")
    const download = req.nextUrl.searchParams.get("download") === "1"

    if (!relativePath) {
      return NextResponse.json({ error: "Missing path parameter" }, { status: 400 })
    }

    // Sanitizar el path para evitar directory traversal
    const sanitizedPath = relativePath
      .replace(/\.\./g, "") // Remover ..
      .replace(/^\/+/, "") // Remover / inicial
      .replace(/\/+/g, "/") // Normalizar slashes

    // Ruta de la carpeta docs en public (para que funcione en Vercel)
    const docsDir = path.join(process.cwd(), "public", "docs")
    const fullPath = path.join(docsDir, sanitizedPath)

    // Verificar que el archivo esta dentro de /docs/
    const resolvedPath = path.resolve(fullPath)
    const resolvedDocsDir = path.resolve(docsDir)
    
    if (!resolvedPath.startsWith(resolvedDocsDir)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 })
    }

    // Verificar que el archivo existe
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const stats = fs.statSync(fullPath)
    if (!stats.isFile()) {
      return NextResponse.json({ error: "Not a file" }, { status: 400 })
    }

    // Leer el archivo
    const fileBuffer = fs.readFileSync(fullPath)
    const ext = path.extname(fullPath)
    const mimeType = getMimeType(ext)
    const filename = path.basename(fullPath).replace(/"/g, "")

    // Determinar si mostrar inline o forzar descarga
    const disposition = download
      ? `attachment; filename="${filename}"`
      : `inline; filename="${filename}"`

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": disposition,
        "Content-Length": String(stats.size),
        "Cache-Control": "private, max-age=3600",
      },
    })
  } catch (err) {
    console.error("Error serving doc:", err)
    return NextResponse.json({ error: "Error serving file" }, { status: 500 })
  }
}
