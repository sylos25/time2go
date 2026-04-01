"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

export interface HeaderUser {
  token?: string
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

export function useHeaderSession(pathname: string) {
  const router = useRouter()
  const [user, setUser] = useState<HeaderUser | null>(null)
  const logoutTimerRef = useRef<number | null>(null)

  const parseJwtExp = useCallback((token: string) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      return payload.exp as number | undefined
    } catch {
      return undefined
    }
  }, [])

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

      localStorage.removeItem("token")
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
    [router],
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

  const scheduleAutoLogout = useCallback(
    (expiresAtSec?: number) => {
      if (logoutTimerRef.current) {
        window.clearTimeout(logoutTimerRef.current)
        logoutTimerRef.current = null
      }

      if (!expiresAtSec) return

      const ms = expiresAtSec * 1000 - Date.now()
      if (ms <= 0) {
        void performLogout()
        return
      }

      logoutTimerRef.current = window.setTimeout(() => {
        void performLogout()
      }, ms)
    },
    [performLogout],
  )

  useEffect(() => {
    const syncFromStorage = () => {
      const token = localStorage.getItem("token")
      const storedName = localStorage.getItem("userName")
      const storedUserPublicId = localStorage.getItem("userPublicId")
      const storedRole = localStorage.getItem("userRole")

      if (!token) return

      const exp = parseJwtExp(token)
      setUser({
        token,
        name: storedName || undefined,
        id_publico: storedUserPublicId || undefined,
        role: storedRole ? Number(storedRole) : undefined,
      })

      if (exp) scheduleAutoLogout(exp)
    }

    const validateSession = async () => {
      try {
        const token = localStorage.getItem("token")

        if (token) {
          const exp = parseJwtExp(token)
          if (exp && exp * 1000 <= Date.now()) {
            await performLogout()
            return
          }

          const storedName = localStorage.getItem("userName")
          setUser({ token, name: storedName || undefined })
          if (exp) scheduleAutoLogout(exp)

          try {
            const res = await fetch("/api/me", {
              headers: { Authorization: `Bearer ${token}` },
              credentials: "include",
            })

            if (!res.ok) {
              await clearSessionSilent()
              return
            }

            const data = await res.json()
            if (data?.ok && data.user) {
              const name =
                data.user.nombres ||
                data.user.correo ||
                storedName ||
                localStorage.getItem("userName") ||
                undefined
              const userPublicId =
                data.user.id_publico ||
                localStorage.getItem("userPublicId") ||
                undefined
              const roleNumber =
                data.user.id_rol !== undefined
                  ? Number(data.user.id_rol)
                  : undefined

              if (userPublicId) {
                localStorage.setItem("userPublicId", String(userPublicId))
              }
              if (roleNumber !== undefined) {
                localStorage.setItem("userRole", String(roleNumber))
              }

              setUser({
                token,
                name,
                id_publico: userPublicId,
                role: roleNumber,
              })
            } else {
              await clearSessionSilent()
            }
          } catch (err) {
            console.error("validateSession server check error", err)
          }

          return
        }

        const res = await fetch("/api/me", { credentials: "include" })
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
          const tokenFromStorage = localStorage.getItem("token") || undefined
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
            token: tokenFromStorage,
            name,
            id_publico: userPublicId,
            role: roleNumber,
          })

          const expFromToken = tokenFromStorage
            ? parseJwtExp(tokenFromStorage)
            : undefined
          if (expFromToken) scheduleAutoLogout(expFromToken)
        } else {
          await clearSessionSilent()
        }
      } catch (err) {
        console.error("validateSession error", err)
      }
    }

    syncFromStorage()
    void validateSession()

    const onLogin = (e: Event) => {
      const ev = e as CustomEvent
      const detail = ev.detail ?? {}
      const token = detail.token || localStorage.getItem("token")
      const name =
        detail.name ||
        detail.nombre ||
        localStorage.getItem("userName") ||
        "Usuario"
      const userPublicId =
        detail.id_publico || localStorage.getItem("userPublicId") || undefined
      const roleNumber =
        detail.id_rol !== undefined ? Number(detail.id_rol) : undefined

      if (token) localStorage.setItem("token", token)
      if (name) localStorage.setItem("userName", name)
      if (userPublicId) {
        localStorage.setItem("userPublicId", String(userPublicId))
      }
      if (roleNumber !== undefined) {
        localStorage.setItem("userRole", String(roleNumber))
      }

      setUser({ token, name, id_publico: userPublicId, role: roleNumber })

      const exp = detail.expiresAt || parseJwtExp(token || "")
      if (exp) scheduleAutoLogout(exp)
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === "token") {
        if (!e.newValue) {
          void performLogout()
        } else {
          syncFromStorage()
          void validateSession()
        }
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
    pathname,
    parseJwtExp,
    scheduleAutoLogout,
    clearSessionSilent,
    performLogout,
  ])

  return {
    user,
    performLogout,
    clearSessionSilent,
  }
}
