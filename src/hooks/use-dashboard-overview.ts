import { useEffect, useState } from "react"

import {
  DEFAULT_STATS,
  type CategoryApiRow,
  type CategoryChartRow,
  type RegistrationApiRow,
  type RegistrationChartRow,
  type StatCard,
  type TopRatedEventApiRow,
  type TopRatedEventChartRow,
  fetchOverviewStats,
  mapCategoriesForChart,
  mapRegistrationsForChart,
  mapTopRatedEventsForChart,
  mergeOverviewStats,
} from "@/lib/dashboard-overview"

export function useDashboardOverview() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<StatCard[]>(DEFAULT_STATS)
  const [registrationsData, setRegistrationsData] = useState<RegistrationChartRow[]>(() => mapRegistrationsForChart([]))
  const [categoryData, setCategoryData] = useState<CategoryChartRow[]>([])
  const [topRatedEvents, setTopRatedEvents] = useState<TopRatedEventChartRow[]>([])

  useEffect(() => {
    let cancelled = false

    async function loadOverview() {
      try {
        const result = await fetchOverviewStats()
        if (cancelled || !result.statsOk) return

        const statsPayload = result.statsPayload || {}

        setStats((prev) =>
          mergeOverviewStats(prev, {
            eventsActive: Number(statsPayload.eventsActive || 0),
            eventsInactive: Number(statsPayload.eventsInactive || 0),
            usersBanned: Number(statsPayload.usersBanned || 0),
            usersActive: result.usersActive,
          })
        )

        setRegistrationsData(mapRegistrationsForChart((statsPayload.userRegistrationsByMonth || []) as RegistrationApiRow[]))
        setCategoryData(mapCategoriesForChart((statsPayload.eventsByCategory || []) as CategoryApiRow[]))
        setTopRatedEvents(mapTopRatedEventsForChart((statsPayload.topRatedEvents || []) as TopRatedEventApiRow[]))
      } catch (error) {
        console.error("Error cargando resumen del dashboard", error)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadOverview()

    return () => {
      cancelled = true
    }
  }, [])

  return {
    loading,
    stats,
    registrationsData,
    categoryData,
    topRatedEvents,
  }
}
