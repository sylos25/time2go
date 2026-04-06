"use client"

import { MisEventosLoadingState } from "@/app/mis-eventos/components/mis-eventos-loading-state"
import { MisEventosShell } from "@/app/mis-eventos/components/mis-eventos-shell"
import { MyEventsEmptyState } from "@/app/mis-eventos/components/my-events-empty-state"
import { MyEventsGrid } from "@/app/mis-eventos/components/my-events-grid"
import { MyEventsHeader } from "@/app/mis-eventos/components/my-events-header"
import { useMyEventsPage } from "@/app/mis-eventos/hooks/use-my-events-page"

export default function MisEventosPage() {
  const { loading, error, events, goToExploreEvents, openEvent } = useMyEventsPage()

  if (loading) {
    return (
      <MisEventosShell>
        <div className="flex-1 pt-32 pb-12 px-4 flex items-center justify-center">
          <MisEventosLoadingState message="Cargando tus eventos..." />
        </div>
      </MisEventosShell>
    )
  }

  return (
    <MisEventosShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <MyEventsHeader onExplore={goToExploreEvents} />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        {!error && events.length === 0 && <MyEventsEmptyState />}

        {events.length > 0 && (
          <div className="mt-6">
            <MyEventsGrid events={events} onOpenEvent={openEvent} />
          </div>
        )}
      </div>
    </MisEventosShell>
  )
}
