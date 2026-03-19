"use client"

import { useEffect, useState } from "react"
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
import { Calendar, EyeOff, Users } from "lucide-react"

interface StatCard {
  title: string
  value: number | string
  icon: React.ElementType
  color: string
}

interface RegistrationApiRow {
  monthKey: string
  total: number
}

interface CategoryApiRow {
  idCategoriaEvento: number
  nombre: string
  total: number
}

interface TopRatedEventApiRow {
  idEvento: number
  nombreEvento: string
  promedioValoracion: number
  totalValoraciones: number
}

const CATEGORY_COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#06B6D4", "#84CC16", "#EC4899"]

const monthLabelFormatter = new Intl.DateTimeFormat("es-CO", { month: "short" })

function getLastSixMonthsLabels() {
  const result: string[] = []
  const base = new Date()
  base.setDate(1)

  for (let offset = 5; offset >= 0; offset -= 1) {
    const d = new Date(base.getFullYear(), base.getMonth() - offset, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    result.push(key)
  }

  return result
}

function mapRegistrationsForChart(rows: RegistrationApiRow[]) {
  const map = new Map(rows.map((row) => [row.monthKey, Number(row.total || 0)]))

  return getLastSixMonthsLabels().map((monthKey) => {
    const [year, month] = monthKey.split("-").map(Number)
    const date = new Date(year, month - 1, 1)
    const monthLabel = monthLabelFormatter.format(date)
    const normalizedLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)

    return {
      month: normalizedLabel,
      registrados: map.get(monthKey) ?? 0,
    }
  })
}

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState<StatCard[]>([
    { title: "Eventos Activos", value: 0, icon: Calendar, color: "from-fuchsia-500 to-red-700" },
    { title: "Eventos Inactivos", value: 0, icon: EyeOff, color: "from-gray-500 to-gray-600" },
    { title: "Usuarios Activos", value: 0, icon: Users, color: "from-lime-500 to-green-700" },
    { title: "Usuarios Baneados", value: 0, icon: Users, color: "from-gray-500 to-gray-600" },
  ])
  const [registrationsData, setRegistrationsData] = useState(() => mapRegistrationsForChart([]))
  const [categoryData, setCategoryData] = useState<Array<{ name: string; value: number; color: string }>>([])
  const [topRatedEvents, setTopRatedEvents] = useState<Array<{ name: string; promedio: number; valoraciones: number }>>([])

  useEffect(() => {
    let cancelled = false

    const loadStats = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        const headers: Record<string, string> = {}
        if (token) headers.Authorization = `Bearer ${token}`

        const [statsRes, usersRolesRes] = await Promise.all([
          fetch("/api/stats", { headers }),
          fetch("/api/usuarios?roles=1,2&estado=true&page=1&pageSize=1", { headers }),
        ])

        if (!cancelled && statsRes.ok) {
          const statsData = await statsRes.json()
          if (statsData.ok) {
            setStats((prev) =>
              prev.map((s) => {
                if (s.title === "Eventos Activos") return { ...s, value: statsData.eventsActive }
                if (s.title === "Eventos Inactivos") return { ...s, value: statsData.eventsInactive }
                if (s.title === "Usuarios Baneados") return { ...s, value: statsData.usersBanned }
                return s
              })
            )

            setRegistrationsData(mapRegistrationsForChart((statsData.userRegistrationsByMonth || []) as RegistrationApiRow[]))

            const categories = ((statsData.eventsByCategory || []) as CategoryApiRow[]).map((category, index) => ({
              name: category.nombre,
              value: Number(category.total || 0),
              color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
            }))
            setCategoryData(categories)

            const ratedEvents = ((statsData.topRatedEvents || []) as TopRatedEventApiRow[]).map((event) => ({
              name: event.nombreEvento,
              promedio: Number(event.promedioValoracion || 0),
              valoraciones: Number(event.totalValoraciones || 0),
            }))
            setTopRatedEvents(ratedEvents)
          }
        }

        if (!cancelled && usersRolesRes.ok) {
          const usersRolesData = await usersRolesRes.json()
          const activeRolesOneAndTwo = Number(usersRolesData?.pagination?.total || 0)
          setStats((prev) =>
            prev.map((s) => (s.title === "Usuarios Activos" ? { ...s, value: activeRolesOneAndTwo } : s))
          )
        }
      } catch (error) {
        console.error("Error cargando resumen del dashboard", error)
      }
    }

    loadStats()
    return () => {
      cancelled = true
    }
  }, [])

  return (
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
              <h3 className="text-lg font-bold text-foreground">Evolución de Usuarios Registrados</h3>
              <p className="text-sm text-muted-foreground mt-1">Últimos 6 meses</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={registrationsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }} />
              <Legend wrapperStyle={{ fontSize: "14px" }} />
              <Line
                type="monotone"
                dataKey="registrados"
                stroke="#16A34A"
                strokeWidth={3}
                name="Usuarios Registrados"
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
            <p className="text-sm text-muted-foreground mt-1">Ordenados por promedio de valoración de usuarios</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topRatedEvents}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} domain={[0, 5]} />
            <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }} />
            <Legend wrapperStyle={{ fontSize: "14px" }} />
            <Bar dataKey="promedio" fill="#F59E0B" name="Promedio de Valoración" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
