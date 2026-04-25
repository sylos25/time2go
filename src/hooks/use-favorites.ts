import { useCallback, useEffect, useState } from "react"

/**
 * Shared hook for favorites state and toggle logic.
 * @param onRequireAuth - Called when the user must be authenticated (401 response).
 */
export function useFavorites(onRequireAuth: () => void) {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([])
  const [favoritePendingIds, setFavoritePendingIds] = useState<number[]>([])

  const fetchFavorites = useCallback(async () => {
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
    void fetchFavorites()

    const onLogin = () => {
      void fetchFavorites()
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === "token") {
        if (event.newValue) {
          void fetchFavorites()
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
  }, [fetchFavorites])

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
          onRequireAuth()
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
    [favoriteIds, favoritePendingIds, onRequireAuth]
  )

  return {
    favoriteIds,
    setFavoriteIds,
    favoritePendingIds,
    toggleFavorite,
  }
}
