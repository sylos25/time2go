"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LoginForm } from "@/components/login-form"
import { RegisterForm } from "@/components/register-form"

export default function AuthPage() {
  const router = useRouter()
  const [step, setStep] = useState<"choice" | "login" | "register">("choice")

  const handleLoginSuccess = () => {
    router.push("/")
  }

  const handleRegisterSuccess = () => {
    setStep("login")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Container con padding para acomodar el header fijo */}
      <div className="mt-20 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          {step === "choice" && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <img src="/images/logo_color.png" 
                    className="mx-auto mb-3 max-w-[400px] max-h-[400px] object-contain" />
                <p className="mt-6 text-gray-600 -mt-6">Todo los eventos de tu ciudad, justo donde estás. </p>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={() => setStep("login")}
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 hover:from-blue-700 hover:via-purple-700 hover:to-violet-700 text-white font-medium py-6 rounded-sm text-lg"
                >
                  Iniciar Sesión
                </Button>

                <Button
                  onClick={() => setStep("register")}
                  variant="outline"
                  className="w-full border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-medium py-6 rounded-sm text-lg"
                >
                  Crear Cuenta
                </Button>
              </div>

              <div className="mt-8 text-center">
                <Button
                  variant="link"
                  onClick={() => router.push("/")}
                  className="text-gray-600 hover:text-gray-800"
                >
                  'ACA SE VA PONER EL ACCESO CON GMAIL'
                </Button>
              </div>
            </div>
          )}

          {step === "login" && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 bg-clip-text text-transparent mb-2">
                  Bienvenido
                </h1>
                <p className="mt-4 text-1xl text-gray-600">Inicia sesión para continuar con la experiencia</p>
              </div>

              <LoginForm onSuccess={handleLoginSuccess} />

              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  onClick={() => setStep("choice")}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Volver atrás
                </Button>
              </div>
            </div>
          )}

          {step === "register" && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 bg-clip-text text-transparent mb-2">
                  Registrate
                </h1>
                <p className="mt-6 text-gray-600">Crea tu cuenta y descubre los eventos de tu ciudad</p>
              </div>

              <RegisterForm onSuccess={handleRegisterSuccess} />

              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  onClick={() => setStep("choice")}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Volver atrás
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
