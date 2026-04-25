"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useFavorites } from "@/hooks/use-favorites"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay } from "swiper/modules"

import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import {
  extractRawEvents,
  isFeaturedEventInLanding,
  mapSelectedCategories,
  mapServerEventToFeaturedEvent,
  sortFeaturedEventsByDate,
  toGridPresentationDataFromFeaturedEvent,
  type FeaturedEvent,
  type HomeConfigResponse,
  type LandingCategory,
} from "@/components/events/event-presentation-adapters"
import { EVENT_PRESENTATION_LABELS } from "@/components/events/event-presentation-constants"
import { EventPresentationCard } from "@/components/events/event-presentation-card"
import { buildEventUrl } from "@/lib/event-url"

const swiperBreakpoints = {
  640: { slidesPerView: 2 },
  1024: { slidesPerView: 3 },
  1280: { slidesPerView: 3 },
}

export function EventsPreview() {
  const [featuredEvents, setFeaturedEvents] = useState<FeaturedEvent[]>([])
  const [landingCategories, setLandingCategories] = useState<LandingCategory[]>([])
  const [selectedImageByEvent, setSelectedImageByEvent] = useState<Record<number, number>>({})
  const [copiedEventId, setCopiedEventId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const router = useRouter()

  const { favoriteIds, favoritePendingIds, toggleFavorite } = useFavorites(
    useCallback(() => { router.push("/auth?redirect=/") }, [router])
  )

  const handleToggleFavorite = useCallback(
    (eventId: number) => void toggleFavorite(eventId),
    [toggleFavorite]
  )

  const handleSelectImage = useCallback((eventId: number, index: number) => {
    if (!Number.isFinite(eventId) || eventId <= 0 || index < 0) {
      return
    }

    setSelectedImageByEvent((prev) => ({
      ...prev,
      [eventId]: index,
    }))
  }, [])



  const handleShareEvent = useCallback(async (event: FeaturedEvent) => {
    const id = event.id
    if (!Number.isFinite(id) || id <= 0) {
      return
    }

    const detailPath = buildEventUrl(event.idPublico, event.title, id)
    const relativePath = `${detailPath}?returnTo=${encodeURIComponent("/#eventos-destacados")}`
    const shareUrl = `${window.location.origin}${relativePath}`
    const eventTitle = String(event.title || "Evento en Time2Go")

    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        try {
          await navigator.share({
            title: eventTitle,
            text: `Mira este evento: ${eventTitle}`,
            url: shareUrl,
          })
          return
        } catch (shareError: unknown) {
          if ((shareError as { name?: string })?.name === "AbortError") {
            return
          }
        }
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
      } else {
        const textarea = document.createElement("textarea")
        textarea.value = shareUrl
        textarea.setAttribute("readonly", "")
        textarea.style.position = "fixed"
        textarea.style.left = "-9999px"
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand("copy")
        document.body.removeChild(textarea)
      }

      setCopiedEventId(id)
      window.setTimeout(() => {
        setCopiedEventId((current) => (current === id ? null : current))
      }, 2000)
    } catch (error) {
      console.error("No se pudo copiar el enlace del evento", error)
      alert("No se pudo copiar el enlace del evento")
    }
  }, [])

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        const [eventsRes, homeConfigRes] = await Promise.all([
          fetch("/api/events"),
          fetch("/api/home-config"),
        ])

        const data = await eventsRes.json()
        const homeConfigData: HomeConfigResponse = await homeConfigRes.json().catch(() => ({ ok: false }))

        const categories = mapSelectedCategories(homeConfigData)

        setLandingCategories(categories)
        const selectedCategoryIds = new Set(categories.map((category) => category.id))

        const destacados = sortFeaturedEventsByDate(
          extractRawEvents(data)
            .filter((event) => isFeaturedEventInLanding(event, selectedCategoryIds))
            .map((event) => mapServerEventToFeaturedEvent(event))
        )

        setFeaturedEvents(destacados)
      } catch (error) {
        console.error("Error cargando eventos destacados:", error)
        setFeaturedEvents([])
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedEvents()
  }, [])

  const featuredByCategory = useMemo(() => {
    return featuredEvents.reduce<Record<string, FeaturedEvent[]>>((acc, event) => {
      const key = event.category || "Sin categoría"
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(event)
      return acc
    }, {})
  }, [featuredEvents])

  const categorySections = useMemo(() => {
    if (landingCategories.length > 0) {
      return landingCategories
        .map((category, index) => ({
          title: category.nombre,
          events: featuredEvents.filter((event) => event.categoryId === category.id),
          delay: 4000 + index * 500,
        }))
    }

    return Object.entries(featuredByCategory)
      .map(([title, events], index) => ({
        title,
        events,
        delay: 4000 + index * 500,
      }))
      .sort((a, b) => b.events.length - a.events.length)
  }, [featuredByCategory, featuredEvents, landingCategories])

  const EmptyCarouselSection = ({ title }: { title: string }) => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
      <div className="rounded-sm border border-border bg-card/70 p-6 text-center text-muted-foreground">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs mt-2">No hay eventos destacados en esta categoría aún.</p>
      </div>
    </div>
  )

  const CarouselSection = ({
    title,
    events,
    delay,
  }: {
    title: string
    events: FeaturedEvent[]
    delay: number
  }) => {
    return (
      <>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="flex items-center gap-4">
            {/* Línea decorativa izquierda */}
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-green-500 to-lime-400 flex-shrink-0" />
            <div>
              <h3 className="text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-green-600 to-lime-500 bg-clip-text text-transparent">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5 font-medium tracking-wide uppercase">
                Eventos destacados
              </p>
            </div>
          </div>
        </div>

        <div className="mb-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1.2}
          loop={events.length > 1}
          centeredSlides={false}
          centerInsufficientSlides={true}
          navigation={true}
          pagination={{ clickable: true }}
          autoplay={{ delay, disableOnInteraction: false }}
          breakpoints={swiperBreakpoints}
          className="events-swiper"
        >
          {events.map((event) => {
            const presentationData = toGridPresentationDataFromFeaturedEvent(event)
            const detailHref = buildEventUrl(event.idPublico, event.title, event.id)

            const isFavorite = favoriteIds.includes(event.id)
            const isFavoritePending = favoritePendingIds.includes(event.id)
            const isLinkCopied = copiedEventId === event.id

            return (
              <SwiperSlide key={event.id} className="pb-2">
                <EventPresentationCard
                  variant="grid"
                  event={presentationData.event}
                  detailHref={detailHref}
                  detailLabel={EVENT_PRESENTATION_LABELS.detail.grid}
                  secondaryBadgeLabel={presentationData.secondaryBadgeLabel}
                  topLeftTagLabel={presentationData.topLeftTagLabel}
                  metaRows={presentationData.metaRows}
                  imageGallery={presentationData.imageGallery}
                  selectedImageIndex={selectedImageByEvent[event.id] ?? 0}
                  onSelectImage={(index) => handleSelectImage(event.id, index)}
                  favoriteAction={{
                    isActive: isFavorite,
                    isPending: isFavoritePending,
                    onToggle: () => void handleToggleFavorite(event.id),
                    activeAriaLabel: EVENT_PRESENTATION_LABELS.favorite.remove,
                    inactiveAriaLabel: EVENT_PRESENTATION_LABELS.favorite.add,
                  }}
                  shareAction={{
                    isCopied: isLinkCopied,
                    onShare: () => void handleShareEvent(event),
                    copiedAriaLabel: EVENT_PRESENTATION_LABELS.share.copied,
                    defaultAriaLabel: EVENT_PRESENTATION_LABELS.share.copy,
                  }}
                  priceLabel={presentationData.priceLabel}
                />
              </SwiperSlide>
            )
          })}
        </Swiper>
      </div>
    </>
  )
  }

  return (
    <section id="eventos-destacados" className="py-16 lg:py-24 pt-24 overflow-hidden">
      {loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-muted-foreground">Cargando eventos destacados...</p>
        </div>
      ) : categorySections.length > 0 ? (
        categorySections.map((section) =>
          section.events.length === 0 ? (
            <EmptyCarouselSection key={section.title} title={section.title} />
          ) : (
            <CarouselSection
              key={section.title}
              title={section.title}
              events={section.events}
              delay={section.delay}
            />
          )
        )
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14">
          <div className="rounded-sm border border-border bg-card/70 p-6 text-center text-muted-foreground">
            No hay eventos destacados disponibles por ahora.
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Link href="/eventos">
            <Button
              size="lg"
              variant="outline"
              className="bg-card/80 backdrop-blur-sm border-2 border-border hover:border-green-500 hover:text-green-600 transition-all duration-300 px-8 py-3 rounded-sm"
            >
              Ver todos los eventos
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

<style jsx global>{`
        .events-swiper {
          padding-bottom: 50px !important;
          padding-left: 20px !important;
          padding-right: 20px !important;
        }

        .events-swiper .swiper-button-next,
        .events-swiper .swiper-button-prev {
          width: 44px !important;
          height: 44px !important;
          background: hsl(var(--card) / 0.78) !important;
          backdrop-filter: blur(4px) !important;
          border-radius: 4px !important;
          box-shadow: 0 2px 8px hsl(var(--foreground) / 0.12) !important;
          color: #16a34a !important;
          border: 1px solid hsl(var(--border)) !important;
          transition: all 0.3s ease !important;
        }

        .events-swiper .swiper-button-next:hover,
        .events-swiper .swiper-button-prev:hover {
          background: linear-gradient(to right, #16a34a, #84cc16) !important;
          color: white !important;
          transform: scale(1.1) !important;
          border-color: transparent !important;
        }

        .events-swiper .swiper-button-next:after,
        .events-swiper .swiper-button-prev:after {
          font-size: 16px !important;
          font-weight: bold !important;
        }

        .events-swiper .swiper-pagination-bullet {
          background: hsl(var(--muted-foreground) / 0.35) !important;
          opacity: 1 !important;
          width: 10px !important;
          height: 10px !important;
          border-radius: 2px !important;
        }

        .events-swiper .swiper-pagination-bullet-active {
          background: linear-gradient(to right, #16a34a, #84cc16) !important;
          width: 24px !important;
          border-radius: 3px !important;
        }
      `}</style>
    </section>
  )
}