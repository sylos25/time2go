"use client"

import { useEffect, useRef, useState } from "react"

interface GoogleLoginButtonProps {
  onSuccess: () => void
}

type GoogleCredentialResponse = {
  credential?: string
}

type GoogleIdentity = {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string
        callback: (response: GoogleCredentialResponse) => void | Promise<void>
      }) => void
      renderButton: (
        element: HTMLElement,
        options: {
          theme: string
          size: string
          width: number
          text: string
          shape: string
        }
      ) => void
    }
  }
}

declare global {
  interface Window {
    google?: GoogleIdentity
  }
}

export function GoogleLoginButton({ onSuccess }: GoogleLoginButtonProps) {
  const buttonRef = useRef<HTMLDivElement | null>(null)
  const [error, setError] = useState(() =>
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? "" : "Google Client ID no configurado"
  )

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) {
      return
    }

    if (typeof window === "undefined") return

    const init = () => {
      const google = window.google
      if (!google || !buttonRef.current) {
        setError("No se pudo cargar Google Identity Services")
        return
      }

      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: GoogleCredentialResponse) => {
          try {
            setError("")
            const credential = response?.credential
            if (!credential) {
              setError("No se recibio el token de Google")
              return
            }

            const res = await fetch("/api/login-google", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ credential }),
            })
            const data = await res.json()
            if (!res.ok) {
              setError(data?.message || "No fue posible iniciar sesion con Google")
              return
            }

            const readConsent = () => {
              try {
                const v = document.cookie
                  .split(";")
                  .map((s) => s.trim())
                  .find((s) => s.startsWith("cookie_consent="))
                if (!v) return null
                return decodeURIComponent(v.split("=")[1])
              } catch {
                return null
              }
            }

            const consent = readConsent()
            const name = data.name || "Usuario"
            const userRole = data.id_rol !== undefined ? Number(data.id_rol) : undefined

            if (consent !== "rejected") {
              const userPublicId = data.id_publico
              if (userPublicId) {
                localStorage.setItem("userPublicId", String(userPublicId))
              }
              localStorage.setItem("userName", name)
              if (userRole !== undefined) {
                localStorage.setItem("userRole", String(userRole))
              }
              if (data.expiresAt) {
                localStorage.setItem("accessExpiresAt", String(data.expiresAt))
              }
            } else {
              localStorage.removeItem("userPublicId")
              localStorage.removeItem("userName")
              localStorage.removeItem("userRole")
              localStorage.removeItem("accessExpiresAt")
            }

            window.dispatchEvent(
              new CustomEvent("user:login", {
                detail: {
                  name,
                  expiresAt: data.expiresAt,
                  id_publico: data.id_publico,
                  id_rol: userRole,
                },
              })
            )

            onSuccess()
          } catch (err) {
            console.error("Google login error:", err)
            setError("Error de red. Intenta nuevamente.")
          }
        },
      })

      google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with",
        shape: "rectangular",
      })
    }

    const existing = document.querySelector("script[data-google-gsi]")
    if (existing) {
      if (window.google) {
        init()
      } else {
        existing.addEventListener("load", init)
      }
      return
    }

    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.setAttribute("data-google-gsi", "true")

    script.onload = init

    script.onerror = () => {
      setError("No se pudo cargar el script de Google")
    }

    document.head.appendChild(script)
  }, [onSuccess])

  return (
    <div className="space-y-2">
      <div ref={buttonRef} className="flex justify-center" />
      {error && <p className="text-xs text-red-600 text-center">{error}</p>}
    </div>
  )
}
