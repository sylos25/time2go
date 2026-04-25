"use client"

import { useState } from "react"
import { CheckCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LoginForm } from "@/components/login-form"
import { RegisterForm } from "@/components/register-form"
import { GoogleLoginButton } from "@/components/google-login-button"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  isLogin: boolean
  onToggleMode: () => void
}

export function AuthModal({ isOpen, onClose, isLogin, onToggleMode }: AuthModalProps) {
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false)

  const handleLoginSuccess = () => {
    onClose()
  }

  const handleRegisterSuccess = () => {
    setShowRegistrationSuccess(true)

    if (!isLogin) {
      onToggleMode()
    }

    setTimeout(() => {
      setShowRegistrationSuccess(false)
    }, 5000)
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setShowRegistrationSuccess(false)
          onClose()
        }
      }}
    >
      <DialogContent className="w-[min(92vw,30rem)] rounded-sm max-h-[92vh] overflow-y-auto px-5 py-6 sm:px-7">
        <DialogHeader className="items-center text-center">
          <DialogTitle className="text-3xl font-bold leading-tight bg-gradient-to-tr from-green-600 to-lime-500 bg-clip-text text-transparent">
            {isLogin ? "Bienvenido de vuelta" : "Únete a Time2Go"}
          </DialogTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLogin
              ? "Inicia sesión para continuar con tu experiencia"
              : "Crea tu cuenta y descubre eventos increíbles"}
          </p>
        </DialogHeader>

        {showRegistrationSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-800 font-semibold text-sm">¡Cuenta creada exitosamente!</p>
              <p className="text-green-700 text-xs mt-1">
                Se ha enviado un correo de validación. Revisa tu buzón y valida tu email para poder acceder.
              </p>
            </div>
          </div>
        )}

        <div className="mt-2">
          {isLogin ? (
            <>
              <LoginForm onSuccess={handleLoginSuccess} />
              <div className="mt-4">
                <GoogleLoginButton onSuccess={handleLoginSuccess} />
              </div>
            </>
          ) : (
            <RegisterForm onSuccess={handleRegisterSuccess} />
          )}
        </div>

        <div className="text-center text-sm">
          <span className="text-sm text-muted-foreground">
            {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
          </span>
          <Button
            variant="link"
            onClick={onToggleMode}
            className="ml-1 text-purple-600 hover:text-purple-700 font-medium"
          >
            {isLogin ? "Regístrate aquí" : "Inicia sesión"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
