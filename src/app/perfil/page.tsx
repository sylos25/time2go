"use client"

import { useState, useEffect, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertCircle,
  Lock,
  Loader2,
  CheckCircle,
  Rat,
  Upload,
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
  const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isPromotorDialogOpen, setIsPromotorDialogOpen] = useState(false)
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null)
  const [promotorError, setPromotorError] = useState<string | null>(null)
  const [isUploadingPdf, setIsUploadingPdf] = useState(false)


{/*Función para asignar clases de estilo según el nombre del rol*/}
  const getRoleBadgeClass = (roleName?: string) => {
    const role = roleName?.toLowerCase().trim() || "usuario"

    if (role === "admin" || role === "administrador") {
      return "bg-gradient-to-tr from-red-400 to-rose-500"
    }

    if (role === "moderador") {
      return "bg-gradient-to-tr from-red-600 to-fuchsia-700"
    }

    if (role === "promotor") {
      return "bg-gradient-to-tr from-emerald-600 to-lime-500"
    }

    if (role === "cliente") {
      return "bg-gradient-to-tr from-blue-600 to-sky-400"
    }

    return "bg-gradient-to-tr from-amber-500 to-yellow-400"
  }

{/*Carga los datos del usuario*/} 
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

{/*Solicitar el rol de promotor (Solo usuarios)*/}  
  const handleOpenPromotorDialog = () => {
    setPromotorError(null)
    setSelectedPdf(null)
    setIsPromotorDialogOpen(true)
  }

{ /*Maneja la selección del archivo PDF, validando el formato y tamaño*/}
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setPromotorError(null)

    if (!file) {
      setSelectedPdf(null)
      return
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
    if (!isPdf) {
      setPromotorError("Solo se permite formato PDF")
      setSelectedPdf(null)
      event.target.value = ""
      return
    }

    if (file.size > MAX_PDF_SIZE_BYTES) {
      setPromotorError("El archivo supera el máximo de 5 MB")
      setSelectedPdf(null)
      event.target.value = ""
      return
    }

    setSelectedPdf(file)
  }

