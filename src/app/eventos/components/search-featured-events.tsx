import { Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"

import { formatEventPrice } from "@/app/eventos/lib/events-page-utils"
import type { EventCardItem } from "@/app/eventos/lib/events-page-types"

type SearchFeaturedEventsProps = {
  topRatedEvents: EventCardItem[]
}

export function SearchFeaturedEvents({ topRatedEvents }: SearchFeaturedEventsProps) {
  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-popover text-popover-foreground rounded-2xl shadow-2xl border border-border z-[60] overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-foreground mb-3">Eventos destacados</h3>
        <div className="space-y-3">
          {topRatedEvents.map((event) => (
            <div
              key={event.id_evento}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <img
                src={event.image || "/placeholder.svg"}
                alt={event.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate">{event.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {event.category}
                  </Badge>
                </div>
              </div>
              <div className="text-sm font-bold text-blue-600">{formatEventPrice(event.price)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}