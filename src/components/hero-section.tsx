"use client"

import { useEffect, useState } from "react"
import {
  type CarouselSlide,
  HeroCarouselSlide,  // Estilo B+C — Desplazamiento + numeración
} from "@/components/hero-carousel"

type HomeConfigResponse = {
  ok: boolean
  heroImages?: CarouselSlide[]
}

export function HeroSection() {
  const [slides, setSlides] = useState<CarouselSlide[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    let mounted = true

    const loadHeroImages = async () => {
      try {
        const res = await fetch("/api/home-config", {
          signal: controller.signal,
          cache: "no-store",
        })

        const data: HomeConfigResponse = await res.json().catch(() => ({ ok: false }))

        if (!res.ok || !data.ok || !Array.isArray(data.heroImages)) return

        const images = data.heroImages
          .map((item) => ({
            id: Number(item.id),
            url: String(item.url || ""),
            order: Number(item.order),
          }))
          .filter((item) => item.id > 0 && item.url.length > 0)
          .sort((a, b) => a.order - b.order || a.id - b.id)

        if (mounted) setSlides(images)
      } catch (error) {
        if ((error as Error)?.name !== "AbortError") {
          console.error("Error cargando imágenes del hero:", error)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadHeroImages()

    return () => {
      mounted = false
      controller.abort()
    }
  }, [])

  if (loading) {
    return (
      <section className="overflow-hidden px-3 pt-16 pb-12 sm:px-4 lg:px-6 lg:pt-20 lg:pb-20">
        <div className="mx-auto mt-8 w-full max-w-[2520px]">
          <div className="w-full aspect-[16/9] sm:aspect-[2/1] lg:aspect-[21/10] rounded-2xl bg-muted animate-pulse" />
        </div>
      </section>
    )
  }

  if (slides.length === 0) return null

  return (
    <section className="overflow-hidden px-3 pt-16 pb-12 sm:px-4 lg:px-6 lg:pt-20 lg:pb-20">
      <div className="mx-auto mt-8 w-full max-w-[2520px]">
        {/* Variantes disponibles en hero-carousel.tsx: Fade, Slide, Zoom */}
        <HeroCarouselSlide slides={slides} />
      </div>
    </section>
  )
}
