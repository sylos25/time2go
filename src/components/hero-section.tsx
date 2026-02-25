"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

const heroSlides = [
  {
    id: 1,
    title: "Festival de la carranga",
    description: "Una experiencia única llena de ritmo, melodía y tradición musical",
    image: "/images/carranga2.jpg?height=600&width=800",
    category: "Música",
  },
  {
    id: 2,
    title: "Teatro Contemporáneo",
    description: "Obras maestras que despiertan emociones y reflexiones profundas",
    image: "/images/experimental-theater.jpg?height=600&width=800",
    category: "Teatro",
  },
  {
    id: 3,
    title: "Festival Gastronómico",
    description: "Sabores del mundo en un solo lugar, una aventura culinaria",
    image: "/images/img8.jpg?height=600&width=800",
    category: "Gastronomía",
  },
  {
    id: 4,
    title: "Arte y Cultura Urbana",
    description: "Expresiones artísticas que transforman espacios y comunidades",
    image: "/images/img11.jpg?height=600&width=800",
    category: "Arte",
  },
]

export function HeroSection() {
  const router = useRouter()

  const handleSlideEventDetails = (slideId: number) => {
    router.push(`/eventos?expand=${slideId}`)
  }

  return (
    <section className="pt-16 lg:pt-20 pb-12 lg:pb-20 overflow-hidden">
      {/* Full-width: usa w-screen + translate para romper cualquier padding del padre */}
      <div className="relative mt-8 w-screen left-1/2 -translate-x-1/2">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          className="hero-swiper w-full h-[400px] sm:h-[500px] lg:h-[650px] xl:h-[750px]"
          loop={true}
          effect="fade"
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          navigation={true}
        >
          {heroSlides.map((slide) => (
            <SwiperSlide key={slide.id} className="relative group">
              <img
                src={slide.image || "/placeholder.svg"}
                alt={slide.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Contenido alineado al max-width de la app */}
              <div className="absolute bottom-8 left-0 right-0 text-white">
                <div className="max-w-7xl mx-auto px-8">
                  <div className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
                    {slide.category}
                  </div>

                  <h3 className="text-2xl lg:text-4xl xl:text-5xl font-bold mb-3 leading-tight">{slide.title}</h3>

                  <p className="text-base lg:text-lg opacity-90 max-w-2xl leading-relaxed">{slide.description}</p>

                  <Button
                    onClick={() => handleSlideEventDetails(slide.id)}
                    variant="secondary"
                    className="mt-6 bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all duration-300"
                  >
                    Ver Detalles
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .hero-swiper .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.6) !important;
          opacity: 1 !important;
          width: 12px !important;
          height: 12px !important;
          transition: all 0.3s ease !important;
        }
        
        .hero-swiper .swiper-pagination-bullet-active {
          background: white !important;
          transform: scale(1.3) !important;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.8) !important;
        }
        
        /* Flechas muy transparentes */
        .hero-swiper .swiper-button-next,
        .hero-swiper .swiper-button-prev {
          width: 56px !important;
          height: 56px !important;
          background: rgba(255, 255, 255, 0.07) !important;
          backdrop-filter: blur(4px) !important;
          border-radius: 50% !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          color: rgba(255, 255, 255, 0.6) !important;
          transition: all 0.3s ease !important;
        }
        
        .hero-swiper .swiper-button-next:hover,
        .hero-swiper .swiper-button-prev:hover {
          background: rgba(255, 255, 255, 0.15) !important;
          color: white !important;
          transform: scale(1.1) !important;
        }
         
        .hero-swiper .swiper-button-next:after,
        .hero-swiper .swiper-button-prev:after {
          font-size: 18px !important;
          font-weight: bold !important;
        }
      `}</style>
    </section>
  )
}