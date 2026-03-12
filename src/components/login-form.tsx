"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, Lock, AlertCircle } from "lucide-react"
import { Turnstile } from "@marsidev/react-turnstile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ResetPasswordDialog } from "@/components/reset-password-dialog"
import { EMAIL_MAX_LENGTH, PASSWORD_MAX_LENGTH, sanitizeEmail, sanitizePassword } from "@/lib/auth-form-validation"

interface LoginFormProps {
  onSuccess: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [emailValidationError, setEmailValidationError] = useState(false)
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileError, setTurnstileError] = useState("")
  const [turnstileKey, setTurnstileKey] = useState(0)
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({
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

// Manejo de blur para marcar campos como tocados (touched) y mostrar validación  
  const handleBlur = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }))
  }

// Manejo de cambios en el campo de email
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(sanitizeEmail(e.target.value))
  }

  // Manejo de cambios en el campo de contraseña
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(sanitizePassword(e.target.value))
  }

// Manejo de submit del formulario  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setEmailValidationError(false)
    setTurnstileError("")

    const sanitizedEmail = sanitizeEmail(email)
    const sanitizedPassword = sanitizePassword(password)

    if (sanitizedEmail !== email) setEmail(sanitizedEmail)
    if (sanitizedPassword !== password) setPassword(sanitizedPassword)

    // Validar campos requeridos
    if (!sanitizedEmail || !sanitizedPassword) {
      if (!sanitizedEmail) setTouchedFields((prev) => ({ ...prev, email: true }))
      if (!sanitizedPassword) setTouchedFields((prev) => ({ ...prev, password: true }))
      return
    }

    // Validar token de Turnstile
    if (!turnstileToken) {
      setTurnstileError("Por favor, completa la verificación del captcha")
      return
    }

    // Enviar datos al backend
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sanitizedEmail, password: sanitizedPassword, turnstileToken }),
      })
      const data = await res.json()
      
      if (!res.ok) {
        console.error("Login failed:", data)

        // El token de Turnstile es de un solo uso: en cualquier error se solicita uno nuevo.
        setTurnstileToken(null)
        setTurnstileKey((prev) => prev + 1)
        setTurnstileError("")
        
        // Si es error de email no validado (status 403)
        if (res.status === 403 && data.requiresEmailValidation) {
          setEmailValidationError(true)
          setError(data.message || "Debes validar tu correo electrónico antes de poder acceder.")
        } else {
          setError(data.error || data.message || "Error al iniciar sesión")
        }
        return
      }

// Login exitoso: manejar almacenamiento de token y datos de usuario según consentimiento de cookies
      const readConsent = () => {
        try {
          const v = document.cookie.split(';').map(s => s.trim()).find(s => s.startsWith('cookie_consent='))
          if (!v) return null
          return decodeURIComponent(v.split('=')[1])
        } catch {
          return null
        }
      }

// Determinar nombre de usuario para mostrar (usar parte local del email si no se proporciona un nombre específico)      
      const consent = readConsent()
      const name = data.name || (sanitizedEmail ? sanitizedEmail.split("@")[0] : "Usuario")
      const userRole = data.id_rol !== undefined ? Number(data.id_rol) : undefined

      if (consent !== 'rejected') {
        if (data.token) localStorage.setItem("token", data.token)
        const userPublicId = data.id_publico
        if (userPublicId) {
          localStorage.setItem("userPublicId", String(userPublicId))
        }
        localStorage.setItem("userName", name)
        if (userRole !== undefined) {
          localStorage.setItem("userRole", String(userRole))
        }
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", sanitizedEmail)
        } else {
          localStorage.removeItem("rememberedEmail")
        }
      } else {
        // Si el consentimiento es rechazado, asegurarse de no almacenar datos en localStorage y limpiar cualquier dato existente
        localStorage.removeItem("token")
        localStorage.removeItem("userPublicId")
        localStorage.removeItem("userName")
        localStorage.removeItem("userRole")
        localStorage.removeItem("rememberedEmail")
      }

      // Emitir evento global de login con detalles del usuario (incluyendo token solo si el consentimiento no es 'rejected')
      window.dispatchEvent(
        new CustomEvent("user:login", {
          detail: {
            token: consent !== 'rejected' ? data.token : undefined,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <Input
          id="email"
          type="text"
          value={email}
          onChange={handleEmailChange}
          onBlur={() => handleBlur("email")}
          autoCapitalize="none"
          maxLength={EMAIL_MAX_LENGTH}
          className={`w-full border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            touchedFields.email && !email ? "border-red-500 ring-red-500" : "border-gray-300"
          }`}
          placeholder="ejemplo@correo.com"
        />
        {touchedFields.email && !email && (
          <p className="text-red-500 text-xs -mt-0.5">Este campo es obligatorio</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          Contraseña
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={handlePasswordChange}
            onBlur={() => handleBlur("password")}
            maxLength={PASSWORD_MAX_LENGTH}
            className={`pl-10 pr-10 w-full border rounded-md py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              touchedFields.password && !password ? "border-red-500 ring-red-500" : "border-gray-300"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 cursor-pointer" />
            ) : (
              <Eye className="h-4 w-4 cursor-pointer" />
            )}
          </button>
        </div>
        {touchedFields.password && !password && (
          <p className="text-red-500 text-xs mt-0.5">Este campo es obligatorio</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            className="cursor-pointer"
            id="rememberMe"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
          />
          <Label htmlFor="rememberMe" className="text-sm text-muted-foreground">
            Recordarme
          </Label>
        </div>
        <Button 
          type="button"
          variant="link" 
          className="text-sm text-green-600 hover:text-lime-500 p-0 cursor-pointer"
          onClick={() => setResetPasswordOpen(true)}
        >
          ¿Olvidaste tu contraseña?
        </Button>
      </div>

      {/* Turnstile Captcha */}
      <div className="flex justify-center">
        <Turnstile
          key={turnstileKey}
          siteKey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || ""}
          onSuccess={(token) => {
            setTurnstileToken(token)
            setTurnstileError("")
          }}
          onError={() => {
            setTurnstileToken(null)
            setTurnstileError("Error al cargar el captcha. Por favor, intenta nuevamente.")
          }}
          onExpire={() => {
            setTurnstileToken(null)
            setTurnstileError("La verificación del captcha ha expirado. Por favor, intenta nuevamente.")
          }}
        />
      </div>

      {(turnstileError || error) && (
        <div className="space-y-2">
          {turnstileError && (
            <div className="w-full px-3 py-2 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-600" />
              <p className="text-xs leading-snug text-red-700">{turnstileError}</p>
            </div>
          )}

          {error && (
            <div className={`w-full px-3 py-2 rounded-lg flex items-start gap-2 ${
              emailValidationError 
                ? "bg-yellow-50 border border-yellow-200" 
                : "bg-red-50 border border-red-200"
            }`}>
              <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                emailValidationError ? "text-yellow-600" : "text-red-600"
              }`} />
              <p className={`text-xs leading-snug ${
                emailValidationError ? "text-yellow-800" : "text-red-700"
              }`}>
                {error}
              </p>
            </div>
          )}
        </div>
      )}

      <Button
        type="submit"
        className="w-80 bg-gradient-to-tr from-fuchsia-700 to-red-500 text-white font-medium py-6 rounded-sm text-lg transition-all duration-300 ease-in-out hover:scale-103 hover:from-fuchsia-600 hover:to-red-500 hover:text-white"
      >
        Iniciar Sesión
      </Button>

      <ResetPasswordDialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen} />
    </form>
  )
}
