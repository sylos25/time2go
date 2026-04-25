import { MyEventCard } from "@/app/mis-eventos/components/my-event-card"
import type { MyEventItem } from "@/app/mis-eventos/lib/mis-eventos-types"

type MyEventsGridProps = {
  events: MyEventItem[]
  getEventHref: (event: MyEventItem) => string
  onBeforeOpenEvent: (id: number) => void
}

export function MyEventsGrid({ events, getEventHref, onBeforeOpenEvent }: MyEventsGridProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      {events.map((event) => (
        <MyEventCard
          key={event.id}
          event={event}
          eventHref={getEventHref(event)}
          onBeforeOpenEvent={onBeforeOpenEvent}
        />
      ))}
    </div>
  )
}