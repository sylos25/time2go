"use client"

import type React from "react"

import { useState } from "react"
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
}

interface StatCard {
  title: string
  value: string
  change: number
  icon: React.ElementType
  color: string
}

interface ChecklistItem {
  id: number
  text: string
  completed: boolean
}

interface KPISubObjective {
  id: number
  name: string
  progress: number
}

interface KPI {
  id: number
  name: string
  description: string
  progress: number
  color: string
  subObjectives: KPISubObjective[]
}

export default function EventDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [selectedEvents, setSelectedEvents] = useState<number[]>([])
  const router = useRouter()

  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    { id: 1, text: "Revisar eventos del mes", completed: true },
    { id: 2, text: "Confirmar proveedores", completed: true },
    { id: 3, text: "Actualizar precios", completed: false },
    { id: 4, text: "Enviar reporte financiero", completed: false },
    { id: 5, text: "Planificar próximo festival", completed: false },
  ])

  const [kpis, setKpis] = useState<KPI[]>([
    {
      id: 1,
      name: "Actividad de Usuarios",
      description: "Incrementar la participación y uso recurrente del sistema",
      progress: 0,
      color: "#3B82F6",
      subObjectives: [
        { id: 1, name: "Usuarios activos diarios (DAU) - Meta: crecer 20% mensual", progress: 0 },
        { id: 2, name: "Retención 7 días - Meta: 35-50%", progress: 0 },
        { id: 3, name: "Usuarios por municipio - Meta: aumentar cobertura en zonas clave", progress: 0 },
        { id: 4, name: "Usuarios nuevos por mes - Meta: +15% mensual", progress: 0 },
      ],
    },
    {
      id: 2,
      name: "Interacción con Eventos",
      description: "Aumentar el interés por los eventos y mejorar su visibilidad",
      progress: 0,
      color: "#10B981",
      subObjectives: [
        { id: 1, name: "Vistas promedio por evento - Meta: +30%", progress: 0 },
        { id: 2, name: "Eventos favoritos o guardados - Meta: crecer en 25%", progress: 0 },
        { id: 3, name: "Duración promedio por sesión - Meta: +10%", progress: 0 },
        { id: 4, name: "Tasa de scroll / interacción dentro del evento - Meta: +20%", progress: 0 },
      ],
    },
    {
      id: 3,
      name: "Conversiones y Reservas",
      description: "Mejorar la conversión en eventos gratuitos y la salida hacia boleterías externas",
      progress: 0,
      color: "#F97316",
      subObjectives: [
        { id: 1, name: "Tasa de reserva en eventos gratuitos - Meta: 25-35%", progress: 0 },
        { id: 2, name: "Clics hacia boleterías externas - Meta: +20% mensual", progress: 0 },
        { id: 3, name: "Eventos gratuitos agotados - Meta: 70% del cupo llenado", progress: 0 },
        { id: 4, name: "Tasa de abandono antes de reservar - Meta: disminuir 15%", progress: 0 },
      ],
    },
    {
      id: 4,
      name: "Rendimiento Técnico",
      description: "Garantizar que el sistema sea rápido, estable y confiable",
      progress: 0,
      color: "#EAB308",
      subObjectives: [
        { id: 1, name: "Tiempo promedio de carga del sitio - Meta: < 2.5s", progress: 0 },
        { id: 2, name: "Tiempo de respuesta del backend/API - Meta: < 600ms", progress: 0 },
        { id: 3, name: "Errores 4xx y 5xx por mes - Meta: reducción del 30%", progress: 0 },
        { id: 4, name: "Disponibilidad del sistema (Uptime) - Meta: 99.5%", progress: 0 },
      ],
    },
    {
      id: 5,
      name: "Gestión de Organizadores",
      description: "Medir qué tan bien usan el CMS para subir contenidos",
      progress: 0,
      color: "#78350F",
      subObjectives: [
        { id: 1, name: "Eventos creados por organizador - Meta: min. 3/mes", progress: 0 },
        { id: 2, name: "Tiempo promedio para crear un evento - Meta: < 5 minutos", progress: 0 },
        { id: 3, name: "Eventos aprobados sin errores - Meta: > 90%", progress: 0 },
        { id: 4, name: "Tasa de rechazo por errores de datos - Meta: reducir 25%", progress: 0 },
      ],
    },
    {
      id: 6,
      name: "Calidad del Contenido",
      description: "Asegurar que los eventos y datos publicados sean útiles y claros",
      progress: 0,
      color: "#DC2626",
      subObjectives: [
        { id: 1, name: "Eventos con información completa - Meta: 95%", progress: 0 },
        { id: 2, name: "Valoración promedio de eventos - Meta: 4.5/5", progress: 0 },
        { id: 3, name: "Tasa de correcciones posteriores - Meta: reducir 30%", progress: 0 },
        { id: 4, name: "Fotos/medios cargados correctamente - Meta: 98%", progress: 0 },
      ],
    },
    {
      id: 7,
      name: "Expansión del Mercado",
      description: "Aumentar la cantidad de municipios con eventos activos",
      progress: 0,
      color: "#8B5CF6",
      subObjectives: [
        { id: 1, name: "Municipios con al menos un evento activo - Meta: +3 por mes", progress: 0 },
        { id: 2, name: "Número de organizadores registrados - Meta: +10% mensual", progress: 0 },
        { id: 3, name: "Crecimiento de eventos mensuales - Meta: +15%", progress: 0 },
        { id: 4, name: "Diversidad de categorías de eventos - Meta: aumentar variedad", progress: 0 },
      ],
    },
  ])

  const stats: StatCard[] = [
    {
      title: "Eventos Activos",
      value: "24",
      change: 12.5,
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Total Asistentes",
      value: "3,275",
      change: 18.2,
      icon: Users,
      color: "from-green-500 to-emerald-600",
    },
    {
      title: "Vistas del Mes",
      value: "12,847",
      change: 15.3,
      icon: Eye,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Usuarios Activos",
      value: "1,234",
      change: 8.7,
      icon: Users,
      color: "from-orange-500 to-red-500",
    },
  ]

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
    { id: "kpis", name: "KPIs y Objetivos", icon: Target },
    { id: "checklist", name: "Tareas Pendientes", icon: CheckSquare },
    { id: "events", name: "Gestión de Eventos", icon: Calendar },
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

  const kpiRadarData = kpis.map((kpi) => ({
    subject: kpi.name.split(" ").slice(0, 2).join(" "),
    value: kpi.progress,
    fullMark: 100,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 w-72 h-screen bg-white border-r border-gray-200 shadow-sm transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Time2Go</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
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
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">Admin</p>
              <p className="text-xs text-gray-500 truncate">admin@time2go.com</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <div className="lg:ml-72">
        <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200 sticky top-0 z-20">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {menuItems.find((item) => item.id === activeTab)?.name}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">Bienvenido de nuevo, Admin</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-semibold">
                  3
                </span>
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                A
              </div>
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
                        <div className="flex items-center mt-3">
                          <div
                            className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                              stat.change >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                            }`}
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span className="text-xs font-semibold">{stat.change}%</span>
                          </div>
                          <span className="text-xs text-gray-500 ml-2">vs mes anterior</span>
                        </div>
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

          {activeTab === "kpis" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">KPIs y Objetivos Estratégicos</h3>
                  <p className="text-sm text-gray-500 mt-1">Seguimiento del progreso de objetivos clave</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all">
                  <Plus className="w-4 h-4" />
                  Agregar KPI
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  {kpis.map((kpi) => (
                    <div key={kpi.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-900">{kpi.name}</h4>
                          <p className="text-sm text-gray-500 mt-1">{kpi.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold" style={{ color: kpi.color }}>
                            {kpi.progress}%
                          </span>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                          <span>Progreso General</span>
                          <span className="font-semibold">{kpi.progress}%</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${kpi.progress}%`,
                              backgroundColor: kpi.color,
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-gray-100">
                        <h5 className="text-sm font-semibold text-gray-700 mb-3">Sub-objetivos</h5>
                        {kpi.subObjectives.map((sub) => (
                          <div key={sub.id}>
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
                              <span className="font-medium">{sub.name}</span>
                              <span className="font-semibold">{sub.progress}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${sub.progress}%`,
                                  backgroundColor: kpi.color,
                                  opacity: 0.7,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Resumen de KPIs</h3>
                    <p className="text-sm text-gray-500 mt-1">Vista general del progreso</p>
                  </div>

                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={kpiRadarData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "#6b7280" }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Radar name="Progreso" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                      <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }} />
                    </RadarChart>
                  </ResponsiveContainer>

                  <div className="mt-6 space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700">KPIs por progreso</h4>
                    {kpis
                      .sort((a, b) => b.progress - a.progress)
                      .map((kpi, index) => (
                        <div key={kpi.id} className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: kpi.color }} />
                              <span className="text-sm text-gray-700 truncate">{kpi.name}</span>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{kpi.progress}%</span>
                        </div>
                      ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Progreso Promedio</span>
                      <span className="text-lg font-bold text-blue-600">
                        {Math.round(kpis.reduce((acc, kpi) => acc + kpi.progress, 0) / kpis.length)}%
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.round(kpis.reduce((acc, kpi) => acc + kpi.progress, 0) / kpis.length)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "checklist" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Tareas Pendientes</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {checklistItems.filter((item) => item.completed).length} de {checklistItems.length} tareas
                    completadas
                  </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all">
                  <Plus className="w-4 h-4" />
                  Nueva Tarea
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="space-y-2">
                    {checklistItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => toggleChecklistItem(item.id)}
                        className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors group border border-gray-100"
                      >
                        <div
                          className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                            item.completed
                              ? "bg-blue-600 border-blue-600"
                              : "border-gray-300 group-hover:border-blue-400"
                          }`}
                        >
                          {item.completed && <CheckCircle className="w-5 h-5 text-white" />}
                        </div>
                        <span
                          className={`text-base font-medium text-left flex-1 ${
                            item.completed ? "text-gray-400 line-through" : "text-gray-900"
                          }`}
                        >
                          {item.text}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setChecklistItems(checklistItems.filter((i) => i.id !== item.id))
                          }}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-900">Progreso</h4>
                      <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                        <CheckSquare className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>

                    <div className="text-center mb-6">
                      <div className="text-5xl font-bold text-blue-600 mb-2">
                        {Math.round(
                          (checklistItems.filter((item) => item.completed).length / checklistItems.length) * 100,
                        )}
                        %
                      </div>
                      <p className="text-sm text-gray-500">Tareas completadas</p>
                    </div>

                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                        style={{
                          width: `${(checklistItems.filter((item) => item.completed).length / checklistItems.length) * 100}%`,
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-sm text-gray-500">Completadas</p>
                        <p className="text-2xl font-bold text-green-600">
                          {checklistItems.filter((item) => item.completed).length}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Pendientes</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {checklistItems.filter((item) => !item.completed).length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-3">Consejos</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Prioriza las tareas más importantes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Divide tareas grandes en sub- tareas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Revisa tu progreso diariamente</span>
                      </li>
                    </ul>
                  </div>
                </div>
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
                              <button
                                onClick={() => toggleVisibility(event.id)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title={event.visibility ? "Ocultar evento" : "Mostrar evento"}
                              >
                                {event.visibility ? (
                                  <Eye className="w-4 h-4" />
                                ) : (
                                  <EyeOff className="w-4 h-4 text-gray-400" />
                                )}
                              </button>
                              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
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

          {activeTab === "analytics" && (
            <div className="text-center py-20">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Sección de Analíticas</p>
              <p className="text-sm text-gray-400 mt-1">Esta funcionalidad estará disponible próximamente</p>
            </div>
          )}

          {activeTab === "users" && (
            <div className="text-center py-20">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Gestión de Usuarios</p>
              <p className="text-sm text-gray-400 mt-1">Esta funcionalidad estará disponible próximamente</p>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="text-center py-20">
              <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Configuración</p>
              <p className="text-sm text-gray-400 mt-1">Esta funcionalidad estará disponible próximamente</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
