"use client"

/**
 * HeroCarousel — Carrusel propio sin dependencias externas.
 *
 * Exporta tres variantes independientes:
 *   <HeroCarouselFade   slides={slides} />   → Estilo A: Fade Editorial
 *   <HeroCarouselSlide  slides={slides} />   → Estilo B+C: Slide Moderno con numeración
 *   <HeroCarouselZoom   slides={slides} />   → Estilo C: Zoom Dramático
 *
 * Todas comparten:
 *   - Autoplay (5 s, pausa en hover)
 *   - Navegación por flechas y bullets
 *   - Swipe táctil básico
 *   - Accesibilidad (aria-label, role, keyboard)
 *   - Proporción responsive alineada al dashboard (16:9 → 2:1 → 21:10)
 */

import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react"

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type CarouselSlide = {
  id: number
  url: string
  order: number
}

type CarouselProps = {
  slides: CarouselSlide[]
  interval?: number // ms entre slides (default 5000)
}

// ─── Hook compartido ──────────────────────────────────────────────────────────

function useCarousel(count: number, interval = 5000) {
  const [current, setCurrent] = useState(0)
  const [prev, setPrev] = useState<number | null>(null)
  const [direction, setDirection] = useState<"next" | "prev">("next")
  const hovered = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const go = useCallback(
    (to: number, dir: "next" | "prev" = "next") => {
      if (count <= 0) return
      setPrev(current)
      setDirection(dir)
      setCurrent((to + count) % count)
    },
    [current, count]
  )

  const next = useCallback(() => go((current + 1) % count, "next"), [current, count, go])
  const back = useCallback(() => go((current - 1 + count) % count, "prev"), [current, count, go])

  // Autoplay
  useEffect(() => {
    if (count <= 1) return
    const tick = () => {
      if (!hovered.current) next()
    }
    timerRef.current = setInterval(tick, interval)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [next, count, interval])

  // Reset prev después de la animación
  useEffect(() => {
    const t = setTimeout(() => setPrev(null), 800)
    return () => clearTimeout(t)
  }, [current])

  const pauseHover = () => { hovered.current = true }
  const resumeHover = () => { hovered.current = false }

  return { current, prev, direction, go, next, back, pauseHover, resumeHover }
}

// ─── Hook de swipe táctil ─────────────────────────────────────────────────────

function useSwipe(onNext: () => void, onPrev: () => void) {
  const startX = useRef<number | null>(null)

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    startX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (startX.current === null) return
    const delta = startX.current - e.changedTouches[0].clientX
    if (Math.abs(delta) > 40) delta > 0 ? onNext() : onPrev()
    startX.current = null
  }

  return { onTouchStart, onTouchEnd }
}

// ─── Dimensiones responsive compartidas ──────────────────────────────────────

const viewportClass = "relative w-full aspect-[16/9] overflow-hidden"

// ══════════════════════════════════════════════════════════════════════════════
// ESTILO A — Fade Editorial
// Fundido limpio entre imágenes. Bordes redondeados, overlay mínimo,
// bullets tipo guión, flechas casi invisibles que aparecen en hover.
// ══════════════════════════════════════════════════════════════════════════════

