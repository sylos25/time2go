import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".webp", ".xlsx", ".xls", ".docx", ".doc", ".pptx", ".ppt", ".csv", ".txt"]

const EXTENSION_LABELS: Record<string, { label: string; category: string; color: string }> = {
  ".pdf":  { label: "PDF",    category: "Documento",        color: "bg-red-100 text-red-700" },
  ".png":  { label: "Imagen", category: "Diagrama",         color: "bg-blue-100 text-blue-700" },
  ".jpg":  { label: "Imagen", category: "Diagrama",         color: "bg-blue-100 text-blue-700" },
  ".jpeg": { label: "Imagen", category: "Diagrama",         color: "bg-blue-100 text-blue-700" },
  ".webp": { label: "Imagen", category: "Diagrama",         color: "bg-blue-100 text-blue-700" },
  ".xlsx": { label: "Excel",  category: "Hoja de cálculo",  color: "bg-green-100 text-green-700" },
  ".xls":  { label: "Excel",  category: "Hoja de cálculo",  color: "bg-green-100 text-green-700" },
  ".docx": { label: "Word",   category: "Documento",        color: "bg-blue-100 text-blue-700" },
  ".doc":  { label: "Word",   category: "Documento",        color: "bg-blue-100 text-blue-700" },
  ".pptx": { label: "PPT",    category: "Presentación",     color: "bg-orange-100 text-orange-700" },
  ".ppt":  { label: "PPT",    category: "Presentación",     color: "bg-orange-100 text-orange-700" },
  ".csv":  { label: "CSV",    category: "Datos",            color: "bg-lime-100 text-lime-700" },
  ".txt":  { label: "Texto",  category: "Documento",        color: "bg-gray-100 text-gray-700" },
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

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface FileEntry {
  name: string
  relativePath: string
  ext: string
  label: string
  category: string
  color: string
  sizeLabel: string
  modifiedAt: string
}

function readFilesRecursive(dir: string, baseDir: string): FileEntry[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const results: FileEntry[] = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...readFilesRecursive(fullPath, baseDir))
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase()
      if (!ALLOWED_EXTENSIONS.includes(ext)) continue
      const stats = fs.statSync(fullPath)
      const meta = EXTENSION_LABELS[ext] ?? { label: "Archivo", category: "Otro", color: "bg-gray-100 text-gray-700" }
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, "/")
      results.push({
        name: entry.name,
        relativePath,
        ext,
        ...meta,
        sizeLabel: formatSize(stats.size),
        modifiedAt: stats.mtime.toISOString(),
      })
    }
  }
  return results
}

// GET /api/docs/files
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  try {
    const docsDir = path.join(process.cwd(), "docs")

    if (!fs.existsSync(docsDir)) {
      return NextResponse.json({ files: [] })
    }

    const files = readFilesRecursive(docsDir, docsDir)
      .sort((a, b) => a.relativePath.localeCompare(b.relativePath))

    return NextResponse.json({ files })
  } catch (err) {
    console.error("docs/files error:", err)
    return NextResponse.json({ error: "Error al leer archivos" }, { status: 500 })
  }
}