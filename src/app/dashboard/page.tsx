"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import {
  Calendar,
  Users,
  TrendingUp,
  Eye,
  Settings,
  Bell,
  Search,
  Plus,
  Menu,
  X,
  Edit,
  Trash2,
  EyeOff,
  CheckCircle,
  MapPin,
  Clock,
  Download,
  Home,
  LogOut,
  CheckSquare,
  Activity,
  MoreVertical,
  Target,
} from "lucide-react"
import { InsertDataTab } from "@/components/dashboard/insert-data-tab"
import ViewDataTab from "@/components/dashboard/view-data-tab"
import { EditEventModal } from "@/components/dashboard/edit-event-modal"
import { ToggleEventStatusModal } from "@/components/dashboard/toggle-event-status-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

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
  const [selectedEvents, setSelectedEvents] = useState<number[]>([])
  const [eventsScope, setEventsScope] = useState<'all' | 'mine'>('all')
  const [loading, setLoading] = useState(true)
  const [meUser, setMeUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [searchUsers, setSearchUsers] = useState('')
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [statusModalEvent, setStatusModalEvent] = useState<any>(null)
  const [pdfModalOpen, setPdfModalOpen] = useState(false)
  const [pdfModalUrl, setPdfModalUrl] = useState<string | null>(null)
  const router = useRouter()
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  const refreshEvents = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const headers: any = {}
      if (token) headers['Authorization'] = `Bearer ${token}`
      const eventsRes = await fetch('/api/events', { headers })
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json()
        const serverEvents = eventsData.eventos || []
        const mapped = serverEvents.map((ev: any) => ({
          id: ev.id_evento,
          name: ev.nombre_evento || 'Sin título',
          date: ev.fecha_inicio || ev.fecha_creacion,
          time: ev.hora_inicio || '',
          location: ev.sitio?.nombre_sitio || ev.municipio?.nombre_municipio || '',
          category: ev.categoria_nombre || '',
          capacity: ev.cupo || 0,
          ticketsSold: (ev.valores && ev.valores.reduce((acc: number, v: any) => acc + (v.valor || 0), 0)) || 0,
          status: ev.estado ? 'published' : 'hidden',
          visibility: !!ev.estado,
          image: (ev.imagenes && ev.imagenes[0] && ev.imagenes[0].url_imagen_evento) || '/images/placeholder.jpg',
          promoter: ev.creador?.nombres || '',
          creatorId: ev.creador?.numero_documento || null,
          documentos: ev.documentos || [],
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
        if (!canceled) setAuthorized(roleNum === 3 || roleNum === 4)
        if (!canceled && !(roleNum === 3 || roleNum === 4)) {
          // user authenticated but not allowed
          return
        }

        // Fetch events (server returns all events)
        const eventsRes = await fetch('/api/events')
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json()
          const serverEvents = eventsData.eventos || []
          // Map server events to local Event type (include creatorId to allow scoping)
          const mapped = serverEvents.map((ev: any) => ({
            id: ev.id_evento,
            name: ev.nombre_evento || 'Sin título',
            date: ev.fecha_inicio || ev.fecha_creacion,
            time: ev.hora_inicio || '',
            location: ev.sitio?.nombre_sitio || ev.municipio?.nombre_municipio || '',
            category: ev.categoria_nombre || '',
            capacity: ev.cupo || 0,
            ticketsSold: (ev.valores && ev.valores.reduce((acc: number, v: any) => acc + (v.valor || 0), 0)) || 0,
            status: ev.estado ? 'published' : 'hidden',
            visibility: !!ev.estado,
            image: (ev.imagenes && ev.imagenes[0] && ev.imagenes[0].url_imagen_evento) || '/images/placeholder.jpg',
            promoter: ev.creador?.nombres || '',
            creatorId: ev.creador?.numero_documento || null,
            documentos: ev.documentos || [],
          }))
          if (!canceled) setEvents(mapped)

          // Update the Eventos Activos stat based on current server data
          try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
            const headers: any = {}
            if (token) headers['Authorization'] = `Bearer ${token}`
            const statsRes = await fetch('/api/stats', { headers })
            if (statsRes.ok) {
              const statsData = await statsRes.json()
              if (!canceled && statsData.ok) {
                setStats((prev) => prev.map((s) => {
                  if (s.title === 'Eventos Activos') return { ...s, value: statsData.eventsActive }
                  if (s.title === 'Usuarios Activos') return { ...s, value: statsData.usersActive }
                  return s
                }))
              }
            }
          } catch (e) {
            console.error('Failed to load stats', e)
          }
        }
      } catch (err) {
        console.error('Error cargando datos del dashboard', err)
      } finally {
        if (!canceled) setLoading(false)
      }
    }
    loadDashboardData()
    return () => { canceled = true }
  }, [router])

  if (authorized === null) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-600">Comprobando permisos...</div>
      </main>
    )
  }

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
        const res = await fetch('/api/usuarios', { headers })
        if (res.ok) {
          const data = await res.json()
          if (!cancelled) setUsers(data.usuarios || [])
        }
      } catch (err) {
        console.error('Error cargando usuarios', err)
      } finally {
        if (!cancelled) setLoadingUsers(false)
      }
    }
    loadUsers()
    return () => { cancelled = true }
  }, [activeTab])

  if (authorized === false) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <h2 className="text-2xl font-semibold text-red-600">Acceso denegado</h2>
            <p className="mt-4 text-gray-600">No tienes permisos para ver el dashboard.</p>
            <div className="mt-6">
              <Button onClick={() => router.push('/')} className="bg-lime-600 text-white">Volver al inicio</Button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    { id: 1, text: "Revisar eventos del mes", completed: true },
    { id: 2, text: "Confirmar proveedores", completed: true },
    { id: 3, text: "Actualizar precios", completed: false },
    { id: 4, text: "Enviar reporte financiero", completed: false },
    { id: 5, text: "Planificar próximo festival", completed: false },
  ])


  const [stats, setStats] = useState<StatCard[]>([
    { title: "Eventos Activos", value: 0, icon: Calendar, color: "from-blue-500 to-blue-600" },
    { title: "Total Asistentes", value: 0, icon: Users, color: "from-green-500 to-emerald-600" },
    { title: "Vistas del Mes", value: 0, icon: Eye, color: "from-purple-500 to-purple-600" },
    { title: "Usuarios Activos", value: 0, icon: Users, color: "from-orange-500 to-red-500" },
  ])

  const [events, setEvents] = useState<Event[]>([
    {
      id: 1,
      name: "La Madriguera",
      date: "2024-12-15",
      time: "20:00",
      location: "Teatro Municipal",
      category: "Teatro",
      capacity: 450,
      ticketsSold: 380,
      status: "published",
      visibility: true,
      image: "/images/teatro.jpg",
      promoter: "Eventos Colombia",
    },
    {
      id: 2,
      name: "Festival de la Carranga",
      date: "2024-12-20",
      time: "14:00",
      location: "Plaza Central",
      category: "Música",
      capacity: 2000,
      ticketsSold: 1850,
      status: "published",
      visibility: true,
      image: "/images/carranga.jpg",
      promoter: "MusicFest Pro",
    },
    {
      id: 3,
      name: "Concierto de Rock",
      date: "2024-11-28",
      time: "21:00",
      location: "Auditorio Nacional",
      category: "Música",
      capacity: 800,
      ticketsSold: 800,
      status: "completed",
      visibility: false,
      image: "/images/rock.jpg",
      promoter: "Rock Nation",
    },
    {
      id: 4,
      name: "Festival de Jazz",
      date: "2024-12-10",
      time: "19:00",
      location: "Centro Cultural",
      category: "Música",
      capacity: 300,
      ticketsSold: 245,
      status: "published",
      visibility: true,
      image: "/images/jazz.jpg",
      promoter: "Jazz Internacional",
    },
  ])

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
    { id: "events", name: "Gestión de Eventos", icon: Calendar },
    { id: "ingresar-datos", name: "Ingresar Datos", icon: MapPin },
    { id: "ver-datos", name: "Ver Datos", icon: Search },
    { id: "analytics", name: "Analíticas", icon: TrendingUp },
    { id: "users", name: "Usuarios", icon: Users },
    { id: "settings", name: "Configuración", icon: Settings },
  ]

  const toggleVisibility = (id: number) => {
    setEvents(events.map((event) => (event.id === id ? { ...event, visibility: !event.visibility } : event)))
  }

  const deleteEvent = (id: number) => {
    if (confirm("¿Estás seguro de eliminar este evento?")) {
      setEvents(events.filter((event) => event.id !== id))
    }
  }

  const bulkHide = () => {
    setEvents(events.map((event) => (selectedEvents.includes(event.id) ? { ...event, visibility: false } : event)))
    setSelectedEvents([])
  }

  const bulkShow = () => {
    setEvents(events.map((event) => (selectedEvents.includes(event.id) ? { ...event, visibility: true } : event)))
    setSelectedEvents([])
  }

  const toggleChecklistItem = (id: number) => {
    setChecklistItems(checklistItems.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  const eventsScoped = eventsScope === 'all' ? events : (events as any[]).filter((ev) => String(ev.creatorId) === String(meUser?.numero_documento))

  const filteredEvents = eventsScoped.filter((event) => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || event.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "hidden":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      default:
        return "bg-gray-100 text-gray-800"
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando tu panel...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-indigo-50/50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 w-72 h-screen bg-gradient-to-tr from-green-700 to-lime-500 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
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
                  : "bg-gradient-to-bl from-yellow-50 to-green-50 text-gray-700 hover:bg-gray-50 cursor-pointer"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.name}</span>
            </button>
          ))}
        </nav>


      </aside>

      <div className="lg:ml-72">
        <header className="bg-gradient-to-l from-green-700 to-lime-500 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </button>
              <div>
                <p className="text-3xl text-white font-sans font-bold mt-0.5">Bienvenido , {meUser?.nombres || meUser?.name || 'Usuario'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => router.push('/')} className="px-3 py-1 text-sm bg-white text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 curs">
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
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-gray-200 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>

                      </div>
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-sm`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Evolución de Vistas y Asistentes</h3>
                      <p className="text-sm text-gray-500 mt-1">Últimos 6 meses</p>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                      <Download className="w-4 h-4" />
                      Exportar
                    </button>
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

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Eventos por Categoría</h3>
                    <p className="text-sm text-gray-500 mt-1">Distribución actual</p>
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
                          <span className="text-gray-700">{category.name}</span>
                        </div>
                        <span className="font-semibold text-gray-900">{category.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Eventos Más Populares</h3>
                    <p className="text-sm text-gray-500 mt-1">Ordenados por número de tickets vendidos</p>
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

          {activeTab === "events" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar eventos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEventsScope('all')}
                      className={`px-3 py-1 rounded ${eventsScope === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setEventsScope('mine')}
                      className={`px-3 py-1 rounded ${eventsScope === 'mine' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
                    >
                      Míos
                    </button>
                  </div>

                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todas las categorías</option>
                    <option value="Música">Música</option>
                    <option value="Teatro">Teatro</option>
                    <option value="Deportes">Deportes</option>
                    <option value="Arte">Arte</option>
                  </select>

                  <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all">
                    <Plus className="w-4 h-4" />
                    Nuevo Evento
                  </button>
                </div>
              </div>

              {selectedEvents.length > 0 && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedEvents.length} evento(s) seleccionado(s)
                  </span>
                  <button
                    onClick={bulkShow}
                    className="px-3 py-1.5 text-sm bg-white text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Eye className="w-4 h-4 inline mr-1" />
                    Mostrar
                  </button>
                  <button
                    onClick={bulkHide}
                    className="px-3 py-1.5 text-sm bg-white text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <EyeOff className="w-4 h-4 inline mr-1" />
                    Ocultar
                  </button>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEvents(filteredEvents.map((event) => event.id))
                              } else {
                                setSelectedEvents([])
                              }
                            }}
                            checked={selectedEvents.length === filteredEvents.length && filteredEvents.length > 0}
                            className="rounded border-gray-300"
                          />
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Evento
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Fecha y Hora
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Ubicación
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Tickets
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredEvents.map((event) => (
                        <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedEvents.includes(event.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedEvents([...selectedEvents, event.id])
                                } else {
                                  setSelectedEvents(selectedEvents.filter((id) => id !== event.id))
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{event.name}</p>
                                <p className="text-sm text-gray-500">{event.category}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 text-sm text-gray-700">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                {event.date}
                              </div>
                              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                <Clock className="w-4 h-4 text-gray-400" />
                                {event.time}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-sm text-gray-700">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              {event.location}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-semibold text-gray-900">
                                {event.ticketsSold} / {event.capacity}
                              </span>
                              <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-600 rounded-full"
                                  style={{ width: `${(event.ticketsSold / event.capacity) * 100}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(event.status)}`}
                            >
                              {getStatusText(event.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {event.documentos && event.documentos.length > 0 && (
                                <button
                                  onClick={() => {
                                    if (event.documentos.length === 1) {
                                      const proxied = `/api/events/document?url=${encodeURIComponent(event.documentos[0].url_documento_evento)}`
                                      setPdfModalUrl(proxied)
                                      setPdfModalOpen(true)
                                    } else {
                                      // Si hay múltiples documentos, mostrar un menú simple
                                      const listText = event.documentos.map((d: any, i: number) => `${i + 1}. Documento ${i + 1}`).join('\n')
                                      const docNum = prompt(
                                        `Hay ${event.documentos.length} documentos. Ingresa el número (1-${event.documentos.length}) del documento que deseas ver:\n\n${listText}`,
                                        '1'
                                      )
                                      if (docNum && !isNaN(parseInt(docNum))) {
                                        const idx = parseInt(docNum) - 1
                                        if (idx >= 0 && idx < event.documentos.length) {
                                          const proxied = `/api/events/document?url=${encodeURIComponent(event.documentos[idx].url_documento_evento)}`
                                          setPdfModalUrl(proxied)
                                          setPdfModalOpen(true)
                                        }
                                      }
                                    }
                                  }}
                                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                  title="Ver documento/PDF del evento"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setStatusModalEvent(event)
                                  setStatusModalOpen(true)
                                }}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Validar/Inhabilitar evento"
                              >
                                {event.visibility ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <EyeOff className="w-4 h-4 text-gray-400" />
                                )}
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
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No se encontraron eventos</p>
                    <p className="text-sm text-gray-400 mt-1">Intenta con otros filtros de búsqueda</p>
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
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Sección de Analíticas</p>
              <p className="text-sm text-gray-400 mt-1">Esta funcionalidad estará disponible próximamente</p>
            </div>
          )}

          {activeTab === "users" && (
            <Card className="border-lime-100 bg-yellow-50">
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <CardContent>
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Buscar usuarios..."
                    value={searchUsers}
                    onChange={(e) => setSearchUsers(e.target.value)}
                    className="w-full pl-3 pr-30 py-1.5 bg-white border border-green-600 rounded-lg placeholder-lime-600 text-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                  />
                </div>
                </CardContent>
                <CardContent className="w-full pl-1 pr-30 py-1.5">
                <div className="flex items-center gap-3">
                  <button
                    onClick={async () => {
                      setLoadingUsers(true)
                      try {
                        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
                        const headers: any = {}
                        if (token) headers['Authorization'] = `Bearer ${token}`
                        const res = await fetch('/api/usuarios?estado=true', { headers })
                        if (res.ok) {
                          const data = await res.json()
                          setUsers(data.usuarios || [])
                        }
                      } catch (err) {
                        console.error('Error fetching users', err)
                      } finally {
                        setLoadingUsers(false)
                      }
                    }}
                    className="px-4 py-1.5 bg-green-800 border rounded-lg shadow-sm hover:bg-lime-600 text-white cursor-pointer transition-colors"
                  >
                    Actualizar
                  </button>
                </div>
                </CardContent>
              </div>
            <CardContent>
              <div className="bg-white rounded-sm shadow-sm border border-green-600 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="table-fixed w-full border-collapse border border-green-600">
                    <thead className="bg-lime-100 border-b border-green-600">
                      <tr>
                        <th className="w-32 px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-green-600">Documento</th>
                        <th className="w-42 px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-green-600">Tipo Documento</th>
                        <th className="w-40 px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-green-600">Nombres</th>
                        <th className="w-40 px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-green-600">Apellidos</th>
                        <th className="w-30 px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-green-600">País</th>
                        <th className="w-32 px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-green-600">Teléfono</th>
                        <th className="w-40 px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-green-600">Tel. Validado</th>
                        <th className="w-80 px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-green-600">Correo</th>
                        <th className="w-45 px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-green-600">Correo Validado</th>
                        <th className="w-26 px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-green-600">Estado</th>
                        <th className="w-40 px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-green-600">Rol</th>
                        <th className="w-50 px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-green-600">Fecha Registro</th>
                        <th className="w-50 px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-green-600">Fecha Desactivación</th>
                        <th className="w-50 px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-green-600">Fecha Actualización</th>
                        <th className="w-28 px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users
                        .filter(u => {
                          if (!searchUsers) return true
                          const hay = `${u.numero_documento} ${u.nombres} ${u.apellidos} ${u.correo} ${u.pais} ${u.rol}`.toLowerCase()
                          return hay.includes(searchUsers.toLowerCase())
                        })
                        .map((u) => (
                          <tr key={u.numero_documento} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-center text-sm text-gray-700">{u.numero_documento}</td>
                            <td className="px-6 py-4 text-center text-sm text-gray-700">{u.tipo_documento}</td>
                            <td className="px-6 py-4 text-center text-sm text-gray-900">{u.nombres}</td>
                            <td className="px-6 py-4 text-center text-sm text-gray-900">{u.apellidos}</td>
                            <td className="px-6 py-4 text-center text-sm text-gray-700">{u.pais || '-'}</td>
                            <td className="px-6 py-4 text-center text-sm text-gray-700">{u.telefono || '-'}</td>
                            <td className="px-6 py-4 text-center text-sm text-gray-700">{u.validacion_telefono ? 'Sí' : 'No'}</td>
                            <td className="px-6 py-4 text-center text-sm text-gray-700">{u.correo}</td>
                            <td className="px-6 py-4 text-center text-sm text-gray-700">{u.validacion_correo ? 'Sí' : 'No'}</td>
                            <td className="px-6 py-4 text-center text-sm text-gray-700">{u.estado ? 'Activo' : 'Inactivo'}</td>
                            <td className="px-6 py-4 text-center text-sm text-gray-700">{u.rol || '-'}</td>
                            <td className="px-6 py-4 text-center text-sm text-gray-700">{u.fecha_registro ? new Date(u.fecha_registro).toLocaleString() : '-'}</td>
                            <td className="px-6 py-4 text-center text-sm text-gray-700">{u.fecha_desactivacion ? new Date(u.fecha_desactivacion).toLocaleString() : '-'}</td>
                            <td className="px-6 py-4 text-center text-sm text-gray-700">{u.fecha_actualizacion ? new Date(u.fecha_actualizacion).toLocaleString() : '-'}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button className="px-3 py-1 bg-white border border-gray-200 rounded-lg">Ver</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {(!users || users.length === 0) && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No se encontraron usuarios</p>
                    <p className="text-sm text-gray-400 mt-1">Pulsa "Actualizar" para cargar la lista</p>
                  </div>
                )}
              </div>
              </CardContent>
            </div>
          </Card>)}

          {activeTab === "insert-data" && <InsertDataTab />}

          {activeTab === "settings" && (
            <div className="text-center py-20">
              <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Configuración</p>
              <p className="text-sm text-gray-400 mt-1">Esta funcionalidad estará disponible próximamente</p>
            </div>
          )}
        </main>

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

        {statusModalEvent && (
          <ToggleEventStatusModal
            isOpen={statusModalOpen}
            onClose={() => {
              setStatusModalOpen(false)
              setStatusModalEvent(null)
            }}
            event={statusModalEvent}
            onSave={async (updatedEvent) => {
              await refreshEvents()
            }}
          />
        )}
        {/* PDF Viewer Modal */}
        <Dialog open={pdfModalOpen} onOpenChange={() => setPdfModalOpen(false)}>
          <DialogContent className="max-w-5xl w-full max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Documento</DialogTitle>
            </DialogHeader>
            <div className="h-[75vh]">
              {pdfModalUrl ? (
                <iframe src={pdfModalUrl} title="Documento" className="w-full h-full border-0" />
              ) : (
                <div className="flex items-center justify-center h-full">No hay documento</div>
              )}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setPdfModalOpen(false)}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
