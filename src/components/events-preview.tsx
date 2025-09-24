"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, ArrowRight, Star } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const featuredEvents = [
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
    id: 3,
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
]

export function EventsPreview() {
  const router = useRouter()

  const handleEventDetails = (eventId: number) => {
    router.push(`/eventos?expand=${eventId}`)
  }

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium mb-6">
            <Calendar className="w-4 h-4 mr-2" />
            Próximos eventos destacados
          </div>

          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
            Eventos que no te puedes
            <span className="block bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text from">perder</span>
          </h2>

          <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
            Descubre los eventos más esperados y reserva tu lugar antes de que se agoten
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredEvents.map((event) => (
            <Card
              key={event.id}
              className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-white/50 overflow-hidden"
            >
              <div className="relative">
                <img
                  src={event.image || "/placeholder.svg"}
                  alt={event.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <Badge className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  {event.category}
                </Badge>
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium">{event.rating}</span>
                </div>
              </div>

              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {event.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    {event.date}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2 text-blue-500" />
                    {event.attendees.toLocaleString()} interesados
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-blue-600">${event.price}</div>
                  <Button
                    onClick={() => handleEventDetails(event.id)}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-700 hover:to-cyan-700 group-hover:scale-105 transition-transform"
                  >
                    Ver detalles
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link href="/eventos">
            <Button
              size="lg"
              variant="outline"
              className="bg-white/80 backdrop-blur-sm border-2 border-blue-200 hover:border-blue-600 hover:text-blue-600 transition-all duration-300 px-8 py-3"
            >
              Ver todos los eventos
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
