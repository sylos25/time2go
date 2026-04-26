import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import type { CategoryChartRow } from "@/lib/dashboard-overview"

type CategoriesPieChartCardProps = {
  data: CategoryChartRow[]
  isLoading?: boolean
}

const formatNaturalCount = (value: number) => Math.max(0, Math.round(Number(value || 0)))

export function CategoriesPieChartCard({ data, isLoading = false }: CategoriesPieChartCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-foreground">Eventos por Categoria</h3>
        <p className="mt-1 text-sm text-muted-foreground">Distribucion actual</p>
      </div>
      {isLoading ? (
        <>
          <div className="h-[240px] w-full animate-pulse rounded-lg bg-muted" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-5 w-full animate-pulse rounded bg-muted" />
            ))}
          </div>
        </>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                label={false}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `${formatNaturalCount(Number(value))}`}
                contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {data.map((category) => (
              <div key={category.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                  <span className="text-foreground">{category.name}</span>
                </div>
                <span className="font-semibold text-foreground">{formatNaturalCount(category.value)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
