"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Ticket } from "lucide-react";

export default function MisEventosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservas, setReservas] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

        const res = await fetch("/api/reservas", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json?.ok) {
          setError(String(json?.message || "No se pudieron cargar tus reservas"));
          return;
        }

        setReservas(Array.isArray(json.reservas) ? json.reservas : []);
      } catch (e) {
        setError("Error al cargar tus reservas");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-sky-100 flex flex-col">
      <Header onAuthClick={() => {}} />
      <div className="flex-1 w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mis Eventos</h1>
          <Button variant="outline" onClick={() => router.push("/eventos")}>Explorar eventos</Button>
        </div>

        {loading && <p className="text-muted-foreground">Cargando reservas...</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        {!loading && !error && reservas.length === 0 && (
          <Card className="bg-white/90">
            <CardContent className="pt-6 text-center text-muted-foreground">
              Aún no tienes reservas registradas.
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reservas.map((r) => (
            <Card key={r.id_reserva_evento} className="bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-2">{r.nombre_evento}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {r.url_imagen_evento && (
                  <img
                    src={r.url_imagen_evento}
                    alt={r.nombre_evento}
                    className="w-full h-36 object-cover rounded-lg"
                  />
                )}

                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {r.fecha_inicio ? new Date(r.fecha_inicio).toLocaleDateString("es-ES") : "—"}
                      {r.hora_inicio ? ` · ${String(r.hora_inicio).slice(0, 5)}` : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{r.nombre_sitio || r.nombre_municipio || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4" />
                    <span>Asistentes: {r.cuantos_asistiran}</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <Button className="w-full" onClick={() => router.push(`/mis-eventos/${r.id_reserva_evento}`)}>
                    Ver reserva
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
