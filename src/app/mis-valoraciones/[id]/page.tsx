"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Star, ArrowLeft, Loader2, Save } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

// ── Selector de estrellas interactivo ─────────────────────────────────────────
function SelectorEstrellas({
  valor,
  onChange,
}: {
  valor: number
  onChange: (v: number) => void
}) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((estrella) => (
        <button
          key={estrella}
          type="button"
          onClick={() => onChange(estrella)}
          onMouseEnter={() => setHover(estrella)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none"
          aria-label={`${estrella} estrella${estrella !== 1 ? "s" : ""}`}
        >
          <Star
            className={`h-8 w-8 transition-colors ${
              estrella <= (hover || valor)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-muted text-muted-foreground"
            }`}
          />
        </button>
      ))}
      <span className="ml-2 self-center text-sm text-muted-foreground">
        {(hover || valor)}/5
      </span>
    </div>
  )
}

// ── Helper para leer el token ─────────────────────────────────────────────────
function getToken(): string {
  // Si usas cookie httpOnly no necesitas esto.
  // Si la guardas en localStorage, descomenta:
  // return localStorage.getItem("token") ?? ""
  return ""
}

// ── Página de edición ─────────────────────────────────────────────────────────
export default function EditarValoracionPage() {
  const router       = useRouter()
  const { id }       = useParams<{ id: string }>()

  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Datos del evento (solo lectura)
  const [nombreEvento, setNombreEvento] = useState("")
  const [imagenEvento, setImagenEvento] = useState<string | null>(null)

  // Campos editables
  const [valoracion,  setValoracion]  = useState(0)
  const [comentario,  setComentario]  = useState("")

  // ── Fetch de la valoración ────────────────────────────────────────────
  useEffect(() => {
    if (!id) return
    const fetchValoracion = async () => {
      try {
        const token = getToken()
        const res   = await fetch(`/api/mis-valoraciones/${id}`, {
          headers:     token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        })
        const data = await res.json()
        if (!data.ok) throw new Error(data.message)

        setValoracion(data.valoracion.valoracion)
        setComentario(data.valoracion.comentario ?? "")
        setNombreEvento(data.valoracion.nombre_evento)
        setImagenEvento(data.valoracion.imagen_evento)
      } catch (err: any) {
        setError(err.message ?? "No se pudo cargar la valoración")
      } finally {
        setLoading(false)
      }
    }
    fetchValoracion()
  }, [id])

  // ── Guardar cambios ───────────────────────────────────────────────────
  const handleGuardar = async () => {
    if (valoracion === 0) {
      setError("Debes seleccionar al menos 1 estrella")
      return
    }
    setSaving(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const token = getToken()
      const res   = await fetch(`/api/mis-valoraciones/${id}`, {
        method:  "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          valoracion,
          comentario: comentario.trim() || null,
        }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.message)

      setSuccessMsg("¡Valoración actualizada correctamente!")
      setTimeout(() => router.push("/mis-valoraciones"), 1500)
    } catch (err: any) {
      setError(err.message ?? "Error al guardar los cambios")
    } finally {
      setSaving(false)
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto px-4 py-10">

      <Button
        variant="ghost"
        className="mb-6 -ml-2 text-muted-foreground"
        onClick={() => router.push("/mis-valoraciones")}
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Volver a mis valoraciones
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Editar valoración</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">

          {/* Info del evento — solo lectura */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            {imagenEvento ? (
              <img
                src={imagenEvento}
                alt={nombreEvento}
                className="w-14 h-14 rounded-md object-cover shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-md bg-muted flex items-center justify-center shrink-0">
                <Star className="h-6 w-6 text-muted-foreground/40" />
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Evento valorado</p>
              <p className="font-medium leading-snug">{nombreEvento}</p>
            </div>
          </div>

          {/* Selector estrellas */}
          <div className="flex flex-col gap-2">
            <Label>Calificación</Label>
            <SelectorEstrellas valor={valoracion} onChange={setValoracion} />
          </div>

          {/* Comentario */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="comentario">
              Comentario{" "}
              <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Textarea
              id="comentario"
              placeholder="¿Qué te pareció el evento?"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comentario.length}/500
            </p>
          </div>

          {/* Mensajes */}
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </p>
          )}
          {successMsg && (
            <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-md">
              {successMsg}
            </p>
          )}

          {/* Botones */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => router.push("/mis-valoraciones")}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button onClick={handleGuardar} disabled={saving}>
              {saving
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando...</>
                : <><Save className="h-4 w-4 mr-2" />Guardar cambios</>
              }
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}