export function HeroCarouselFade({ slides, interval = 5000 }: CarouselProps) {
  const { current, prev, go, next, back, pauseHover, resumeHover } = useCarousel(slides.length, interval)
  const swipe = useSwipe(next, back)

  if (slides.length === 0) return null

  return (
    <div
      className="group mx-auto w-full max-w-[1280px] overflow-hidden rounded-2xl shadow-xl"
      onMouseEnter={pauseHover}
      onMouseLeave={resumeHover}
      role="region"
      aria-label="Carrusel de imágenes"
      {...swipe}
    >
      <div className={viewportClass}>

        {/* Slides */}
        {slides.map((slide, i) => {
          const isActive = i === current
          const isLeaving = i === prev
          return (
            <div
              key={slide.id}
              aria-hidden={!isActive}
              className="absolute inset-0 transition-opacity"
              style={{
                opacity: isActive ? 1 : isLeaving ? 0 : 0,
                transitionDuration: isActive ? "900ms" : "600ms",
                transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                zIndex: isActive ? 2 : isLeaving ? 1 : 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.url}
                alt={`Imagen ${i + 1} del carrusel`}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "low"}
                className="w-full h-full object-cover"
                draggable={false}
              />
              {/* Overlay degradado inferior sutil */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
            </div>
          )
        })}

        {/* Flechas */}
        <button
          onClick={back}
          aria-label="Anterior"
          className="
            absolute left-4 top-1/2 -translate-y-1/2 z-10
            w-10 h-10 flex items-center justify-center
            rounded-full bg-white/20 text-white backdrop-blur-sm
            border border-white/30
            opacity-0 group-hover:opacity-100
            hover:bg-white/40 hover:scale-105
            transition-all duration-300
          "
          onMouseEnter={pauseHover}
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 15l-5-5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={next}
          aria-label="Siguiente"
          className="
            absolute right-4 top-1/2 -translate-y-1/2 z-10
            w-10 h-10 flex items-center justify-center
            rounded-full bg-white/20 text-white backdrop-blur-sm
            border border-white/30
            hover:bg-white/40 hover:scale-105
            transition-all duration-300
          "
          onMouseEnter={pauseHover}
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Bullets tipo guión */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i, i > current ? "next" : "prev")}
              aria-label={`Ir a imagen ${i + 1}`}
              className="transition-all duration-500 ease-out rounded-full bg-white"
              style={{
                width: i === current ? "28px" : "8px",
                height: "8px",
                opacity: i === current ? 1 : 0.45,
              }}
            />
          ))}
        </div>

      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// ESTILO B+C — Slide Moderno con numeración
// Deslizamiento horizontal con easing suave + controles numerados debajo,
// combinando la navegación del estilo B con la identidad visual del C.
// ══════════════════════════════════════════════════════════════════════════════

