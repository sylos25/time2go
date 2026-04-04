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
  CreditCard,
  Lock,
  Loader2,
  CheckCircle,
  Rat,
  UserX,
  ShieldAlert,
  CalendarClock,
  LogIn,
  Database,
  ArrowLeft,
} from "lucide-react"
import { getRoleBadgeClass } from "@/lib/role-badge"

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
  validacion_correo?: boolean
  fecha_registro?: string
}

type DeactivateStep = 1 | 2

export default function PerfilPage() {
  const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Organizador (rol id 2)
  const [isOrganizadorDialogOpen, setIsOrganizadorDialogOpen] = useState(false)
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null)
  const [organizadorError, setOrganizadorError] = useState<string | null>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // Desactivar cuenta
  const [deactivateOpen,  setDeactivateOpen]  = useState(false)
  const [deactivateStep,  setDeactivateStep]  = useState<DeactivateStep>(1)
  const [deactivating,    setDeactivating]    = useState(false)
  const [deactivateError, setDeactivateError] = useState<string | null>(null)

  useEffect(() => { fetchUserData() }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("pago") === "resultado") {
      setSuccessMessage("¡Pago recibido! Tu rol de Organizador se activará en breve. Si no cambia en unos minutos, recarga la página.")
      window.history.replaceState({}, "", "/perfil")
    }
  }, [])

  const fetchUserData = async () => {
    try {
      setLoading(true); setError(null)
      const token = localStorage.getItem("token")
      const res = await fetch("/api/me", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) {
        if (res.status === 401) { router.push("/auth"); return }
        throw new Error("No se pudo cargar los datos del usuario")
      }
      const data = await res.json()
      if (data.ok && data.user) setUser(data.user)
      else setError("Error al cargar los datos")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  // ── Organizador (pago Wompi) ─────────────────────────────────────────────
  const handleOpenOrganizadorDialog = () => {
    setOrganizadorError(null); setSelectedPdf(null); setIsOrganizadorDialogOpen(true)
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setOrganizadorError(null)
    if (!file) { setSelectedPdf(null); return }
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
    if (!isPdf) { setOrganizadorError("Solo se permite formato PDF"); setSelectedPdf(null); event.target.value = ""; return }
    if (file.size > MAX_PDF_SIZE_BYTES) { setOrganizadorError("El archivo supera el máximo de 5 MB"); setSelectedPdf(null); event.target.value = ""; return }
    setSelectedPdf(file)
  }

  const handlePayWithWompi = async () => {
    setIsProcessingPayment(true); setOrganizadorError(null)
    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()
      if (selectedPdf) formData.append("document", selectedPdf)
      const res = await fetch("/api/organizador-document", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
        credentials: "include",
      })
      const data = await res.json()
      if (!res.ok || !data?.ok) { setOrganizadorError(data?.message || "No se pudo iniciar el pago"); return }
      window.location.href = data.checkout_url
    } catch {
      setOrganizadorError("Ocurrió un error al iniciar el pago")
      setIsProcessingPayment(false)
    }
  }

  // ── Desactivar cuenta ─────────────────────────────────────────────────────
  const openDeactivate = () => {
    setDeactivateStep(1); setDeactivateError(null); setDeactivateOpen(true)
  }

  const handleDeactivate = async () => {
    setDeactivating(true); setDeactivateError(null)
    try {
      const token = localStorage.getItem("token")
      // Adapta esta URL al endpoint real que tengas disponible
      const res = await fetch(`/api/usuarios/${user?.id_usuario}/ban`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ motivo: "Desactivación solicitada por el usuario" }),
      })
      const data = await res.json()
      if (!res.ok || !data?.ok) {
        setDeactivateError(data?.message || "No se pudo desactivar la cuenta")
        return
      }
      localStorage.removeItem("token")
      localStorage.removeItem("userName")
      localStorage.removeItem("userPublicId")
      router.push("/?deactivated=true")
    } catch {
      setDeactivateError("Ocurrió un error. Intenta de nuevo.")
    } finally {
      setDeactivating(false)
    }
  }

  // ── Loading / Error ───────────────────────────────────────────────────────
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
            <p className="text-foreground text-lg font-medium mb-4">{error || "Error al cargar el perfil"}</p>
            <Button onClick={() => router.push("/")} className="bg-purple-600 hover:bg-purple-700 text-white">Ir al Inicio</Button>
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

          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
              <p className="text-green-700">{successMessage}</p>
            </div>
          )}

          <Card className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="h-32 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url(/images/banner_perfil.jpg)" }} />

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
                        <span className={`inline-block px-3 py-1 ${getRoleBadgeClass(user.nombre_rol, user.id_rol)} text-white text-sm font-medium rounded-full`}>
                          {user.nombre_rol || "Usuario"}
                        </span>
                      </div>
                    </div>
                    {user.id_rol === 1 && (
                      <Button type="button" variant="outline" onClick={handleOpenOrganizadorDialog}
                        className="border-green-500 text-green-700 hover:scale-103 hover:bg-green-50 hover:text-green-800">
                        Organiza tus eventos
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Información Personal */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-lime-500 mb-6">Información Personal</h2>

                <div className="border border-border rounded-lg p-5 hover:bg-accent hover:border-green-500 transition-colors">
                  <p className="text-green-600 text-sm font-bold mb-1">NOMBRE COMPLETO</p>
                  <p className="text-foreground text-lg font-medium">{user.nombres} {user.apellidos}</p>
                </div>

                <div className="border border-border rounded-lg p-5 hover:bg-accent hover:border-green-500 transition-colors">
                  <p className="text-green-700 text-sm font-bold mb-1">PAÍS</p>
                  <p className="text-foreground text-lg font-medium">{user.nombre_pais || "No especificado"}</p>
                </div>

                <div className="border border-border rounded-lg p-5 hover:bg-accent hover:border-green-500 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-green-700 text-sm font-bold mb-1">CORREO ELECTRÓNICO</p>
                      <p className="text-foreground text-lg font-medium break-all">{user.correo}</p>
                    </div>
                    <div className="flex-shrink-0 pt-2">
                      {user.validacion_correo ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-5 w-5" /><span className="text-sm font-medium">Validado</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-amber-600">
                          <AlertCircle className="h-5 w-5" /><span className="text-sm font-medium">Pendiente</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border border-border rounded-lg p-5 hover:bg-accent hover:border-green-500 transition-colors">
                  <p className="text-green-700 text-sm font-bold mb-1">NÚMERO DE TELÉFONO</p>
                  <p className="text-foreground text-lg font-medium">
                    {user.telefono ? String(user.telefono) : "No registrado"}
                  </p>
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <Button
                  onClick={() => router.push("/cambiar-contrasena")}
                  className="w-full bg-gradient-to-tr from-fuchsia-700 to-red-600 hover:from-fuchsia-600 hover:to-red-500 hover:scale-102 text-white font-medium flex items-center justify-center gap-2"
                >
                  <Lock className="h-4 w-4" />Cambiar Contraseña
                </Button>
                <Button
                  onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("userName"); localStorage.removeItem("userPublicId"); router.push("/") }}
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-accent hover:scale-102 font-medium"
                >
                  Volver al Inicio
                </Button>
              </div>

              {/* Zona de peligro */}
              <div className="mt-8 rounded-xl border border-red-200 dark:border-red-900/60 overflow-hidden">
                <div className="bg-red-50 dark:bg-red-950/30 px-5 py-3 flex items-center gap-2 border-b border-red-200 dark:border-red-900/60">
                  <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400">Zona de peligro</span>
                </div>
                <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-sm font-medium text-foreground">Desactivar cuenta</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Suspende el acceso de inmediato. Requiere solicitud manual para reactivar.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={openDeactivate}
                    className="shrink-0 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-500
                               dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Desactivar mi cuenta
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Dialog Organizador / Pago Wompi ── */}
      <Dialog open={isOrganizadorDialogOpen} onOpenChange={(open) => { if (!isProcessingPayment) setIsOrganizadorDialogOpen(open) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Organiza tus eventos</DialogTitle>
            <DialogDescription>
              Convértete en organizador y empieza a publicar eventos en Time2Go
            </DialogDescription>
          </DialogHeader>

          {/* Beneficios */}
          <div className="space-y-2 py-1">
            {[
              "Crea y gestiona tus propios eventos",
              "Accede al panel exclusivo de organizador",
              "Gestiona reservas y boletaría",
              "Publica tus eventos para toda la comunidad",
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Precio */}
          <div className="rounded-xl border border-green-200 dark:border-green-900/60 bg-green-50 dark:bg-green-950/30 p-4">
            <p className="text-3xl font-bold text-green-700 dark:text-green-400">
              {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(
                Number(
                  process.env.NEXT_PUBLIC_ORGANIZADOR_PRICE_COP ??
                    process.env.NEXT_PUBLIC_PROMOTOR_PRICE_COP ??
                    "50000",
                )
              )}
            </p>
            <p className="text-xs text-green-600 dark:text-green-500 mt-1">Pago único de activación · Sin cuotas ni suscripciones</p>
          </div>

          {/* PDF opcional */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Documento de soporte <span className="text-muted-foreground font-normal">(opcional, máx. 5 MB)</span>
            </p>
            <Input type="file" accept="application/pdf,.pdf" onChange={handleFileChange} disabled={isProcessingPayment} />
            {selectedPdf && (
              <p className="text-xs text-muted-foreground">
                Archivo: <span className="font-medium text-foreground">{selectedPdf.name}</span>
              </p>
            )}
          </div>

          {organizadorError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-md border border-red-200 dark:border-red-900">
              <AlertCircle className="h-4 w-4 shrink-0" /><span>{organizadorError}</span>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOrganizadorDialogOpen(false)} disabled={isProcessingPayment}>
              Cancelar
            </Button>
            <Button onClick={handlePayWithWompi} disabled={isProcessingPayment}
              className="bg-gradient-to-tr from-green-600 to-lime-500 text-white">
              {isProcessingPayment
                ? <><Loader2 className="h-4 w-4 animate-spin mr-1" />Redirigiendo...</>
                : <><CreditCard className="h-4 w-4 mr-1" />Pagar con Wompi</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Desactivar — Paso 1 ── */}
      <Dialog open={deactivateOpen && deactivateStep === 1} onOpenChange={(o) => { if (!o) setDeactivateOpen(false) }}>
        <DialogContent className="max-w-md p-0 overflow-hidden gap-0">

          {/* Banda superior */}
          <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center shrink-0">
                <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-amber-800 dark:text-amber-300">¿Desactivar tu cuenta?</h2>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">Lee con atención antes de continuar</p>
              </div>
            </div>
          </div>

          {/* Cuerpo */}
          <div className="px-6 py-5 space-y-3">
            {[
              { icon: LogIn,       text: "Tu cuenta quedará inactiva de inmediato y no podrás iniciar sesión." },
              { icon: Database,    text: "Tus reservas y valoraciones seguirán existiendo en el sistema." },
              { icon: CalendarClock, text: "Para reactivarla deberás contactar al soporte. El proceso puede tardar varios días hábiles." },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-md bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-sm text-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeactivateOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => { setDeactivateStep(2); setDeactivateError(null) }}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              Entiendo, continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Desactivar — Paso 2 ── */}
      <Dialog open={deactivateOpen && deactivateStep === 2} onOpenChange={(o) => { if (!o) setDeactivateOpen(false) }}>
        <DialogContent className="max-w-md p-0 overflow-hidden gap-0">

          {/* Banda superior */}
          <div className="bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-800 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/60 flex items-center justify-center shrink-0">
                <UserX className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-red-800 dark:text-red-300">Confirmación final</h2>
                <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">Esta acción no se puede deshacer fácilmente</p>
              </div>
            </div>
          </div>

          {/* Cuerpo */}
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-muted-foreground">
              Estás a punto de desactivar la siguiente cuenta:
            </p>

            {/* Tarjeta con datos de la cuenta */}
            <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-1">
              <p className="text-sm font-semibold text-foreground">{user.nombres} {user.apellidos}</p>
              <p className="text-xs text-muted-foreground">{user.correo}</p>
              {user.nombre_rol && (
                <span className={`inline-block mt-1 px-2 py-0.5 ${getRoleBadgeClass(user.nombre_rol, user.id_rol)} text-white text-xs font-medium rounded-full`}>
                  {user.nombre_rol}
                </span>
              )}
            </div>

            <p className="text-sm text-foreground font-medium">
              ¿Confirmas que deseas desactivar esta cuenta?
            </p>

            {deactivateError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-md border border-red-200 dark:border-red-900">
                <AlertCircle className="h-4 w-4 shrink-0" /><span>{deactivateError}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border flex justify-between gap-2">
            <Button variant="ghost" onClick={() => setDeactivateStep(1)} disabled={deactivating}
              className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" />Volver
            </Button>
            <Button onClick={handleDeactivate} disabled={deactivating}
              className="bg-red-600 hover:bg-red-700 text-white">
              {deactivating
                ? <><Loader2 className="h-4 w-4 animate-spin mr-1" />Desactivando...</>
                : <><UserX className="h-4 w-4 mr-1" />Sí, desactivar</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}