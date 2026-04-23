"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Database, Server, Terminal, ExternalLink,
  ChevronDown, ChevronRight, Lock, BookOpen,
  FileText, FileSpreadsheet, FileImage, File,
  Download, Eye, RefreshCw, FolderOpen, Braces, Search, Link2,
} from "lucide-react"

// ── Guard de acceso (solo servidor vía /api/me; coherente con middleware) ────
function useAdminGuard() {
  const router = useRouter()
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" })
        if (!res.ok) {
          router.replace("/auth")
          return
        }
        const data = await res.json()
        if (!data?.ok || Number(data.user?.id_rol) !== 4) {
          router.replace("/")
          return
        }
        setAllowed(true)
      } catch {
        router.replace("/auth")
      }
    }
    void check()
  }, [router])

  return { allowed }
}

// ── Tipos ────────────────────────────────────────────────────────────────────
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

type SqlGroup = "ddl" | "triggers" | "funciones"

interface SqlFileResponse {
  ok: boolean
  files?: Record<SqlGroup, string[]>
  error?: string
}

interface SqlContentResponse {
  ok: boolean
  content?: string
  error?: string
}

interface SqlSearchMatch {
  group: SqlGroup
  file: string
  line: number
  snippet: string
}

interface SqlSearchResponse {
  ok: boolean
  q?: string
  matches?: SqlSearchMatch[]
  truncated?: boolean
  error?: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function FileIcon({ ext }: { ext: string }) {
  if ([".png", ".jpg", ".jpeg", ".webp"].includes(ext)) return <FileImage className="h-5 w-5" />
  if ([".xlsx", ".xls", ".csv"].includes(ext)) return <FileSpreadsheet className="h-5 w-5" />
  if ([".pdf", ".docx", ".doc", ".txt"].includes(ext)) return <FileText className="h-5 w-5" />
  return <File className="h-5 w-5" />
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
}

// ── Sección colapsable ───────────────────────────────────────────────────────
function Section({
  icon: Icon, title, color, children, defaultOpen = false,
}: {
  icon: React.ElementType; title: string; color: string
  children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className={`rounded-xl p-2.5 ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-800">{title}</span>
        </div>
        {open ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
      </button>
      {open && <div className="px-6 pb-6 border-t border-gray-100">{children}</div>}
    </div>
  )
}

// ── Bloque de código ─────────────────────────────────────────────────────────
function CodeBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(children); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <div className="relative group mt-3">
      <pre className="bg-gray-900 text-green-400 rounded-xl p-4 text-sm overflow-x-auto font-mono leading-relaxed">
        <code>{children}</code>
      </pre>
      <button onClick={copy} className="absolute top-3 right-3 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
        {copied ? "✓ Copiado" : "Copiar"}
      </button>
    </div>
  )
}

const SQL_Q_GROUP = "sqlGroup"
const SQL_Q_FILE = "sqlFile"
const SQL_Q_Q = "sqlQ"

function readSqlFromLocation(): { group: SqlGroup | null; file: string | null; q: string } {
  if (typeof window === "undefined") {
    return { group: null, file: null, q: "" }
  }
  const sp = new URLSearchParams(window.location.search)
  const g = sp.get(SQL_Q_GROUP)
  const f = sp.get(SQL_Q_FILE)
  const qRaw = sp.get(SQL_Q_Q) || ""
  const group =
    g === "ddl" || g === "triggers" || g === "funciones" ? (g as SqlGroup) : null
  return { group, file: f && f.length > 0 ? f : null, q: qRaw }
}

function writeSqlToLocation(
  next: { group: SqlGroup; file: string; searchQ?: string },
  opts: { replace?: boolean } = {}
) {
  if (typeof window === "undefined") return
  const u = new URL(window.location.href)
  u.searchParams.set(SQL_Q_GROUP, next.group)
  u.searchParams.set(SQL_Q_FILE, next.file)
  if (next.searchQ && next.searchQ.length > 0) u.searchParams.set(SQL_Q_Q, next.searchQ)
  else u.searchParams.delete(SQL_Q_Q)
  const method = opts.replace ? "replaceState" : "pushState"
  window.history[method](null, "", `${u.pathname}${u.search}${u.hash}`)
}

function SqlSourceViewer() {
  const [loadingList, setLoadingList] = useState(true)
  const [loadingContent, setLoadingContent] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState("")
  const [filesByGroup, setFilesByGroup] = useState<Record<SqlGroup, string[]>>({
    ddl: [],
    triggers: [],
    funciones: [],
  })
  const [activeGroup, setActiveGroup] = useState<SqlGroup>("ddl")
  const [activeFile, setActiveFile] = useState("")
  const [activeContent, setActiveContent] = useState("")
  const [nameFilter, setNameFilter] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SqlSearchMatch[] | null>(null)
  const listSyncedFromUrl = useRef(false)

  const groupLabels: Record<SqlGroup, string> = {
    ddl: "DDL",
    triggers: "Triggers",
    funciones: "Funciones",
  }

  const loadList = useCallback(async () => {
    setLoadingList(true)
    setError("")
    try {
      const res = await fetch("/api/docs/sql?mode=list", { credentials: "include" })
      const data: SqlFileResponse = await res.json().catch(() => ({ ok: false }))
      if (!res.ok || !data.ok || !data.files) {
        setError((data as { error?: string }).error || "No se pudo cargar el índice SQL")
        return
      }

      setFilesByGroup(data.files)
      if (!listSyncedFromUrl.current) {
        listSyncedFromUrl.current = true
        const fromLoc = readSqlFromLocation()
        if (fromLoc.q) {
          setSearchInput(fromLoc.q)
          setSearchQuery(fromLoc.q)
        }
        if (fromLoc.group && fromLoc.file) {
          const list = data.files[fromLoc.group] || []
          if (list.includes(fromLoc.file)) {
            setActiveGroup(fromLoc.group)
            setActiveFile(fromLoc.file)
            return
          }
        }
        const firstGroup: SqlGroup =
          data.files.ddl.length > 0 ? "ddl" : data.files.triggers.length > 0 ? "triggers" : "funciones"
        const firstFile = data.files[firstGroup][0] || ""
        setActiveGroup(firstGroup)
        setActiveFile(firstFile)
        if (firstFile) {
          writeSqlToLocation({ group: firstGroup, file: firstFile }, { replace: true })
        }
      }
    } catch {
      setError("Error de red al cargar el índice SQL")
    } finally {
      setLoadingList(false)
    }
  }, [])

  const loadContent = useCallback(async (group: SqlGroup, file: string) => {
    if (!file) {
      setActiveContent("")
      return
    }
    setLoadingContent(true)
    setError("")
    try {
      const params = new URLSearchParams({
        mode: "content",
        group,
        file,
      })
      const res = await fetch(`/api/docs/sql?${params.toString()}`, { credentials: "include" })
      const data: SqlContentResponse = await res.json().catch(() => ({ ok: false }))
      if (!res.ok || !data.ok || typeof data.content !== "string") {
        setError(data.error || "No se pudo cargar el contenido SQL")
        setActiveContent("")
        return
      }
      setActiveContent(data.content)
    } catch {
      setError("Error de red al cargar el contenido SQL")
      setActiveContent("")
    } finally {
      setLoadingContent(false)
    }
  }, [])

  const runSearch = useCallback(async () => {
    const q = searchInput.trim()
    if (q.length < 2) {
      setError("Escribe al menos 2 caracteres para buscar en el SQL.")
      return
    }
    setSearching(true)
    setError("")
    setSearchQuery(q)
    try {
      const params = new URLSearchParams({ mode: "search", q })
      const res = await fetch(`/api/docs/sql?${params.toString()}`, { credentials: "include" })
      const data: SqlSearchResponse = await res.json().catch(() => ({ ok: false }))
      if (!res.ok || !data.ok) {
        setError(data.error || "Búsqueda no disponible")
        setSearchResults(null)
        return
      }
      setSearchResults(data.matches ?? [])
      writeSqlToLocation(
        { group: activeGroup, file: activeFile, searchQ: q },
        { replace: true }
      )
    } catch {
      setError("Error de red en la búsqueda")
      setSearchResults(null)
    } finally {
      setSearching(false)
    }
  }, [searchInput, activeGroup, activeFile])

  const selectFile = useCallback(
    (group: SqlGroup, file: string) => {
      setActiveGroup(group)
      setActiveFile(file)
      writeSqlToLocation(
        { group, file, searchQ: searchQuery || undefined },
        { replace: true }
      )
    },
    [searchQuery]
  )

  const copyLink = useCallback(() => {
    if (typeof window === "undefined" || !activeFile) return
    writeSqlToLocation(
      { group: activeGroup, file: activeFile, searchQ: searchQuery || undefined },
      { replace: true }
    )
    const p = new URLSearchParams()
    p.set(SQL_Q_GROUP, activeGroup)
    p.set(SQL_Q_FILE, activeFile)
    if (searchQuery) p.set(SQL_Q_Q, searchQuery)
    const link = `${window.location.origin}${window.location.pathname}?${p.toString()}`
    void navigator.clipboard.writeText(link)
  }, [activeGroup, activeFile, searchQuery])

  useEffect(() => {
    void loadList()
  }, [loadList])

  useEffect(() => {
    if (!activeFile) return
    void loadContent(activeGroup, activeFile)
  }, [activeGroup, activeFile, loadContent])

  useEffect(() => {
    const onPop = () => {
      const { group, file, q } = readSqlFromLocation()
      if (q) {
        setSearchInput(q)
        setSearchQuery(q)
      }
      if (group && file) {
        setActiveGroup(group)
        setActiveFile(file)
      }
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])

  const currentFiles = (filesByGroup[activeGroup] || []).filter((f) => {
    const t = nameFilter.trim().toLowerCase()
    if (!t) return true
    return f.toLowerCase().includes(t)
  })

  return (
    <div className="mt-5 space-y-4">
      <p className="text-sm text-gray-600 leading-relaxed">
        Vista rápida del código SQL de base de datos para soporte técnico durante demos. Incluye solo
        <strong> DDL</strong>, <strong>triggers</strong> y <strong>funciones</strong> (sin inserts). Usa{" "}
        <code className="bg-gray-100 px-1 rounded text-xs">?sqlGroup=…&amp;sqlFile=…</code> para enlaces directos.
      </p>

      <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
        <div className="flex-1 min-w-0">
          <label className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5" /> Buscar texto dentro del SQL
          </label>
          <div className="mt-1 flex flex-wrap gap-2">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void runSearch()}
              placeholder="Ej. CREATE TABLE, usuario, …"
              className="flex-1 min-w-[12rem] rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => void runSearch()}
              disabled={searching}
              className="text-xs font-medium px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
            >
              {searching ? "Buscando…" : "Buscar"}
            </button>
          </div>
        </div>
        <div className="sm:w-48">
          <label className="text-xs font-medium text-gray-600">Filtrar archivos por nombre</label>
          <input
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            placeholder="*.sql"
          />
        </div>
      </div>

      {searchResults && searchResults.length > 0 && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-sm max-h-48 overflow-y-auto">
          <p className="text-xs font-semibold text-emerald-800 mb-2">Coincidencias</p>
          <ul className="space-y-1.5">
            {searchResults.map((m, i) => (
              <li key={`${m.group}-${m.file}-${m.line}-${i}`}>
                <button
                  type="button"
                  onClick={() => {
                    selectFile(m.group, m.file)
                    setSearchResults(null)
                  }}
                  className="text-left w-full text-emerald-900 hover:underline"
                >
                  <span className="font-mono text-xs text-emerald-700">
                    {groupLabels[m.group]}/{m.file}:{m.line}
                  </span>
                  <span className="block text-gray-600 line-clamp-2">{m.snippet}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {searchResults && searchResults.length === 0 && searchQuery && !searching && (
        <p className="text-sm text-amber-700">No hay coincidencias para &quot;{searchQuery}&quot;.</p>
      )}

      <div className="flex flex-wrap gap-2">
        {(["ddl", "triggers", "funciones"] as const).map((group) => (
          <button
            key={group}
            onClick={() => {
              const first = filesByGroup[group]?.[0] || ""
              selectFile(group, first)
            }}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
              activeGroup === group
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-green-400"
            }`}
          >
            {groupLabels[group]}
          </button>
        ))}
        <button
          type="button"
          onClick={() => void loadList()}
          className="ml-auto flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-600 transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Actualizar índice SQL
        </button>
        <button
          type="button"
          onClick={copyLink}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-600 transition-colors cursor-pointer"
        >
          <Link2 className="h-3.5 w-3.5" /> Copiar enlace
        </button>
      </div>

      {!loadingList && currentFiles.length > 0 && (
        <div className="flex flex-wrap gap-2" id="sql-section">
          {currentFiles.map((file) => (
            <button
              key={file}
              onClick={() => selectFile(activeGroup, file)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                activeFile === file
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-emerald-400"
              }`}
            >
              {file}
            </button>
          ))}
        </div>
      )}

      {loadingList && (
        <div className="flex items-center gap-3 py-6 text-gray-400">
          <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Cargando índice SQL...</span>
        </div>
      )}

      {!loadingList && !error && !activeFile && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
          No se encontraron archivos SQL para esta categoría.
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
      )}

      {activeFile && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">
            Archivo activo: <code className="bg-gray-100 px-1 rounded">{activeFile}</code>
          </p>
          {loadingContent ? (
            <div className="flex items-center gap-3 py-6 text-gray-400">
              <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Cargando contenido SQL...</span>
            </div>
          ) : (
            <CodeBlock>{activeContent || "-- Sin contenido --"}</CodeBlock>
          )}
        </div>
      )}
    </div>
  )
}

// ── Visor de archivos ────────────────────────────────────────────────────────
function FileBrowser() {
  const [files, setFiles] = useState<DocFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState("Todos")

  const categories = ["Todos", "Diagrama", "Hoja de cálculo", "Documento", "Presentación", "Datos", "Otro"]

  const fetchFiles = async () => {
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/docs/files", {
        credentials: "include",
      })
      if (!res.ok) { setError("No se pudieron cargar los archivos"); return }
      const data = await res.json()
      setFiles(data.files ?? [])
    } catch {
      setError("Error de red al cargar archivos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFiles() }, [])

  const filtered = filter === "Todos" ? files : files.filter(f => f.category === filter)

  const openFile = (relativePath: string) => {
    window.open(`/api/docs/serve?path=${encodeURIComponent(relativePath)}`, "_blank")
  }

  const downloadFile = (relativePath: string) => {
    window.open(`/api/docs/serve?path=${encodeURIComponent(relativePath)}&download=1`, "_blank")
  }

  return (
    <div className="mt-5 space-y-4">
      {/* Filtros + refresh */}
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                filter === cat
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-green-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <button
          onClick={fetchFiles}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-600 transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Actualizar
        </button>
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className="flex items-center gap-3 py-8 justify-center text-gray-400">
          <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Cargando archivos...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-10 text-gray-400">
          <FolderOpen className="h-10 w-10" />
          <p className="text-sm">
            {filter === "Todos"
              ? "No hay archivos en public/docs/"
              : `No hay archivos de tipo "${filter}"`}
          </p>
          <p className="text-xs text-gray-300">
            Agrega archivos en <code className="bg-gray-100 px-1 rounded">public/docs/</code> (relativo a la raíz del repo)
          </p>
        </div>
      )}

      {/* Lista de archivos */}
      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map((file) => (
            <div
              key={file.relativePath}
              className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-green-200 hover:bg-green-50/30 transition-all"
            >
              <div className="text-gray-400 flex-shrink-0">
                <FileIcon ext={file.ext} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {file.relativePath !== file.name && (
                    <span className="text-gray-300 mr-1">📁 {file.relativePath.replace("/" + file.name, "")} ·</span>
                  )}
                  {file.sizeLabel} · {formatDate(file.modifiedAt)}
                </p>
              </div>

              <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${file.color}`}>
                {file.label}
              </span>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => openFile(file.relativePath)}
                  title="Ver archivo"
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => downloadFile(file.relativePath)}
                  title="Descargar"
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 pt-2">
        Origen: <code className="bg-gray-100 px-1 rounded text-xs">public/docs/</code>. Solo administradores (API y middleware).
      </p>
    </div>
  )
}

