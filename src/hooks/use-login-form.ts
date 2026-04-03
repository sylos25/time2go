"use client"

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"

import { EMAIL_MAX_LENGTH, PASSWORD_MAX_LENGTH, sanitizeEmail, sanitizePassword } from "@/lib/auth-form-validation"

type TouchedFields = {
  email: boolean
  password: boolean
}

function readCookieConsent(): string | null {
  try {
    const cookieEntry = document.cookie
      .split(";")
      .map((value) => value.trim())
      .find((value) => value.startsWith("cookie_consent="))

    if (!cookieEntry) return null
    return decodeURIComponent(cookieEntry.split("=")[1])
  } catch {
    return null
  }
}

function resetStoredSessionData() {
  localStorage.removeItem("token")
  localStorage.removeItem("userPublicId")
  localStorage.removeItem("userName")
  localStorage.removeItem("userRole")
  localStorage.removeItem("rememberedEmail")
}

export function useLoginForm(onSuccess: () => void) {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || ""
  const turnstileStrictMode = process.env.NEXT_PUBLIC_TURNSTILE_STRICT_MODE === "true"
  const shouldRenderTurnstile = turnstileSiteKey.length > 0

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [emailValidationError, setEmailValidationError] = useState(false)
  const [isBanned, setIsBanned] = useState(false)
  const [isNotRegistered, setIsNotRegistered] = useState(false)
  const [areCredentialsInvalid, setAreCredentialsInvalid] = useState(false)
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileError, setTurnstileError] = useState("")
  const [turnstileKey, setTurnstileKey] = useState(0)
  const [touchedFields, setTouchedFields] = useState<TouchedFields>({
    email: false,
    password: false,
  })

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail")
    if (savedEmail) {
      setEmail(savedEmail.toLowerCase())
      setRememberMe(true)
    }
  }, [])

  function handleBlur(field: keyof TouchedFields) {
    setTouchedFields((prev) => ({ ...prev, [field]: true }))
  }

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    setEmail(sanitizeEmail(event.target.value))
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setPassword(sanitizePassword(event.target.value))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError("")
    setEmailValidationError(false)
    setIsBanned(false)
    setIsNotRegistered(false)
    setAreCredentialsInvalid(false)
    setTurnstileError("")

    const sanitizedEmail = sanitizeEmail(email)
    const sanitizedPassword = sanitizePassword(password)

    if (sanitizedEmail !== email) setEmail(sanitizedEmail)
    if (sanitizedPassword !== password) setPassword(sanitizedPassword)

    if (!sanitizedEmail || !sanitizedPassword) {
      if (!sanitizedEmail) setTouchedFields((prev) => ({ ...prev, email: true }))
      if (!sanitizedPassword) setTouchedFields((prev) => ({ ...prev, password: true }))
      return
    }

    if (turnstileStrictMode && shouldRenderTurnstile && !turnstileToken) {
      setTurnstileError("Por favor, completa la verificación del captcha")
      return
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sanitizedEmail, password: sanitizedPassword, turnstileToken }),
      })
      const data = await response.json()

      if (!response.ok) {
        console.error("Login failed:", data)
        setTurnstileToken(null)
        setTurnstileKey((prev) => prev + 1)
        setTurnstileError("")

        // Manejar casos específicos de error
        if (response.status === 403 && data.banned) {
          setIsBanned(true)
          setError(data.message || "Tu cuenta está baneada. Contacta al administrador.")
        } else if (response.status === 403 && data.requiresEmailValidation) {
          setEmailValidationError(true)
          setError(data.message || "Debes validar tu correo electrónico antes de poder acceder.")
        } else if (response.status === 401 && data.message === "Credenciales inválidas") {
          setAreCredentialsInvalid(true)
          setError(data.message || "Email o contraseña incorrectos.")
        } else {
          setError(data.error || data.message || "Error al iniciar sesión")
        }
        return
      }

      const consent = readCookieConsent()
      const name = data.name || (sanitizedEmail ? sanitizedEmail.split("@")[0] : "Usuario")
      const userRole = data.id_rol !== undefined ? Number(data.id_rol) : undefined

      if (consent !== "rejected") {
        if (data.token) localStorage.setItem("token", data.token)
        if (data.id_publico) localStorage.setItem("userPublicId", String(data.id_publico))
        localStorage.setItem("userName", name)
        if (userRole !== undefined) localStorage.setItem("userRole", String(userRole))

        if (rememberMe) {
          localStorage.setItem("rememberedEmail", sanitizedEmail)
        } else {
          localStorage.removeItem("rememberedEmail")
        }
      } else {
        resetStoredSessionData()
      }

      window.dispatchEvent(
        new CustomEvent("user:login", {
          detail: {
            token: consent !== "rejected" ? data.token : undefined,
            name,
            expiresAt: data.expiresAt,
            id_publico: data.id_publico,
            id_rol: userRole,
          },
        })
      )

      onSuccess()
    } catch (err) {
      console.error("Login error:", err)
      setTurnstileToken(null)
      setTurnstileKey((prev) => prev + 1)
      setTurnstileError("")
      setError("Error de red. Intenta nuevamente.")
    }
  }

  return {
    email,
    emailValidationError,
    error,
    isBanned,
    isNotRegistered,
    areCredentialsInvalid,
    password,
    rememberMe,
    resetPasswordOpen,
    shouldRenderTurnstile,
    showPassword,
    touchedFields,
    turnstileError,
    turnstileKey,
    turnstileSiteKey,
    turnstileStrictMode,
    EMAIL_MAX_LENGTH,
    PASSWORD_MAX_LENGTH,
    handleBlur,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
    setRememberMe,
    setResetPasswordOpen,
    setShowPassword,
    setTurnstileError,
    setTurnstileKey,
    setTurnstileToken,
  }
}
