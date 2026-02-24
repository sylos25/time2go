"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Ticket, Loader2 } from "lucide-react";

export default function MisEventosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventos, setEventos] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

        const res = await fetch("/api/events?mine=true", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json?.ok) {
          setError(String(json?.message || "No se pudieron cargar tus eventos"));
          return;
        }

        setEventos(Array.isArray(json.eventos) ? json.eventos : []);
      } catch (e) {
        setError("Error al cargar tus eventos");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex flex-col">
        <Header onAuthClick={() => {}} />
        <div className="flex-1 pt-32 pb-12 px-4 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-green-800 animate-spin mx-auto mb-4" />
            <p className="text-gray-700 text-lg">Cargando tus eventos...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-sky-100 flex flex-col">
      <Header onAuthClick={() => {}} />
      <div className="flex-1 w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mis Eventos</h1>
          <Button variant="outline" onClick={() => router.push("/eventos")}>Explorar eventos</Button>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        {!loading && !error && eventos.length === 0 && (
          <Card className="bg-white/90">
            <CardContent className="pt-6 text-center text-muted-foreground">
              Aún no has creado eventos.
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {eventos.map((evento) => (
            <Card key={evento.id_evento} className="bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-2">{evento.nombre_evento}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {evento.imagenes?.[0]?.url_imagen_evento && (
                  <img
                    src={evento.imagenes[0].url_imagen_evento}
                    alt={evento.nombre_evento}
                    className="w-full h-36 object-cover rounded-lg"
                  />
                )}

                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {evento.fecha_inicio ? new Date(evento.fecha_inicio).toLocaleDateString("es-ES") : "—"}
                      {evento.hora_inicio ? ` · ${String(evento.hora_inicio).slice(0, 5)}` : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{evento.sitio?.nombre_sitio || evento.municipio?.nombre_municipio || evento.nombre_municipio || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4" />
                    <span>Cupo: {Number(evento.cupo || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <Button
                    className="w-full"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        sessionStorage.setItem("creator-event-view", String(evento.id_evento));
                      }
                      router.push(`/eventos/${evento.id_evento}`);
                    }}
                  >
                    Ver evento
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      </div>
      <Footer />
    </main>
  );
}
