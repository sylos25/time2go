import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import pool from "@/lib/db"
import { getRequesterIdLenient } from "@/lib/auth-request"

export const runtime = "nodejs"

type SqlGroup = "ddl" | "triggers" | "funciones"

const GROUP_DIRS: Record<SqlGroup, string> = {
  ddl: path.join("scripts SQL", "DDL Time2Go.SQL"),
  triggers: path.join("scripts SQL", "triggers"),
  funciones: path.join("scripts SQL", "funciones"),
}

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

function isValidGroup(value: string | null): value is SqlGroup {
  return value === "ddl" || value === "triggers" || value === "funciones"
}

async function listSqlFilesForGroup(group: SqlGroup): Promise<string[]> {
  const base = process.cwd()
  const target = path.join(base, GROUP_DIRS[group])

  if (group === "ddl") {
    try {
      await fs.access(target)
      return [path.basename(target)]
    } catch {
      return []
    }
  }

  let entries: Awaited<ReturnType<typeof fs.readdir>>
  try {
    entries = await fs.readdir(target, { withFileTypes: true })
  } catch {
    return []
  }

  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".sql"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, "es"))
}

function resolveSafePath(group: SqlGroup, file: string): string | null {
  const base = process.cwd()

  if (group === "ddl") {
    const ddlAbsolute = path.resolve(path.join(base, GROUP_DIRS.ddl))
    return file === path.basename(ddlAbsolute) ? ddlAbsolute : null
  }

  const groupDir = path.resolve(path.join(base, GROUP_DIRS[group]))
  const cleaned = file.replace(/\\/g, "/").replace(/\.\./g, "").replace(/^\/+/, "")
  const candidate = path.resolve(path.join(groupDir, cleaned))

  if (!candidate.startsWith(groupDir)) return null
  if (!candidate.toLowerCase().endsWith(".sql")) return null

  return candidate
}

const SEARCH_MAX_FILES = 200
const SNIPPET_MAX = 240

type SearchMatch = { group: SqlGroup; file: string; line: number; snippet: string }

async function searchSqlInGroup(group: SqlGroup, normalized: string, out: SearchMatch[], budget: { n: number }) {
  if (budget.n <= 0) return
  const files = await listSqlFilesForGroup(group)
  for (const name of files) {
    if (budget.n <= 0) return
    const safe = resolveSafePath(group, name)
    if (!safe) continue
    let content: string
    try {
      content = await fs.readFile(safe, "utf8")
    } catch {
      continue
    }
    const lower = content.toLowerCase()
    if (!lower.includes(normalized)) continue

    const lines = content.split(/\r?\n/)
    for (let i = 0; i < lines.length; i += 1) {
      if (lines[i].toLowerCase().includes(normalized)) {
        const raw = lines[i].trim()
        const snippet =
          raw.length > SNIPPET_MAX ? `${raw.slice(0, SNIPPET_MAX)}…` : raw
        out.push({ group, file: name, line: i + 1, snippet })
        budget.n -= 1
        if (budget.n <= 0) return
        break
      }
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await ensureAdminRole(req)
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const mode = req.nextUrl.searchParams.get("mode") || "list"

    if (mode === "list") {
      const [ddl, triggers, funciones] = await Promise.all([
        listSqlFilesForGroup("ddl"),
        listSqlFilesForGroup("triggers"),
        listSqlFilesForGroup("funciones"),
      ])
      const payload = { ddl, triggers, funciones }
      return NextResponse.json({ ok: true, files: payload })
    }

    if (mode === "search") {
      const q = (req.nextUrl.searchParams.get("q") || "").trim()
      if (q.length < 2) {
        return NextResponse.json({ error: "Query too short (min 2 characters)" }, { status: 400 })
      }
      const normalized = q.toLowerCase()
      const matches: SearchMatch[] = []
      const budget = { n: SEARCH_MAX_FILES }
      await searchSqlInGroup("ddl", normalized, matches, budget)
      await searchSqlInGroup("triggers", normalized, matches, budget)
      await searchSqlInGroup("funciones", normalized, matches, budget)
      return NextResponse.json({ ok: true, q, matches, truncated: budget.n === 0 })
    }

    if (mode === "content") {
      const groupParam = req.nextUrl.searchParams.get("group")
      const file = req.nextUrl.searchParams.get("file") || ""

      if (!isValidGroup(groupParam) || !file) {
        return NextResponse.json({ error: "Missing or invalid group/file" }, { status: 400 })
      }

      const safePath = resolveSafePath(groupParam, file)
      if (!safePath) {
        return NextResponse.json({ error: "File not found" }, { status: 404 })
      }

      let stats: Awaited<ReturnType<typeof fs.stat>>
      try {
        stats = await fs.stat(safePath)
      } catch {
        return NextResponse.json({ error: "File not found" }, { status: 404 })
      }
      if (!stats.isFile()) {
        return NextResponse.json({ error: "Not a file" }, { status: 400 })
      }

      const content = await fs.readFile(safePath, "utf8")
      return NextResponse.json({ ok: true, content, file, group: groupParam })
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 })
  } catch (error) {
    console.error("Error in /api/docs/sql:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
