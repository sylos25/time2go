import type { EventCardItem } from "@/app/eventos/lib/events-page-types"
import { toGridPresentationData } from "@/components/events/event-presentation-adapters"
import { EventPresentationCard } from "@/components/events/event-presentation-card"
import { EVENT_PRESENTATION_LABELS } from "@/components/events/event-presentation-constants"
import { buildEventUrl } from "@/lib/event-url"

type EventsGridProps = {
  events: EventCardItem[]
  selectedImageByEvent: Record<number, number>
  favoriteIds: number[]
  favoritePendingIds: number[]
  copiedEventId: number | null
  onSelectImage: (eventId: number, index: number) => void
  onToggleFavorite: (eventId: number) => void
  onShareEvent: (event: EventCardItem) => void
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
        const detailHref = buildEventUrl(event.id_publico_evento, event.title, eventId)
        const selectedImageIndex = selectedImageByEvent[eventId] ?? 0
        const isFavorite = favoriteIds.includes(eventId)
        const isFavoritePending = favoritePendingIds.includes(eventId)
        const isLinkCopied = copiedEventId === eventId
        const presentationData = toGridPresentationData(event)

        return (
          <EventPresentationCard
            key={event.id_evento}
            variant="grid"
            event={presentationData.event}
            detailHref={detailHref}
            detailLabel={EVENT_PRESENTATION_LABELS.detail.grid}
            secondaryBadgeLabel={presentationData.secondaryBadgeLabel}
            topLeftTagLabel={presentationData.topLeftTagLabel}
            metaRows={presentationData.metaRows}
            imageGallery={presentationData.imageGallery}
            selectedImageIndex={selectedImageIndex}
            onSelectImage={(index) => onSelectImage(eventId, index)}
            favoriteAction={{
              isActive: isFavorite,
              isPending: isFavoritePending,
              onToggle: () => onToggleFavorite(eventId),
              activeAriaLabel: EVENT_PRESENTATION_LABELS.favorite.remove,
              inactiveAriaLabel: EVENT_PRESENTATION_LABELS.favorite.add,
            }}
            shareAction={{
              isCopied: isLinkCopied,
              onShare: () => onShareEvent(event),
              copiedAriaLabel: EVENT_PRESENTATION_LABELS.share.copied,
              defaultAriaLabel: EVENT_PRESENTATION_LABELS.share.copy,
            }}
            priceLabel={presentationData.priceLabel}
          />
        )
      })}
    </div>
  )
}
