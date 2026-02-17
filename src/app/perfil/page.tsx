"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertCircle,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Lock,
  Loader2,
  CheckCircle,
  Eye,
  EyeOff,
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

export default function PerfilPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header isLoggedIn={true} userName="Usuario" />
        <div className="pt-32 pb-12 px-4 flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-700 text-lg">Cargando datos del perfil...</p>
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
              {error || "Error al cargar el perfil"}
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
          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-green-700">{successMessage}</p>
            </div>
          )}

          {/* Contenedor Principal */}
          <Card className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            {/* Encabezado */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 h-32" />

            <div className="px-8 pb-8">
              {/* Avatar y Nombre */}
              <div className="flex items-end gap-6 mb-8 relative -mt-16">
                <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center border-4 border-white shadow-lg">
                  <User className="h-16 w-16 text-white" />
                </div>
                <div className="flex-1 pb-4">
                  <h1 className="text-4xl font-bold text-gray-900">
                    {user.nombres} {user.apellidos}
                  </h1>
                  <div className="flex items-center gap-4 mt-2">
                    {user.fecha_registro && (
                      <span className="text-gray-600 text-sm">
                        Registrado el {new Date(user.fecha_registro).toLocaleDateString("es-ES")}
                      </span>
                    )}
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                      {user.nombre_rol || "Usuario"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información Personal */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Información Personal</h2>

                {/* Nombres */}
                <div className="border border-gray-200 rounded-lg p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <p className="text-gray-600 text-sm font-bold mb-1">NOMBRE COMPLETO</p>
                      <p className="text-gray-900 text-lg font-medium">
                        {user.nombres} {user.apellidos}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ID de Usuario */}
                <div className="border border-gray-200 rounded-lg p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <p className="text-gray-600 text-sm font-bold mb-1">ID DE USUARIO</p>
                      <p className="text-gray-900 text-lg font-medium">{user.id_usuario}</p>
                    </div>
                  </div>
                </div>

                {/* País */}
                <div className="border border-gray-200 rounded-lg p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <p className="text-gray-600 text-sm font-bold mb-1">PAÍS</p>
                      <p className="text-gray-900 text-lg font-medium">
                        {user.nombre_pais || "No especificado"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Correo */}
                <div className="border border-gray-200 rounded-lg p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-1">
                        <p className="text-gray-600 text-sm font-bold mb-1">CORREO ELECTRÓNICO</p>
                        <p className="text-gray-900 text-lg font-medium break-all">{user.correo}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 pt-2">
                      {user.validacion_correo ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">Validado</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-amber-600">
                          <AlertCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">Pendiente</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Teléfono */}
                <div className="border border-gray-200 rounded-lg p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-1">
                        <p className="text-gray-600 text-sm font-bold mb-1">NÚMERO DE TELÉFONO</p>
                        <p className="text-gray-900 text-lg font-medium">
                          {user.telefono ? String(user.telefono) : "No registrado"}
                        </p>
                      </div>
                    </div>
                    {user.telefono && (
                      <div className="flex-shrink-0 pt-2">
                        {user.validacion_telefono ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-5 w-5" />
                            <span className="text-sm font-medium">Validado</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-amber-600">
                            <AlertCircle className="h-5 w-5" />
                            <span className="text-sm font-medium">Pendiente</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-8 space-y-3">
                <Button
                  onClick={() => router.push("/cambiar-contrasena")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  Cambiar Contraseña
                </Button>
                <Button
                  onClick={() => {
                    localStorage.removeItem("token")
                    localStorage.removeItem("userName")
                    localStorage.removeItem("userId")
                    localStorage.removeItem("userDocument")
                    router.push("/")
                  }}
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
