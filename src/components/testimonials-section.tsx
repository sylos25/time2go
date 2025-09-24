"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Anny Mariana",
    role: "Organizadora de eventos",
    avatar: "/placeholder.svg?height=60&width=60",
    rating: 5,
    text: "Time2Go ha revolucionado la forma en que organizo mis eventos. La plataforma es intuitiva y el soporte es excepcional.",
  },
  {
    id: 2,
    name: "Angel Velazco",
    role: "Asistente frecuente",
    avatar: "/placeholder.svg?height=60&width=60",
    rating: 5,
    text: "He descubierto eventos increíbles que nunca habría encontrado por mi cuenta. La recomendación personalizada es perfecta.",
  },
  {
    id: 3,
    name: "Kevin Bermudez",
    role: "Artista independiente",
    avatar: "/placeholder.svg?height=60&width=60",
    rating: 5,
    text: "Como artista, Time2Go me ha ayudado a conectar con mi audiencia y vender más tickets para mis presentaciones.",
  },
]

export function TestimonialsSection() {
  return (
    <section className="bg-blue-50 py-16 lg:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">

          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
            Reseñas de
            <span className="block bg-gradient-to-r  from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              usuarios satisfechos
            </span>
          </h2>

          <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
            Miles de personas ya confían en Time2Go para descubrir y crear experiencias memorables
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white/90 backdrop-blur-sm border-white/50"
            >
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Quote className="h-8 w-8 text-blue-600 opacity-50" />
                </div>

                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.text}"</p>

                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
