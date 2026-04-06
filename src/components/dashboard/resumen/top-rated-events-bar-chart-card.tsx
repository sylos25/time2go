import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { TopRatedEventChartRow } from "@/lib/dashboard-overview"

type TopRatedEventsBarChartCardProps = {
  data: TopRatedEventChartRow[]
  isLoading?: boolean
}

export function TopRatedEventsBarChartCard({ data, isLoading = false }: TopRatedEventsBarChartCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">Eventos Mas Populares</h3>
          <p className="mt-1 text-sm text-muted-foreground">Ordenados por promedio de valoracion de usuarios</p>
        </div>
      </div>
      {isLoading ? (
        <div className="h-[300px] w-full animate-pulse rounded-lg bg-muted" />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} domain={[0, 5]} />
            <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }} />
            <Legend wrapperStyle={{ fontSize: "14px" }} />
            <Bar dataKey="promedio" fill="#F59E0B" name="Promedio de Valoracion" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
