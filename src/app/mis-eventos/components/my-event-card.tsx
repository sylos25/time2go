import { Calendar, MapPin, Ticket } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import type { MyEventItem } from "@/app/mis-eventos/lib/mis-eventos-types"

type MyEventCardProps = {
  event: MyEventItem
  onOpenEvent: (id: number) => void
}

export function MyEventCard({ event, onOpenEvent }: MyEventCardProps) {
  return (
    <Card className="bg-card/90 backdrop-blur-sm border border-border rounded-sm overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-foreground line-clamp-2">{event.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {event.imageUrl && (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-36 object-cover rounded-lg"
          />
        )}

        <div className="text-sm text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{event.dateText}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{event.locationText}</span>
          </div>
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            <span>Cupo: {event.capacityText}</span>
          </div>
        </div>

        <div className="pt-2 flex gap-2">
          <Button
            className="w-full bg-gradient-to-tr from-green-600 to-lime-500 text-white hover:from-green-500 hover:to-lime-400"
            onClick={() => onOpenEvent(event.id)}
          >
            Ver evento
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}