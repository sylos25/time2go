"use client"

import type React from "react"

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
  Filter,
  Plus,
  MoreVertical,
  ArrowUpRight,
  Home,
  LogOut,
  Menu,
  X,
} from "lucide-react"

// Tipos de datos
interface Event {
  id: number
  name: string
  date: string
  attendees: number
  revenue: number
  status: "active" | "completed" | "cancelled"
  image: string
}

interface User {
  id: number
  name: string
  email: string
  joinDate: string
  eventsAttended: number
  avatar: string
}

interface StatCard {
  title: string
  value: string
  change: number
  icon: React.ElementType
  color: string
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [notifications, setNotifications] = useState(3)
  const router = useRouter()

  // Datos de ejemplo
  const stats: StatCard[] = [
    {
      title: "Ingresos Totales",
      value: "$124,500",
      change: 12.5,
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
    },
    {
      title: "Eventos Activos",
      value: "45",
      change: 8.2,
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Usuarios Registrados",
      value: "2,847",
      change: 15.3,
      icon: Users,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Visualizaciones",
      value: "18,492",
      change: -2.4,
      icon: Eye,
      color: "from-orange-500 to-red-500",
    },
  ]

  const recentEvents: Event[] = [
    {
      id: 1,
      name: "Festival de Jazz 2024",
      date: "2024-03-15",
      attendees: 1250,
      revenue: 25000,
      status: "active",
      image: "/images/img1.jpg",
    },
    {
      id: 2,
      name: "Concierto Rock Nacional",
      date: "2024-03-20",
      attendees: 2800,
      revenue: 56000,
      status: "active",
      image: "/images/img2.jpg",
    },
    {
      id: 3,
      name: "Teatro Clásico",
      date: "2024-02-28",
      attendees: 450,
      revenue: 9000,
      status: "completed",
      image: "/images/img3.jpg",
    },
  ]

  const recentUsers: User[] = [
    {
      id: 1,
      name: "María González",
      email: "maria@email.com",
      joinDate: "2024-03-10",
      eventsAttended: 5,
      avatar: "/images/avatar1.jpg",
    },
    {
      id: 2,
      name: "Carlos Rodríguez",
      email: "carlos@email.com",
      joinDate: "2024-03-08",
      eventsAttended: 3,
      avatar: "/images/avatar2.jpg",
    },
  ]

  const chartData = [
    { name: "Ene", ingresos: 4000, eventos: 24 },
    { name: "Feb", ingresos: 3000, eventos: 18 },
    { name: "Mar", ingresos: 5000, eventos: 32 },
    { name: "Abr", ingresos: 4500, eventos: 28 },
    { name: "May", ingresos: 6000, eventos: 35 },
    { name: "Jun", ingresos: 5500, eventos: 30 },
  ]

  const eventTypeData = [
    { name: "Conciertos", value: 400, color: "#3B82F6" },
    { name: "Festivales", value: 300, color: "#8B5CF6" },
    { name: "Teatro", value: 200, color: "#10B981" },
    { name: "Deportes", value: 100, color: "#F59E0B" },
  ]

  const menuItems = [
    { id: "overview", name: "Resumen", icon: Home },
    { id: "events", name: "Eventos", icon: Calendar },
    { id: "users", name: "Usuarios", icon: Users },
    { id: "analytics", name: "Analíticas", icon: TrendingUp },
    { id: "settings", name: "Configuración", icon: Settings },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Activo"
      case "completed":
        return "Completado"
      case "cancelled":
        return "Cancelado"
      default:
        return "Desconocido"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-80 h-screen bg-white shadow-2xl transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 relative">
              <Image src="/images/logo.svg" alt="Time2Go Logo" fill className="object-contain" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Time2Go Admin
            </h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-6">
          <ul className="space-y-2">
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

        {/* User Profile */}
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
            <span className="text-sm">Volver al sitio</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-80">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-20">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900">
                {menuItems.find((item) => item.id === activeTab)?.name || "Dashboard"}
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                        <div className="flex items-center mt-2">
                          <ArrowUpRight className={`w-4 h-4 ${stat.change >= 0 ? "text-green-500" : "text-red-500"}`} />
                          <span
                            className={`text-sm font-medium ${stat.change >= 0 ? "text-green-500" : "text-red-500"}`}
                          >
                            {Math.abs(stat.change)}%
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

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Ingresos Mensuales</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="ingresos"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        dot={{ fill: "#3B82F6", strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Event Types Chart */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Tipos de Eventos</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={eventTypeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`}
                      >
                        {eventTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Events */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Eventos Recientes</h3>
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all">
                    <Plus className="w-4 h-4 inline mr-2" />
                    Nuevo Evento
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Evento</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Fecha</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Asistentes</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Ingresos</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Estado</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentEvents.map((event) => (
                        <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={event.image || "/placeholder.svg"}
                                alt={event.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <span className="font-medium text-gray-900">{event.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">{event.date}</td>
                          <td className="py-4 px-4 text-gray-600">{event.attendees.toLocaleString()}</td>
                          <td className="py-4 px-4 text-gray-600">${event.revenue.toLocaleString()}</td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}
                            >
                              {getStatusText(event.status)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                              <MoreVertical className="w-4 h-4 text-gray-600" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "events" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Gestión de Eventos</h3>
                  <div className="flex space-x-3">
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Filter className="w-4 h-4" />
                      <span>Filtrar</span>
                    </button>
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all">
                      <Plus className="w-4 h-4 inline mr-2" />
                      Crear Evento
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentEvents.map((event) => (
                    <div
                      key={event.id}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all"
                    >
                      <img
                        src={event.image || "/placeholder.svg"}
                        alt={event.name}
                        className="w-full h-48 rounded-lg object-cover mb-4"
                      />
                      <h4 className="font-bold text-gray-900 mb-2">{event.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">📅 {event.date}</p>
                      <p className="text-sm text-gray-600 mb-2">👥 {event.attendees} asistentes</p>
                      <p className="text-sm text-gray-600 mb-4">💰 ${event.revenue.toLocaleString()}</p>
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {getStatusText(event.status)}
                        </span>
                        <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">Ver detalles</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Usuarios Registrados</h3>
                  <div className="flex space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Buscar usuarios..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all">
                      <Plus className="w-4 h-4 inline mr-2" />
                      Invitar Usuario
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Usuario</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Fecha de Registro</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Eventos</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user) => (
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
                          <td className="py-4 px-4 text-gray-600">{user.joinDate}</td>
                          <td className="py-4 px-4 text-gray-600">{user.eventsAttended}</td>
                          <td className="py-4 px-4">
                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                              <MoreVertical className="w-4 h-4 text-gray-600" />
                            </button>
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
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="eventos" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Tendencia de Ingresos</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="ingresos" stroke="#10B981" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Configuración General</h3>
                <div className="space-y-6">
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
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                    <textarea
                      rows={4}
                      defaultValue="Plataforma líder en gestión de eventos y experiencias culturales"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="pt-6 border-t border-gray-200">
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
