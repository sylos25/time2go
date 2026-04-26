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
import Link from "next/link"

type EventsGridProps = {
  events: EventCardItem[]
  selectedImageByEvent: Record<number, number>
  favoriteIds: number[]
  favoritePendingIds: number[]
  copiedEventId: number | null
  onSelectImage: (eventId: number, index: number) => void
  onToggleFavorite: (eventId: number) => void
  onShareEvent: (event: EventCardItem) => void
  getViewDetailsHref: (eventId: number) => string
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
  getViewDetailsHref,
}: EventsGridProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card/60 px-6 py-16 text-center shadow-sm">
        <div className="mb-6 text-8xl">🔍</div>
        <h3 className="mb-3 text-2xl font-bold text-foreground">No se encontraron eventos</h3>
        <p className="mx-auto max-w-xl text-lg text-muted-foreground">
          Intenta con otros términos de búsqueda o ajusta los filtros para ampliar resultados.
        </p>
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
        const rawEventType = event.raw?.tipo_evento ?? event.raw?.tipo
        let eventType = "Tipo no especificado"
        if (typeof rawEventType === "string" && rawEventType.trim().length > 0) {
          eventType = rawEventType.trim()
        } else if (rawEventType && typeof rawEventType === "object") {
          const eventTypeObj = rawEventType as Record<string, unknown>
          const candidate =
            eventTypeObj.nombre ?? eventTypeObj.tipo ?? eventTypeObj.descripcion ?? eventTypeObj.label
          if (typeof candidate === "string" && candidate.trim().length > 0) {
            eventType = candidate.trim()
          }
        }

        const formatDateLabel = (value: unknown, fallback = "Por confirmar") => {
          if (!value) return fallback
          const date = new Date(String(value))
          if (Number.isNaN(date.getTime())) return fallback
          return new Intl.DateTimeFormat("es-CO", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(date)
        }

        const formatTimeLabel = (value: unknown, fallback = "Por confirmar") => {
          if (!value || typeof value !== "string") return fallback
          const match = value.match(/^(\d{1,2}):(\d{2})/)
          if (!match) return fallback
          let hours = Number(match[1])
          const minutes = match[2]
          if (!Number.isFinite(hours) || hours < 0 || hours > 23) return fallback
          const period = hours >= 12 ? "p.m." : "a.m."
          hours = hours % 12 || 12
          return `${hours}:${minutes} ${period}`
        }

        const startDate = formatDateLabel(event.raw?.fecha_inicio)
        const endDate = formatDateLabel(event.raw?.fecha_final, startDate)
        const startTime = formatTimeLabel(event.raw?.hora_inicio)
        const endTime = formatTimeLabel(event.raw?.hora_final)
        const rawRatingCandidates = [
          event.raw?.promedio_valoracion,
          event.raw?.promedioValoracion,
          event.raw?.valoracion_promedio,
          event.raw?.calificacion_promedio,
          event.raw?.rating_promedio,
          event.raw?.rating,
          event.raw?.valoracion,
        ]
        const numericRating = rawRatingCandidates
          .map((value) => Number(value))
          .find((value) => Number.isFinite(value) && value >= 0)
        const rating = typeof numericRating === "number" ? numericRating : 0
        const ratingLabel = rating > 0 ? rating.toFixed(1) : "0"

        return (
          <Card
            key={event.id_evento}
            className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-card/90 dark:bg-card/80 backdrop-blur-sm border border-border/70 dark:border-border/50 rounded-2xl overflow-hidden"
          >
            <div className="relative overflow-hidden">
              <div className="w-full h-44 bg-slate-100 dark:bg-slate-800/70">
                {eventImages.length > 0 ? (
                  <>
                    <img
                      src={eventImages[safeSelectedIndex].url_imagen_evento || "/placeholder.svg"}
                      alt={event.title}
                      className="w-full h-44 object-cover group-hover:scale-110 transition-transform duration-500"
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
                    className="w-full h-44 object-cover"
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
                  className="h-9 w-9 bg-card/90 dark:bg-slate-800/90 dark:text-slate-100 backdrop-blur-sm rounded-full hover:bg-card dark:hover:bg-slate-700"
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
                  className="h-9 w-9 bg-card/90 dark:bg-slate-800/90 dark:text-slate-100 backdrop-blur-sm rounded-full hover:bg-card dark:hover:bg-slate-700"
                  onClick={() => onShareEvent(event)}
                  aria-label={isLinkCopied ? "Enlace copiado" : "Copiar enlace del evento"}
                  title={isLinkCopied ? "Enlace copiado" : "Copiar enlace del evento"}
                >
                  {isLinkCopied ? <Check className="h-4 w-4 text-green-600" /> : <Share2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <CardContent className="px-6 pt-2 pb-6">
              <div className="space-y-2 mb-6">
                <h3
                  title={event.title}
                  className="text-2xl leading-tight font-bold text-green-700 dark:text-lime-400 group-hover:text-lime-500 dark:group-hover:text-lime-500 transition-colors line-clamp-2"
                >
                  {event.title}
                </h3>

                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge className="rounded-full bg-emerald-500 text-white">
                    {event.category}
                  </Badge>
                  <Badge className="rounded-full bg-teal-500 text-white">
                    {eventType}
                  </Badge>
                  <div className="ml-auto flex items-center gap-1 text-amber-500">
                    <Star className="h-4 w-4 fill-amber-500" />
                    <span className="text-sm font-semibold text-foreground">{ratingLabel}</span>
                  </div>
                </div>

                <p className="text-muted-foreground line-clamp-2">{event.description}</p>

                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-3" />
                  {startDate} - {endDate}
                </div>

                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-3" />
                  {startTime} - {endTime}
                </div>

                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-3" />
                  Lugar: {event.location}
                </div>

                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-3" />
                  Aforo: {Number(event.attendees).toLocaleString("es-CO")}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-green-600 dark:text-emerald-400">{formatEventPrice(event.price)}</div>
                <Button
                  asChild
                  type="button"
                  className="bg-rose-600 hover:bg-rose-500 dark:bg-rose-500 dark:hover:bg-rose-600 hover:scale-103 rounded-xl px-6 text-white"
                >
                  <Link href={getViewDetailsHref(event.id_evento)}>Detalles</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
