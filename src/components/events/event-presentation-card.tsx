import {
  Calendar,
  Check,
  Heart,
  MapPin,
  Share2,
  Star,
  Users,
} from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EVENT_PRESENTATION_LABELS } from "@/components/events/event-presentation-constants"
import { cn } from "@/lib/utils"
import { formatEventPrice } from "@/app/eventos/lib/events-page-utils"

type EventMetaIcon = "calendar" | "mapPin" | "users"

export type EventCardImage = {
  id: string
  url: string
  alt: string
}

export type EventCardMetaRow = {
  icon: EventMetaIcon
  text: string
}

export type FavoriteAction = {
  isActive: boolean
  isPending?: boolean
  onToggle: () => void
  activeAriaLabel: string
  inactiveAriaLabel: string
}

export type ShareAction = {
  isCopied: boolean
  onShare: () => void
  copiedAriaLabel?: string
  defaultAriaLabel?: string
}

export type EventPresentationCardProps = {
  variant?: "preview" | "grid"
  event: {
    id: number
    title: string
    category: string
    description: string
    location: string
    attendees: number
    price: number | string
    image: string
    rating?: number | null
  }
  detailHref: string
  detailLabel?: string
  secondaryBadgeLabel?: string
  topLeftTagLabel?: string | null
  metaRows: EventCardMetaRow[]
  attendeesSuffix?: string
  imageGallery?: EventCardImage[]
  selectedImageIndex?: number
  onSelectImage?: (index: number) => void
  favoriteAction?: FavoriteAction
  shareAction?: ShareAction
  priceLabel?: string
}

const iconByType: Record<EventMetaIcon, typeof Calendar> = {
  calendar: Calendar,
  mapPin: MapPin,
  users: Users,
}

