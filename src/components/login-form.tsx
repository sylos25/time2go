"use client"

import { useState, useRef, useEffect } from "react"
import { Eye, EyeOff, Lock } from "lucide-react"
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

    // Validate required fields
    if (!email || !password) {
      if (!email) setTouchedFields((prev) => ({ ...prev, email: true }))
      if (!password) setTouchedFields((prev) => ({ ...prev, password: true }))
      return
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        console.error("Login failed:", data)
        setError(data.error || "Error al iniciar sesión")
        return
      }

      // Guardar token y datos
      if (data.token) localStorage.setItem("token", data.token)
      if (data.numero_documento) localStorage.setItem("userDocument", String(data.numero_documento))
      const name = data.name || (email ? email.split("@")[0] : "Usuario")
      localStorage.setItem("userName", name)

      // Notificar al header
      window.dispatchEvent(
        new CustomEvent("user:login", {
          detail: {
            token: data.token,
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
          className="text-sm text-blue-600 hover:text-blue-500 p-0 cursor-pointer"
          onClick={() => setResetPasswordOpen(true)}
        >
          ¿Olvidaste tu contraseña?
        </Button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 hover:from-blue-700 hover:via-purple-700 hover:to-violet-700 text-white font-medium py-6 rounded-sm text-lg"
      >
        Iniciar Sesión
      </Button>

      <ResetPasswordDialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen} />
    </form>
  )
}
