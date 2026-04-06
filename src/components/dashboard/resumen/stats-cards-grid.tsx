import type { StatCard } from "@/lib/dashboard-overview"

type StatsCardsGridProps = {
  stats: StatCard[]
  isLoading?: boolean
}

export function StatsCardsGrid({ stats, isLoading = false }: StatsCardsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-border hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              {isLoading ? (
                <div className="mt-2 h-9 w-20 animate-pulse rounded-md bg-muted" />
              ) : (
                <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
              )}
            </div>
            <div className={`rounded-xl bg-gradient-to-br p-3 shadow-sm ${stat.color}`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
