import type { ElementType } from "react"
import { Calendar, EyeOff, Users } from "lucide-react"

export type StatCard = {
  title: string
  value: number | string
  icon: ElementType
  color: string
}

export type RegistrationApiRow = {
  monthKey: string
  total: number
}

export type CategoryApiRow = {
  idCategoriaEvento: number
  nombre: string
  total: number
}

export type TopRatedEventApiRow = {
  idEvento: number
  nombreEvento: string
  promedioValoracion: number
  totalValoraciones: number
}

export type RegistrationChartRow = {
  month: string
  registrados: number
}

export type CategoryChartRow = {
  name: string
  value: number
  color: string
}

export type TopRatedEventChartRow = {
  name: string
  promedio: number
  valoraciones: number
}

export const CATEGORY_COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#06B6D4", "#84CC16", "#EC4899"]

const monthLabelFormatter = new Intl.DateTimeFormat("es-CO", { month: "short" })

export const DEFAULT_STATS: StatCard[] = [
  { title: "Eventos Activos", value: 0, icon: Calendar, color: "from-fuchsia-500 to-red-700" },
  { title: "Eventos Inactivos", value: 0, icon: EyeOff, color: "from-gray-500 to-gray-600" },
  { title: "Usuarios Activos", value: 0, icon: Users, color: "from-lime-500 to-green-700" },
  { title: "Usuarios Baneados", value: 0, icon: Users, color: "from-gray-500 to-gray-600" },
]

function getLastSixMonthsLabels() {
  const result: string[] = []
  const base = new Date()
  base.setDate(1)

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(base.getFullYear(), base.getMonth() - offset, 1)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    result.push(key)
  }

  return result
}

export function mapRegistrationsForChart(rows: RegistrationApiRow[]): RegistrationChartRow[] {
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

export function mapCategoriesForChart(rows: CategoryApiRow[]): CategoryChartRow[] {
  return rows.map((category, index) => ({
    name: category.nombre,
    value: Number(category.total || 0),
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }))
}

export function mapTopRatedEventsForChart(rows: TopRatedEventApiRow[]): TopRatedEventChartRow[] {
  return rows.map((event) => ({
    name: event.nombreEvento,
    promedio: Number(event.promedioValoracion || 0),
    valoraciones: Number(event.totalValoraciones || 0),
  }))
}

export function mergeOverviewStats(baseStats: StatCard[], values: {
  eventsActive: number
  eventsInactive: number
  usersBanned: number
  usersActive: number
}): StatCard[] {
  return baseStats.map((stat) => {
    if (stat.title === "Eventos Activos") return { ...stat, value: values.eventsActive }
    if (stat.title === "Eventos Inactivos") return { ...stat, value: values.eventsInactive }
    if (stat.title === "Usuarios Baneados") return { ...stat, value: values.usersBanned }
    if (stat.title === "Usuarios Activos") return { ...stat, value: values.usersActive }
    return stat
  })
}

export async function fetchOverviewStats() {
  const fetchOpts: RequestInit = { credentials: "include" }

  const [statsResponse, usersRolesResponse] = await Promise.all([
    fetch("/api/stats", fetchOpts),
    fetch("/api/usuarios?roles=1,2&estado=true&page=1&pageSize=1", fetchOpts),
  ])

  const statsPayload = statsResponse.ok ? await statsResponse.json().catch(() => ({})) : null
  const usersRolesPayload = usersRolesResponse.ok ? await usersRolesResponse.json().catch(() => ({})) : null

  return {
    statsOk: Boolean(statsResponse.ok && statsPayload?.ok),
    statsPayload,
    usersActive: Number(usersRolesPayload?.pagination?.total || 0),
  }
}
