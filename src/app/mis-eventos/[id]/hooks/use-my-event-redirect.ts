"use client"

import { useMemo, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

function normalizeId(param: string | string[] | undefined): number {
  const rawId = Array.isArray(param) ? param[0] : param
  return Number(rawId)
}

export function useMyEventRedirect() {
  const router = useRouter()
  const params = useParams<{ id?: string | string[] }>()

  const id = useMemo(() => normalizeId(params?.id), [params?.id])

  useEffect(() => {
    if (!id) {
      router.replace("/mis-eventos")
      return
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem("creator-event-view", String(id))
    }

    router.replace(`/eventos/${id}`)
  }, [id, router])

  return { id }
}