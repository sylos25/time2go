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

// ── Categorizar archivo por extension ────────────────────────────────────────
function categorizeFile(ext: string): { category: string; label: string; color: string } {
  const extLower = ext.toLowerCase()
  
  if ([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".bmp"].includes(extLower)) {
    return { category: "Diagrama", label: "Imagen", color: "bg-purple-100 text-purple-700" }
  }
  if ([".xlsx", ".xls", ".csv"].includes(extLower)) {
    return { category: "Hoja de cálculo", label: "Excel", color: "bg-green-100 text-green-700" }
  }
  if ([".pdf"].includes(extLower)) {
    return { category: "Documento", label: "PDF", color: "bg-red-100 text-red-700" }
  }
  if ([".docx", ".doc"].includes(extLower)) {
    return { category: "Documento", label: "Word", color: "bg-blue-100 text-blue-700" }
  }
  if ([".pptx", ".ppt"].includes(extLower)) {
    return { category: "Presentación", label: "PowerPoint", color: "bg-orange-100 text-orange-700" }
  }
  if ([".txt", ".md"].includes(extLower)) {
    return { category: "Documento", label: "Texto", color: "bg-gray-100 text-gray-700" }
  }
  if ([".json", ".xml", ".yaml", ".yml"].includes(extLower)) {
    return { category: "Datos", label: "Datos", color: "bg-yellow-100 text-yellow-700" }
  }
  if ([".sql"].includes(extLower)) {
    return { category: "Datos", label: "SQL", color: "bg-teal-100 text-teal-700" }
  }
  return { category: "Otro", label: extLower.slice(1).toUpperCase() || "Archivo", color: "bg-gray-100 text-gray-600" }
}

// ── Formatear tamano de archivo ──────────────────────────────────────────────
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Leer archivos recursivamente ─────────────────────────────────────────────
interface DocFile {
  name: string
  ext: string
  label: string
  category: string
  color: string
  sizeLabel: string
  modifiedAt: string
  relativePath: string
}

function readFilesRecursively(dir: string, baseDir: string): DocFile[] {
  const files: DocFile[] = []
  
  if (!fs.existsSync(dir)) return files
  
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, "/")
    
    if (entry.isDirectory()) {
      // Recursivamente leer subdirectorios
      files.push(...readFilesRecursively(fullPath, baseDir))
    } else if (entry.isFile()) {
      // Ignorar archivos ocultos
      if (entry.name.startsWith(".")) continue
      
      const ext = path.extname(entry.name)
      const stats = fs.statSync(fullPath)
      const { category, label, color } = categorizeFile(ext)
      
      files.push({
        name: entry.name,
        ext,
        label,
        category,
        color,
        sizeLabel: formatFileSize(stats.size),
        modifiedAt: stats.mtime.toISOString(),
        relativePath,
      })
    }
  }
  
  return files
}

// ── GET: Listar archivos de /docs/ ───────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const isAdmin = await ensureAdminRole(req)
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Ruta de la carpeta docs en public (para que funcione en Vercel)
    const docsDir = path.join(process.cwd(), "public", "docs")
    
    const files = readFilesRecursively(docsDir, docsDir)
    
    // Ordenar por fecha de modificacion (mas recientes primero)
    files.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime())

    return NextResponse.json({ ok: true, files })
  } catch (err) {
    console.error("Error listing docs:", err)
    return NextResponse.json({ error: "Error listing files" }, { status: 500 })
  }
}
