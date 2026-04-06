"use client"

import { CategoriesPieChartCard } from "@/components/dashboard/resumen/categories-pie-chart-card"
import { RegistrationsLineChartCard } from "@/components/dashboard/resumen/registrations-line-chart-card"
import { StatsCardsGrid } from "@/components/dashboard/resumen/stats-cards-grid"
import { TopRatedEventsBarChartCard } from "@/components/dashboard/resumen/top-rated-events-bar-chart-card"
import { useDashboardOverview } from "@/hooks/use-dashboard-overview"

export default function DashboardOverviewPage() {
  const {
    loading,
    stats,
    registrationsData,
    categoryData,
    topRatedEvents,
  } = useDashboardOverview()

  return (
    <div className="space-y-6">
      <StatsCardsGrid stats={stats} isLoading={loading} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RegistrationsLineChartCard data={registrationsData} isLoading={loading} />
        <CategoriesPieChartCard data={categoryData} isLoading={loading} />
      </div>

      <TopRatedEventsBarChartCard data={topRatedEvents} isLoading={loading} />
    </div>
  )
}
