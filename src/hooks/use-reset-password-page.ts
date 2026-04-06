import { useCallback, useEffect, useMemo, useState } from "react"
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

import {
  PASSWORD_MAX_LENGTH,
  validatePasswordPolicy,
} from "@/lib/password-policy"

export function useResetPasswordPage(token: string, router: AppRouterInstance) {
  const [loadingToken, setLoadingToken] = useState(true)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const passwordErrors = useMemo(() => validatePasswordPolicy(newPassword).errors, [newPassword])

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

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
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

    if (passwordErrors.length > 0) {
      setError(passwordErrors.join(". "))
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
  }, [confirmPassword, newPassword, passwordErrors, router, token])

  return {
    loadingToken,
    tokenError,
    newPassword,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    submitting,
    error,
    success,
    passwordMaxLength: PASSWORD_MAX_LENGTH,
    setNewPassword,
    setConfirmPassword,
    setShowPassword,
    setShowConfirmPassword,
    handleSubmit,
  }
}
