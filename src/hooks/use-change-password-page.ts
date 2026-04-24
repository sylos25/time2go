import { useCallback, useEffect, useState } from "react"

import {
  PASSWORD_MAX_LENGTH,
  validatePasswordPolicy,
} from "@/lib/password-policy"

type PasswordField = "current" | "new" | "confirm"

type UserData = {
  id_usuario: string
  nombres: string
  apellidos: string
  correo: string
  id_rol: number
  id_pais: number
  nombre_pais?: string
  nombre_rol?: string
  telefono?: string
  validacion_correo?: boolean
  fecha_registro?: string
}

export function useChangePasswordPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswords, setShowPasswords] = useState<Record<PasswordField, boolean>>({
    current: false,
    new: false,
    confirm: false,
  })

  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const togglePasswordVisibility = useCallback((field: PasswordField) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }, [])

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/me", {
        credentials: "include",
      })

      if (!response.ok) {
        if (response.status === 401) {
          window.location.assign("/auth")
          return
        }
        throw new Error("No se pudo cargar los datos del usuario")
      }

      const data = await response.json()
      if (data.ok && data.user) {
        setUser(data.user)
        return
      }

      setError("Error al cargar los datos")
    } catch (err) {
      console.error("Error fetching user data:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchUserData()
  }, [fetchUserData])

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault()
    setPasswordError(null)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Todos los campos son requeridos")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas nuevas no coinciden")
      return
    }

    const validation = validatePasswordPolicy(newPassword)
    if (!validation.isValid) {
      setPasswordError(validation.errors.join(". "))
      return
    }

    try {
      setSaving(true)

      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setPasswordError(data.message || "Error al cambiar la contraseña")
        return
      }

      setSuccessMessage("Contraseña actualizada correctamente")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    } catch (err) {
      console.error("Error changing password:", err)
      setPasswordError("Error al cambiar la contraseña")
    } finally {
      setSaving(false)
    }
  }, [confirmPassword, currentPassword, newPassword])

  return {
    user,
    loading,
    error,
    currentPassword,
    newPassword,
    confirmPassword,
    showPasswords,
    saving,
    successMessage,
    passwordError,
    passwordMaxLength: PASSWORD_MAX_LENGTH,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    togglePasswordVisibility,
    handleSubmit,
  }
}