// ── Página principal ─────────────────────────────────────────────────────────
export default function DocsPage() {
  const { allowed } = useAdminGuard()

  if (allowed === null) {
    return (
      <main className="min-h-screen bg-gradient-to-tl from-green-50 via-lime-50 to-green-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Verificando acceso...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-tl from-green-50 via-lime-50 to-green-50">

      {/* Hero */}
      <div className="bg-gradient-to-r from-green-600 to-lime-500 pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 rounded-xl p-2">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-white/80 text-sm font-medium uppercase tracking-wide">Acceso restringido · Solo administradores</span>
            <Lock className="h-4 w-4 text-white/60" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight">Documentación Técnica</h1>
          <p className="text-white/85 text-lg max-w-2xl leading-relaxed">Arquitectura, base de datos, archivos del proyecto y guía de instalación local de Time2Go.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">

        {/* ── Archivos del proyecto ── */}
        <Section icon={FolderOpen} title="Archivos del Proyecto" color="bg-green-600" defaultOpen={true}>
          <FileBrowser />
        </Section>

        <Section icon={Braces} title="Código SQL de la Base de Datos" color="bg-emerald-700">
          <SqlSourceViewer />
        </Section>

        {/* ── Diagrama BD ── */}
        <Section icon={Database} title="Diagrama de Base de Datos" color="bg-lime-600">
          <div className="mt-5 space-y-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              Diagrama completo con tablas, relaciones, llaves primarias y foráneas del modelo de datos de Time2Go. Alojado en <strong>dbdiagram.io</strong>.
            </p>
            <a
              href="https://dbdiagram.io/d/699da7d7bd82f5fce2a9b5ce"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-lime-500 hover:from-green-700 hover:to-lime-600 text-white font-semibold px-5 py-3 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <Database className="h-4 w-4" />
              Ver diagrama de BD
              <ExternalLink className="h-4 w-4" />
            </a>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
              {[
                { label: "Motor",          value: "PostgreSQL" },
                { label: "Autenticación",  value: "JWT + cookies HttpOnly + refresh" },
                { label: "Cifrado",        value: "bcrypt (bf, 12)" },
                { label: "Archivos evento", value: "S3 / R2" },
                { label: "Pagos",          value: "ePayco (checkout + webhook)" },
                { label: "Sesión activa",  value: "Redis/Upstash (HMAC key v2)" },
                { label: "ORM / Query",    value: "SQL nativo" },
                { label: "Roles",          value: "4 niveles" },
              ].map((item) => (
                <div key={item.label} className="bg-green-50 border border-green-100 rounded-xl p-3">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{item.label}</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Arquitectura ── */}
        <Section icon={Server} title="Arquitectura del Proyecto" color="bg-emerald-600">
          <div className="mt-5 space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Stack tecnológico</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { layer: "Frontend",            tech: "Next.js 16 (App Router)", icon: "🖥️" },
                  { layer: "Estilos",             tech: "Tailwind CSS + shadcn/ui", icon: "🎨" },
                  { layer: "Backend",             tech: "Next.js API Routes (Node.js)", icon: "⚙️" },
                  { layer: "Base de datos",        tech: "PostgreSQL", icon: "🗄️" },
                  { layer: "Autenticación",        tech: "JWT + refresh + sesión activa", icon: "🔐" },
                  { layer: "Almacenamiento",       tech: "S3/R2 (eventos, documentos)", icon: "☁️" },
                  { layer: "Pagos",                tech: "ePayco (checkout + webhook)", icon: "💳" },
                  { layer: "Redis",                tech: "Upstash (revocación + sesión activa)", icon: "🧠" },
                  { layer: "Control de versiones", tech: "Git + GitHub", icon: "📦" },
                ].map((item) => (
                  <div key={item.layer} className="flex items-center gap-3 border border-gray-100 rounded-xl p-3 bg-gray-50">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">{item.layer}</p>
                      <p className="text-sm font-semibold text-gray-800">{item.tech}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Estructura de carpetas</h4>
              <pre className="bg-gray-900 text-green-400 rounded-xl p-4 text-xs font-mono leading-relaxed overflow-x-auto">
{`time2go/
├── src/
│   ├── app/                    # App Router (páginas + API)
│   │   ├── api/
│   │   │   ├── docs/
│   │   │   │   ├── files/      # Lista archivos de public/docs
│   │   │   │   └── serve/      # Sirve archivos de public/docs
│   │   │   ├── epayco/
│   │   │   │   └── webhook/    # Confirmación de transacciones
│   │   │   └── ...
│   │   ├── docs/               # UI /docs (admin)
│   │   └── ...
│   ├── components/
│   ├── hooks/
│   └── lib/                    # auth-session, jwt, active-session, token-revocation
├── public/
│   ├── docs/                   # ← Documentación adjunta (PDF, xlsx, etc.)
│   └── images/
├── middleware.ts
└── .env.example`}
              </pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Sistema de roles</h4>
              <div className="space-y-2">
                {[
                  { rol: 1, nombre: "Usuario regular",  permisos: "Ver eventos, reservar, gestionar perfil y reservas" },
                  { rol: 2, nombre: "Organizador",       permisos: "Todo lo anterior + crear y gestionar sus propios eventos" },
                  { rol: 3, nombre: "Moderador",         permisos: "Revisar y aprobar eventos, gestionar reportes" },
                  { rol: 4, nombre: "Administrador",     permisos: "Acceso total, incluyendo dashboard y documentación técnica" },
                ].map((r) => (
                  <div key={r.rol} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                    <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      r.rol === 4 ? "bg-green-600" : r.rol === 3 ? "bg-lime-600" : r.rol === 2 ? "bg-emerald-500" : "bg-gray-400"
                    }`}>{r.rol}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{r.nombre}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{r.permisos}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── Instalación local + Cloudflare Tunnel ── */}
        <Section icon={Terminal} title="Instalación Local y Tunnel" color="bg-teal-600">
          <div className="mt-5 space-y-6">

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Requisitos previos</h4>
              <div className="flex flex-wrap gap-2">
                {["Node.js ≥ 18", "npm ≥ 9", "PostgreSQL ≥ 15", "Git", "cloudflared"].map((r) => (
                  <span key={r} className="bg-teal-50 border border-teal-200 text-teal-700 text-xs font-medium px-3 py-1 rounded-full">{r}</span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1 uppercase tracking-wide">1 · Clonar e instalar</h4>
              <CodeBlock>{`git clone https://github.com/tu-org/time2go.git
cd time2go
npm install`}</CodeBlock>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1 uppercase tracking-wide">2 · Variables de entorno</h4>
              <p className="text-sm text-gray-500 mb-1">
                Copia <code className="bg-gray-100 px-1 rounded text-xs">.env.example</code> a{" "}
                <code className="bg-gray-100 px-1 rounded text-xs">.env</code> o{" "}
                <code className="bg-gray-100 px-1 rounded text-xs">.env.local</code> y completa los valores.
              </p>
              <CodeBlock>{`# Mínimo para desarrollo local:
DATABASE_URL=postgresql://user:password@localhost:5432/time2go
JWT_SECRET=tu_secreto_seguro
# o BETTER_AUTH_SECRET=...

# Redis/Upstash (opcional pero recomendado para sesión activa segura):
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
ACTIVE_SESSION_HMAC_SECRET=tu_secreto_hmac_largo

# ePayco (si pruebas upgrade de organizador):
EPAYCO_PUBLIC_KEY=...
EPAYCO_TEST_MODE=true
EPAYCO_P_CUST_ID_CLIENTE=...

# Ver .env.example para S3/R2, email, cron, etc.
NEXT_PUBLIC_APP_URL=http://localhost:3000`}</CodeBlock>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1 uppercase tracking-wide">3 · Inicializar la base de datos</h4>
              <CodeBlock>{`# Usa los scripts reales del repositorio:
psql -U user -d time2go -f "scripts SQL/DDL Time2Go.SQL"
# Inserta catálogos/semillas según necesites desde:
# scripts SQL/insert/`}</CodeBlock>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1 uppercase tracking-wide">4 · Levantar en desarrollo</h4>
              <CodeBlock>{`npm run dev
# → http://localhost:3000`}</CodeBlock>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1 uppercase tracking-wide">5 · Exponer con Cloudflare Tunnel</h4>
              <p className="text-sm text-gray-500 mb-1">Instala <code className="bg-gray-100 px-1 rounded text-xs">cloudflared</code> y autentica tu cuenta:</p>
              <CodeBlock>{`# Instalar cloudflared (Windows)
winget install Cloudflare.cloudflared

# Autenticar con tu cuenta de Cloudflare
cloudflared tunnel login

# Crear el tunnel
cloudflared tunnel create time2go

# Levantar el tunnel apuntando al puerto local
cloudflared tunnel run --url http://localhost:3000 time2go`}</CodeBlock>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1 uppercase tracking-wide">6 · Tunnel rápido sin cuenta (dev)</h4>
              <p className="text-sm text-gray-500 mb-1">Para pruebas rápidas sin configurar un tunnel permanente:</p>
              <CodeBlock>{`# Genera una URL pública temporal (expira al cerrar)
cloudflared tunnel --url http://localhost:3000`}</CodeBlock>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-amber-700 mb-1">⚠️ Consideraciones de seguridad con el tunnel</p>
              <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                <li>Cambia <code className="bg-amber-100 px-1 rounded text-xs">JWT_SECRET</code> por un valor seguro antes de exponer el tunnel</li>
                <li>Actualiza <code className="bg-amber-100 px-1 rounded text-xs">NEXT_PUBLIC_APP_URL</code> con la URL del tunnel</li>
                <li>El middleware protege las rutas sensibles aunque el tunnel sea público</li>
                <li>No compartas la URL del tunnel públicamente en redes sociales</li>
              </ul>
            </div>

          </div>
        </Section>

        <div className="text-center py-6 border-t border-gray-200">
          <p className="text-sm text-gray-400">Documentación interna · Time2Go · Solo para administradores</p>
        </div>
      </div>
    </main>
  )
}