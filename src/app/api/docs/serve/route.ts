import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".webp", ".xlsx", ".xls", ".docx", ".doc", ".pptx", ".ppt", ".csv", ".txt"]

const MIME_TYPES: Record<string, string> = {
  ".pdf":  "application/pdf",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xls":  "application/vnd.ms-excel",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".doc":  "application/msword",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".ppt":  "application/vnd.ms-powerpoint",
  ".csv":  "text/csv",
  ".txt":  "text/plain",
}

function verifyAdmin(request: NextRequest): boolean {
  const cookieToken = request.cookies.get("token")?.value
  const authHeader = request.headers.get("authorization") ?? ""
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null
  const token = cookieToken ?? bearerToken
  if (!token) return false
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString("utf-8"))
    if (payload.exp && payload.exp * 1000 < Date.now()) return false
    return Number(payload.id_rol ?? 0) === 4
  } catch {
    return false
  }
}

// GET /api/docs/serve?path=Diagramas/diagrama.png  (o ?file=archivo.pdf para raíz)
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  // Acepta ?path= (con subcarpetas) o ?file= (solo nombre en raíz)
  const fileParam = request.nextUrl.searchParams.get("path") ?? request.nextUrl.searchParams.get("file")
  if (!fileParam) {
    return NextResponse.json({ error: "Nombre de archivo requerido" }, { status: 400 })
  }

  const docsDir = path.join(process.cwd(), "docs")
  const filePath = path.resolve(docsDir, fileParam)

  // Path traversal check
  if (!filePath.startsWith(docsDir + path.sep) && filePath !== docsDir) {
    return NextResponse.json({ error: "Ruta no permitida" }, { status: 400 })
  }

  const safeName = path.basename(filePath)
  const ext = path.extname(safeName).toLowerCase()

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 400 })
  }

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 })
  }

  const fileBuffer = fs.readFileSync(filePath)
  const mimeType = MIME_TYPES[ext] ?? "application/octet-stream"
  const download = request.nextUrl.searchParams.get("download") === "1"

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": mimeType,
      "Content-Disposition": download
        ? `attachment; filename="${safeName}"`
        : `inline; filename="${safeName}"`,
      "Content-Length": String(fileBuffer.length),
      "Cache-Control": "no-store",
    },
  })
}