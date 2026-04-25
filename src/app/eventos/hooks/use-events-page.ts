import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { useFavorites } from "@/hooks/use-favorites"
import { buildEventUrl } from "@/lib/event-url"
import {
  filterAndSortEvents,
  normalizeEvent,
} from "@/app/eventos/lib/events-page-utils"
import type {
  CategoriaEvento,
  EventFilterType,
  EventCardItem,
  RawEvent,
} from "@/app/eventos/lib/events-page-types"

const FILTER_DEFAULTS: Record<EventFilterType, string> = {
  category: "all",
  time: "diurno",
  price: "asc",
  access: "gratis",
}

export function useEventsPage() {
  const [events, setEvents] = useState<EventCardItem[]>([])
  const [categories, setCategories] = useState<CategoriaEvento[]>([])
  const [selectedImageByEvent, setSelectedImageByEvent] = useState<Record<number, number>>({})
  const router = useRouter()

  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [isLogin, setIsLogin] = useState(true)

  const { favoriteIds, favoritePendingIds, toggleFavorite } = useFavorites(
    useCallback(() => { router.push("/auth?redirect=/eventos") }, [router])
  )

  const openAuthModal = useCallback((loginMode = true) => {
    setIsLogin(loginMode)
    setAuthModalOpen(true)
  }, [])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilterType, setSelectedFilterType] = useState<EventFilterType>("category")
  const [selectedFilterValue, setSelectedFilterValue] = useState(FILTER_DEFAULTS.category)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [expandedEventId, setExpandedEventId] = useState<number | null>(null)
  const [copiedEventId, setCopiedEventId] = useState<number | null>(null)

  const handleFilterTypeChange = useCallback((value: EventFilterType) => {
    setSelectedFilterType(value)
    setSelectedFilterValue(FILTER_DEFAULTS[value])
  }, [])

  const fetchEventos = useCallback(async () => {
    try {
      const response = await fetch("/api/events")
      const data = await response.json()
      const rawEvents: RawEvent[] =
        data && data.ok && Array.isArray(data.eventos)
          ? data.eventos
          : Array.isArray(data)
            ? data
            : []

      const visibleEvents = rawEvents.filter((event) => event?.estado === true)
      setEvents(visibleEvents.map(normalizeEvent))
    } catch (error) {
      console.error("Error fetching events:", error)
      setEvents([])
    }
  }, [])

  const fetchCategorias = useCallback(async () => {
    try {
      const response = await fetch("/api/categoria_evento")
      const data = await response.json()
      const list = Array.isArray(data) ? data : []

      const normalized = list
        .map((category: Record<string, unknown>) => ({
          id_categoria_evento: Number(category?.id_categoria_evento || 0),
          nombre: String(category?.nombre || "").trim(),
        }))
        .filter(
          (category: CategoriaEvento) =>
            category.id_categoria_evento > 0 && category.nombre.length > 0
        )

      setCategories(normalized)
    } catch (error) {
      console.error("Error fetching categories:", error)
      setCategories([])
    }
  }, [])



  useEffect(() => {
    void fetchEventos()
    void fetchCategorias()
  }, [fetchCategorias, fetchEventos])

  const handleShareEvent = useCallback(async (event: EventCardItem) => {
    const id = event.id_evento
    if (!id) return

    const detailPath = buildEventUrl(event.id_publico_evento, event.title, id)
    const relativePath = `${detailPath}?returnTo=${encodeURIComponent("/eventos#eventos-disponibles")}`
    const shareUrl = `${window.location.origin}${relativePath}`
    const eventTitle = String(event.raw?.nombre_evento ?? event.title ?? "Evento en Time2Go")

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

  const filteredEvents = useMemo(
    () => filterAndSortEvents(events, searchTerm, selectedFilterType, selectedFilterValue),
    [events, searchTerm, selectedFilterType, selectedFilterValue]
  )

  const topRatedEvents = useMemo(() => events.slice(0, 3), [events])

  const expandedEvent = useMemo(() => {
    if (!expandedEventId) return null
    return events.find((event) => event.id_evento === expandedEventId) || null
  }, [events, expandedEventId])

  return {
    events,
    categories,
    selectedImageByEvent,
    favoriteIds,
    favoritePendingIds,
    authModalOpen,
    isLogin,
    searchTerm,
    selectedFilterType,
    selectedFilterValue,
    isSearchFocused,
    expandedEventId,
    copiedEventId,
    filteredEvents,
    topRatedEvents,
    expandedEvent,
    setSelectedImageByEvent,
    setAuthModalOpen,
    setIsLogin,
    setSearchTerm,
    setSelectedFilterValue,
    setIsSearchFocused,
    setExpandedEventId,
    handleFilterTypeChange,
    openAuthModal,
    toggleFavorite,
    handleShareEvent,
  }
}
