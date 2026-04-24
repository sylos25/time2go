"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function ValidateEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ValidateEmailPageContent />
    </Suspense>
  )
}

function ValidateEmailPageContent() {
  const searchParams = useSearchParams()
  const token = searchParams?.get("token")
  const hasToken = Boolean(token)
  const [status, setStatus] = useState<"loading" | "success" | "error">(hasToken ? "loading" : "error")
  const [message, setMessage] = useState(hasToken ? "" : "Token no proporcionado")

  useEffect(() => {
    if (!hasToken || !token) {
      return
    }

    const validateEmail = async () => {
      try {
        const response = await fetch(`/api/validate-email?token=${token}`)
        const data = await response.json()

        if (!response.ok) {
          setStatus("error")
          setMessage(data.error || "Error al validar el correo")
        } else {
          setStatus("success")
          setMessage("¡Tu correo ha sido validado correctamente!")
          
          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            window.location.assign("/auth")
          }, 3000)
        }
      } catch (error) {
        console.error("Error validando email:", error)
        setStatus("error")
        setMessage("Error al conectar con el servidor")
      }
    }

    validateEmail()
  }, [hasToken, token])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-card text-card-foreground rounded-lg shadow-lg p-8 max-w-md w-full text-center border border-border">
        {status === "loading" && (
          <>
            <Loader2 className="h-16 w-16 text-green-700 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl text-green-600 font-bold text-foreground mb-2">Validando correo...</h1>
            <p className="text-muted-foreground">Por favor espera un momento</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-green-600 text-foreground mb-2">¡Éxito!</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <p className="text-sm text-muted-foreground mb-6">
              Serás redirigido al login en unos segundos...
            </p>
            <Link
              href="/auth"
              className="inline-block bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-500 hover:scale-103 transition-colors transition-transform"
            >
              Ir al Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-green-600 text-foreground mb-2">Error</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <div className="flex gap-3">
              <Link
                href="/"
                className="flex-1 border-2 border-green-600 text-green-700 px-4 py-2 rounded-lg hover:bg-green-50 hover:scale-103 transition-colors transition-transform"
              >
                Ir al inicio
              </Link>
              <Link
                href="/auth"
                className="flex-1 bg-rose-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow hover:bg-rose-500 hover:scale-103 transition-transform"
              >
                Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
