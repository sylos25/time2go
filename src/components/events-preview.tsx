"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, ArrowRight, Star } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay } from "swiper/modules"

import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

interface FeaturedEvent {
  id: number
  categoryId: number
  title: string
  description: string
  date: string
  location: string
  attendees: number
  price: number | string
  image: string
  category: string
  rating?: number | null
  featuredAt?: string | null
}

type LandingCategory = {
  id: number
  nombre: string
}

type HomeConfigResponse = {
  ok: boolean
  selectedCategories?: LandingCategory[]
}

const swiperBreakpoints = {
  640: { slidesPerView: 2 },
  1024: { slidesPerView: 3 },
  1280: { slidesPerView: 4 },
}

export function EventsPreview() {
  const router = useRouter()
  const [featuredEvents, setFeaturedEvents] = useState<FeaturedEvent[]>([])
  const [landingCategories, setLandingCategories] = useState<LandingCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        const [eventsRes, homeConfigRes] = await Promise.all([
          fetch("/api/events"),
          fetch("/api/home-config"),
        ])

        const data = await eventsRes.json()
        const homeConfigData: HomeConfigResponse = await homeConfigRes.json().catch(() => ({ ok: false }))

        const categories = Array.isArray(homeConfigData.selectedCategories)
          ? homeConfigData.selectedCategories
              .map((category) => ({
                id: Number(category.id),
                nombre: String(category.nombre || ""),
              }))
              .filter((category) => category.id > 0 && category.nombre.length > 0)
          : []

        setLandingCategories(categories)
        const selectedCategoryIds = new Set(categories.map((category) => category.id))

        const rawEvents =
          data && data.ok && Array.isArray(data.eventos)
            ? data.eventos
            : Array.isArray(data)
              ? data
              : []

        const destacados = rawEvents
          .filter((event: any) => {
            if (event?.estado !== true || event?.destacado !== true) {
              return false
            }

            if (selectedCategoryIds.size === 0) {
              return true
            }

            const eventCategoryId = Number(
              event?.id_categoria_evento || event?.evento_categoria_id || event?.categoria?.id_categoria_evento || 0
            )

            return selectedCategoryIds.has(eventCategoryId)
          })
          .map((event: any) => {
            const firstImage =
              event.imagenes && event.imagenes.length
                ? event.imagenes[0].url_imagen_evento
                : "/placeholder.svg"

            const date = event.fecha_inicio
              ? new Date(event.fecha_inicio).toLocaleDateString("es-CO", {
                  day: "2-digit",
                  month: "short",
                })
              : "Sin fecha"

            let price: number | string = "Gratis"
            if (event.gratis_pago) {
              const prices = Array.isArray(event.valores)
                ? event.valores
                    .map((value: any) => Number(value?.precio_boleto ?? value?.valor ?? 0))
                    .filter((value: number) => Number.isFinite(value) && value > 0)
                : []
              price = prices.length ? Math.min(...prices) : 0
            }

            return {
              id: Number(event.id_evento),
              categoryId: Number(event.id_categoria_evento || event.evento_categoria_id || event.categoria?.id_categoria_evento || 0),
              title: String(event.nombre_evento || "Evento"),
              description: String(event.descripcion || ""),
              date,
              location: String(event.sitio?.nombre_sitio || event.nombre_sitio || "Ubicación por confirmar"),
              attendees: Number(event.cupo || 0),
              price,
              image: firstImage,
              category: String(event.categoria?.nombre || event.categoria_nombre || "Sin categoría"),
              rating: Number.isFinite(Number(event.promedio_valoracion)) ? Number(event.promedio_valoracion) : null,
              featuredAt: event.fecha_destacado || null,
            } as FeaturedEvent
          })
          .sort((a: FeaturedEvent, b: FeaturedEvent) => {
            const featuredA = a.featuredAt ? new Date(a.featuredAt).getTime() : 0
            const featuredB = b.featuredAt ? new Date(b.featuredAt).getTime() : 0
            return featuredB - featuredA
          })

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
        .filter((section) => section.events.length > 0)
    }

    return Object.entries(featuredByCategory)
      .map(([title, events], index) => ({
        title,
        events,
        delay: 4000 + index * 500,
      }))
      .sort((a, b) => b.events.length - a.events.length)
  }, [featuredByCategory, featuredEvents, landingCategories])

  const handleEventDetails = (eventId: number) => {
    router.push(`/eventos?expand=${eventId}`)
  }

  const EventCard = ({ event }: { event: FeaturedEvent }) => (
    <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-card/80 backdrop-blur-sm border-border overflow-hidden h-full rounded-sm">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <Badge className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-lime-400 text-white rounded-sm">
          {event.category}
        </Badge>
        {typeof event.rating === "number" && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-card/90 backdrop-blur-sm rounded-sm px-2 py-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium">{event.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-green-600 transition-colors">
          {event.title}
        </h3>
        <p className="text-muted-foreground mb-4 line-clamp-2">{event.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2 text-green-500" />
            {event.date}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2 text-green-500" />
            {event.location}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2 text-green-500" />
            {event.attendees.toLocaleString("es-CO")} interesados
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-lime-500 bg-clip-text text-transparent">
            {typeof event.price === "number" ? `$${event.price}` : event.price}
          </div>
          <Button
            onClick={() => handleEventDetails(event.id)}
            className="bg-gradient-to-r from-green-500 to-lime-400 hover:from-green-600 hover:to-lime-500 text-white group-hover:scale-105 transition-transform rounded-sm"
          >
            Ver detalles
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const CarouselSection = ({
    title,
    events,
    delay,
  }: {
    title: string
    events: FeaturedEvent[]
    delay: number
  }) => (
    <>
      {/* Título de sección más grande y estilizado */}
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

      <div className="mb-14 px-4 sm:px-6 lg:px-8">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1.2}
          loop={true}
          navigation={true}
          pagination={{ clickable: true }}
          autoplay={{ delay, disableOnInteraction: false }}
          breakpoints={swiperBreakpoints}
          className="events-swiper"
        >
          {events.map((event) => (
            <SwiperSlide key={event.id} className="pb-2">
              <EventCard event={event} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  )

  return (
    <section className="py-16 lg:py-24 pt-24 overflow-hidden">
      {loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-muted-foreground">Cargando eventos destacados...</p>
        </div>
      ) : categorySections.length > 0 ? (
        categorySections.map((section) => (
          <CarouselSection
            key={section.title}
            title={section.title}
            events={section.events}
            delay={section.delay}
          />
        ))
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
          padding-right: 32px !important;
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