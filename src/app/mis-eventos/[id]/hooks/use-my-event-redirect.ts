"use client"

import { useMemo, useEffect } from "react"
import { useParams } from "next/navigation"

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

    if (typeof window !== "undefined") {
      sessionStorage.setItem("creator-event-view", String(id))
    }

    window.location.replace(`/eventos/${id}`)
  }, [id])

  return { id }
}