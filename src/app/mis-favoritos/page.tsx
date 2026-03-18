"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, ChevronRight, Heart, Loader2, MapPin, Trash2, Users } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AuthModal } from "@/components/auth-modal"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface FavoritoEvento {
  id_evento: number
  id_publico_evento?: string
  nombre_evento: string
  descripcion: string
  fecha_inicio: string
  hora_inicio?: string
  categoria: string
  location: string
  attendees: number
  price: number | string
  image: string | null
}

export default function MisFavoritosPage() {
  const router = useRouter()

  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const openAuthModal = (loginMode = true) => {
    setIsLogin(loginMode)
    setAuthModalOpen(true)
  }

  const [favoritos, setFavoritos] = useState<FavoritoEvento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<number | null>(null)

  useEffect(() => {
    const loadFavoritos = async () => {
      try {
        setLoading(true)
        setError(null)

        const favRes = await fetch("/api/favoritos", { credentials: "include" })
        if (favRes.status === 401) {
          openAuthModal(true)
          setFavoritos([])
          return
        }

        const favData = await favRes.json()
        if (!favRes.ok || !favData?.ok) {
          throw new Error(favData?.message || "No se pudieron cargar tus favoritos")
        }

        const favoriteIds = Array.isArray(favData.favoritos)
          ? favData.favoritos.map((value: unknown) => Number(value)).filter((value: number) => Number.isFinite(value))
          : []

        if (favoriteIds.length === 0) {
          setFavoritos([])
          return
        }

        const eventsRes = await fetch("/api/events", { credentials: "include" })
        const eventsData = await eventsRes.json()
        if (!eventsRes.ok || !eventsData?.ok || !Array.isArray(eventsData.eventos)) {
          throw new Error(eventsData?.message || "No se pudieron cargar los eventos favoritos")
        }

        const normalized = eventsData.eventos
          .filter((event: any) => favoriteIds.includes(Number(event?.id_evento)))
          .map((event: any) => {
            const firstImage = event.imagenes && event.imagenes.length ? event.imagenes[0].url_imagen_evento : null
            let price: number | string = "Gratis"

            if (event.gratis_pago === true) {
              const valores = Array.isArray(event.valores)
                ? event.valores
                    .map((value: any) => Number(value?.precio_boleto ?? value?.valor ?? 0))
                    .filter((value: number) => Number.isFinite(value) && value > 0)
                : []
              price = valores.length > 0 ? Math.min(...valores) : 0
            }

            return {
              id_evento: Number(event.id_evento),
              id_publico_evento: event.id_publico_evento,
              nombre_evento: String(event.nombre_evento || "Evento sin nombre"),
              descripcion: String(event.descripcion || ""),
              fecha_inicio: String(event.fecha_inicio || ""),
              hora_inicio: event.hora_inicio ? String(event.hora_inicio) : undefined,
              categoria: String(event.categoria?.nombre || event.categoria_nombre || "Sin categoría"),
              location: String(event.sitio?.nombre_sitio || event.nombre_sitio || event.municipio?.nombre_municipio || event.nombre_municipio || "Ubicación no disponible"),
              attendees: Number(event.cupo || 0),
              price,
              image: firstImage,
            } as FavoritoEvento
          })

        setFavoritos(normalized)
      } catch (err: any) {
        setError(err?.message || "No se pudieron cargar tus favoritos")
      } finally {
        setLoading(false)
      }
    }

    loadFavoritos()
  }, [])

  const handleRemoveFavorite = async (eventId: number) => {
    try {
      setRemovingId(eventId)
      setError(null)

      const res = await fetch(`/api/favoritos?id_evento=${eventId}`, {
        method: "DELETE",
        credentials: "include",
      })
      const data = await res.json()
      if (!res.ok || !data?.ok) {
        throw new Error(data?.message || "No se pudo eliminar el favorito")
      }

      setFavoritos((prev) => prev.filter((event) => event.id_evento !== eventId))
    } catch (err: any) {
      setError(err?.message || "No se pudo eliminar el favorito")
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Header onAuthClick={openAuthModal} />

      <section className="pt-28 lg:pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <button onClick={() => router.push("/")} className="hover:text-green-600 transition-colors">
                Inicio
              </button>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium">Mis Favoritos</span>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <Heart className="h-7 w-7 text-red-500 fill-red-500" />
                  Mis Favoritos
                </h1>
                <p className="text-muted-foreground mt-1">
                  {loading
                    ? "Cargando..."
                    : favoritos.length === 0
                    ? "Aún no has guardado eventos como favoritos."
                    : `Tienes ${favoritos.length} evento${favoritos.length !== 1 ? "s" : ""} guardado${favoritos.length !== 1 ? "s" : ""} en favoritos.`}
                </p>
              </div>

              {!loading && favoritos.length > 0 && (
                <div className="flex items-center gap-2 bg-card border border-border rounded-sm px-4 py-2">
                  <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                  <span className="font-bold text-foreground text-lg">{favoritos.length}</span>
                  <span className="text-muted-foreground text-sm">favorito{favoritos.length !== 1 ? "s" : ""}</span>
                </div>
              )}
            </div>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          )}

          {error && !loading && (
            <Card className="bg-card/90 backdrop-blur-sm border-border rounded-sm">
              <CardContent className="p-6 text-center">
                <p className="text-red-600 text-sm">{error}</p>
              </CardContent>
            </Card>
          )}

          {!loading && !error && favoritos.length === 0 && (
            <Card className="bg-card/90 backdrop-blur-sm border-border rounded-sm">
              <CardContent className="p-12 flex flex-col items-center text-center gap-4">
                <Heart className="h-12 w-12 text-muted-foreground/30" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Sin favoritos todavía</h3>
                  <p className="text-muted-foreground text-sm">
                    Marca con el corazón los eventos que quieres revisar o reservar después.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/eventos")}
                  className="px-5 py-2 rounded-sm text-white text-sm font-medium bg-linear-to-tr from-fuchsia-700 to-red-500 hover:scale-103 hover:from-fuchsia-600 hover:to-red-500 transition-all cursor-pointer"
                >
                  Explorar eventos
                </button>
              </CardContent>
            </Card>
          )}

          {!loading && favoritos.length > 0 && (
            <div className="grid gap-4">
              {favoritos.map((event) => (
                <Card key={event.id_evento} className="bg-card/90 backdrop-blur-sm border-border rounded-sm overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-44 h-40 sm:h-auto flex-shrink-0">
                        {event.image ? (
                          <img src={event.image} alt={event.nombre_evento} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Heart className="h-8 w-8 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 p-5 flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <button
                              onClick={() => router.push(`/eventos/${event.id_evento}`)}
                              className="font-semibold text-foreground text-left hover:text-green-600 transition-colors leading-tight line-clamp-1 w-full"
                            >
                              {event.nombre_evento}
                            </button>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                              <span>
                                {event.fecha_inicio
                                  ? new Date(event.fecha_inicio).toLocaleDateString("es-CO", {
                                      day: "numeric", month: "long", year: "numeric",
                                    })
                                  : "Fecha por confirmar"}
                                {event.hora_inicio ? ` · ${event.hora_inicio.slice(0, 5)}` : ""}
                              </span>
                            </div>
                          </div>
                          <Badge variant="secondary" className="shrink-0 rounded-sm">
                            {event.categoria}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">{event.descripcion}</p>

                        <div className="grid gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>Aforo para {Number(event.attendees || 0).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-1 flex-wrap gap-2">
                          <span className="text-sm font-semibold text-lime-600">
                            {typeof event.price === "number" ? `$${event.price}` : event.price}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => router.push(`/eventos/${event.id_evento}`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium border border-border text-foreground hover:border-green-500 hover:text-green-600 transition-colors cursor-pointer"
                            >
                              Ver detalle
                            </button>
                            <button
                              onClick={() => handleRemoveFavorite(event.id_evento)}
                              disabled={removingId === event.id_evento}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium border border-border text-foreground hover:border-red-400 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-60"
                            >
                              {removingId === event.id_evento ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                              Quitar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
    </main>
  )
}