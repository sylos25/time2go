"use client"

import { useMemo, useEffect } from "react"
import { useParams } from "next/navigation"
import { buildEventUrl } from "@/lib/event-url"

function normalizeId(param: string | string[] | undefined): number {
  const rawId = Array.isArray(param) ? param[0] : param
  return Number(rawId)
}

export function useMyEventRedirect() {
  const params = useParams<{ id?: string | string[] }>()

  const id = useMemo(() => normalizeId(params?.id), [params?.id])

  useEffect(() => {
    if (!id) {
      window.location.replace("/mis-eventos")
      return
    }

    const redirectToPublicEvent = async () => {
      try {
        const response = await fetch(`/api/events?id=${id}&mine=true`, {
          credentials: "include",
        })
        const payload = await response.json().catch(() => ({}))
        const event = payload?.ok ? payload.event : null

        if (typeof window !== "undefined") {
          const creatorSessionKey =
            event?.id_publico_evento && String(event.id_publico_evento).trim().length > 0
              ? String(event.id_publico_evento)
              : String(id)
          sessionStorage.setItem("creator-event-view", creatorSessionKey)
        }

        const href = buildEventUrl(
          event?.id_publico_evento ? String(event.id_publico_evento) : null,
          event?.nombre_evento ? String(event.nombre_evento) : "Evento",
          id
        )
        window.location.replace(href)
      } catch {
        window.location.replace("/eventos")
      }
    }

    void redirectToPublicEvent()
  }, [id])

  return { id }
}