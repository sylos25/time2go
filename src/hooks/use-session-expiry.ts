"use client"

import { useEffect, useState, useCallback } from "react"

export function useSessionExpiry() {
  const [isSessionExpired, setIsSessionExpired] = useState(false)

  const checkSessionValidity = useCallback(async () => {
    try {
      const response = await fetch("/api/me")
      
      if (response.status === 401) {
        // Token ha vencido
        setIsSessionExpired(true)
      } else if (response.ok) {
        // Token sigue siendo válido
        setIsSessionExpired(false)
      }
    } catch (error) {
      console.error("Error checking session validity:", error)
    }
  }, [])

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) {
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

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [checkSessionValidity])

  const resetExpiry = useCallback(() => {
    setIsSessionExpired(false)
  }, [])

  return { isSessionExpired, checkSessionValidity, resetExpiry }
}
