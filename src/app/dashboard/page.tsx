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

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Tareas Pendientes</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {checklistItems.filter((item) => item.completed).length} de {checklistItems.length} completadas
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                    <CheckSquare className="w-6 h-6 text-blue-600" />
                  </div>
                </div>

                <div className="space-y-2">
                  {checklistItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleChecklistItem(item.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div
                        className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          item.completed ? "bg-blue-600 border-blue-600" : "border-gray-300 group-hover:border-blue-400"
                        }`}
                      >
                        {item.completed && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <span
                        className={`text-sm font-medium text-left flex-1 ${
                          item.completed ? "text-gray-400 line-through" : "text-gray-700"
                        }`}
                      >
                        {item.text}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">Progreso</span>
                    <span className="text-blue-600 font-semibold">
                      {Math.round(
                        (checklistItems.filter((item) => item.completed).length / checklistItems.length) * 100,
                      )}
                      %
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                      style={{
                        width: `${(checklistItems.filter((item) => item.completed).length / checklistItems.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
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
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Eventos Más Populares</h3>
                  <p className="text-sm text-gray-500 mt-1">Ordenados por asistencia</p>
                </div>
                <div className="space-y-3">
                  {topEvents.map((event, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-transparent rounded-xl hover:from-blue-50 transition-all border border-transparent hover:border-blue-100"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-sm ${
                            index === 0
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-500"
                              : index === 1
                                ? "bg-gradient-to-br from-gray-300 to-gray-400"
                                : index === 2
                                  ? "bg-gradient-to-br from-orange-400 to-orange-500"
                                  : "bg-gradient-to-br from-blue-400 to-blue-500"
                          }`}
                        >
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{event.name}</p>
                          <p className="text-sm text-gray-600">{event.tickets.toLocaleString()} asistentes</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600 text-lg">{event.views.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 font-medium">Vistas</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "events" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative flex-1 md:max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Buscar eventos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="all">Todas las categorías</option>
                      <option value="Música">Música</option>
                      <option value="Teatro">Teatro</option>
                      <option value="Deportes">Deportes</option>
                      <option value="Arte">Arte</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedEvents.length > 0 && (
                      <>
                        <button
                          onClick={bulkShow}
                          className="px-4 py-2.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Mostrar ({selectedEvents.length})
                        </button>
                        <button
                          onClick={bulkHide}
                          className="px-4 py-2.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <EyeOff className="w-4 h-4" />
                          Ocultar ({selectedEvents.length})
                        </button>
                      </>
                    )}
                    <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:shadow-md transition-all text-sm flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Nuevo Evento
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto -mx-6 px-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-4">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEvents(filteredEvents.map((e) => e.id))
                              } else {
                                setSelectedEvents([])
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                        </th>
                        <th className="text-left py-4 px-4 font-semibold text-sm text-gray-600">Evento</th>
                        <th className="text-left py-4 px-4 font-semibold text-sm text-gray-600">Categoría</th>
                        <th className="text-left py-4 px-4 font-semibold text-sm text-gray-600">Fecha</th>
                        <th className="text-left py-4 px-4 font-semibold text-sm text-gray-600">Ubicación</th>
                        <th className="text-left py-4 px-4 font-semibold text-sm text-gray-600">Asistencia</th>
                        <th className="text-left py-4 px-4 font-semibold text-sm text-gray-600">Promotor</th>
                        <th className="text-left py-4 px-4 font-semibold text-sm text-gray-600">Estado</th>
                        <th className="text-left py-4 px-4 font-semibold text-sm text-gray-600">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEvents.map((event) => (
                        <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-4">
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
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{event.name}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                {event.time}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                              {event.category}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-700">{event.date}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate max-w-[150px]">{event.location}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-gray-900">
                                {event.ticketsSold} / {event.capacity}
                              </span>
                              <div className="mt-1 w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                                  style={{ width: `${(event.ticketsSold / event.capacity) * 100}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm font-medium text-gray-900">{event.promoter}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(event.status)}`}
                            >
                              {getStatusText(event.status)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleVisibility(event.id)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title={event.visibility ? "Ocultar" : "Mostrar"}
                              >
                                {event.visibility ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </button>
                              <button
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteEvent(event.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar"
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
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Vistas por Mes</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={eventData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="vistas" fill="#3B82F6" name="Vistas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Capacidad vs Asistencia</h3>
                  <div className="space-y-4">
                    {events.slice(0, 4).map((event) => (
                      <div key={event.id}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">{event.name}</span>
                          <span className="text-sm text-gray-600">
                            {((event.ticketsSold / event.capacity) * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all"
                            style={{ width: `${(event.ticketsSold / event.capacity) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Rendimiento por Categoría</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" name="Eventos">
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Gestión de Usuarios</h3>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Buscar usuarios..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all">
                      <Plus className="w-4 h-4 inline mr-2" />
                      Nuevo Usuario
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Usuarios Totales</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">1,234</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 font-medium">Activos este mes</p>
                        <p className="text-2xl font-bold text-green-900 mt-1">847</p>
                      </div>
                      <Activity className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600 font-medium">Nuevos (7 días)</p>
                        <p className="text-2xl font-bold text-purple-900 mt-1">89</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Usuario</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Registro</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Eventos</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Tickets</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Estado</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          id: 1,
                          name: "María González",
                          email: "maria@email.com",
                          date: "2024-01-15",
                          events: 12,
                          tickets: 18,
                          status: "active",
                        },
                        {
                          id: 2,
                          name: "Carlos Rodríguez",
                          email: "carlos@email.com",
                          date: "2024-02-20",
                          events: 8,
                          tickets: 10,
                          status: "active",
                        },
                        {
                          id: 3,
                          name: "Ana Martínez",
                          email: "ana@email.com",
                          date: "2024-03-10",
                          events: 15,
                          tickets: 22,
                          status: "active",
                        },
                        {
                          id: 4,
                          name: "Luis Pérez",
                          email: "luis@email.com",
                          date: "2023-12-05",
                          events: 20,
                          tickets: 35,
                          status: "premium",
                        },
                      ].map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                {user.name.charAt(0)}
                              </div>
                              <span className="font-medium text-gray-900">{user.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">{user.email}</td>
                          <td className="py-4 px-4 text-gray-600">{user.date}</td>
                          <td className="py-4 px-4 text-gray-600">{user.events}</td>
                          <td className="py-4 px-4 text-gray-600">{user.tickets}</td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                user.status === "premium"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {user.status === "premium" ? "Premium" : "Activo"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Configuración de la Plataforma</h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Información General</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Plataforma</label>
                        <input
                          type="text"
                          defaultValue="Time2Go"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email de Contacto</label>
                        <input
                          type="email"
                          defaultValue="info@time2go.com"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                        <input
                          type="tel"
                          defaultValue="+57 300 123 4567"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                        <input
                          type="text"
                          defaultValue="Bucaramanga"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Configuración de Eventos</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Aprobación automática de eventos</p>
                          <p className="text-sm text-gray-600">Los nuevos eventos se publican sin revisión</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Notificaciones por email</p>
                          <p className="text-sm text-gray-600">Enviar alertas de nuevos eventos a usuarios</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Modo mantenimiento</p>
                          <p className="text-sm text-gray-600">Desactivar temporalmente la plataforma</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Exportar Datos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Download className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-700">Exportar Eventos</span>
                      </button>
                      <button className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Download className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-700">Exportar Usuarios</span>
                      </button>
                      <button className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Download className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-700">Exportar Estadísticas</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200 flex justify-end space-x-4">
                    <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                      Cancelar
                    </button>
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all">
                      Guardar Cambios
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
