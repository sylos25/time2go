"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "@/lib/auth-client"

export function useSessionExpiry() {
  const { data: session } = useSession()
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
    // Solo verificar si hay una sesión activa
    if (!session?.user) {
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
  }, [session?.user, checkSessionValidity])

  const resetExpiry = useCallback(() => {
    setIsSessionExpired(false)
  }, [])

  return { isSessionExpired, checkSessionValidity, resetExpiry }
}