export function EventPresentationCard({
  variant = "preview",
  event,
  detailHref,
  detailLabel,
  secondaryBadgeLabel,
  topLeftTagLabel = null,
  metaRows,
  attendeesSuffix,
  imageGallery = [],
  selectedImageIndex = 0,
  onSelectImage,
  favoriteAction,
  shareAction,
  priceLabel,
}: EventPresentationCardProps) {
  const isGrid = variant === "grid"
  const hasGallery = imageGallery.length > 0 && Boolean(onSelectImage)
  const safeSelectedIndex = imageGallery[selectedImageIndex] ? selectedImageIndex : 0
  const selectedImage = hasGallery ? imageGallery[safeSelectedIndex].url : event.image
  const selectedRating = Number(event.rating)
  const hasRating = Number.isFinite(selectedRating) && selectedRating > 0
  const detailButtonLabel =
    detailLabel ||
    (isGrid ? EVENT_PRESENTATION_LABELS.detail.grid : EVENT_PRESENTATION_LABELS.detail.preview)

  return (
    <Card
      className={cn(
        "group overflow-hidden transition-all duration-500",
        isGrid
          ? "hover:shadow-2xl hover:-translate-y-2 bg-card/90 dark:bg-card/80 backdrop-blur-sm border border-border/70 dark:border-border/50 rounded-2xl"
          : "hover:shadow-2xl hover:-translate-y-2 bg-card/80 backdrop-blur-sm border-border h-full rounded-sm"
      )}
    >
      <div className="relative overflow-hidden">
        <div className={cn("w-full", isGrid ? "h-44 bg-slate-100 dark:bg-slate-800/70" : "h-48")}>
          <img
            src={selectedImage || "/placeholder.svg"}
            alt={event.title}
            loading="lazy"
            className={cn(
              "w-full object-cover transition-transform duration-500",
              isGrid ? "h-44 group-hover:scale-110" : "h-48 group-hover:scale-105"
            )}
          />

          {hasGallery && (
            <div className="absolute bottom-2 left-2 right-2 flex gap-2 overflow-x-auto p-1">
              {imageGallery.map((image, index) => (
                <img
                  key={`${image.id}-${index}`}
                  src={image.url || "/placeholder.svg"}
                  alt={image.alt}
                  onClick={() => onSelectImage(index)}
                  className={cn(
                    "h-10 w-16 object-cover rounded-md border shadow-sm cursor-pointer transition",
                    safeSelectedIndex === index
                      ? "border-white ring-2 ring-white/90"
                      : "border-border opacity-90 hover:opacity-100"
                  )}
                />
              ))}
            </div>
          )}

          {topLeftTagLabel ? (
            <span
              className={cn(
                "absolute top-4 left-4 text-xs font-semibold px-2 py-1",
                isGrid ? "rounded-full bg-blue-600 text-white" : "rounded-sm bg-gradient-to-r from-green-500 to-lime-400 text-white"
              )}
            >
              {topLeftTagLabel}
            </span>
          ) : (
            <Badge className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-lime-400 text-white rounded-sm">
              {event.category}
            </Badge>
          )}

          {hasRating && (
            <div
              className={cn(
                "absolute flex items-center gap-1 rounded-sm px-2 py-1",
                isGrid
                  ? "bottom-3 right-3 bg-card/90 backdrop-blur-sm"
                  : "top-3 right-3 bg-card/90 backdrop-blur-sm"
              )}
            >
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{selectedRating.toFixed(1)}</span>
            </div>
          )}

          {(favoriteAction || shareAction) && (
            <div className="absolute top-4 right-4 flex gap-2">
              {favoriteAction && (
                <Button
                  size="icon"
                  variant="secondary"
                  type="button"
                  className="h-9 w-9 bg-card/90 dark:bg-slate-800/90 dark:text-slate-100 backdrop-blur-sm rounded-full hover:bg-card dark:hover:bg-slate-700"
                  onClick={favoriteAction.onToggle}
                  disabled={Boolean(favoriteAction.isPending)}
                  aria-label={
                    favoriteAction.isActive
                      ? favoriteAction.activeAriaLabel
                      : favoriteAction.inactiveAriaLabel
                  }
                >
                  <Heart
                    className={cn(
                      "h-4 w-4 transition-colors",
                      favoriteAction.isActive ? "fill-red-500 text-red-500" : "text-foreground"
                    )}
                  />
                </Button>
              )}

              {shareAction && (
                <Button
                  size="icon"
                  variant="secondary"
                  type="button"
                  className="h-9 w-9 bg-card/90 dark:bg-slate-800/90 dark:text-slate-100 backdrop-blur-sm rounded-full hover:bg-card dark:hover:bg-slate-700"
                  onClick={shareAction.onShare}
                  aria-label={
                    shareAction.isCopied
                      ? shareAction.copiedAriaLabel || EVENT_PRESENTATION_LABELS.share.copied
                      : shareAction.defaultAriaLabel || EVENT_PRESENTATION_LABELS.share.copy
                  }
                  title={
                    shareAction.isCopied
                      ? shareAction.copiedAriaLabel || EVENT_PRESENTATION_LABELS.share.copied
                      : shareAction.defaultAriaLabel || EVENT_PRESENTATION_LABELS.share.copy
                  }
                >
                  {shareAction.isCopied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Share2 className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <CardContent className={cn(isGrid ? "px-6 pt-2 pb-6" : "p-6")}>
        <h3
          title={event.title}
          className={cn(
            "font-bold transition-colors line-clamp-2",
            isGrid
              ? "text-2xl leading-tight text-green-700 dark:text-lime-400 group-hover:text-lime-500 dark:group-hover:text-lime-500"
              : "text-xl text-foreground mb-2 group-hover:text-green-600"
          )}
        >
          {event.title}
        </h3>

        {isGrid && (
          <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
            <Badge className="rounded-full bg-emerald-500 text-white">{event.category}</Badge>
            {secondaryBadgeLabel && <Badge className="rounded-full bg-teal-500 text-white">{secondaryBadgeLabel}</Badge>}
            {hasRating && (
              <div className="ml-auto flex items-center gap-1 text-amber-500">
                <Star className="h-4 w-4 fill-amber-500" />
                <span className="text-sm font-semibold text-foreground">{selectedRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        )}

        <p className={cn("text-muted-foreground line-clamp-2", isGrid ? "mb-0" : "mb-4")}>{event.description}</p>

        <div className={cn("space-y-2", isGrid ? "my-4" : "mb-4")}>
          {metaRows.map((row, index) => {
            const Icon = iconByType[row.icon]
            const isUsersRow = row.icon === "users"
            const attendeesText = isUsersRow && attendeesSuffix ? `${row.text} ${attendeesSuffix}` : row.text

            return (
              <div key={`${row.icon}-${index}`} className="flex items-center text-sm text-muted-foreground">
                <Icon className={cn("h-4 w-4", isGrid ? "mr-3" : "mr-2 text-green-500")} />
                {attendeesText}
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-between">
          <div
            className={cn(
              "text-2xl font-bold",
              isGrid ? "text-green-600 dark:text-emerald-400" : "bg-gradient-to-r from-green-600 to-lime-500 bg-clip-text text-transparent"
            )}
          >
            {priceLabel || formatEventPrice(event.price)}
          </div>

          <Button
            asChild
            type="button"
            className={cn(
              isGrid
                ? "bg-rose-600 hover:bg-rose-500 dark:bg-rose-500 dark:hover:bg-rose-600 hover:scale-103 rounded-xl px-6 text-white"
                : "bg-gradient-to-r from-green-500 to-lime-400 hover:from-green-600 hover:to-lime-500 text-white group-hover:scale-105 transition-transform rounded-sm"
            )}
          >
            <Link href={detailHref}>{detailButtonLabel}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}