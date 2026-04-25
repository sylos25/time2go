import { CalendarDays, Heart, Loader2, MapPin, Trash2, Users } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

import type { FavoriteEvent } from "@/app/mis-favoritos/lib/mis-favoritos-types"
import { formatDisplayPrice } from "@/app/mis-favoritos/lib/mis-favoritos-utils"

type FavoriteEventCardProps = {
  event: FavoriteEvent
  removingId: number | null
  getEventHref: (event: FavoriteEvent) => string
  onRemoveFavorite: (eventId: number) => void
}

type FavoriteEventsListProps = {
  favorites: FavoriteEvent[]
  removingId: number | null
  getEventHref: (event: FavoriteEvent) => string
  onRemoveFavorite: (eventId: number) => void
}

function FavoriteEventCard({
  event,
  removingId,
  getEventHref,
  onRemoveFavorite,
}: FavoriteEventCardProps) {
  return (
    <Card className="bg-card/90 backdrop-blur-sm border-border rounded-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-44 h-40 sm:h-auto flex-shrink-0">
            {event.image ? (
              <img src={event.image} alt={event.nombre_evento} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Heart className="h-8 w-8 text-muted-foreground/30" />
              </div>
            )}
          </div>

          <div className="flex-1 p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <Link
                  href={getEventHref(event)}
                  className="font-semibold text-foreground text-left hover:text-green-600 transition-colors leading-tight line-clamp-1 w-full"
                >
                  {event.nombre_evento}
                </Link>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {event.fecha_inicio
                      ? new Date(event.fecha_inicio).toLocaleDateString("es-CO", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Fecha por confirmar"}
                    {event.hora_inicio ? ` · ${event.hora_inicio.slice(0, 5)}` : ""}
                  </span>
                </div>
              </div>
              <Badge variant="secondary" className="shrink-0 rounded-sm">
                {event.categoria}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">{event.descripcion}</p>

            <div className="grid gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Aforo para {Number(event.attendees || 0).toLocaleString("es-CO")}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-auto pt-1 flex-wrap gap-2">
              <span className="text-sm font-semibold text-lime-600">{formatDisplayPrice(event.price)}</span>
              <div className="flex gap-2">
                <Link
                  href={getEventHref(event)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium border border-border text-foreground hover:border-green-500 hover:text-green-600 transition-colors cursor-pointer"
                >
                  Ver detalle
                </Link>
                <button
                  onClick={() => onRemoveFavorite(event.id_evento)}
                  disabled={removingId === event.id_evento}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium border border-border text-foreground hover:border-red-400 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-60"
                >
                  {removingId === event.id_evento ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                  Quitar
                </button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function FavoriteEventsList({
  favorites,
  removingId,
  getEventHref,
  onRemoveFavorite,
}: FavoriteEventsListProps) {
  return (
    <div className="grid gap-4">
      {favorites.map((event) => (
        <FavoriteEventCard
          key={event.id_evento}
          event={event}
          removingId={removingId}
          getEventHref={getEventHref}
          onRemoveFavorite={onRemoveFavorite}
        />
      ))}
    </div>
  )
}