"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

export interface HeaderUser {
  name?: string
  firstName?: string
  id_publico?: string
  role?: number
}

interface ClearSessionOptions {
  notify?: boolean
  redirectToHome?: boolean
  callServerLogout?: boolean
}

export function useHeaderSession() {
  const router = useRouter()
  const [user, setUser] = useState<HeaderUser | null>(null)
  /** Primera validación con /api/me terminó (éxito o fallo). */
  const [sessionResolved, setSessionResolved] = useState(false)
  const logoutTimerRef = useRef<number | null>(null)
  const ACCESS_EXP_KEY = "accessExpiresAt"

  const clearSessionState = useCallback(
    async ({
      notify = false,
      redirectToHome = false,
      callServerLogout = false,
    }: ClearSessionOptions = {}) => {
      if (callServerLogout) {
        try {
          await fetch("/api/logout", { method: "POST", credentials: "include" })
        } catch (err) {
          console.error("logout request error", err)
        }
      }

      localStorage.removeItem(ACCESS_EXP_KEY)
      localStorage.removeItem("userName")
      localStorage.removeItem("userRole")
      localStorage.removeItem("userPublicId")

      setUser(null)
      if (logoutTimerRef.current) {
        window.clearTimeout(logoutTimerRef.current)
        logoutTimerRef.current = null
      }

      if (notify) {
        window.dispatchEvent(new CustomEvent("user:logout"))
      }

      if (redirectToHome) {
        router.push("/")
      }
    },
    [router, ACCESS_EXP_KEY],
  )

  const performLogout = useCallback(async () => {
    await clearSessionState({
      notify: true,
      redirectToHome: true,
      callServerLogout: true,
    })
  }, [clearSessionState])

  const clearSessionSilent = useCallback(async () => {
    await clearSessionState()
  }, [clearSessionState])

  const handleSessionReplaced = useCallback(async () => {
    localStorage.setItem("sessionTerminationReason", "session_replaced")
    window.dispatchEvent(new CustomEvent("session:replaced"))
    await clearSessionState({
      notify: true,
      redirectToHome: false,
      callServerLogout: false,
    })
    router.push("/auth?session_replaced=1")
  }, [clearSessionState, router])

  const refreshAccessToken = useCallback(async (): Promise<{ expiresAt: number | null; sessionReplaced: boolean }> => {
    try {
      const res = await fetch("/api/refresh", {
        method: "POST",
        credentials: "include",
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        if (payload?.code === "session_replaced") {
          return { expiresAt: null, sessionReplaced: true }
        }
        return { expiresAt: null, sessionReplaced: false }
      }
      const data = await res.json()
      const nextExp = data?.expiresAt ? Number(data.expiresAt) : null
      if (nextExp && Number.isFinite(nextExp)) {
        localStorage.setItem(ACCESS_EXP_KEY, String(nextExp))
        return { expiresAt: nextExp, sessionReplaced: false }
      }
      return { expiresAt: null, sessionReplaced: false }
    } catch (err) {
      console.error("refresh token error", err)
      return { expiresAt: null, sessionReplaced: false }
    }
  }, [ACCESS_EXP_KEY])

  const scheduleAutoLogout = useCallback(
    (expiresAtSec?: number) => {
      if (logoutTimerRef.current) {
        window.clearTimeout(logoutTimerRef.current)
        logoutTimerRef.current = null
      }

      if (!expiresAtSec) return

      const refreshLeadMs = 60 * 1000
      const ms = expiresAtSec * 1000 - Date.now() - refreshLeadMs
      if (ms <= 0) {
        void (async () => {
          const refreshResult = await refreshAccessToken()
          if (refreshResult.expiresAt) {
            scheduleAutoLogout(refreshResult.expiresAt)
            return
          }
          if (refreshResult.sessionReplaced) {
            await handleSessionReplaced()
            return
          }
          await performLogout()
        })()
        return
      }

      logoutTimerRef.current = window.setTimeout(() => {
        void (async () => {
          const refreshResult = await refreshAccessToken()
          if (refreshResult.expiresAt) {
            scheduleAutoLogout(refreshResult.expiresAt)
            return
          }
          if (refreshResult.sessionReplaced) {
            await handleSessionReplaced()
            return
          }
          await performLogout()
        })()
      }, ms)
    },
    [handleSessionReplaced, performLogout, refreshAccessToken],
  )

  useEffect(() => {
    const syncFromStorage = () => {
      const storedName = localStorage.getItem("userName")
      const storedUserPublicId = localStorage.getItem("userPublicId")
      const storedRole = localStorage.getItem("userRole")
      const storedAccessExp = Number(localStorage.getItem(ACCESS_EXP_KEY) || "0")

      if (!storedName && !storedUserPublicId && !storedRole) return

      setUser({
        name: storedName || undefined,
        id_publico: storedUserPublicId || undefined,
        role: storedRole ? Number(storedRole) : undefined,
      })

      if (Number.isFinite(storedAccessExp) && storedAccessExp > 0) {
        scheduleAutoLogout(storedAccessExp)
      }
    }

    const validateSession = async () => {
      try {
        let res = await fetch("/api/me", { credentials: "include" })
        if (!res.ok && res.status === 401) {
          const refreshResult = await refreshAccessToken()
          if (refreshResult.sessionReplaced) {
            await handleSessionReplaced()
            return
          }
          if (refreshResult.expiresAt) {
            scheduleAutoLogout(refreshResult.expiresAt)
            res = await fetch("/api/me", { credentials: "include" })
          }
        }

        if (!res.ok) {
          await clearSessionSilent()
          return
        }

        const data = await res.json()
        if (data?.ok && data.user) {
          const name =
            data.user.nombres ||
            data.user.correo ||
            localStorage.getItem("userName") ||
            undefined
          const userPublicId =
            data.user.id_publico || localStorage.getItem("userPublicId") || undefined
          const roleNumber =
            data.user.id_rol !== undefined ? Number(data.user.id_rol) : undefined

          if (userPublicId) {
            localStorage.setItem("userPublicId", String(userPublicId))
          }
          if (roleNumber !== undefined) {
            localStorage.setItem("userRole", String(roleNumber))
          }

          setUser({
            name,
            id_publico: userPublicId,
            role: roleNumber,
          })

          const expFromStorage = Number(localStorage.getItem(ACCESS_EXP_KEY) || "0")
          if (Number.isFinite(expFromStorage) && expFromStorage > 0) {
            scheduleAutoLogout(expFromStorage)
          }
        } else {
          await clearSessionSilent()
        }
      } catch (err) {
        console.error("validateSession error", err)
        await clearSessionSilent()
      } finally {
        setSessionResolved(true)
      }
    }

    syncFromStorage()
    void validateSession()

    const onLogin = (e: Event) => {
      const ev = e as CustomEvent
      const detail = ev.detail ?? {}
      const name =
        detail.name ||
        detail.nombre ||
        localStorage.getItem("userName") ||
        "Usuario"
      const userPublicId =
        detail.id_publico || localStorage.getItem("userPublicId") || undefined
      const roleNumber =
        detail.id_rol !== undefined ? Number(detail.id_rol) : undefined

      if (name) localStorage.setItem("userName", name)
      if (userPublicId) {
        localStorage.setItem("userPublicId", String(userPublicId))
      }
      if (roleNumber !== undefined) {
        localStorage.setItem("userRole", String(roleNumber))
      }
      if (detail.expiresAt) {
        localStorage.setItem(ACCESS_EXP_KEY, String(detail.expiresAt))
      }

      setUser({ name, id_publico: userPublicId, role: roleNumber })
      setSessionResolved(true)

      const exp = detail.expiresAt
      if (exp) scheduleAutoLogout(exp)
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === ACCESS_EXP_KEY) {
        syncFromStorage()
        void validateSession()
      }

      if (e.key === "userName") {
        const storedName = localStorage.getItem("userName")
        setUser((prev) =>
          prev ? { ...prev, name: storedName || prev.name } : prev,
        )
      }

      if (e.key === "userRole") {
        const storedRole = localStorage.getItem("userRole")
        setUser((prev) =>
          prev
            ? {
                ...prev,
                role: storedRole !== null ? Number(storedRole) : prev.role,
              }
            : prev,
        )
      }
    }

    window.addEventListener("user:login", onLogin)
    window.addEventListener("storage", onStorage)

    return () => {
      window.removeEventListener("user:login", onLogin)
      window.removeEventListener("storage", onStorage)
    }
  }, [
    scheduleAutoLogout,
    clearSessionSilent,
    handleSessionReplaced,
    performLogout,
    refreshAccessToken,
    ACCESS_EXP_KEY,
  ])

  return {
    user,
    performLogout,
    clearSessionSilent,
    sessionResolved,
  }
}
