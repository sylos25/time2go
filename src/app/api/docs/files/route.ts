import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import pool from "@/lib/db"
import { getRequesterIdLenient } from "@/lib/auth-request"

export const runtime = "nodejs"

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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

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

async function readFilesRecursively(dir: string, baseDir: string): Promise<DocFile[]> {
  const files: DocFile[] = []

  let entries: Awaited<ReturnType<typeof fs.readdir>>
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch {
    return files
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, "/")

    if (entry.isDirectory()) {
      files.push(...(await readFilesRecursively(fullPath, baseDir)))
    } else if (entry.isFile()) {
      if (entry.name.startsWith(".")) continue

      const ext = path.extname(entry.name)
      const stats = await fs.stat(fullPath)
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

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await ensureAdminRole(req)
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const docsDir = path.join(process.cwd(), "public", "docs")
    const files = await readFilesRecursively(docsDir, docsDir)
    files.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime())

    return NextResponse.json({ ok: true, files })
  } catch (err) {
    console.error("Error listing docs:", err)
    return NextResponse.json({ error: "Error listing files" }, { status: 500 })
  }
}
