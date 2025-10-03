"use client"

import { useState } from "react"
import Image from "next/image"
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
  DollarSign,
  Eye,
  Settings,
  Bell,
  Search,
  Plus,
  MoreVertical,
  Home,
  LogOut,
  Menu,
  X,
  Edit,
  Trash2,
  EyeOff,
  CheckCircle,
  XCircle,
  MapPin,
  Clock,
  Ticket,
  Activity,
  Filter,
  Download,
  Upload,
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
  price: number
  revenue: number
  status: "published" | "hidden" | "cancelled" | "completed"
  visibility: boolean
  image: string
}

interface StatCard {
  title: string
  value: string
  change: number
  icon: React.ElementType
  color: string
}

export default function EventDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [selectedEvents, setSelectedEvents] = useState<number[]>([])
  const router = useRouter()

  const stats: StatCard[] = [
    {
      title: "Eventos Activos",
      value: "24",
      change: 12.5,
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Tickets Vendidos",
      value: "3,847",
      change: 23.1,
      icon: Ticket,
      color: "from-green-500 to-emerald-600",
    },
    {
      title: "Ingresos del Mes",
      value: "$186,500",
      change: 15.3,
      icon: DollarSign,
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
      price: 45000,
      revenue: 17100000,
      status: "published",
      visibility: true,
      image: "/images/teatro.jpg",
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
      price: 25000,
      revenue: 46250000,
      status: "published",
      visibility: true,
      image: "/images/carranga.jpg",
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
      price: 60000,
      revenue: 48000000,
      status: "completed",
      visibility: false,
      image: "/images/rock.jpg",
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
      price: 35000,
      revenue: 8575000,
      status: "published",
      visibility: true,
      image: "/images/jazz.jpg",
    },
  ])

  const revenueData = [
    { month: "Jul", ingresos: 45000, eventos: 12 },
    { month: "Ago", ingresos: 52000, eventos: 15 },
    { month: "Sep", ingresos: 61000, eventos: 18 },
    { month: "Oct", ingresos: 58000, eventos: 16 },
    { month: "Nov", ingresos: 72000, eventos: 22 },
    { month: "Dic", ingresos: 86000, eventos: 24 },
  ]

  const categoryData = [
    { name: "Música", value: 45, color: "#3B82F6" },
    { name: "Teatro", value: 25, color: "#8B5CF6" },
    { name: "Deportes", value: 15, color: "#10B981" },
    { name: "Arte", value: 10, color: "#F59E0B" },
    { name: "Otros", value: 5, color: "#EF4444" },
  ]

  const topEvents = [
    { name: "Festival Carranga", tickets: 1850, revenue: 46250000 },
    { name: "Concierto Rock", tickets: 800, revenue: 48000000 },
    { name: "La Madriguera", tickets: 380, revenue: 17100000 },
    { name: "Festival Jazz", tickets: 245, revenue: 8575000 },
  ]

  const menuItems = [
    { id: "overview", name: "Resumen General", icon: Home },
    { id: "events", name: "Gestión de Eventos", icon: Calendar },
    { id: "analytics", name: "Analíticas", icon: TrendingUp },
    { id: "users", name: "Usuarios", icon: Users },
    { id: "settings", name: "Configuración", icon: Settings },
  ]

  const toggleVisibility = (id: number) => {
    setEvents(events.map(event => 
      event.id === id ? { ...event, visibility: !event.visibility } : event
    ))
  }

  const deleteEvent = (id: number) => {
    if (confirm("¿Estás seguro de eliminar este evento?")) {
      setEvents(events.filter(event => event.id !== id))
    }
  }

  const bulkHide = () => {
    setEvents(events.map(event =>
      selectedEvents.includes(event.id) ? { ...event, visibility: false } : event
    ))
    setSelectedEvents([])
  }

  const bulkShow = () => {
    setEvents(events.map(event =>
      selectedEvents.includes(event.id) ? { ...event, visibility: true } : event
    ))
    setSelectedEvents([])
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || event.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-800"
      case "hidden": return "bg-gray-100 text-gray-800"
      case "cancelled": return "bg-red-100 text-red-800"
      case "completed": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "published": return "Publicado"
      case "hidden": return "Oculto"
      case "cancelled": return "Cancelado"
      case "completed": return "Completado"
      default: return "Desconocido"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 w-72 h-screen bg-white shadow-2xl transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Time2Go
            </h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <p className="font-medium text-gray-900">Admin</p>
              <p className="text-sm text-gray-500">admin@time2go.com</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <div className="lg:ml-72">
        <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-20">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900">
                {menuItems.find((item) => item.id === activeTab)?.name}
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                        <div className="flex items-center mt-2">
                          <TrendingUp className={`w-4 h-4 ${stat.change >= 0 ? "text-green-500" : "text-red-500"}`} />
                          <span className={`text-sm font-medium ml-1 ${stat.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {stat.change}%
                          </span>
                          <span className="text-sm text-gray-500 ml-1">vs mes anterior</span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Evolución de Ingresos</h3>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      <Download className="w-4 h-4 inline mr-1" />
                      Exportar
                    </button>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="ingresos" stroke="#3B82F6" strokeWidth={3} name="Ingresos (miles)" />
                      <Line type="monotone" dataKey="eventos" stroke="#8B5CF6" strokeWidth={3} name="Eventos" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Eventos por Categoría</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Eventos Más Exitosos</h3>
                <div className="space-y-4">
                  {topEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{event.name}</p>
                          <p className="text-sm text-gray-600">{event.tickets} tickets vendidos</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">${(event.revenue / 1000000).toFixed(1)}M</p>
                        <p className="text-sm text-gray-600">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "events" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="relative flex-1 md:w-80">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Buscar eventos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todas las categorías</option>
                      <option value="Música">Música</option>
                      <option value="Teatro">Teatro</option>
                      <option value="Deportes">Deportes</option>
                      <option value="Arte">Arte</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-3">
                    {selectedEvents.length > 0 && (
                      <>
                        <button
                          onClick={bulkShow}
                          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <Eye className="w-4 h-4 inline mr-1" />
                          Mostrar ({selectedEvents.length})
                        </button>
                        <button
                          onClick={bulkHide}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <EyeOff className="w-4 h-4 inline mr-1" />
                          Ocultar ({selectedEvents.length})
                        </button>
                      </>
                    )}
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all">
                      <Plus className="w-4 h-4 inline mr-2" />
                      Nuevo Evento
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEvents(filteredEvents.map(e => e.id))
                              } else {
                                setSelectedEvents([])
                              }
                            }}
                            className="rounded"
                          />
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Evento</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Categoría</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Fecha</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Ubicación</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Ventas</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Ingresos</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Estado</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Visibilidad</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEvents.map((event) => (
                        <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <input
                              type="checkbox"
                              checked={selectedEvents.includes(event.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedEvents([...selectedEvents, event.id])
                                } else {
                                  setSelectedEvents(selectedEvents.filter(id => id !== event.id))
                                }
                              }}
                              className="rounded"
                            />
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={event.image || "/placeholder.svg"}
                                alt={event.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <div>
                                <p className="font-medium text-gray-900">{event.name}</p>
                                <p className="text-sm text-gray-500">{event.time}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                              {event.category}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-600">{event.date}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center text-gray-600">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span className="text-sm">{event.location}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm">
                              <p className="font-medium text-gray-900">{event.ticketsSold}/{event.capacity}</p>
                              <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${(event.ticketsSold / event.capacity) * 100}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-semibold text-green-600">${(event.revenue / 1000000).toFixed(1)}M</p>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                              {getStatusText(event.status)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() => toggleVisibility(event.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                event.visibility ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              {event.visibility ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteEvent(event.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Eventos por Mes</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="eventos" fill="#8B5CF6" name="Número de Eventos" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Capacidad vs Ventas</h3>
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

              <div className="bg-white rounded-2xl shadow-lg p-6">
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
              <div className="bg-white rounded-2xl shadow-lg p-6">
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
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Gasto Total</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Estado</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: 1, name: "María González", email: "maria@email.com", date: "2024-01-15", events: 12, tickets: 18, spent: 450000, status: "active" },
                        { id: 2, name: "Carlos Rodríguez", email: "carlos@email.com", date: "2024-02-20", events: 8, tickets: 10, spent: 320000, status: "active" },
                        { id: 3, name: "Ana Martínez", email: "ana@email.com", date: "2024-03-10", events: 15, tickets: 22, spent: 680000, status: "active" },
                        { id: 4, name: "Luis Pérez", email: "luis@email.com", date: "2023-12-05", events: 20, tickets: 35, spent: 950000, status: "premium" },
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
                          <td className="py-4 px-4 font-semibold text-green-600">${(user.spent / 1000).toFixed(0)}k</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.status === "premium" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
                            }`}>
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
              <div className="bg-white rounded-2xl shadow-lg p-6">
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
                        <span className="font-medium text-gray-700">Exportar Ventas</span>
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