{/*Envía el PDF para solicitar el cambio de rol, mostrando mensajes de éxito o error según corresponda*/}
  const handleUploadPromotorDocument = async () => {
    try {
      if (!selectedPdf) {
        setPromotorError("Debes seleccionar un archivo PDF")
        return
      }

      setIsUploadingPdf(true)
      setPromotorError(null)
      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("document", selectedPdf)

      const res = await fetch("/api/promotor-document", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
        credentials: "include",
      })

      const data = await res.json()

      if (!res.ok || !data?.ok) {
        setPromotorError(data?.message || "No se pudo subir el documento")
        return
      }

      setSuccessMessage("Documento cargado correctamente. Tu solicitud para promotor fue registrada.")
      setIsPromotorDialogOpen(false)
      setSelectedPdf(null)
    } catch (err) {
      console.error("Error uploading promoter document:", err)
      setPromotorError("Ocurrió un error al subir el documento")
    } finally {
      setIsUploadingPdf(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header isLoggedIn={true} userName="Usuario" />
        <div className="pt-32 pb-12 px-4 flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-green-800 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Cargando datos del perfil...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header isLoggedIn={true} userName="Usuario" />
        <div className="pt-32 pb-12 px-4">
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-foreground text-lg font-medium mb-4">
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
    <div className="min-h-screen bg-background">
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
          <Card className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            {/* Encabezado */}
            <div 
              className="h-32 bg-cover bg-center bg-no-repeat" 
              style={{
                backgroundImage: 'url(/images/banner_top.jpg)'
              }}
            />

            <div className="px-8 pb-8">
              {/* Avatar y Nombre */}
              <div className="flex items-end gap-6 mb-8 relative -mt-12">
                <div className="w-32 h-32 rounded-lg bg-card flex items-center justify-center border-4 border-green-700 shadow-lg">
                  <Rat className="h-16 w-16 text-lime-500" />
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-tr from-green-600 to-lime-400 text-transparent bg-clip-text">
                        {user.nombres} {user.apellidos}
                      </h1>
                      <div className="flex items-center gap-4 mt-2">
                        {user.fecha_registro && (
                          <span className="text-muted-foreground text-sm">
                            Registrado el {new Date(user.fecha_registro).toLocaleDateString("es-ES")}
                          </span>
                        )}
                        <span
                          className={`inline-block px-3 py-1 ${getRoleBadgeClass(
                            user.nombre_rol
                          )} text-white text-sm font-medium rounded-full`}
                        >
                          {user.nombre_rol || "Usuario"}
                        </span>
                      </div>
                    </div>
                    {user.id_rol === 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleOpenPromotorDialog}
                        className="border-green-500 text-green-700 hover:scale-103 hover:bg-green-50 hover:text-green-800"
                      >
                        Hazte promotor
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Información Personal */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-lime-500 mb-6">Información Personal</h2>

                {/* Nombres */}
                <div className="border border-border rounded-lg p-5 hover:bg-accent hover:border-green-500 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <p className="text-green-600 text-sm font-bold mb-1">NOMBRE COMPLETO</p>
                      <p className="text-foreground text-lg font-medium">
                        {user.nombres} {user.apellidos}
                      </p>
                    </div>
                  </div>
                </div>

                {/* País */}
                <div className="border border-border rounded-lg p-5 hover:bg-accent hover:border-green-500 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <p className="text-green-700 text-sm font-bold mb-1">PAÍS</p>
                      <p className="text-foreground text-lg font-medium">
                        {user.nombre_pais || "No especificado"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Correo */}
                <div className="border border-border rounded-lg p-5 hover:bg-accent hover:border-green-500 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-1">
                        <p className="text-green-700 text-sm font-bold mb-1">CORREO ELECTRÓNICO</p>
                        <p className="text-foreground text-lg font-medium break-all">{user.correo}</p>
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
                <div className="border border-border rounded-lg p-5 hover:bg-accent hover:border-green-500 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-1">
                        <p className="text-green-700 text-sm font-bold mb-1">NÚMERO DE TELÉFONO</p>
                        <p className="text-foreground text-lg font-medium">
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
              <div className="mt-8 grid grid-cols-2 gap-50">
                <Button
                  onClick={() => router.push("/cambiar-contrasena")}
                  className="w-full bg-gradient-to-tr from-fuchsia-700 to-red-600 hover:from-fuchsia-600 hover:to-red-500 hover:scale-102 text-white font-medium flex items-center justify-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  Cambiar Contraseña
                </Button>
                <Button
                  onClick={() => {
                    localStorage.removeItem("token")
                    localStorage.removeItem("userName")
                    localStorage.removeItem("userId")
                    router.push("/")
                  }}
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-accent hover:scale-102 font-medium"
                >
                  Volver al Inicio
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={isPromotorDialogOpen} onOpenChange={setIsPromotorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hazte promotor</DialogTitle>
            <DialogDescription>
              <p>Carga un archivo PDF para solicitar el rol de promotor.</p>
              <p> Tamaño máximo: 5 MB.</p>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleFileChange}
              disabled={isUploadingPdf}
            />
            {selectedPdf && (
              <p className="text-sm text-muted-foreground">
                Archivo seleccionado: <span className="font-medium">{selectedPdf.name}</span>
              </p>
            )}
            {promotorError && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{promotorError}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              className="hover:scale-103"
              variant="outline"
              onClick={() => setIsPromotorDialogOpen(false)}
              disabled={isUploadingPdf}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleUploadPromotorDocument}
              disabled={isUploadingPdf}
              className="bg-gradient-to-tr from-green-600 to-lime-500 hover:scale-103 hover:bg-gradient-to-tr hover:from-green-500 hover:to-lime-500 text-white"
            >
              {isUploadingPdf ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Cargar PDF
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
