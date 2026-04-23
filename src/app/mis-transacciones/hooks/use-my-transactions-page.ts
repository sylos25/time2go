"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import type {
  TransaccionItem,
  TransaccionesResponse,
} from "@/app/mis-transacciones/lib/mis-transacciones-types"
import {
  getSummaryText,
  getToken,
  normalizeTransactions,
} from "@/app/mis-transacciones/lib/mis-transacciones-utils"

export function useMyTransactionsPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [transacciones, setTransacciones] = useState<TransaccionItem[]>([])

  useEffect(() => {
    async function loadTransactions() {
      try {
        setLoading(true)
        setError(null)

        const token = getToken()
        const response = await fetch("/api/mis-transacciones", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        })

        const payload: TransaccionesResponse = await response
          .json()
          .catch(() => ({ ok: false, message: "Respuesta invalida del servidor" }))

        if (response.status === 401) {
          router.replace("/auth?redirect=/mis-transacciones")
          return
        }

        if (response.status === 403) {
          router.replace("/")
          return
        }

        if (!response.ok || payload.ok !== true) {
          throw new Error(payload.message || "No se pudieron cargar tus transacciones")
        }

        setTransacciones(normalizeTransactions(payload.transacciones))
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Error al cargar tus transacciones"
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [router])

  const goToHome = useCallback(() => {
    router.push("/")
  }, [router])

  const summaryText = useMemo(
    () => getSummaryText(loading, transacciones.length),
    [loading, transacciones.length]
  )

  return {
    loading,
    error,
    transacciones,
    summaryText,
    goToHome,
  }
}
