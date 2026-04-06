import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { RegistrationChartRow } from "@/lib/dashboard-overview"

type RegistrationsLineChartCardProps = {
  data: RegistrationChartRow[]
  isLoading?: boolean
}

export function RegistrationsLineChartCard({ data, isLoading = false }: RegistrationsLineChartCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">Evolucion de Usuarios Registrados</h3>
          <p className="mt-1 text-sm text-muted-foreground">Ultimos 6 meses</p>
        </div>
      </div>
      {isLoading ? (
        <div className="h-[300px] w-full animate-pulse rounded-lg bg-muted" />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
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
      )}
    </div>
  )
}
