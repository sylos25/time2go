"use client"

import { useCallback, useEffect, useState } from "react"

import { normalizeMyEvent } from "@/app/mis-eventos/lib/mis-eventos-utils"
import type { MyEventItem, RawMyEvent } from "@/app/mis-eventos/lib/mis-eventos-types"

type EventsResponse = {
  ok?: boolean
  message?: string
  eventos?: RawMyEvent[]
}

function saveCreatorView(id: number) {
  if (typeof window === "undefined") return
  sessionStorage.setItem("creator-event-view", String(id))
}

export function useMyEventsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<MyEventItem[]>([])

  useEffect(() => {
    async function loadMyEvents() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/events?mine=true", {
          credentials: "include",
        })

        const payload: EventsResponse = await response.json().catch(() => ({}))
        if (!response.ok || !payload?.ok) {
          setError(String(payload?.message || "No se pudieron cargar tus eventos"))
          return
        }

        const normalizedEvents = Array.isArray(payload.eventos)
          ? payload.eventos.map(normalizeMyEvent)
          : []

        setEvents(normalizedEvents.filter((event) => event.id > 0))
      } catch {
        setError("Error al cargar tus eventos")
      } finally {
        setLoading(false)
      }
    }

    loadMyEvents()
  }, [])

  const beforeOpenEvent = useCallback((id: number) => {
    saveCreatorView(id)
  }, [])

  return {
    loading,
    error,
    events,
    beforeOpenEvent,
  }
}