"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, ArrowRight, Star } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay } from "swiper/modules"

import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

const featuredEvents = [
  // Carrusel 1 - Música (6 eventos)
  { id: 1,  title: "Festival de Jazz Internacional",  description: "Una noche mágica con los mejores artistas de jazz",          date: "15 Abril", location: "Teatro Nacional",      attendees: 1250, price: 45, image: "/images/img9.jpg",  category: "Música",      rating: 4.8 },
  { id: 2,  title: "Concierto de Rock Alternativo",   description: "Las mejores bandas emergentes en un solo escenario",        date: "18 Abril", location: "Auditorio Central",    attendees: 2500, price: 35, image: "/images/img9.jpg",  category: "Música",      rating: 4.7 },
  { id: 3,  title: "Festival Electrónica",            description: "Los mejores DJs internacionales",                           date: "22 Abril", location: "Plaza de Eventos",     attendees: 3000, price: 50, image: "/images/img9.jpg",  category: "Música",      rating: 4.9 },
  { id: 4,  title: "Noche de Salsa",                  description: "Baile y música latina toda la noche",                       date: "25 Abril", location: "Club Latino",          attendees: 800,  price: 20, image: "/images/img9.jpg",  category: "Música",      rating: 4.6 },
  { id: 13, title: "Concierto Sinfónico",             description: "La orquesta filarmónica presenta clásicos inmortales",      date: "28 Abril", location: "Palacio de la Música", attendees: 1800, price: 55, image: "/images/img9.jpg",  category: "Música",      rating: 4.9 },
  { id: 14, title: "Festival de Reggaeton",           description: "Los artistas más populares del género urbano",              date: "1 Mayo",   location: "Estadio Nacional",     attendees: 5000, price: 65, image: "/images/img9.jpg",  category: "Música",      rating: 4.7 },
  // Carrusel 2 - Arte y Cultura (6 eventos)
  { id: 5,  title: "Exposición de Arte Moderno",      description: "Obras contemporáneas de artistas reconocidos",             date: "20 Abril", location: "Museo de Arte",        attendees: 800,  price: 15, image: "/images/img10.jpg", category: "Arte",        rating: 4.6 },
  { id: 6,  title: "Festival de Cine Independiente",  description: "Cortometrajes y documentales exclusivos",                  date: "23 Abril", location: "Cinemateca Nacional",  attendees: 600,  price: 18, image: "/images/img10.jpg", category: "Cultura",     rating: 4.7 },
  { id: 7,  title: "Arte y Cultura Urbana",           description: "Expresiones artísticas callejeras",                        date: "27 Abril", location: "Distrito Creativo",    attendees: 1500, price: 10, image: "/images/img10.jpg", category: "Arte",        rating: 4.8 },
  { id: 8,  title: "Feria de Artesanías",             description: "Lo mejor del arte tradicional local",                      date: "29 Abril", location: "Plaza Central",        attendees: 2000, price: 5,  image: "/images/img10.jpg", category: "Cultura",     rating: 4.5 },
  { id: 15, title: "Teatro Contemporáneo",            description: "Obras vanguardistas de dramaturgos locales",               date: "3 Mayo",   location: "Teatro Municipal",     attendees: 450,  price: 30, image: "/images/img10.jpg", category: "Cultura",     rating: 4.8 },
  { id: 16, title: "Noche de Poesía",                 description: "Recitales y spoken word de poetas emergentes",             date: "5 Mayo",   location: "Café Literario",       attendees: 200,  price: 12, image: "/images/img10.jpg", category: "Cultura",     rating: 4.6 },
  // Carrusel 3 - Gastronomía (6 eventos)
  { id: 9,  title: "Festival Gastronómico",           description: "Sabores del mundo en un solo lugar",                       date: "25 Abril", location: "Plaza Central",        attendees: 2000, price: 25, image: "/images/img8.jpg",  category: "Gastronomía", rating: 4.9 },
  { id: 10, title: "Noche de Vinos",                  description: "Cata de vinos premium con sommelier",                      date: "28 Abril", location: "Bodega del Centro",    attendees: 150,  price: 60, image: "/images/img8.jpg",  category: "Gastronomía", rating: 4.8 },
  { id: 11, title: "Mercado Gourmet",                 description: "Productos artesanales y especialidades",                   date: "30 Abril", location: "Mercado Municipal",    attendees: 1800, price: 12, image: "/images/img8.jpg",  category: "Gastronomía", rating: 4.7 },
  { id: 12, title: "Festival de Street Food",         description: "Los mejores food trucks de la ciudad",                     date: "2 Mayo",   location: "Parque Central",       attendees: 2500, price: 15, image: "/images/img8.jpg",  category: "Gastronomía", rating: 4.8 },
  { id: 17, title: "Masterclass de Cocina",           description: "Aprende técnicas de chefs internacionales",               date: "7 Mayo",   location: "Escuela Culinaria",    attendees: 100,  price: 80, image: "/images/img8.jpg",  category: "Gastronomía", rating: 4.9 },
  { id: 18, title: "Festival de Cerveza Artesanal",   description: "Las mejores cervecerías locales en un evento",            date: "10 Mayo",  location: "Jardín Cervecero",     attendees: 3000, price: 35, image: "/images/img8.jpg",  category: "Gastronomía", rating: 4.7 },
]

const carousel1 = featuredEvents.slice(0, 6)
const carousel2 = featuredEvents.slice(6, 12)
const carousel3 = featuredEvents.slice(12, 18)

const swiperBreakpoints = {
  640: { slidesPerView: 2 },
  1024: { slidesPerView: 3 },
  1280: { slidesPerView: 4 },
}

export function EventsPreview() {
  const router = useRouter()

  const handleEventDetails = (eventId: number) => {
    router.push(`/eventos?expand=${eventId}`)
  }

  const EventCard = ({ event }: { event: (typeof featuredEvents)[0] }) => (
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
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-card/90 backdrop-blur-sm rounded-sm px-2 py-1">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-medium">{event.rating}</span>
        </div>
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
            {event.attendees.toLocaleString()} interesados
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-lime-500 bg-clip-text text-transparent">
            ${event.price}
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
    events: typeof featuredEvents
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
      <CarouselSection title="Música" events={carousel1} delay={4000} />
      <CarouselSection title="Arte y Cultura" events={carousel2} delay={4500} />
      <CarouselSection title="Gastronomía" events={carousel3} delay={5000} />

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