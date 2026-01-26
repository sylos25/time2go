"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function ValidateEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams?.get("token")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Token no proporcionado")
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
            router.push("/auth")
          }, 3000)
        }
      } catch (error) {
        console.error("Error validando email:", error)
        setStatus("error")
        setMessage("Error al conectar con el servidor")
      }
    }

    validateEmail()
  }, [token, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Validando correo...</h1>
            <p className="text-gray-600">Por favor espera un momento</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Éxito!</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500 mb-6">
              Serás redirigido al login en unos segundos...
            </p>
            <Link
              href="/auth"
              className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-shadow"
            >
              Ir al Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex gap-3">
              <Link
                href="/"
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Ir al inicio
              </Link>
              <Link
                href="/auth"
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
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
