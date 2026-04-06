"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import type {
  FavoriteEvent,
  RawEventsPayload,
  RawFavoritePayload,
} from "@/app/mis-favoritos/lib/mis-favoritos-types"
import {
  filterFavoriteEvents,
  formatFavoritesSummary,
  getFavoriteIds,
} from "@/app/mis-favoritos/lib/mis-favoritos-utils"

export function useFavoritesPage() {
  const router = useRouter()

  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [favoritos, setFavoritos] = useState<FavoriteEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<number | null>(null)

  const openAuthModal = useCallback((loginMode = true) => {
    setIsLogin(loginMode)
    setAuthModalOpen(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false)
  }, [])

  const toggleAuthMode = useCallback(() => {
    setIsLogin((prev) => !prev)
  }, [])

  useEffect(() => {
    async function loadFavoritos() {
      try {
        setLoading(true)
        setError(null)

        const favoritesResponse = await fetch("/api/favoritos", { credentials: "include" })
        if (favoritesResponse.status === 401) {
          openAuthModal(true)
          setFavoritos([])
          return
        }

        const favoritesData: RawFavoritePayload = await favoritesResponse
          .json()
          .catch(() => ({}))

        if (!favoritesResponse.ok || !favoritesData?.ok) {
          throw new Error(favoritesData?.message || "No se pudieron cargar tus favoritos")
        }

        const favoriteIds = getFavoriteIds(favoritesData.favoritos)
        if (favoriteIds.length === 0) {
          setFavoritos([])
          return
        }

        const eventsResponse = await fetch("/api/events", { credentials: "include" })
        const eventsData: RawEventsPayload = await eventsResponse.json().catch(() => ({}))

        if (!eventsResponse.ok || !eventsData?.ok || !Array.isArray(eventsData.eventos)) {
          throw new Error(eventsData?.message || "No se pudieron cargar los eventos favoritos")
        }

        setFavoritos(filterFavoriteEvents(eventsData.eventos, favoriteIds))
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : "No se pudieron cargar tus favoritos"
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadFavoritos()
  }, [openAuthModal])

  const handleRemoveFavorite = useCallback(
    async (eventId: number) => {
      try {
        setRemovingId(eventId)
        setError(null)

        const response = await fetch(`/api/favoritos?id_evento=${eventId}`, {
          method: "DELETE",
          credentials: "include",
        })

        if (response.status === 401) {
          openAuthModal(true)
          return
        }

        const payload = await response.json().catch(() => ({}))
        if (!response.ok || !payload?.ok) {
          throw new Error(payload?.message || "No se pudo eliminar el favorito")
        }

        setFavoritos((prev) => prev.filter((event) => event.id_evento !== eventId))
      } catch (removeError) {
        const message = removeError instanceof Error ? removeError.message : "No se pudo eliminar el favorito"
        setError(message)
      } finally {
        setRemovingId(null)
      }
    },
    [openAuthModal]
  )

  const goToHome = useCallback(() => {
    router.push("/")
  }, [router])

  const goToEvents = useCallback(() => {
    router.push("/eventos")
  }, [router])

  const goToEventDetail = useCallback(
    (eventId: number) => {
      router.push(`/eventos/${eventId}`)
    },
    [router]
  )

  return {
    authModalOpen,
    isLogin,
    favoritos,
    loading,
    error,
    removingId,
    summaryText: formatFavoritesSummary(loading, favoritos.length),
    openAuthModal,
    closeAuthModal,
    toggleAuthMode,
    goToHome,
    goToEvents,
    goToEventDetail,
    handleRemoveFavorite,
  }
}