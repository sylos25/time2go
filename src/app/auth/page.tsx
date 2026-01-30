"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LoginForm } from "@/components/login-form"
import { RegisterForm } from "@/components/register-form"
import { CheckCircle } from "lucide-react"

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<"choice" | "login" | "register">("choice")
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false)
  const images = [ "/images/bucaramanga.jpg", "/images/floridablanca.jpg", "/images/giron.jpg", "/images/piedecuesta.jpg", ];
  const [currentIndex, setCurrentIndex] = useState(0); 

  useEffect(() => {
    const registered = searchParams?.get("registered")
    if (registered === "true") {
      setShowRegistrationSuccess(true)
      setStep("choice")

      const timer = setTimeout(() => {
        setShowRegistrationSuccess(false)
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  
  const handleLoginSuccess = () => {
    router.push("/")
  }

  const handleRegisterSuccess = () => {
    setShowRegistrationSuccess(true)
    setStep("choice")
    // Ocultar el mensaje después de 5 segundos
    setTimeout(() => {
      setShowRegistrationSuccess(false)
    }, 5000)
  }

  useEffect(() => { 
    const interval = setInterval(() => { 
      setCurrentIndex((prev) => (prev + 1) % images.length); }, 5000); 
      return () => 
        clearInterval(interval); }, 
      [images.length]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
            {images.map((img, index) => ( 
              <div key={index} style={{ backgroundImage: `url(${img})` }} 
                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${ 
                  index === currentIndex ? "opacity-100" : "opacity-0" }`} /> ))}

    <div className="absolute top-20 w-full text-center p-2 bg-black/30 z-10"> 
      <p className="text-xs text-gray-200"> Fotografías: © Autores originales </p> 
    </div>

      {/* Banner de registro exitoso */}
      {showRegistrationSuccess && (
        <div className="fixed top-20 left-0 right-0 mx-4 z-50">
          <div className="max-w-md mx-auto bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 shadow-lg">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-800 font-semibold">¡Cuenta creada exitosamente!</p>
              <p className="text-green-700 text-sm mt-1">Se ha enviado un correo de validación. Revisa tu buzón y valida tu email para poder acceder.</p>
            </div>
          </div>
        </div>
      )}

      {/* Container con padding para acomodar el header fijo */}
      <div className="mt-40 relative z-10 flex items-center justify-center h-full">
        <div className="max-w-md mx-auto">
          {step === "choice" && (
            <div className="w-100 bg-white rounded-lg shadow-lg p-8">
              <div className="flex flex-col items-center mb-6">
                <img src="/images/logo_color.png" 
                    className="mb-3 max-w-[350px] max-h-[350px] object-contain" />
                <p className="mt-6 text-gray-600 -mt-6">
                  Los eventos de tu ciudad, justo donde estás. 
                </p>
              </div>

              <div className="flex flex-col items-center space-y-4">
                <Button
                  onClick={() => setStep("login")}
                  className="w-80 bg-gradient-to-br from-amber-300 via-amber-300 to-amber-300 text-amber-700 font-medium py-6 rounded-sm text-lg transition duration-300 ease-in-out hover:from-amber-300 hover:via-yellow-300 hover:to-amber-300 hover:text-amber-600"
                >
                  Iniciar Sesión
                </Button>

                <Button
                  onClick={() => setStep("register")}
                  variant="outline"
                  className="w-80 border-2 border-lime-500 text-lime-500 hover:bg-lime-50 hover:text-lime-600 font-medium py-6 rounded-sm text-lg"
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
              <div className="text-center mb-6">
                <h1 className="text-4xl font-bold leading-relaxed bg-gradient-to-r from-lime-500 via-lime-400 to-lime-500 bg-clip-text text-transparent mb-2">
                  Bienvenido
                </h1>
                <p className="mt-1 text-1xl text-gray-600">
                  Inicia sesión para continuar con la experiencia
                </p>
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
                <h1 className="text-4xl font-bold leading-relaxed bg-gradient-to-r from-lime-500 via-lime-400 to-lime-500 bg-clip-text text-transparent mb-2">
                  Registrate
                </h1>
                <p className="mt-2 text-gray-600">Crea tu cuenta y descubre los eventos de la ciudad</p>
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
