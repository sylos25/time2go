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
  // Carrusel 1 - Música
  {
    id: 1,
    title: "Festival de Jazz Internacional",
    description: "Una noche mágica con los mejores artistas de jazz",
    date: "15 Abril",
    location: "Teatro Nacional",
    attendees: 1250,
    price: 45,
    image: "/images/jazz-festival.jpg?height=200&width=300",
    category: "Música",
    rating: 4.8,
  },
  {
    id: 2,
    title: "Concierto de Rock Alternativo",
    description: "Las mejores bandas emergentes en un solo escenario",
    date: "18 Abril",
    location: "Auditorio Central",
    attendees: 2500,
    price: 35,
    image: "/rock-concert.png",
    category: "Música",
    rating: 4.7,
  },
  {
    id: 3,
    title: "Festival Electrónica",
    description: "Los mejores DJs internacionales",
    date: "22 Abril",
    location: "Plaza de Eventos",
    attendees: 3000,
    price: 50,
    image: "/electronic-music-festival.jpg",
    category: "Música",
    rating: 4.9,
  },
  {
    id: 4,
    title: "Noche de Salsa",
    description: "Baile y música latina toda la noche",
    date: "25 Abril",
    location: "Club Latino",
    attendees: 800,
    price: 20,
    image: "/salsa-dancing.png",
    category: "Música",
    rating: 4.6,
  },
  // Carrusel 2 - Arte y Cultura
  {
    id: 5,
    title: "Exposición de Arte Moderno",
    description: "Obras contemporáneas de artistas reconocidos",
    date: "20 Abril",
    location: "Museo de Arte",
    attendees: 800,
    price: 15,
    image: "/images/img10.jpg?height=200&width=300",
    category: "Arte",
    rating: 4.6,
  },
  {
    id: 6,
    title: "Festival de Cine Independiente",
    description: "Cortometrajes y documentales exclusivos",
    date: "23 Abril",
    location: "Cinemateca Nacional",
    attendees: 600,
    price: 18,
    image: "/cinema-festival.jpg",
    category: "Cultura",
    rating: 4.7,
  },
  {
    id: 7,
    title: "Arte y Cultura Urbana",
    description: "Expresiones artísticas callejeras",
    date: "27 Abril",
    location: "Distrito Creativo",
    attendees: 1500,
    price: 10,
    image: "/images/img11.jpg?height=200&width=300",
    category: "Arte",
    rating: 4.8,
  },
  {
    id: 8,
    title: "Feria de Artesanías",
    description: "Lo mejor del arte tradicional local",
    date: "29 Abril",
    location: "Plaza Central",
    attendees: 2000,
    price: 5,
    image: "/handicrafts-fair.jpg",
    category: "Cultura",
    rating: 4.5,
  },
  // Carrusel 3 - Gastronomía y Más
  {
    id: 9,
    title: "Festival Gastronómico",
    description: "Sabores del mundo en un solo lugar",
    date: "25 Abril",
    location: "Plaza Central",
    attendees: 2000,
    price: 25,
    image: "/images/img8.jpg?height=200&width=300",
    category: "Gastronomía",
    rating: 4.9,
  },
  {
    id: 10,
    title: "Noche de Vinos",
    description: "Cata de vinos premium con sommelier",
    date: "28 Abril",
    location: "Bodega del Centro",
    attendees: 150,
    price: 60,
    image: "/wine-tasting.png",
    category: "Gastronomía",
    rating: 4.8,
  },
  {
    id: 11,
    title: "Mercado Gourmet",
    description: "Productos artesanales y especialidades",
    date: "30 Abril",
    location: "Mercado Municipal",
    attendees: 1800,
    price: 12,
    image: "/gourmet-market.jpg",
    category: "Gastronomía",
    rating: 4.7,
  },
  {
    id: 12,
    title: "Festival de Street Food",
    description: "Los mejores food trucks de la ciudad",
    date: "2 Mayo",
    location: "Parque Central",
    attendees: 2500,
    price: 15,
    image: "/street-food-festival.jpg",
    category: "Gastronomía",
    rating: 4.8,
  },
]

const carousel1 = featuredEvents.slice(0, 4)
const carousel2 = featuredEvents.slice(4, 8)
const carousel3 = featuredEvents.slice(8, 12)

export function EventsPreview() {
  const router = useRouter()

  const handleEventDetails = (eventId: number) => {
    router.push(`/eventos?expand=${eventId}`)
  }

  const EventCard = ({ event }: { event: (typeof featuredEvents)[0] }) => (
    <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-white/50 overflow-hidden h-full rounded-sm">
      <div className="relative">
        <img
          src={event.image || "/placeholder.svg"}
          alt={event.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <Badge className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 via-purple-500 to-violet-500 text-white rounded-sm">
          {event.category}
        </Badge>
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-sm px-2 py-1">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-medium">{event.rating}</span>
        </div>
      </div>

      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
          {event.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-purple-500" />
            {event.date}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-purple-500" />
            {event.location}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2 text-purple-500" />
            {event.attendees.toLocaleString()} interesados
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
            ${event.price}
          </div>
          <Button
            onClick={() => handleEventDetails(event.id)}
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-violet-600 hover:from-blue-700 hover:via-purple-700 hover:to-violet-700 group-hover:scale-105 transition-transform rounded-sm"
          >
            Ver detalles
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <section className="py-16 lg:py-24 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
              Música
            </span>
          </h3>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            navigation={true}
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="events-swiper"
          >
            {carousel1.map((event) => (
              <SwiperSlide key={event.id}>
                <EventCard event={event} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
              Arte y Cultura
            </span>
          </h3>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            navigation={true}
            pagination={{ clickable: true }}
            autoplay={{ delay: 4500, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="events-swiper"
          >
            {carousel2.map((event) => (
              <SwiperSlide key={event.id}>
                <EventCard event={event} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
              Gastronomía
            </span>
          </h3>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            navigation={true}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="events-swiper"
          >
            {carousel3.map((event) => (
              <SwiperSlide key={event.id}>
                <EventCard event={event} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="text-center">
          <Link href="/eventos">
            <Button
              size="lg"
              variant="outline"
              className="bg-white/80 backdrop-blur-sm border-2 border-purple-200 hover:border-purple-600 hover:text-purple-600 transition-all duration-300 px-8 py-3 rounded-sm"
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
        }
        
        .events-swiper .swiper-button-next,
        .events-swiper .swiper-button-prev {
          width: 44px !important;
          height: 44px !important;
          background: white !important;
          border-radius: 4px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
          color: #7c3aed !important;
          transition: all 0.3s ease !important;
        }
        
        .events-swiper .swiper-button-next:hover,
        .events-swiper .swiper-button-prev:hover {
          background: linear-gradient(to right, #2563eb, #7c3aed, #8b5cf6) !important;
          color: white !important;
          transform: scale(1.1) !important;
        }
        
        .events-swiper .swiper-button-next:after,
        .events-swiper .swiper-button-prev:after {
          font-size: 16px !important;
          font-weight: bold !important;
        }
        
        .events-swiper .swiper-pagination-bullet {
          background: #cbd5e1 !important;
          opacity: 1 !important;
          width: 10px !important;
          height: 10px !important;
          border-radius: 2px !important;
        }
        
        .events-swiper .swiper-pagination-bullet-active {
          background: linear-gradient(to right, #2563eb, #7c3aed, #8b5cf6) !important;
          width: 24px !important;
          border-radius: 3px !important;
        }
      `}</style>
    </section>
  )
}
