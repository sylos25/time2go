"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "swiper/css/effect-fade"

const heroSlides = [
  {
    id: 1,
    title: "Festival de Jazz Internacional",
    description: "Una experiencia única llena de ritmo, melodía y tradición musical",
    image: "/images/jazz-festival.jpg?height=600&width=800",
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
    <section className="pt-16 lg:pt-20 pb-8 lg:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Content */}
        <div className="text-center mb-8 lg:mb-16">
          <h1 className="text-4xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Descubre Eventos
            <span className="block bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Increíbles
            </span>
          </h1>

          <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Encuentra y disfruta de los mejores eventos, festivales y experiencias culturales cerca de ti. Conecta con
            tu pasión y vive momentos únicos.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/eventos">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-8 py-3"
              >
                Explorar Eventos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Enhanced Carousel */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay, EffectFade]}
            className="w-full max-w-6xl mx-auto h-[350px] sm:h-[450px] lg:h-[550px] xl:h-[650px] rounded-3xl overflow-hidden shadow-2xl"
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

                {/* Enhanced Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-8 left-8 right-8 text-white">
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
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <style jsx global>{`
        .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.6) !important;
          opacity: 1 !important;
          width: 12px !important;
          height: 12px !important;
          transition: all 0.3s ease !important;
        }
        
        .swiper-pagination-bullet-active {
          background: white !important;
          transform: scale(1.3) !important;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.8) !important;
        }
        
        .swiper-button-next,
        .swiper-button-prev {
          width: 56px !important;
          height: 56px !important;
          background: rgba(255, 255, 255, 0.15) !important;
          backdrop-filter: blur(12px) !important;
          border-radius: 50% !important;
          border: 2px solid rgba(255, 255, 255, 0.2) !important;
          color: white !important;
          transition: all 0.3s ease !important;
        }
        
        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          background: rgba(255, 255, 255, 0.25) !important;
          transform: scale(1.1) !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important;
        }
        
        .swiper-button-next:after,
        .swiper-button-prev:after {
          font-size: 20px !important;
          font-weight: bold !important;
        }
      `}</style>
    </section>
  )
}
