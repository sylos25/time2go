"use client"

import { useEffect, useState, useCallback } from "react"

export type SessionEndReason = "expired" | "session_replaced"

export function useSessionExpiry() {
  const [isSessionExpired, setIsSessionExpired] = useState(false)
  const [reason, setReason] = useState<SessionEndReason>("expired")

  const checkSessionValidity = useCallback(async () => {
    try {
      const response = await fetch("/api/me", { credentials: "include" })
      
      if (response.status === 401) {
        const payload = await response.json().catch(() => null)
        if (payload?.code === "session_replaced") {
          setReason("session_replaced")
        } else {
          setReason("expired")
        }
        setIsSessionExpired(true)
      } else if (response.ok) {
        setReason("expired")
        setIsSessionExpired(false)
      }
    } catch (error) {
      console.error("Error checking session validity:", error)
    }
  }, [])

  useEffect(() => {
    const userPublicId = typeof window !== "undefined" ? localStorage.getItem("userPublicId") : null
    if (!userPublicId) {
      setIsSessionExpired(false)
      return
    }

    // Verificar inmediatamente
    checkSessionValidity()

    // Verificar cada 5 minutos (300000ms)
    const interval = setInterval(checkSessionValidity, 5 * 60 * 1000)

    // También verificar cuando el documento recupera el foco (usuario vuelve a la pestaña)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkSessionValidity()
      }
    }

    const handleSessionReplaced = () => {
      setReason("session_replaced")
      setIsSessionExpired(true)
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("session:replaced", handleSessionReplaced)

    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("session:replaced", handleSessionReplaced)
    }
  }, [checkSessionValidity])

  const resetExpiry = useCallback(() => {
    setIsSessionExpired(false)
  }, [])

  return { isSessionExpired, reason, checkSessionValidity, resetExpiry }
}
