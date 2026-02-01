"use client"

import { useState, useRef, useEffect } from "react"
import { Eye, EyeOff, Lock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ResetPasswordDialog } from "@/components/reset-password-dialog"

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
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({
    email: false,
    password: false,
  })

  const handleBlur = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }))
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setEmailValidationError(false)

    // Validate required fields
    if (!email || !password) {
      if (!email) setTouchedFields((prev) => ({ ...prev, email: true }))
      if (!password) setTouchedFields((prev) => ({ ...prev, password: true }))
      return
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      
      if (!res.ok) {
        console.error("Login failed:", data)
        
        // Si es error de email no validado (status 403)
        if (res.status === 403 && data.requiresEmailValidation) {
          setEmailValidationError(true)
          setError(data.message || "Debes validar tu correo electrónico antes de poder acceder.")
        } else {
          setError(data.error || data.message || "Error al iniciar sesión")
        }
        return
      }

      // Respect cookie consent: if user rejected non-essential cookies, avoid storing token/user data in localStorage
      const readConsent = () => {
        try {
          const v = document.cookie.split(';').map(s => s.trim()).find(s => s.startsWith('cookie_consent='))
          if (!v) return null
          return decodeURIComponent(v.split('=')[1])
        } catch {
          return null
        }
      }

      const consent = readConsent()
      const name = data.name || (email ? email.split("@")[0] : "Usuario")

      if (consent !== 'rejected') {
        if (data.token) localStorage.setItem("token", data.token)
        if (data.numero_documento) localStorage.setItem("userDocument", String(data.numero_documento))
        localStorage.setItem("userName", name)
      } else {
        // Clear any existing persisted auth data to fully respect rejection
        localStorage.removeItem("token")
        localStorage.removeItem("userDocument")
        localStorage.removeItem("userName")
      }

      // Notificar al header (include token only when consent allows it)
      window.dispatchEvent(
        new CustomEvent("user:login", {
          detail: {
            token: consent !== 'rejected' ? data.token : undefined,
            name,
            expiresAt: data.expiresAt,
            numero_documento: data.numero_documento,
          },
        })
      )

      onSuccess()
    } catch (err) {
      console.error("Login error:", err)
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
          className={`w-full border rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            touchedFields.email && !email ? "border-red-500 ring-red-500" : "border-gray-300"
          }`}
          placeholder="ejemplo@correo.com"
        />
        {touchedFields.email && !email && (
          <p className="text-red-500 text-xs -mt-1">Este campo es obligatorio</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          Contraseña
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => handleBlur("password")}
            className={`pl-10 pr-10 w-full border rounded-md py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              touchedFields.password && !password ? "border-red-500 ring-red-500" : "border-gray-300"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
          <Label htmlFor="rememberMe" className="text-sm text-gray-600">
            Recordarme
          </Label>
        </div>
        <Button 
          type="button"
          variant="link" 
          className="text-sm text-lime-600 hover:text-lime-700 p-0 cursor-pointer"
          onClick={() => setResetPasswordOpen(true)}
        >
          ¿Olvidaste tu contraseña?
        </Button>
      </div>

      {error && (
        <div className={`p-4 rounded-lg flex items-start gap-3 ${
          emailValidationError 
            ? "bg-yellow-50 border border-yellow-200" 
            : "bg-red-50 border border-red-200"
        }`}>
          <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
            emailValidationError ? "text-yellow-600" : "text-red-600"
          }`} />
          <p className={`text-sm ${
            emailValidationError ? "text-yellow-800" : "text-red-700"
          }`}>
            {error}
          </p>
        </div>
      )}

      <Button
        type="submit"
        className="w-80 bg-gradient-to-br from-amber-300 via-amber-300 to-amber-300 text-amber-700 font-medium py-6 rounded-sm text-lg transition duration-300 ease-in-out hover:from-amber-300 hover:via-yellow-300 hover:to-amber-300 hover:text-amber-600"
      >
        Iniciar Sesión
      </Button>

      <ResetPasswordDialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen} />
    </form>
  )
}
