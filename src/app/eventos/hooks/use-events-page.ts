import { useCallback, useEffect, useMemo, useState } from "react"

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
  location: "all",
}

export function useEventsPage() {
  const [events, setEvents] = useState<EventCardItem[]>([])
  const [categories, setCategories] = useState<CategoriaEvento[]>([])
  const [selectedImageByEvent, setSelectedImageByEvent] = useState<Record<number, number>>({})
  const [favoriteIds, setFavoriteIds] = useState<number[]>([])
  const [favoritePendingIds, setFavoritePendingIds] = useState<number[]>([])
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
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

  const fetchFavoritos = useCallback(async () => {
    try {
      const response = await fetch("/api/favoritos", { credentials: "include" })
      if (response.status === 401) {
        setFavoriteIds([])
        return
      }

      const data = await response.json()
      if (response.ok && data?.ok && Array.isArray(data.favoritos)) {
        setFavoriteIds(
          data.favoritos
            .map((value: unknown) => Number(value))
            .filter((value: number) => Number.isFinite(value))
        )
        return
      }

      setFavoriteIds([])
    } catch (error) {
      console.error("Error fetching favorites:", error)
      setFavoriteIds([])
    }
  }, [])

  useEffect(() => {
    void fetchEventos()
    void fetchCategorias()
  }, [fetchCategorias, fetchEventos])

  useEffect(() => {
    void fetchFavoritos()

    const onLogin = () => {
      void fetchFavoritos()
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === "token") {
        if (event.newValue) {
          void fetchFavoritos()
        } else {
          setFavoriteIds([])
        }
      }
    }

    window.addEventListener("user:login", onLogin)
    window.addEventListener("storage", onStorage)

    return () => {
      window.removeEventListener("user:login", onLogin)
      window.removeEventListener("storage", onStorage)
    }
  }, [fetchFavoritos])

  const openAuthModal = useCallback((loginMode = true) => {
    setIsLogin(loginMode)
    setAuthModalOpen(true)
  }, [])

  const toggleFavorite = useCallback(
    async (eventId: number) => {
      if (!Number.isFinite(eventId) || eventId <= 0) return
      if (favoritePendingIds.includes(eventId)) return

      const isFavorite = favoriteIds.includes(eventId)
      setFavoritePendingIds((prev) => [...prev, eventId])
      setFavoriteIds((prev) =>
        isFavorite ? prev.filter((id) => id !== eventId) : [...prev, eventId]
      )

      try {
        const response = await fetch(
          isFavorite ? `/api/favoritos?id_evento=${eventId}` : "/api/favoritos",
          {
            method: isFavorite ? "DELETE" : "POST",
            credentials: "include",
            headers: isFavorite ? undefined : { "Content-Type": "application/json" },
            body: isFavorite ? undefined : JSON.stringify({ id_evento: eventId }),
          }
        )

        if (response.status === 401) {
          setFavoriteIds((prev) => prev.filter((id) => id !== eventId))
          openAuthModal(true)
          return
        }

        const data = await response.json()
        if (!response.ok || !data?.ok) {
          throw new Error(data?.message || "No se pudo actualizar favoritos")
        }
      } catch (error) {
        console.error("Error updating favorite:", error)
        setFavoriteIds((prev) =>
          isFavorite ? [...prev, eventId] : prev.filter((id) => id !== eventId)
        )
      } finally {
        setFavoritePendingIds((prev) => prev.filter((id) => id !== eventId))
      }
    },
    [favoriteIds, favoritePendingIds, openAuthModal]
  )

  const handleShareEvent = useCallback(async (event: EventCardItem) => {
    const id = event.id_evento
    if (!id) return

    const relativePath = `/eventos/${id}?returnTo=${encodeURIComponent("/eventos#eventos-disponibles")}`
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

  const municipalities = useMemo(() => {
    const names = new Set<string>()
    events.forEach((event) => {
      const municipality = String(event.raw?.municipio?.nombre_municipio || "").trim()
      if (municipality) names.add(municipality)
    })
    return Array.from(names).sort((left, right) => left.localeCompare(right, "es"))
  }, [events])

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
    municipalities,
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
