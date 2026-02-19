"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertCircle,
  Lock,
  Loader2,
  CheckCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Rat,
} from "lucide-react"

interface UserData {
  id_usuario: string
  nombres: string
  apellidos: string
  correo: string
  id_rol: number
  id_pais: number
  nombre_pais?: string
  nombre_rol?: string
  telefono?: string
  validacion_telefono?: boolean
  validacion_correo?: boolean
  fecha_registro?: string
}

export default function CambiarContrasenaPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem("token")

      const res = await fetch("/api/me", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/auth")
          return
        }
        throw new Error("No se pudo cargar los datos del usuario")
      }

      const data = await res.json()
      if (data.ok && data.user) {
        setUser(data.user)
      } else {
        setError("Error al cargar los datos")
      }
    } catch (err) {
      console.error("Error fetching user data:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Todos los campos son requeridos")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas nuevas no coinciden")
      return
    }

    if (newPassword.length < 8) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres")
      return
    }

    try {
      setSaving(true)
      const token = localStorage.getItem("token")

      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
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
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header isLoggedIn={true} userName="Usuario" />
        <div className="pt-32 pb-12 px-4 flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-700 text-lg">Cargando...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-white">
        <Header isLoggedIn={true} userName="Usuario" />
        <div className="pt-32 pb-12 px-4">
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-gray-700 text-lg font-medium mb-4">
              {error || "Error al cargar los datos"}
            </p>
            <Button
              onClick={() => router.push("/")}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Ir al Inicio
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header isLoggedIn={true} userName={user.nombres} />

      <div className="pt-32 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Botón Atrás */}
          <button
            onClick={() => router.push("/perfil")}
            className="flex items-center gap-2 text-green-700 hover:text-lime-500 mb-6 transition-colors font-medium cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al perfil</span>
          </button>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-green-700">{successMessage}</p>
            </div>
          )}

          {/* Contenedor Principal */}
          <Card className="bg-gradient-to-tr from-stone-50 to-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            {/* Encabezado */}
            <div 
              className="h-32 bg-cover bg-center bg-no-repeat" 
              style={{
                backgroundImage: 'url(https://res.cloudinary.com/dljthy97e/image/upload/v1771390899/banner_perfil_g8cmuw.jpg)'
              }}
            />

            <div className="px-8 pb-8">
              {/* Avatar y Nombre */}
              <div className="flex items-end gap-6 mb-8 relative -mt-12">
                <div className="w-32 h-32 rounded-lg bg-white flex items-center justify-center border-4 border-green-700 shadow-lg">
                  <Rat className="h-16 w-16 text-lime-500" />
                </div>
                <div className="flex-1 pb-4">
                  <h1 className="text-4xl font-bold bg-gradient-to-tr from-green-600 to-lime-400 text-transparent bg-clip-text">
                    {user.nombres} {user.apellidos}
                  </h1>
                  <div className="flex items-center gap-4 mt-2">
                    {user.fecha_registro && (
                      <span className="text-gray-600 text-sm">
                        Registrado el {new Date(user.fecha_registro).toLocaleDateString("es-ES")}
                      </span>
                    )}
                    <span className="inline-block px-3 py-1 bg-gradient-to-tr from-amber-500 to-orange-300 text-white text-sm font-medium rounded-full">
                      {user.nombre_rol || "Usuario"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Formulario de Cambio de Contraseña */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-lime-500">Cambiar Contraseña</h2>

                {passwordError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-red-700">{passwordError}</p>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-5">
                  {/* Contraseña Actual */}
                  <div className="space-y-2">
                    <Label className="text-green-700 font-medium">Contraseña Actual</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.current ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="border-gray-300 text-gray-900 pr-10"
                        placeholder="Ingresa tu contraseña actual"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords((prev) => ({ ...prev, current: !prev.current }))
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Contraseña Nueva */}
                  <div className="space-y-2">
                    <Label className="text-green-700 font-medium">Contraseña Nueva</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.new ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="border-gray-300 text-gray-900 pr-10"
                        placeholder="Ingresa tu nueva contraseña"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirmar Contraseña */}
                  <div className="space-y-2">
                    <Label className="text-green-700 font-medium">Confirmar Contraseña</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="border-gray-300 text-gray-900 pr-10"
                        placeholder="Confirma tu nueva contraseña"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="mt-8 grid grid-cols-2 gap-50">
                    <Button
                      type="button"
                      onClick={() => router.push("/perfil")}
                      variant="outline"
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:scale-102 font-medium"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-gradient-to-tr from-fuchsia-700 to-red-500 hover:from-fuchsia-600 hover:to-red-500 hover:scale-102 text-white font-medium flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          Cambiar Contraseña
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                {/* Información adicional */}
                <div className="bg-yellow-50 border border-green-600 rounded-lg p-4 mt-6">
                  <h3 className="font-semibold text-green-900 mb-2">Recomendaciones de Seguridad:</h3>
                  <ul className="space-y-1 text-sm text-green-800">
                    <li>• Usa una contraseña con al menos 8 caracteres</li>
                    <li>• Incluye mayúsculas, minúsculas y números</li>
                    <li>• Evita usar información personal (nombre, fecha de nacimiento)</li>
                    <li>• No compartas tu contraseña con nadie</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