export function HeroCarouselSlide({ slides, interval = 5000 }: CarouselProps) {
  const { current, prev, direction, next, back, pauseHover, resumeHover } = useCarousel(slides.length, interval)
  const swipe = useSwipe(next, back)

  if (slides.length === 0) return null

  return (
    <div
      className="mx-auto w-full max-w-[1280px]"
      onMouseEnter={pauseHover}
      onMouseLeave={resumeHover}
      role="region"
      aria-label="Carrusel de imágenes"
    >
      {/* Área principal */}
      <div
        className={`${viewportClass} rounded-2xl overflow-hidden shadow-2xl bg-neutral-900`}
        {...swipe}
      >
        {slides.map((slide, i) => {
          const isActive = i === current
          const isPrev = i === prev

          let translateX = direction === "next" ? "100%" : "-100%"
          let transition = "none"
          let zIndex = 0

          if (isActive) {
            translateX = "0%"
            transition = "transform 620ms cubic-bezier(0.77, 0, 0.18, 1)"
            zIndex = 2
          } else if (isPrev) {
            translateX = direction === "next" ? "-100%" : "100%"
            transition = "transform 620ms cubic-bezier(0.77, 0, 0.18, 1)"
            zIndex = 1
          }

          return (
            <div
              key={slide.id}
              aria-hidden={!isActive}
              className="absolute inset-0"
              style={{
                transform: `translateX(${translateX})`,
                transition,
                zIndex,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.url}
                alt={`Imagen ${i + 1} del carrusel`}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "low"}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
          )
        })}

        {/* Flechas */}
        <button
          onClick={back}
          aria-label="Anterior"
          className="
            absolute left-4 top-1/2 -translate-y-1/2 z-10
            w-11 h-11 flex items-center justify-center
            rounded-full bg-black/35 text-white backdrop-blur-md
            border border-white/20
            hover:bg-black/55 hover:scale-105
            transition-all duration-200
          "
          onMouseEnter={pauseHover}
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M13 15l-5-5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={next}
          aria-label="Siguiente"
          className="
            absolute right-4 top-1/2 -translate-y-1/2 z-10
            w-11 h-11 flex items-center justify-center
            rounded-full bg-black/35 text-white backdrop-blur-md
            border border-white/20
            hover:bg-black/55 hover:scale-105
            transition-all duration-200
          "
          onMouseEnter={pauseHover}
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M7 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Contador */}
        <div className="absolute bottom-4 right-5 z-10 text-white/80 text-sm font-medium tabular-nums select-none">
          {current + 1} / {slides.length}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// ESTILO C — Zoom Dramático
// El slide activo aparece con un zoom-in suave desde el centro mientras el
// anterior se aleja con un zoom-out. Efecto de escala + fade cruzado.
// Bullets grandes con número. Solo hay una imagen visible a la vez.
// ══════════════════════════════════════════════════════════════════════════════

export function HeroCarouselZoom({ slides, interval = 5000 }: CarouselProps) {
  const { current, prev, go, next, back, pauseHover, resumeHover } = useCarousel(slides.length, interval)
  const swipe = useSwipe(next, back)

  if (slides.length === 0) return null

  return (
    <div
      className="mx-auto w-full max-w-[1280px] rounded-2xl overflow-hidden shadow-2xl"
      onMouseEnter={pauseHover}
      onMouseLeave={resumeHover}
      role="region"
      aria-label="Carrusel de imágenes"
      {...swipe}
    >
      <div className={viewportClass + " bg-neutral-950"}>

        {/* Slides con zoom cruzado */}
        {slides.map((slide, i) => {
          const isActive = i === current
          const isLeaving = i === prev

          let opacity = 0
          let scale = 1.06
          if (isActive) { opacity = 1; scale = 1 }
          else if (isLeaving) { opacity = 0; scale = 0.96 }

          return (
            <div
              key={slide.id}
              aria-hidden={!isActive}
              className="absolute inset-0"
              style={{
                opacity,
                transform: `scale(${scale})`,
                transition: "opacity 750ms cubic-bezier(0.4,0,0.2,1), transform 900ms cubic-bezier(0.4,0,0.2,1)",
                zIndex: isActive ? 2 : isLeaving ? 1 : 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.url}
                alt={`Imagen ${i + 1} del carrusel`}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "low"}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
          )
        })}

        {/* Flechas rectangulares con borde */}
        <button
          onClick={back}
          aria-label="Anterior"
          className="
            absolute left-5 top-1/2 -translate-y-1/2 z-10
            px-3 py-2.5 flex items-center gap-1.5
            rounded-md bg-white/10 text-white backdrop-blur-sm
            border border-white/20 text-sm font-medium
            hover:bg-white/20 hover:border-white/40
            transition-all duration-200
          "
          onMouseEnter={pauseHover}
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M13 15l-5-5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={next}
          aria-label="Siguiente"
          className="
            absolute right-5 top-1/2 -translate-y-1/2 z-10
            px-3 py-2.5 flex items-center gap-1.5
            rounded-md bg-white/10 text-white backdrop-blur-sm
            border border-white/20 text-sm font-medium
            hover:bg-white/20 hover:border-white/40
            transition-all duration-200
          "
          onMouseEnter={pauseHover}
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M7 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Bullets con número */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i, i > current ? "next" : "prev")}
              aria-label={`Ir a imagen ${i + 1}`}
              className="rounded-full flex items-center justify-center font-semibold transition-all duration-400"
              style={{
                width: i === current ? "32px" : "26px",
                height: i === current ? "32px" : "26px",
                fontSize: i === current ? "12px" : "11px",
                background: i === current ? "rgb(101,163,13)" : "rgba(255,255,255,0.18)",
                color: "white",
                boxShadow: i === current ? "0 0 18px rgba(101,163,13,0.55)" : "none",
                backdropFilter: "blur(6px)",
                border: i === current ? "2px solid rgba(255,255,255,0.5)" : "1.5px solid rgba(255,255,255,0.2)",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Barra de progreso */}
        <div className="absolute bottom-0 left-0 right-0 z-10 h-[3px] bg-white/10">
          <div
            className="h-full bg-[rgb(101,163,13)]"
            style={{
              width: `${((current + 1) / slides.length) * 100}%`,
              transition: "width 700ms cubic-bezier(0.4,0,0.2,1)",
            }}
          />
        </div>

      </div>
    </div>
  )
}
