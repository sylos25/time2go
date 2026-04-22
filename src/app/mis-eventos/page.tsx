"use client"

import { MisEventosLoadingState } from "@/app/mis-eventos/components/mis-eventos-loading-state"
import { MisEventosShell } from "@/app/mis-eventos/components/mis-eventos-shell"
import { MyEventsEmptyState } from "@/app/mis-eventos/components/my-events-empty-state"
import { MyEventsGrid } from "@/app/mis-eventos/components/my-events-grid"
import { MyEventsHeader } from "@/app/mis-eventos/components/my-events-header"
import { useMyEventsPage } from "@/app/mis-eventos/hooks/use-my-events-page"
import { Card, CardContent } from "@/components/ui/card"

export default function MisEventosPage() {
  const { loading, error, events, goToHome, goToExploreEvents, openEvent } = useMyEventsPage()
  const summaryText =
    events.length === 0
      ? "Aun no has creado ningun evento."
      : `Tienes ${events.length} evento${events.length !== 1 ? "s" : ""} creado${events.length !== 1 ? "s" : ""}.`

  return (
    <MisEventosShell>
      <section className="flex-grow pt-28 lg:pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MyEventsHeader
            loading={loading}
            count={events.length}
            summaryText={summaryText}
            onGoHome={goToHome}
          />

          {loading && <MisEventosLoadingState message="Cargando tus eventos..." />}

          {error && !loading && (
            <Card className="bg-card/90 backdrop-blur-sm border border-red-200 rounded-sm mb-6">
              <CardContent className="p-4 text-sm text-red-600">{error}</CardContent>
            </Card>
          )}

          {!loading && !error && events.length === 0 && (
            <MyEventsEmptyState onExploreEvents={goToExploreEvents} />
          )}

          {!loading && !error && events.length > 0 && (
            <div className="mt-6">
              <MyEventsGrid events={events} onOpenEvent={openEvent} />
            </div>
          )}
        </div>
      </section>
    </MisEventosShell>
  )
}
