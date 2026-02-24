"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Ticket, Loader2 } from "lucide-react";

export default function MisReservasPage() {
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

        const meRes = await fetch("/api/me", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        });

        const meJson = await meRes.json().catch(() => ({}));
        const role = Number(meJson?.user?.id_rol || 0);
        if (!meRes.ok || role !== 1) {
          router.replace("/eventos");
          return;
        }

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
      } catch {
        setError("Error al cargar tus reservas");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex flex-col">
        <Header onAuthClick={() => {}} />
        <div className="flex-1 pt-32 pb-12 px-4 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-green-800 animate-spin mx-auto mb-4" />
            <p className="text-gray-700 text-lg">Cargando tus reservas...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Mis Reservas</h1>
            <Button variant="outline" onClick={() => router.push("/eventos")}>Explorar eventos</Button>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          {!loading && !error && reservas.length === 0 && (
            <Card className="bg-white/90">
              <CardContent className="pt-6 text-center text-muted-foreground">
                Aún no has realizado reservas.
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reservas.map((reserva) => (
              <Card key={reserva.id_reserva_evento} className="bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-2">{reserva.nombre_evento}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reserva.url_imagen_evento && (
                    <img
                      src={reserva.url_imagen_evento}
                      alt={reserva.nombre_evento}
                      className="w-full h-36 object-cover rounded-lg"
                    />
                  )}

                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {reserva.fecha_inicio ? new Date(reserva.fecha_inicio).toLocaleDateString("es-ES") : "—"}
                        {reserva.hora_inicio ? ` · ${String(reserva.hora_inicio).slice(0, 5)}` : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{reserva.nombre_sitio || reserva.nombre_municipio || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4" />
                      <span>Asistentes: {Number(reserva.cuantos_asistiran || 0)}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <Button
                      className="w-full"
                      onClick={() => router.push(`/eventos/${reserva.id_evento}`)}
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
