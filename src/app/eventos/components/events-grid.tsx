import {
  Calendar,
  Check,
  Heart,
  MapPin,
  Share2,
  Star,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { formatEventPrice } from "@/app/eventos/lib/events-page-utils"
import type { EventCardItem } from "@/app/eventos/lib/events-page-types"

type EventsGridProps = {
  events: EventCardItem[]
  selectedImageByEvent: Record<number, number>
  favoriteIds: number[]
  favoritePendingIds: number[]
  copiedEventId: number | null
  onSelectImage: (eventId: number, index: number) => void
  onToggleFavorite: (eventId: number) => void
  onShareEvent: (event: EventCardItem) => void
  onViewDetails: (eventId: number) => void
}

export function EventsGrid({
  events,
  selectedImageByEvent,
  favoriteIds,
  favoritePendingIds,
  copiedEventId,
  onSelectImage,
  onToggleFavorite,
  onShareEvent,
  onViewDetails,
}: EventsGridProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-8xl mb-6">🔍</div>
        <h3 className="text-2xl font-bold text-foreground mb-3">No se encontraron eventos</h3>
        <p className="text-lg text-muted-foreground">Intenta con otros términos de búsqueda o filtros</p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {events.map((event) => {
        const eventId = event.id_evento
        const eventImages = Array.isArray(event.raw?.imagenes) ? event.raw.imagenes : []
        const selectedImageIndex = selectedImageByEvent[eventId] ?? 0
        const safeSelectedIndex = eventImages[selectedImageIndex] ? selectedImageIndex : 0
        const isFavorite = favoriteIds.includes(eventId)
        const isFavoritePending = favoritePendingIds.includes(eventId)
        const isLinkCopied = copiedEventId === eventId

        return (
          <Card
            key={event.id_evento}
            className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-card/90 backdrop-blur-sm border-border rounded-2xl overflow-hidden"
          >
            <div className="relative overflow-hidden">
              <div className="w-full h-52 bg-gray-100">
                {eventImages.length > 0 ? (
                  <>
                    <img
                      src={eventImages[safeSelectedIndex].url_imagen_evento || "/placeholder.svg"}
                      alt={event.title}
                      className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute bottom-2 left-2 right-2 flex gap-2 overflow-x-auto p-1">
                      {eventImages.map((image, index) => (
                        <img
                          key={`${image.id_imagen_evento || "img"}-${index}`}
                          src={image.url_imagen_evento || "/placeholder.svg"}
                          alt={`${event.title} ${index + 1}`}
                          onClick={() => onSelectImage(eventId, index)}
                          className={`h-10 w-16 object-cover rounded-md border shadow-sm cursor-pointer transition ${
                            safeSelectedIndex === index
                              ? "border-white ring-2 ring-white/90"
                              : "border-border opacity-90 hover:opacity-100"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <img
                    src="/placeholder.svg"
                    alt={event.title}
                    className="w-full h-52 object-cover"
                  />
                )}

                <span className={`absolute top-4 left-4 text-xs font-semibold px-2 py-1 rounded-full ${typeof event.price === "number" ? "bg-blue-600 text-white" : "bg-green-600 text-white"}`}>
                  {typeof event.price === "number" ? "PAGO" : "GRATIS"}
                </span>
              </div>

              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  type="button"
                  className="h-9 w-9 bg-card/90 backdrop-blur-sm rounded-full hover:bg-card"
                  onClick={() => onToggleFavorite(eventId)}
                  disabled={isFavoritePending}
                  aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                >
                  <Heart className={`h-4 w-4 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-foreground"}`} />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  type="button"
                  className="h-9 w-9 bg-card/90 backdrop-blur-sm rounded-full hover:bg-card"
                  onClick={() => onShareEvent(event)}
                  aria-label={isLinkCopied ? "Enlace copiado" : "Copiar enlace del evento"}
                  title={isLinkCopied ? "Enlace copiado" : "Copiar enlace del evento"}
                >
                  {isLinkCopied ? <Check className="h-4 w-4 text-green-600" /> : <Share2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-3" />
                  {event.date} • {event.time}
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="rounded-full">
                  {event.category}
                </Badge>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">4.8</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-lime-500 transition-colors">
                {event.title}
              </h3>
              <p className="text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-3" />
                  {event.location}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-3" />
                  Aforo para {Number(event.attendees).toLocaleString("es-CO")}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-lime-500">{formatEventPrice(event.price)}</div>
                <Button
                  type="button"
                  onClick={() => onViewDetails(event.id_evento)}
                  className="bg-gradient-to-tr from-fuchsia-500 to-red-600 hover:from-fuchsia-600 hover:to-red-700 rounded-xl px-6"
                >
                  Detalles
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
