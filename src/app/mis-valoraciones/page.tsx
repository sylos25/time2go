"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Star, Pencil, Trash2, CalendarDays, Loader2, ChevronRight, Check, X } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AuthModal } from "@/components/auth-modal"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface Valoracion {
  id_valoracion:     number
  valoracion:        number
  comentario:        string | null
  fecha_creacion:    string
  id_publico_evento: string
  nombre_evento:     string
  fecha_inicio:      string
  hora_inicio:       string
  imagen_evento:     string | null
}

// ── Helper token ──────────────────────────────────────────────────────────────
function getToken(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("token") ?? ""
}

// ── Estrellas solo lectura ────────────────────────────────────────────────────
function Estrellas({ valor }: { valor: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= valor ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted-foreground"
          }`}
        />
      ))}
    </div>
  )
}

// ── Selector de estrellas interactivo ─────────────────────────────────────────
function SelectorEstrellas({ valor, onChange }: { valor: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((estrella) => (
        <button
          key={estrella}
          type="button"
          onClick={() => onChange(estrella)}
          onMouseEnter={() => setHover(estrella)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none"
        >
          <Star
            className={`h-5 w-5 transition-colors cursor-pointer ${
              estrella <= (hover || valor)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-muted text-muted-foreground"
            }`}
          />
        </button>
      ))}
      <span className="ml-1 self-center text-xs text-muted-foreground">{(hover || valor)}/5</span>
    </div>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────
export default function MisValoracionesPage() {
  const router = useRouter()

  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [isLogin,       setIsLogin]       = useState(true)
  const openAuthModal = (loginMode = true) => { setIsLogin(loginMode); setAuthModalOpen(true) }

  const [valoraciones, setValoraciones] = useState<Valoracion[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)

  // Eliminar
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [deleting,  setDeleting]  = useState(false)

  // Edición inline
  const [editingId,      setEditingId]      = useState<number | null>(null)
  const [editRating,     setEditRating]     = useState(5)
  const [editComment,    setEditComment]    = useState("")
  const [savingEdit,     setSavingEdit]     = useState(false)
  const [editError,      setEditError]      = useState<string | null>(null)
  const [editSuccess,    setEditSuccess]    = useState<string | null>(null)

  // ── Fetch inicial ───────────────────────────────────────────────────────
  useEffect(() => {
    const fetchValoraciones = async () => {
      try {
        const token = getToken()
        const res = await fetch("/api/mis-valoraciones", {
          headers:     token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        })
        const contentType = res.headers.get("content-type")
        if (!contentType?.includes("application/json")) throw new Error("No se pudo conectar con el servidor")
        const data = await res.json()
        if (!data.ok) throw new Error(data.message)
        setValoraciones(data.valoraciones)
      } catch (err: any) {
        setError(err.message ?? "No se pudieron cargar las valoraciones")
      } finally {
        setLoading(false)
      }
    }
    fetchValoraciones()
  }, [])

  // ── Iniciar edición ─────────────────────────────────────────────────────
  const startEdit = (v: Valoracion) => {
    setEditingId(v.id_valoracion)
    setEditRating(v.valoracion)
    setEditComment(v.comentario ?? "")
    setEditError(null)
    setEditSuccess(null)
    setConfirmId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditError(null)
    setEditSuccess(null)
  }

  // ── Guardar edición ─────────────────────────────────────────────────────
  const saveEdit = async (id: number) => {
    if (editRating < 1 || editRating > 5) {
      setEditError("Selecciona una calificación válida.")
      return
    }
    setSavingEdit(true)
    setEditError(null)
    setEditSuccess(null)
    try {
      const token = getToken()
      const res = await fetch(`/api/mis-valoraciones/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          valoracion: editRating,
          comentario: editComment.trim() || null,
        }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.message)

      // Actualizar localmente sin refetch
      setValoraciones(prev =>
        prev.map(v =>
          v.id_valoracion === id
            ? { ...v, valoracion: editRating, comentario: editComment.trim() || null }
            : v
        )
      )
      setEditSuccess("¡Valoración actualizada!")
      setTimeout(() => { setEditingId(null); setEditSuccess(null) }, 1200)
    } catch (err: any) {
      setEditError(err.message ?? "Error al guardar los cambios")
    } finally {
      setSavingEdit(false)
    }
  }

  // ── Eliminar ────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (confirmId === null) return
    setDeleting(true)
    try {
      const token = getToken()
      const res = await fetch(`/api/mis-valoraciones/${confirmId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.message)
      setValoraciones(prev => prev.filter(v => v.id_valoracion !== confirmId))
    } catch (err: any) {
      setError(err.message ?? "Error al eliminar la valoración")
    } finally {
      setDeleting(false)
      setConfirmId(null)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onAuthClick={openAuthModal} />

      <section className="flex-grow pt-28 lg:pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Título */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <button onClick={() => router.push("/")} className="hover:text-green-600 transition-colors">
                Inicio
              </button>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium">Mis Valoraciones</span>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <Star className="h-7 w-7 text-green-600" />
                  Mis Valoraciones
                </h1>
                <p className="text-muted-foreground mt-1">
                  {loading
                    ? "Cargando..."
                    : valoraciones.length === 0
                    ? "Aún no has valorado ningún evento."
                    : `Tienes ${valoraciones.length} valoración${valoraciones.length !== 1 ? "es" : ""} registrada${valoraciones.length !== 1 ? "s" : ""}.`}
                </p>
              </div>
              {!loading && valoraciones.length > 0 && (
                <div className="flex items-center gap-2 bg-card border border-border rounded-sm px-4 py-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-foreground text-lg">
                    {(valoraciones.reduce((acc, v) => acc + v.valoracion, 0) / valoraciones.length).toFixed(1)}
                  </span>
                  <span className="text-muted-foreground text-sm">promedio</span>
                </div>
              )}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          )}

          {/* Error global */}
          {error && !loading && (
            <Card className="bg-card/90 backdrop-blur-sm border-border rounded-sm">
              <CardContent className="p-6 text-center">
                <p className="text-red-600 text-sm">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Estado vacío */}
          {!loading && !error && valoraciones.length === 0 && (
            <Card className="bg-card/90 backdrop-blur-sm border-border rounded-sm">
              <CardContent className="p-12 flex flex-col items-center text-center gap-4">
                <Star className="h-12 w-12 text-muted-foreground/30" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Sin valoraciones todavía</h3>
                  <p className="text-muted-foreground text-sm">
                    Asiste a un evento y cuéntanos tu experiencia calificándolo.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/eventos")}
                  className="px-5 py-2 rounded-sm text-white text-sm font-medium
                             bg-gradient-to-tr from-fuchsia-700 to-red-500
                             hover:opacity-90 transition-all cursor-pointer"
                >
                  Explorar eventos
                </button>
              </CardContent>
            </Card>
          )}

          {/* Lista */}
          {!loading && valoraciones.length > 0 && (
            <div className="grid gap-4">
              {valoraciones.map((v) => {
                const isEditing = editingId === v.id_valoracion

                return (
                  <Card
                    key={v.id_valoracion}
                    className="bg-card/90 backdrop-blur-sm border-border rounded-sm overflow-hidden"
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">

                        {/* Imagen */}
                        <div className="sm:w-44 h-40 sm:h-auto flex-shrink-0">
                          {v.imagen_evento ? (
                            <img
                              src={v.imagen_evento}
                              alt={v.nombre_evento}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <Star className="h-8 w-8 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>

                        {/* Contenido */}
                        <div className="flex-1 p-5 flex flex-col gap-3">

                          {/* Cabecera: nombre + badge */}
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div className="flex-1 min-w-0">
                              <button
                                onClick={() => router.push(`/eventos/${v.id_publico_evento}`)}
                                className="font-semibold text-foreground text-left hover:text-green-600
                                           transition-colors leading-tight line-clamp-1 w-full"
                              >
                                {v.nombre_evento}
                              </button>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                                <span>
                                  {new Date(v.fecha_inicio).toLocaleDateString("es-CO", {
                                    day: "numeric", month: "long", year: "numeric",
                                  })}
                                  {" · "}{v.hora_inicio?.slice(0, 5)}
                                </span>
                              </div>
                            </div>
                            <Badge variant="secondary" className="shrink-0 rounded-sm">
                              {isEditing ? editRating : v.valoracion}/5
                            </Badge>
                          </div>

                          {/* ── MODO EDICIÓN ── */}
                          {isEditing ? (
                            <div className="space-y-3 border-t pt-3">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1.5">Calificación</p>
                                <SelectorEstrellas valor={editRating} onChange={setEditRating} />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1.5">
                                  Comentario <span className="font-normal">(opcional)</span>
                                </p>
                                <textarea
                                  value={editComment}
                                  onChange={(e) => setEditComment(e.target.value)}
                                  className="w-full p-2 border rounded-sm text-sm resize-none
                                             bg-background focus:outline-none focus:ring-1 focus:ring-green-500"
                                  placeholder="¿Qué te pareció el evento?"
                                  maxLength={1000}
                                  rows={3}
                                />
                                <p className="text-xs text-muted-foreground text-right -mt-1">
                                  {editComment.length}/1000
                                </p>
                              </div>

                              {editError   && <p className="text-xs text-red-600">{editError}</p>}
                              {editSuccess && <p className="text-xs text-green-600">{editSuccess}</p>}

                              <div className="flex gap-2">
                                <button
                                  onClick={() => saveEdit(v.id_valoracion)}
                                  disabled={savingEdit}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs
                                             font-medium bg-green-600 hover:bg-green-700 text-white
                                             disabled:opacity-50 cursor-pointer transition-colors"
                                >
                                  {savingEdit
                                    ? <Loader2 className="h-3 w-3 animate-spin" />
                                    : <Check className="h-3 w-3" />
                                  }
                                  Guardar
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  disabled={savingEdit}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs
                                             font-medium border border-border text-muted-foreground
                                             hover:text-foreground transition-colors cursor-pointer"
                                >
                                  <X className="h-3 w-3" />
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* ── VISTA NORMAL ── */
                            <>
                              <Estrellas valor={v.valoracion} />
                              {v.comentario && (
                                <div className="bg-muted/50 rounded-sm px-4 py-3 border-l-2 border-green-500">
                                  <p className="text-sm text-muted-foreground italic line-clamp-2">
                                    "{v.comentario}"
                                  </p>
                                </div>
                              )}
                            </>
                          )}

                          {/* Footer: fecha + botones */}
                          {!isEditing && (
                            <div className="flex items-center justify-between mt-auto pt-1 flex-wrap gap-2">
                              <span className="text-xs text-muted-foreground">
                                Valorado el{" "}
                                {new Date(v.fecha_creacion).toLocaleDateString("es-CO", {
                                  day: "numeric", month: "short", year: "numeric",
                                })}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => startEdit(v)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs
                                             font-medium border border-border text-foreground
                                             hover:border-green-500 hover:text-green-600
                                             transition-colors cursor-pointer"
                                >
                                  <Pencil className="h-3 w-3" />
                                  Editar
                                </button>
                                <button
                                  onClick={() => setConfirmId(v.id_valoracion)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs
                                             font-medium border border-border text-foreground
                                             hover:border-red-400 hover:text-red-500
                                             transition-colors cursor-pointer"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

        </div>
      </section>

      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        isLogin={isLogin}
        onToggleMode={() => setIsLogin(!isLogin)}
      />

      {/* Confirmar eliminar */}
      <AlertDialog open={confirmId !== null} onOpenChange={() => setConfirmId(null)}>
        <AlertDialogContent className="rounded-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar valoración?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Tu calificación y comentario
              serán eliminados permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="rounded-sm">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-sm bg-red-500 hover:bg-red-600"
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}