"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react"

const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_LENGTH = 20

function validatePassword(password: string): string[] {
  const errors: string[] = []
  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    errors.push(`La contraseña debe tener entre ${MIN_PASSWORD_LENGTH} y ${MAX_PASSWORD_LENGTH} caracteres`)
  }
  if (!/[a-zA-Z]/.test(password)) errors.push("Debe incluir al menos una letra")
  if (!/[0-9]/.test(password)) errors.push("Debe incluir al menos un número")
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Debe incluir al menos un carácter especial")
  }
  return errors
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get("token") ?? ""

  const [loadingToken, setLoadingToken] = useState(true)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const passwordRules = useMemo(() => validatePassword(newPassword), [newPassword])

  useEffect(() => {
    let ignore = false

    async function validateToken() {
      if (!token) {
        setTokenError("El enlace de recuperación no es válido")
        setLoadingToken(false)
        return
      }

      try {
        setLoadingToken(true)
        const response = await fetch(`/api/reset-password?token=${encodeURIComponent(token)}`)
        const data = await response.json()

        if (ignore) return

        if (!response.ok) {
          setTokenError(data.error || "El enlace de recuperación no es válido o ya expiró")
          return
        }

        setTokenError(null)
      } catch (err) {
        console.error("Token validation error:", err)
        if (!ignore) setTokenError("No fue posible validar el enlace. Intenta nuevamente.")
      } finally {
        if (!ignore) setLoadingToken(false)
      }
    }

    void validateToken()

    return () => {
      ignore = true
    }
  }, [token])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!token) {
      setError("Token no proporcionado")
      return
    }

    if (!newPassword || !confirmPassword) {
      setError("Todos los campos son obligatorios")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (passwordRules.length > 0) {
      setError(passwordRules.join(". "))
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch("/api/reset-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || "No se pudo restablecer la contraseña")
        return
      }

      setSuccess(data.message || "Tu contraseña se restableció correctamente")
      setNewPassword("")
      setConfirmPassword("")

      setTimeout(() => {
        router.push("/auth")
      }, 2500)
    } catch (err) {
      console.error("Reset password confirmation error:", err)
      setError("Error de red. Intenta nuevamente.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-32 pb-12 px-4">
        <div className="max-w-xl mx-auto">
          <Card className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <div
              className="h-24 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: "url(/images/banner_perfil.jpg)" }}
            />

            <div className="p-6 md:p-8 space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold bg-gradient-to-tr from-green-600 to-lime-500 bg-clip-text text-transparent">
                  Restablecer Contraseña
                </h1>
                <p className="text-muted-foreground mt-2">
                  Ingresa una nueva contraseña para tu cuenta.
                </p>
              </div>

              {loadingToken && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Validando enlace de recuperación...</span>
                </div>
              )}

              {!loadingToken && tokenError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-red-700 font-medium">No se puede usar este enlace</p>
                    <p className="text-red-600 text-sm mt-1">{tokenError}</p>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4"
                      onClick={() => router.push("/auth")}
                    >
                      Volver a Iniciar Sesión
                    </Button>
                  </div>
                </div>
              )}

              {!loadingToken && !tokenError && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nueva contraseña</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Ingresa tu nueva contraseña"
                        autoComplete="new-password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirma tu nueva contraseña"
                        autoComplete="new-password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="bg-muted/40 border border-border rounded-lg p-3 text-sm text-muted-foreground">
                    La contraseña debe tener entre 8 y 20 caracteres e incluir al menos una letra, un número y un carácter especial.
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>{success}</span>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/auth")}
                      disabled={submitting}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-gradient-to-tr from-green-600 to-lime-500 text-white"
                    >
                      {submitting ? "Guardando..." : "Guardar Contraseña"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
