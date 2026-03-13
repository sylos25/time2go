"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import {
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Loader2,
  Search,
  Trash2,
  X,
} from "lucide-react"
import { EditEventModal } from "./edit-event-modal"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const PDFViewer = dynamic(() => import("@/components/pdf-viewer").then((module) => module.PDFViewer), { ssr: false })

interface Event {
  id: number
  name: string
  date: string
  time: string
  location: string
  category: string
  capacity: number
  ticketsSold: number
  status: "published" | "hidden" | "cancelled" | "completed"
  visibility: boolean
  promoter: string
  documentos?: any[]
  destacado?: boolean
}

interface EventCategory {
  id_categoria_evento: number
  nombre: string
}

export default function DashboardEventsPage() {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [meUser, setMeUser] = useState<any>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [eventCategories, setEventCategories] = useState<EventCategory[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [pdfModalOpen, setPdfModalOpen] = useState(false)
  const [pdfModalUrl, setPdfModalUrl] = useState<string | null>(null)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectSubmitting, setRejectSubmitting] = useState(false)
  const [togglingDestacado, setTogglingDestacado] = useState<number | null>(null)
  const [rejectForm, setRejectForm] = useState({
    id_evento: 0,
    motivo_rechazo: "",
    rechazado_por: "",
  })

  const refreshEvents = async (token: string | null = null) => {
    try {
      const localToken = token ?? (typeof window !== "undefined" ? localStorage.getItem("token") : null)
      const headers: any = {}
      if (localToken) headers.Authorization = `Bearer ${localToken}`

      const eventsRes = await fetch("/api/events?includeAll=true", { headers, credentials: "include" })
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json()
        const serverEvents = eventsData.eventos || []
        const mapped = serverEvents.map((ev: any) => ({
          id: ev.id_evento,
          name: ev.nombre_evento || "Sin título",
          date: ev.fecha_inicio || ev.fecha_creacion,
          time: ev.hora_inicio || "",
          location: ev.sitio?.nombre_sitio || ev.municipio?.nombre_municipio || "",
          category: ev.categoria?.nombre || ev.categoria_nombre || "",
          capacity: ev.cupo || 0,
          ticketsSold: Number(ev.reservas_asistentes || 0),
          status: ev.estado ? "published" : "hidden",
          visibility: !!ev.estado,
          promoter: ev.creador?.nombres || "",
          documentos: ev.documentos || [],
          destacado: !!ev.destacado,
        }))
        setEvents(mapped)
      }
    } catch (err) {
      console.error("Failed to refresh events", err)
    }
  }

  useEffect(() => {
    let cancelled = false

    const loadData = async () => {
      setLoading(true)
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        const headers: any = {}
        if (token) headers.Authorization = `Bearer ${token}`

        const meRes = await fetch("/api/me", { headers })
        if (!meRes.ok) {
          if (!cancelled) setAuthorized(false)
          return
        }

        const meData = await meRes.json()
        if (!cancelled) setMeUser(meData?.user || null)
        const roleNum = meData?.user?.id_rol !== undefined ? Number(meData.user.id_rol) : undefined

        if (roleNum === undefined || Number.isNaN(roleNum)) {
          if (!cancelled) setAuthorized(false)
          return
        }

        const permRes = await fetch(`/api/permissions/check?id_accesibilidad=3&id_rol=${roleNum}`, {
          headers,
          credentials: "include",
        })

        if (!permRes.ok) {
          if (!cancelled) setAuthorized(false)
          return
        }

        const permData = await permRes.json()
        const hasAccess = Boolean(permData?.hasAccess)
        if (!cancelled) setAuthorized(hasAccess)

        if (!hasAccess) return

        const [categoriesRes] = await Promise.all([
          fetch("/api/categoria_evento", { headers, credentials: "include" }),
          refreshEvents(token),
        ])

        if (!cancelled && categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          if (Array.isArray(categoriesData)) {
            setEventCategories(categoriesData)
          }
        }
      } catch (err) {
        console.error("Error cargando eventos", err)
        if (!cancelled) setAuthorized(false)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadData()
    return () => {
      cancelled = true
    }
  }, [])

  const openRejectModal = (eventId: number) => {
    setRejectForm({
      id_evento: eventId,
      motivo_rechazo: "",
      rechazado_por: String(meUser?.id_usuario || ""),
    })
    setRejectModalOpen(true)
  }

  const submitReject = async () => {
    if (!rejectForm.motivo_rechazo || rejectForm.motivo_rechazo.trim().length < 10) {
      alert("El motivo debe tener mínimo 10 caracteres")
      return
    }

    setRejectSubmitting(true)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const headers: any = { "Content-Type": "application/json" }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch(`/api/events/${rejectForm.id_evento}/toggle-status`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify({
          estado: false,
          motivo_rechazo: rejectForm.motivo_rechazo.trim(),
          rechazado_por: Number(rejectForm.rechazado_por),
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        alert(data?.message || "No se pudo rechazar el evento")
        return
      }

      setRejectModalOpen(false)
      await refreshEvents()
    } catch (err) {
      console.error("Error rechazando evento", err)
      alert("No se pudo rechazar el evento")
    } finally {
      setRejectSubmitting(false)
    }
  }

  const deleteEvent = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este evento?")) return

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const headers: any = {}
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch(`/api/events/${id}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message || "No se pudo eliminar el evento")
      }

      setEvents((prev) => prev.filter((event) => event.id !== id))
    } catch (error) {
      console.error("Error eliminando evento", error)
      alert(error instanceof Error ? error.message : "Error eliminando evento")
    }
  }

  const approveEvent = async (id: number) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const headers: any = { "Content-Type": "application/json" }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch(`/api/events/${id}/toggle-status`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify({ estado: true }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message || "No se pudo validar el evento")
      }

      await refreshEvents()
    } catch (error) {
      console.error("Error validando evento", error)
      alert(error instanceof Error ? error.message : "Error validando evento")
    }
  }

  const toggleDestacado = async (id: number, currentValue: boolean) => {
    setTogglingDestacado(id)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const headers: any = { "Content-Type": "application/json" }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch(`/api/events/${id}/toggle-status`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify({ destacado: !currentValue }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        alert(data?.message || "No se pudo actualizar el estado destacado")
        return
      }

      setEvents((prev) => prev.map((ev) => (ev.id === id ? { ...ev, destacado: !currentValue } : ev)))
    } catch (err) {
      console.error("Error toggling destacado", err)
      alert("Error al cambiar el estado destacado")
    } finally {
      setTogglingDestacado(null)
    }
  }

  const eventCategoryTabs = [
    { value: "all", label: "Todas las categorias" },
    ...eventCategories.map((category) => ({
      value: category.nombre,
      label: category.nombre,
    })),
  ]

  const activeEventCategoryIndex = Math.max(
    0,
    eventCategoryTabs.findIndex((item) => item.value === filterCategory)
  )

  const goToPreviousEventCategory = () => {
    if (activeEventCategoryIndex <= 0) return
    setFilterCategory(eventCategoryTabs[activeEventCategoryIndex - 1].value)
  }

  const goToNextEventCategory = () => {
    if (activeEventCategoryIndex >= eventCategoryTabs.length - 1) return
    setFilterCategory(eventCategoryTabs[activeEventCategoryIndex + 1].value)
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || event.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "hidden":
        return "bg-muted text-muted-foreground"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "published":
        return "Publicado"
      case "hidden":
        return "Oculto"
      case "cancelled":
        return "Cancelado"
      case "completed":
        return "Completado"
      default:
        return "Desconocido"
    }
  }

  const formatEventDate = (value: string) => {
    if (!value) return "-"
    const raw = String(value).trim()
    if (raw.includes("T")) return raw.split("T")[0]
    if (raw.includes(" ")) return raw.split(" ")[0]
    return raw
  }

  const formatEventTime = (value: string) => {
    if (!value) return "-"
    const raw = String(value).trim()
    const timePart = raw.includes("T") ? raw.split("T")[1] || "" : raw.includes(" ") ? raw.split(" ")[1] || raw : raw
    const clean = timePart.replace(/Z$/i, "").replace(/\.\d+$/, "")
    if (/^\d{2}:\d{2}$/.test(clean)) return `${clean}:00`
    return clean || "-"
  }

  if (loading || authorized === null) {
    return (
      <div className="min-h-[60vh] bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-green-800 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">Cargando eventos...</p>
        </div>
      </div>
    )
  }

  if (authorized === false) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-card border border-border rounded-3xl shadow-xl p-8 text-center">
          <h2 className="text-2xl font-semibold text-red-600">Acceso denegado</h2>
          <p className="mt-4 text-muted-foreground">No tienes permisos para gestionar eventos.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-green-700/30 bg-green-600 px-3 py-5 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-900 sm:px-6 sm:py-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-lime-300/30 blur-2xl dark:bg-lime-500/20" />
        <div className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-teal-300/25 blur-2xl dark:bg-emerald-500/20" />

        <div className="relative space-y-4">
          <h3 className="mb-4 text-center text-3xl font-semibold tracking-tight text-white dark:text-lime-200 sm:mb-6 sm:text-5xl">
            <span style={{ fontFamily: "Futura, Trebuchet MS, Helvetica, Arial, sans-serif" }}>Gestion de Eventos</span>
          </h3>

          <p className="text-center text-sm font-medium text-lime-100/95">
            {eventCategoryTabs[activeEventCategoryIndex]?.label || "Todas las categorias"}
          </p>

          <div className="flex items-center justify-center gap-1.5 sm:gap-2" role="tablist" aria-label="Navegacion de categorias de eventos">
            <button
              type="button"
              onClick={goToPreviousEventCategory}
              disabled={activeEventCategoryIndex <= 0}
              aria-label="Categoria anterior"
              title="Categoria anterior"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-lime-200 bg-white/95 text-green-700 transition-colors hover:border-lime-500 hover:bg-lime-100 disabled:cursor-not-allowed disabled:opacity-45 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-200 dark:hover:border-teal-400 dark:hover:bg-teal-800/40 cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="w-full max-w-[calc(100vw-10rem)] overflow-x-auto sm:max-w-[72vw]">
              <div className="flex w-max items-center gap-2 px-1 py-1">
                {eventCategoryTabs.map((item) => {
                  const isActive = item.value === filterCategory
                  return (
                    <button
                      key={item.value}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`Mostrar categoria: ${item.label}`}
                      title={`Mostrar categoria: ${item.label}`}
                      onClick={() => setFilterCategory(item.value)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors sm:text-sm cursor-pointer ${
                        isActive
                          ? "bg-green-700 text-white shadow-sm hover:bg-emerald-400 hover:text-green-900 dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-lime-400"
                          : "bg-white/90 text-green-700 hover:bg-lime-200 hover:text-green-800 dark:bg-emerald-950/55 dark:text-emerald-200 dark:hover:bg-teal-800/45"
                      }`}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={goToNextEventCategory}
              disabled={activeEventCategoryIndex >= eventCategoryTabs.length - 1}
              aria-label="Categoria siguiente"
              title="Categoria siguiente"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-lime-200 bg-white/95 text-green-700 transition-colors hover:border-lime-500 hover:bg-lime-100 disabled:cursor-not-allowed disabled:opacity-45 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-200 dark:hover:border-teal-400 dark:hover:bg-teal-800/40 cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lime-600 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar eventos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white/95 border border-green-600 rounded-lg placeholder:text-muted-foreground text-green-900 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-lime-200/70 bg-white/85 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-950/35">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-green-500 dark:bg-emerald-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/95 uppercase tracking-wider border-r border-lime-200/35 dark:border-emerald-300/20">Evento</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/95 uppercase tracking-wider border-r border-lime-200/35 dark:border-emerald-300/20">Fecha y Hora</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/95 uppercase tracking-wider border-r border-lime-200/35 dark:border-emerald-300/20">Ubicación</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/95 uppercase tracking-wider border-r border-lime-200/35 dark:border-emerald-300/20">Tickets</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/95 uppercase tracking-wider border-r border-lime-200/35 dark:border-emerald-300/20">Estado</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-white/95 uppercase tracking-wider border-r border-lime-200/35 dark:border-emerald-300/20">Destacado</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/95 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lime-200/80 dark:divide-emerald-700/60">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="bg-white/95 hover:bg-lime-50/90 dark:bg-emerald-950/25 dark:hover:bg-emerald-900/35 transition-colors">
                  <td className="px-6 py-4 border-r border-lime-200/70 dark:border-emerald-700/45">
                    <p className="font-semibold text-green-900 dark:text-emerald-100/90">{event.name}</p>
                    <p className="text-sm text-green-700/80 dark:text-emerald-200/80">{event.category}</p>
                  </td>
                  <td className="px-6 py-4 border-r border-lime-200/70 dark:border-emerald-700/45">
                    <div className="flex flex-col gap-1">
                      <div className="text-sm text-green-900 dark:text-emerald-100/90">{formatEventDate(event.date)}</div>
                      <div className="text-sm text-green-700/80 dark:text-emerald-200/80">{formatEventTime(event.time)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r border-lime-200/70 dark:border-emerald-700/45 text-sm text-green-900 dark:text-emerald-100/90">{event.location}</td>
                  <td className="px-6 py-4 border-r border-lime-200/70 dark:border-emerald-700/45">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-green-900 dark:text-emerald-100/90">{event.ticketsSold} / {event.capacity}</span>
                      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${event.capacity > 0 ? Math.min(100, (event.ticketsSold / event.capacity) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r border-lime-200/70 dark:border-emerald-700/45">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(event.status)}`}>
                      {getStatusText(event.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center border-r border-lime-200/70 dark:border-emerald-700/45">
                    <button
                      role="switch"
                      aria-checked={!!event.destacado}
                      onClick={() => toggleDestacado(event.id, !!event.destacado)}
                      disabled={togglingDestacado === event.id}
                      title={event.destacado ? "Quitar de destacados" : "Marcar como destacado"}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${event.destacado ? "bg-yellow-400" : "bg-muted"}`}
                    >
                      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${event.destacado ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => approveEvent(event.id)}
                        className="p-2 text-green-600 hover:bg-accent rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title={event.visibility ? "Evento validado" : "Validar evento"}
                        disabled={Boolean(event.visibility)}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openRejectModal(event.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Rechazar evento"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const documents = event.documentos ?? []
                          if (!documents.length) return

                          if (documents.length === 1) {
                            const proxied = `/api/events/document?id=${encodeURIComponent(String(documents[0].id_documento_evento))}`
                            setPdfModalUrl(proxied)
                            setPdfModalOpen(true)
                            return
                          }

                          const listText = documents.map((_: any, i: number) => `${i + 1}. Documento ${i + 1}`).join("\n")
                          const docNum = prompt(`Hay ${documents.length} documentos. Ingresa el número (1-${documents.length}):\n\n${listText}`, "1")
                          if (docNum && !Number.isNaN(parseInt(docNum, 10))) {
                            const idx = parseInt(docNum, 10) - 1
                            if (idx >= 0 && idx < documents.length) {
                              const proxied = `/api/events/document?id=${encodeURIComponent(String(documents[idx].id_documento_evento))}`
                              setPdfModalUrl(proxied)
                              setPdfModalOpen(true)
                            }
                          }
                        }}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title={(event.documentos ?? []).length > 0 ? "Ver documento PDF" : "Sin documento"}
                        disabled={(event.documentos ?? []).length === 0}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingEvent(event)
                          setEditModalOpen(true)
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar evento"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar evento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No se encontraron eventos</p>
            <p className="text-sm text-muted-foreground mt-1">Intenta con otros filtros de búsqueda</p>
          </div>
        )}
      </div>

      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Rechazar Evento</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Motivo del rechazo</label>
              <textarea
                value={rejectForm.motivo_rechazo}
                onChange={(e) => setRejectForm((prev) => ({ ...prev, motivo_rechazo: e.target.value }))}
                className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 min-h-28 resize-none"
                placeholder="Describe el motivo del rechazo (mínimo 10 caracteres)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {rejectForm.motivo_rechazo.length} caracteres
                {rejectForm.motivo_rechazo.length < 10 && (
                  <span className="text-red-500 ml-1">(mínimo {10 - rejectForm.motivo_rechazo.length} más)</span>
                )}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)} disabled={rejectSubmitting}>
              Cancelar
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={submitReject}
              disabled={rejectSubmitting || rejectForm.motivo_rechazo.trim().length < 10}
            >
              {rejectSubmitting ? "Rechazando..." : "Confirmar Rechazo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editingEvent && (
        <EditEventModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setEditingEvent(null)
          }}
          event={editingEvent}
          onSave={async () => {
            await refreshEvents()
          }}
        />
      )}

      <Dialog open={pdfModalOpen} onOpenChange={() => setPdfModalOpen(false)}>
        <DialogContent className="max-w-5xl w-full max-h-[90vh] p-0 border-0">
          {pdfModalUrl ? (
            <PDFViewer pdfUrl={pdfModalUrl} fileName="documento.pdf" onClose={() => setPdfModalOpen(false)} />
          ) : (
            <div className="flex items-center justify-center h-96">
              <p className="text-muted-foreground">No hay documento</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
