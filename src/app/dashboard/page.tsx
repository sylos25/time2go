"use client"

import type React from "react"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  Calendar,
  Users,
  Settings,
  Search,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Edit,
  Trash2,
  EyeOff,
  MapPin,
  Download,
  Home,
  Activity,
  UserX,
  UserCheck,
} from "lucide-react"
import { InsertDataTab } from "@/components/dashboard/insert-data-tab"
import ViewDataTab from "@/components/dashboard/view-data-tab"
import { EditEventModal } from "@/components/dashboard/edit-event-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"


const PDFViewer = dynamic(
  () => import("@/components/pdf-viewer").then((module) => module.PDFViewer),
  { ssr: false }
)

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
  image: string
  promoter: string
  documentos?: any[]
  destacado?: boolean
}

interface EventCategory {
  id_categoria_evento: number
  nombre: string
}

interface StatCard {
  title: string
  value: number | string
  icon: React.ElementType
  color: string
}

interface ChecklistItem {
  id: number
  text: string
  completed: boolean
}

export default function EventDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [loading, setLoading] = useState(true)
  const [meUser, setMeUser] = useState<any>(null)
  const [canManageEvents, setCanManageEvents] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [usersPage, setUsersPage] = useState(1)
  const [usersPageSize, setUsersPageSize] = useState(25)
  const [usersTotal, setUsersTotal] = useState(0)
  const [usersTotalPages, setUsersTotalPages] = useState(1)
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null)
  const [banModalOpen, setBanModalOpen] = useState(false)
  const [banSubmitting, setBanSubmitting] = useState(false)
  const [banForm, setBanForm] = useState({
    id_usuario: "",
    motivo_ban: "",
    inicio_ban: "",
    fin_ban: "",
    responsable: "",
  })
  const [searchUsers, setSearchUsers] = useState('')
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [pdfModalOpen, setPdfModalOpen] = useState(false)
  const [pdfModalUrl, setPdfModalUrl] = useState<string | null>(null)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectSubmitting, setRejectSubmitting] = useState(false)
  const [rejectForm, setRejectForm] = useState({
    id_evento: 0,
    motivo_rechazo: "",
    rechazado_por: "",
  })
  const [togglingDestacado, setTogglingDestacado] = useState<number | null>(null)
  const router = useRouter()
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    { id: 1, text: "Revisar eventos del mes", completed: true },
    { id: 2, text: "Confirmar proveedores", completed: true },
    { id: 3, text: "Actualizar precios", completed: false },
    { id: 4, text: "Enviar reporte financiero", completed: false },
    { id: 5, text: "Planificar próximo festival", completed: false },
  ])
  const [stats, setStats] = useState<StatCard[]>([
    { title: "Eventos Activos", value: 0, icon: Calendar, color: "from-fuchsia-500 to-red-700" },
    { title: "Eventos Inactivos", value: 0, icon: EyeOff, color: "from-gray-500 to-gray-600" },
    { title: "Usuarios Activos", value: 0, icon: Users, color: "from-lime-500 to-green-700" },
    { title: "Usuarios Baneados", value: 0, icon: Users, color: "from-gray-500 to-gray-600" },
  ])
  const [events, setEvents] = useState<Event[]>([])
  const [eventCategories, setEventCategories] = useState<EventCategory[]>([])

  const refreshEvents = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const headers: any = {}
      if (token) headers['Authorization'] = `Bearer ${token}`
      const eventsUrl = canManageEvents ? '/api/events?includeAll=true' : '/api/events'
      const eventsRes = await fetch(eventsUrl, { headers, credentials: 'include' })
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json()
        const serverEvents = eventsData.eventos || []
        const mapped = serverEvents.map((ev: any) => ({
          id: ev.id_evento,
          name: ev.nombre_evento || 'Sin título',
          date: ev.fecha_inicio || ev.fecha_creacion,
          time: ev.hora_inicio || '',
          location: ev.sitio?.nombre_sitio || ev.municipio?.nombre_municipio || '',
          category: ev.categoria?.nombre || ev.categoria_nombre || '',
          capacity: ev.cupo || 0,
          ticketsSold: Number(ev.reservas_asistentes || 0),
          status: ev.estado ? 'published' : 'hidden',
          visibility: !!ev.estado,
          image: (ev.imagenes && ev.imagenes[0] && ev.imagenes[0].url_imagen_evento) || '/images/placeholder.jpg',
          promoter: ev.creador?.nombres || '',
          creatorId: ev.creador?.id_usuario || null,
          documentos: ev.documentos || [],
          destacado: !!ev.destacado,
        }))
        setEvents(mapped)
      }
    } catch (err) {
      console.error('Failed to refresh events', err)
    }
  }

  // On mount: validate session and fetch dashboard data (events + user)
  useEffect(() => {
    let canceled = false;
    const loadDashboardData = async () => {
      setLoading(true)
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const headers: any = {}
        if (token) headers['Authorization'] = `Bearer ${token}`
        const meRes = await fetch('/api/me', { headers })
        if (!meRes.ok) {
          // Not authenticated — block access
          if (!canceled) setAuthorized(false)
          return
        }
        const meData = await meRes.json()
        if (!canceled) setMeUser(meData.user)
        const roleNum = meData?.user?.id_rol !== undefined ? Number(meData.user.id_rol) : undefined
        if (roleNum === undefined || Number.isNaN(roleNum)) {
          if (!canceled) setAuthorized(false)
          return
        }

        const [permissionRes, manageEventsPermissionRes] = await Promise.all([
          fetch(`/api/permissions/check?id_accesibilidad=4&id_rol=${roleNum}`, {
            headers,
            credentials: 'include',
          }),
          fetch(`/api/permissions/check?id_accesibilidad=3&id_rol=${roleNum}`, {
            headers,
            credentials: 'include',
          }),
        ])

        if (!permissionRes.ok) {
          if (!canceled) setAuthorized(false)
          return
        }

        const permissionData = await permissionRes.json()
        const hasDashboardAccess = Boolean(permissionData?.hasAccess)
        if (!canceled) setAuthorized(hasDashboardAccess)
        if (!canceled && !hasDashboardAccess) {
          return
        }

        let hasManageEventsPermission = false
        if (manageEventsPermissionRes.ok) {
          const manageEventsPermissionData = await manageEventsPermissionRes.json()
          hasManageEventsPermission = Boolean(manageEventsPermissionData?.hasAccess)
        }
        if (!canceled) setCanManageEvents(hasManageEventsPermission)

        // Desbloquear UI del menú apenas se valida acceso
        if (!canceled) setLoading(false)

        // Cargar datos pesados en segundo plano para evitar retraso perceptible en menú
        const eventsUrl = hasManageEventsPermission ? '/api/events?includeAll=true' : '/api/events'

        void Promise.allSettled([
          fetch('/api/categoria_evento', { headers, credentials: 'include' }),
          fetch(eventsUrl, { headers, credentials: 'include' }),
          fetch('/api/stats', { headers }),
          fetch('/api/usuarios?roles=1,2&estado=true&page=1&pageSize=1', { headers }),
        ]).then(async ([categoriesResult, eventsResult, statsResult, usersRolesResult]) => {
          if (!canceled && categoriesResult.status === 'fulfilled' && categoriesResult.value.ok) {
            const categoriesData = await categoriesResult.value.json()
            if (Array.isArray(categoriesData)) {
              setEventCategories(categoriesData)
            }
          }

          if (!canceled && eventsResult.status === 'fulfilled' && eventsResult.value.ok) {
            const eventsData = await eventsResult.value.json()
            const serverEvents = eventsData.eventos || []
            const mapped = serverEvents.map((ev: any) => ({
              id: ev.id_evento,
              name: ev.nombre_evento || 'Sin título',
              date: ev.fecha_inicio || ev.fecha_creacion,
              time: ev.hora_inicio || '',
              location: ev.sitio?.nombre_sitio || ev.municipio?.nombre_municipio || '',
              category: ev.categoria?.nombre || ev.categoria_nombre || '',
              capacity: ev.cupo || 0,
              ticketsSold: Number(ev.reservas_asistentes || 0),
              status: ev.estado ? 'published' : 'hidden',
              visibility: !!ev.estado,
              image: (ev.imagenes && ev.imagenes[0] && ev.imagenes[0].url_imagen_evento) || '/images/placeholder.jpg',
              promoter: ev.creador?.nombres || '',
              creatorId: ev.creador?.id_usuario || null,
              documentos: ev.documentos || [],
              destacado: !!ev.destacado,
            }))
            setEvents(mapped)
          }

          if (!canceled && statsResult.status === 'fulfilled' && statsResult.value.ok) {
            const statsData = await statsResult.value.json()
            if (statsData.ok) {
              setStats((prev) => prev.map((s) => {
                if (s.title === 'Eventos Activos') return { ...s, value: statsData.eventsActive }
                if (s.title === 'Eventos Inactivos') return { ...s, value: statsData.eventsInactive }
                if (s.title === 'Usuarios Baneados') return { ...s, value: statsData.usersBanned }
                return s
              }))
            }
          }

          if (!canceled && usersRolesResult.status === 'fulfilled' && usersRolesResult.value.ok) {
            const usersRolesData = await usersRolesResult.value.json()
            const activeRolesOneAndTwo = Number(usersRolesData?.pagination?.total || 0)

            setStats((prev) =>
              prev.map((s) => (s.title === 'Usuarios Activos' ? { ...s, value: activeRolesOneAndTwo } : s))
            )
          }
        })
      } catch (err) {
        console.error('Error cargando datos del dashboard', err)
      } finally {
        if (!canceled) setLoading(false)
      }
    }
    loadDashboardData()
    return () => { canceled = true }
  }, [router])

  // When user opens the Users tab, fetch users list
  useEffect(() => {
    let cancelled = false
    const loadUsers = async () => {
      if (activeTab !== 'users') return
      setLoadingUsers(true)
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const headers: any = {}
        if (token) headers['Authorization'] = `Bearer ${token}`
        const params = new URLSearchParams({
          roles: '1,2',
          page: String(usersPage),
          pageSize: String(usersPageSize),
        })
        if (searchUsers.trim()) params.set('q', searchUsers.trim())

        const res = await fetch(`/api/usuarios?${params.toString()}`, { headers })
        if (res.ok) {
          const data = await res.json()
          if (!cancelled) {
            setUsers(data.usuarios || [])
            setUsersTotal(Number(data?.pagination?.total || 0))
            setUsersTotalPages(Number(data?.pagination?.totalPages || 1))
          }
        }
      } catch (err) {
        console.error('Error cargando usuarios', err)
      } finally {
        if (!cancelled) setLoadingUsers(false)
      }
    }
    loadUsers()
    return () => { cancelled = true }
  }, [activeTab, usersPage, usersPageSize, searchUsers])

  const formatDateTimeLocal = (date: Date) => {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    return local.toISOString().slice(0, 16)
  }

  const openBanModal = (idUsuario: number) => {
    const inicio = new Date()
    const fin = new Date(inicio.getTime() + 7 * 24 * 60 * 60 * 1000)
    setBanForm({
      id_usuario: String(idUsuario),
      motivo_ban: "",
      inicio_ban: formatDateTimeLocal(inicio),
      fin_ban: formatDateTimeLocal(fin),
      responsable: String(meUser?.id_usuario || ""),
    })
    setBanModalOpen(true)
  }

  const submitBan = async () => {
    const idUsuario = Number(banForm.id_usuario)
    const responsable = Number(banForm.responsable)

    if (!Number.isFinite(idUsuario) || idUsuario <= 0) {
      alert('ID de usuario inválido')
      return
    }
    if (!banForm.motivo_ban || banForm.motivo_ban.trim().length < 10) {
      alert('El motivo debe tener mínimo 10 caracteres')
      return
    }
    if (!banForm.inicio_ban || !banForm.fin_ban) {
      alert('Debes diligenciar fecha de inicio y fecha final')
      return
    }
    if (!Number.isFinite(responsable) || responsable <= 0) {
      alert('Responsable inválido')
      return
    }

    setBanSubmitting(true)
    setUpdatingUserId(idUsuario)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const headers: any = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`/api/usuarios/${encodeURIComponent(String(idUsuario))}/ban`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          action: 'ban',
          id_usuario: idUsuario,
          motivo_ban: banForm.motivo_ban.trim(),
          inicio_ban: banForm.inicio_ban,
          fin_ban: banForm.fin_ban,
          responsable,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        alert(data?.message || 'No se pudo bannear el usuario')
        return
      }

      setUsers((prev) => prev.map((item) => (item.id_usuario === idUsuario ? { ...item, estado: false } : item)))
      setBanModalOpen(false)
    } catch (error) {
      console.error('Error banneando usuario', error)
      alert('No se pudo bannear el usuario')
    } finally {
      setBanSubmitting(false)
      setUpdatingUserId(null)
    }
  }

  const unbanUser = async (idUsuario: number) => {
    setUpdatingUserId(idUsuario)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const headers: any = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`/api/usuarios/${encodeURIComponent(String(idUsuario))}/ban`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ action: 'unban' }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        alert(data?.message || 'No se pudo desbannear el usuario')
        return
      }

      setUsers((prev) => prev.map((item) => (item.id_usuario === idUsuario ? { ...item, estado: true } : item)))
    } catch (error) {
      console.error('Error desbanneando usuario', error)
      alert('No se pudo desbannear el usuario')
    } finally {
      setUpdatingUserId(null)
    }
  }

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
      if (token) headers["Authorization"] = `Bearer ${token}`

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

  const toggleDestacado = async (id: number, currentValue: boolean) => {
    setTogglingDestacado(id)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const headers: any = { "Content-Type": "application/json" }
      if (token) headers["Authorization"] = `Bearer ${token}`

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

      // Actualizar estado local sin refetch
      setEvents((prev) =>
        prev.map((ev) => (ev.id === id ? { ...ev, destacado: !currentValue } : ev))
      )
    } catch (err) {
      console.error("Error toggling destacado", err)
      alert("Error al cambiar el estado destacado")
    } finally {
      setTogglingDestacado(null)
    }
  }


  if (authorized === null) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Comprobando permisos...</div>
      </main>
    )
  }

  if (authorized === false) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-card border border-border rounded-3xl shadow-xl p-8 text-center">
            <h2 className="text-2xl font-semibold text-red-600">Acceso denegado</h2>
            <p className="mt-4 text-muted-foreground">No tienes permisos para ver el dashboard.</p>
            <div className="mt-6">
              <Button onClick={() => router.push('/')} className="bg-lime-600 text-white">Volver al inicio</Button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  const eventData = [
    { month: "Jul", vistas: 8500, asistentes: 2100 },
    { month: "Ago", vistas: 9200, asistentes: 2450 },
    { month: "Sep", vistas: 11000, asistentes: 2800 },
    { month: "Oct", vistas: 10500, asistentes: 2600 },
    { month: "Nov", vistas: 12300, asistentes: 3100 },
    { month: "Dic", vistas: 14200, asistentes: 3275 },
  ]

  const categoryData = [
    { name: "Música", value: 45, color: "#3B82F6" },
    { name: "Teatro", value: 25, color: "#8B5CF6" },
    { name: "Deportes", value: 15, color: "#10B981" },
    { name: "Arte", value: 10, color: "#F59E0B" },
    { name: "Otros", value: 5, color: "#EF4444" },
  ]

  const topEvents = [
    { name: "Festival Carranga", tickets: 1850, views: 8500 },
    { name: "Concierto Rock", tickets: 800, views: 6200 },
    { name: "La Madriguera", tickets: 380, views: 2400 },
    { name: "Festival Jazz", tickets: 245, views: 1900 },
  ]

  const menuItems = [
    { id: "overview", name: "Resumen General", icon: Home },
    ...(canManageEvents ? [{ id: "events", name: "Gestión de Eventos", icon: Calendar }] : []),
    { id: "ingresar-datos", name: "Ingresar Datos", icon: MapPin },
    { id: "ver-datos", name: "Ver Datos", icon: Search },
    { id: "users", name: "Usuarios", icon: Users },
  ]

  const deleteEvent = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este evento?")) return
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const headers: any = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message || 'No se pudo eliminar el evento')
      }

      setEvents((prev) => prev.filter((event) => event.id !== id))
    } catch (error) {
      console.error('Error eliminando evento', error)
      alert(error instanceof Error ? error.message : 'Error eliminando evento')
    }
  }

  const approveEvent = async (id: number) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const headers: any = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`/api/events/${id}/toggle-status`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({ estado: true }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message || 'No se pudo validar el evento')
      }

      await refreshEvents()
    } catch (error) {
      console.error('Error validando evento', error)
      alert(error instanceof Error ? error.message : 'Error validando evento')
    }
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || event.category === filterCategory
    return matchesSearch && matchesCategory
  })

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
    const timePart = raw.includes("T")
      ? (raw.split("T")[1] || "")
      : raw.includes(" ")
        ? (raw.split(" ")[1] || raw)
        : raw

    const clean = timePart.replace(/Z$/i, "").replace(/\.\d+$/, "")
    if (/^\d{2}:\d{2}$/.test(clean)) return `${clean}:00`
    return clean || "-"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-green-800 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">Cargando datos del panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 w-72 h-screen bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <img 
              src="/images/logo.png" 
              alt="Logo" 
              className="w-full h-full object-cover"
            />
          </div>
        
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id)
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === item.id
                  ? "bg-gradient-to-bl from-fuchsia-700 to-red-600 text-white shadow-md shadow-sky-600/25 cursor-pointer"
                  : "text-foreground hover:bg-accent cursor-pointer"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.name}</span>
            </button>
          ))}
        </nav>


      </aside>

      <div className="lg:ml-72">
        <header className="bg-card border-b border-border backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <Menu className="w-5 h-5 text-foreground" />
              </button>
              <div>
                <p className="text-3xl text-foreground font-sans font-bold mt-0.5">Bienvenido , {meUser?.nombres || meUser?.name || 'Usuario'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 ">
              <button onClick={() => router.push('/')} className="px-3 py-1 text-sm bg-card/90 text-foreground rounded-lg shadow-sm hover:bg-accent cursor-pointer border border-border">
                Salir
              </button>
            </div>
          </div>
        </header>

        <main className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md hover:border-border transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                        <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>

                      </div>
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-sm`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-card rounded-xl shadow-sm border border-border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Evolución de Vistas y Asistentes</h3>
                      <p className="text-sm text-muted-foreground mt-1">Últimos 6 meses</p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={eventData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }} />
                      <Legend wrapperStyle={{ fontSize: "14px" }} />
                      <Line
                        type="monotone"
                        dataKey="vistas"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        name="Vistas"
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="asistentes"
                        stroke="#8B5CF6"
                        strokeWidth={3}
                        name="Asistentes"
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-foreground">Eventos por Categoría</h3>
                    <p className="text-sm text-muted-foreground mt-1">Distribución actual</p>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {categoryData.map((category, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                          <span className="text-foreground">{category.name}</span>
                        </div>
                        <span className="font-semibold text-foreground">{category.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Eventos Más Populares</h3>
                    <p className="text-sm text-muted-foreground mt-1">Ordenados por número de tickets vendidos</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topEvents}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }} />
                    <Legend wrapperStyle={{ fontSize: "14px" }} />
                    <Bar dataKey="tickets" fill="#3B82F6" name="Tickets Vendidos" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="views" fill="#8B5CF6" name="Vistas" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === "events" && canManageEvents && (
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
                        <th className="px-6 py-4 text-left text-xs font-semibold text-white/95 uppercase tracking-wider border-r border-lime-200/35 dark:border-emerald-300/20">
                          Evento
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-white/95 uppercase tracking-wider border-r border-lime-200/35 dark:border-emerald-300/20">
                          Fecha y Hora
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-white/95 uppercase tracking-wider border-r border-lime-200/35 dark:border-emerald-300/20">
                          Ubicación
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-white/95 uppercase tracking-wider border-r border-lime-200/35 dark:border-emerald-300/20">
                          Tickets
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-white/95 uppercase tracking-wider border-r border-lime-200/35 dark:border-emerald-300/20">
                          Estado
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-white/95 uppercase tracking-wider border-r border-lime-200/35 dark:border-emerald-300/20">
                         Destacado
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-white/95 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-lime-200/80 dark:divide-emerald-700/60">
                      {filteredEvents.map((event) => {
                        const documents = event.documentos ?? []
                        const hasDocuments = documents.length > 0

                        return (
                        <tr key={event.id} className="bg-white/95 hover:bg-lime-50/90 dark:bg-emerald-950/25 dark:hover:bg-emerald-900/35 transition-colors">
                          <td className="px-6 py-4 border-r border-lime-200/70 dark:border-emerald-700/45">
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-semibold text-green-900 dark:text-emerald-100/90">{event.name}</p>
                                <p className="text-sm text-green-700/80 dark:text-emerald-200/80">{event.category}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 border-r border-lime-200/70 dark:border-emerald-700/45">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 text-sm text-green-900 dark:text-emerald-100/90">
                                {formatEventDate(event.date)}
                              </div>
                              <div className="flex items-center gap-1.5 text-sm text-green-700/80 dark:text-emerald-200/80">
                                {formatEventTime(event.time)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 border-r border-lime-200/70 dark:border-emerald-700/45">
                            <div className="flex items-center gap-1.5 text-sm text-green-900 dark:text-emerald-100/90">
                              {event.location}
                            </div>
                          </td>
                          <td className="px-6 py-4 border-r border-lime-200/70 dark:border-emerald-700/45">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-semibold text-green-900 dark:text-emerald-100/90">
                                {event.ticketsSold} / {event.capacity}
                              </span>
                              <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-600 rounded-full"
                                  style={{ width: `${event.capacity > 0 ? Math.min(100, (event.ticketsSold / event.capacity) * 100) : 0}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 border-r border-lime-200/70 dark:border-emerald-700/45">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(event.status)}`}
                            >
                              {getStatusText(event.status)}
                            </span>
                          </td>
                          {/* Columna Destacado */}
                          <td className="px-6 py-4 text-center border-r border-lime-200/70 dark:border-emerald-700/45">
                            <button
                              role="switch"
                              aria-checked={!!event.destacado}
                              onClick={() => toggleDestacado(event.id, !!event.destacado)}
                              disabled={togglingDestacado === event.id}
                              title={event.destacado ? "Quitar de destacados" : "Marcar como destacado"}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none
                                disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                                ${event.destacado ? "bg-yellow-400" : "bg-muted"}`}
                            >
                              <span
                                className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform
                                  ${event.destacado ? "translate-x-6" : "translate-x-1"}`}
                              />
                            </button>
                          </td>

                          {/* Columna Acciones */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {/* Aprobar */}
                              <button
                                onClick={() => approveEvent(event.id)}
                                className="p-2 text-green-600 hover:bg-accent rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                title={event.visibility ? "Evento validado" : "Validar evento"}
                                disabled={Boolean(event.visibility)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>

                              {/* Rechazar */}
                              <button
                                onClick={() => openRejectModal(event.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Rechazar evento"
                              >
                                <X className="w-4 h-4" />
                              </button>

                              {/* Ver documento */}
                              <button
                                onClick={() => {
                                  const documents = event.documentos ?? []
                                  if (!documents.length) return
                                  if (documents.length === 1) {
                                    const proxied = `/api/events/document?id=${encodeURIComponent(String(documents[0].id_documento_evento))}`
                                    setPdfModalUrl(proxied)
                                    setPdfModalOpen(true)
                                  } else {
                                    const listText = documents.map((d: any, i: number) => `${i + 1}. Documento ${i + 1}`).join("\n")
                                    const docNum = prompt(
                                      `Hay ${documents.length} documentos. Ingresa el número (1-${documents.length}):\n\n${listText}`,
                                      "1"
                                    )
                                    if (docNum && !isNaN(parseInt(docNum))) {
                                      const idx = parseInt(docNum) - 1
                                      if (idx >= 0 && idx < documents.length) {
                                        const proxied = `/api/events/document?id=${encodeURIComponent(String(documents[idx].id_documento_evento))}`
                                        setPdfModalUrl(proxied)
                                        setPdfModalOpen(true)
                                      }
                                    }
                                  }
                                }}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                title={(event.documentos ?? []).length > 0 ? "Ver documento PDF" : "Sin documento"}
                                disabled={(event.documentos ?? []).length === 0}
                              >
                                <Download className="w-4 h-4" />
                              </button>

                              {/* Editar */}
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

                              {/* Eliminar */}
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
                      )})}
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
            </div>
          )}

          {activeTab === "ingresar-datos" && (
            <div className="space-y-6">
              <InsertDataTab initialTable="sitios" />
            </div>
          )}

          {activeTab === "ver-datos" && (
            <div className="space-y-6">
              <ViewDataTab />
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="text-center py-20">
              <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Sección de Analíticas</p>
              <p className="text-sm text-muted-foreground mt-1">Esta funcionalidad estará disponible próximamente</p>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-2xl border border-green-700/30 bg-green-600 px-3 py-5 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-900 sm:px-6 sm:py-8">
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-lime-300/30 blur-2xl dark:bg-lime-500/20" />
                <div className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-teal-300/25 blur-2xl dark:bg-emerald-500/20" />

                <div className="relative space-y-4">
                  <h3 className="mb-4 text-center text-3xl font-semibold tracking-tight text-white dark:text-lime-200 sm:mb-6 sm:text-5xl">
                    <span style={{ fontFamily: "Futura, Trebuchet MS, Helvetica, Arial, sans-serif" }}>Usuarios</span>
                  </h3>
                </div>
              </div>

              <div className="flex justify-start">
                <div className="relative w-full sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lime-600 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar usuarios..."
                    value={searchUsers}
                    onChange={(e) => {
                      setSearchUsers(e.target.value)
                      setUsersPage(1)
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/95 border border-lime-200 rounded-lg placeholder:text-muted-foreground text-green-900 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-lime-200/70 bg-white/85 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-950/35">
                <div className="overflow-x-auto">
                  <table className="table-fixed w-full border-collapse">
                    <thead className="bg-green-500 dark:bg-emerald-700">
                      <tr>
                        <th className="w-32 px-6 py-4 text-center text-xs font-semibold text-white/95 uppercase tracking-wider border-r border-lime-200/35 dark:border-emerald-300/20">ID Usuario</th>
                        <th className="w-32 px-6 py-4 text-center text-xs font-semibold text-white/95 uppercase tracking-wider border-r border-lime-200/35 dark:border-emerald-300/20">ID Rol</th>
                        <th className="w-36 px-6 py-4 text-center text-xs font-semibold text-white/95 uppercase tracking-wider border-r border-lime-200/35 dark:border-emerald-300/20">IG Google</th>
                        <th className="w-40 px-6 py-4 text-center text-xs font-semibold text-white/95 uppercase tracking-wider border-r border-lime-200/35 dark:border-emerald-300/20">Nombres</th>
                        <th className="w-40 px-6 py-4 text-center text-xs font-semibold text-white/95 uppercase tracking-wider border-r border-lime-200/35 dark:border-emerald-300/20">Apellidos</th>
                        <th className="w-32 px-6 py-4 text-center text-xs font-semibold text-white/95 uppercase tracking-wider border-r border-lime-200/35 dark:border-emerald-300/20">Teléfono</th>
                        <th className="w-80 px-6 py-4 text-center text-xs font-semibold text-white/95 uppercase tracking-wider border-r border-lime-200/35 dark:border-emerald-300/20">Correo</th>
                        <th className="w-45 px-6 py-4 text-center text-xs font-semibold text-white/95 uppercase tracking-wider border-r border-lime-200/35 dark:border-emerald-300/20">Correo Validado</th>
                        <th className="w-56 px-6 py-4 text-center text-xs font-semibold text-white/95 uppercase tracking-wider border-r border-lime-200/35 dark:border-emerald-300/20">Términos y Condiciones</th>
                        <th className="w-26 px-6 py-4 text-center text-xs font-semibold text-white/95 uppercase tracking-wider border-r border-lime-200/35 dark:border-emerald-300/20">Estado</th>
                        <th className="w-56 px-6 py-4 text-center text-xs font-semibold text-white/95 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-lime-200/80 dark:divide-emerald-700/60">
                      {users
                        .map((u, index) => (
                          <tr key={u.id_usuario} className={`transition-colors ${index % 2 === 0 ? 'bg-white/95 hover:bg-lime-50/90 dark:bg-emerald-950/25 dark:hover:bg-emerald-900/35' : 'bg-lime-50/45 hover:bg-lime-100/75 dark:bg-teal-950/25 dark:hover:bg-teal-900/35'}`}>
                            <td className="px-6 py-4 text-center text-sm text-green-900 dark:text-emerald-100/90">{u.id_usuario}</td>
                            <td className="px-6 py-4 text-center text-sm text-green-900 dark:text-emerald-100/90">{u.id_rol || '-'}</td>
                            <td className="px-6 py-4 text-center text-sm text-green-900 dark:text-emerald-100/90">{u.id_google ? 'Sí' : 'No'}</td>
                            <td className="px-6 py-4 text-center text-sm text-green-900 dark:text-emerald-100/90">{u.nombres}</td>
                            <td className="px-6 py-4 text-center text-sm text-green-900 dark:text-emerald-100/90">{u.apellidos}</td>
                            <td className="px-6 py-4 text-center text-sm text-green-900 dark:text-emerald-100/90">{u.telefono || '-'}</td>
                            <td className="px-6 py-4 text-center text-sm text-green-900 dark:text-emerald-100/90">{u.correo}</td>
                            <td className="px-6 py-4 text-center text-sm text-green-900 dark:text-emerald-100/90">{u.validacion_correo ? 'Sí' : 'No'}</td>
                            <td className="px-6 py-4 text-center text-sm text-green-900 dark:text-emerald-100/90">{u.terminos_condiciones ? 'Sí' : 'No'}</td>
                            <td className="px-6 py-4 text-center text-sm text-green-900 dark:text-emerald-100/90">{u.estado ? 'Activo' : 'Inactivo'}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openBanModal(u.id_usuario)}
                                  disabled={updatingUserId === u.id_usuario || !u.estado}
                                  title="Bannear usuario"
                                  aria-label="Bannear usuario"
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {updatingUserId === u.id_usuario ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <UserX className="h-4 w-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => unbanUser(u.id_usuario)}
                                  disabled={updatingUserId === u.id_usuario || u.estado}
                                  title="Quitar ban a usuario"
                                  aria-label="Quitar ban a usuario"
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white bg-green-700 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {updatingUserId === u.id_usuario ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <UserCheck className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {usersTotal > 0 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-lime-200/80 bg-lime-50/50 dark:border-emerald-700/60 dark:bg-emerald-900/20">
                    <p className="text-sm text-green-800 dark:text-emerald-200/90">
                      Mostrando {Math.min((usersPage - 1) * usersPageSize + 1, usersTotal)} - {Math.min(usersPage * usersPageSize, usersTotal)} de {usersTotal}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setUsersPage((prev) => Math.max(1, prev - 1))}
                        disabled={usersPage <= 1 || loadingUsers}
                        className="px-3 py-1.5 rounded-lg border border-lime-200 text-green-900 dark:text-emerald-200 dark:border-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      <span className="text-sm text-green-800 dark:text-emerald-200/90">
                        Página {usersPage} de {usersTotalPages}
                      </span>
                      <button
                        onClick={() => setUsersPage((prev) => Math.min(usersTotalPages, prev + 1))}
                        disabled={usersPage >= usersTotalPages || loadingUsers}
                        className="px-3 py-1.5 rounded-lg border border-lime-200 text-green-900 dark:text-emerald-200 dark:border-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}

                {(!users || users.length === 0) && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-green-800 dark:text-emerald-200 font-medium">No se encontraron usuarios</p>
                    <p className="text-sm text-green-700/80 dark:text-emerald-200/80 mt-1">Ajusta la búsqueda o intenta nuevamente en unos segundos</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "insert-data" && <InsertDataTab />}

          {activeTab === "settings" && (
            <div className="text-center py-20">
              <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Configuración</p>
              <p className="text-sm text-muted-foreground mt-1">Esta funcionalidad estará disponible próximamente</p>
            </div>
          )}
        </main>

        <Dialog open={banModalOpen} onOpenChange={setBanModalOpen}>
          <DialogContent className="max-w-lg w-full">
            <DialogHeader>
              <DialogTitle>Registrar Ban de Usuario</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">ID Usuario</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={banForm.id_usuario}
                  onChange={(e) => setBanForm((prev) => ({ ...prev, id_usuario: e.target.value.replace(/\D/g, '') }))}
                  className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2"
                  placeholder="ID del usuario a bannear"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Motivo del ban</label>
                <textarea
                  value={banForm.motivo_ban}
                  onChange={(e) => setBanForm((prev) => ({ ...prev, motivo_ban: e.target.value }))}
                  className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 min-h-24"
                  placeholder="Escribe el motivo del ban (obligatorio, mínimo 10 caracteres)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Fecha de inicio</label>
                  <input
                    type="datetime-local"
                    value={banForm.inicio_ban}
                    onChange={(e) => setBanForm((prev) => ({ ...prev, inicio_ban: e.target.value }))}
                    className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Fecha final</label>
                  <input
                    type="datetime-local"
                    value={banForm.fin_ban}
                    onChange={(e) => setBanForm((prev) => ({ ...prev, fin_ban: e.target.value }))}
                    className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Responsable</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={banForm.responsable}
                  onChange={(e) => setBanForm((prev) => ({ ...prev, responsable: e.target.value.replace(/\D/g, '') }))}
                  className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2"
                  placeholder="ID del usuario responsable"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setBanModalOpen(false)}
                disabled={banSubmitting}
              >
                Cancelar
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={submitBan}
                disabled={banSubmitting}
              >
                {banSubmitting ? 'Guardando...' : 'Confirmar Ban'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Rechazo de Evento */}
        <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
          <DialogContent className="max-w-lg w-full">
            <DialogHeader>
              <DialogTitle>Rechazar Evento</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Motivo del rechazo
                </label>
                <textarea
                  value={rejectForm.motivo_rechazo}
                  onChange={(e) =>
                    setRejectForm((prev) => ({ ...prev, motivo_rechazo: e.target.value }))
                  }
                  className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 min-h-28 resize-none"
                  placeholder="Describe el motivo del rechazo (mínimo 10 caracteres)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {rejectForm.motivo_rechazo.length} caracteres
                  {rejectForm.motivo_rechazo.length < 10 && (
                    <span className="text-red-500 ml-1">
                      (mínimo {10 - rejectForm.motivo_rechazo.length} más)
                    </span>
                  )}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRejectModalOpen(false)}
                disabled={rejectSubmitting}
              >
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
        {/* Modales */}
        {editingEvent && (
          <EditEventModal
            isOpen={editModalOpen}
            onClose={() => {
              setEditModalOpen(false)
              setEditingEvent(null)
            }}
            event={editingEvent}
            onSave={async (updatedEvent) => {
              await refreshEvents()
            }}
          />
        )}
        {/* PDF Viewer Modal */}
        <Dialog open={pdfModalOpen} onOpenChange={() => setPdfModalOpen(false)}>
          <DialogContent className="max-w-5xl w-full max-h-[90vh] p-0 border-0">
            {pdfModalUrl ? (
              <PDFViewer 
                pdfUrl={pdfModalUrl} 
                fileName="documento.pdf"
                onClose={() => setPdfModalOpen(false)}
              />
            ) : (
              <div className="flex items-center justify-center h-96">
                <p className="text-muted-foreground">No hay documento</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
