"use client"

import { useEffect, useRef, useState } from "react"

interface GoogleLoginButtonProps {
  onSuccess: () => void
}

type GoogleCredentialResponse = {
  credential?: string
}

export function GoogleLoginButton({ onSuccess }: GoogleLoginButtonProps) {
  const buttonRef = useRef<HTMLDivElement | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) {
      setError("Google Client ID no configurado")
      return
    }

    if (typeof window === "undefined") return

    const init = () => {
      const google = (window as any).google
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

            if (consent !== "rejected") {
              if (data.token) localStorage.setItem("token", data.token)
              if (data.numero_documento) {
                localStorage.setItem("userDocument", String(data.numero_documento))
              }
              localStorage.setItem("userName", name)
            } else {
              localStorage.removeItem("token")
              localStorage.removeItem("userDocument")
              localStorage.removeItem("userName")
            }

            window.dispatchEvent(
              new CustomEvent("user:login", {
                detail: {
                  token: consent !== "rejected" ? data.token : undefined,
                  name,
                  expiresAt: data.expiresAt,
                  numero_documento: data.numero_documento,
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
      if ((window as any).google) {
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
