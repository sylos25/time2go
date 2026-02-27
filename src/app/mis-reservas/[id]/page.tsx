"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar, MapPin, Ticket } from "lucide-react";

export default function ReservaDetallePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reserva, setReserva] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const reservaId = Number(params?.id || 0);
        if (!reservaId) {
          setError("Reserva inválida");
          return;
        }

        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const res = await fetch(`/api/reservas/${encodeURIComponent(String(reservaId))}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json?.ok) {
          setError(String(json?.message || "No se pudo cargar la reserva"));
          return;
        }

        setReserva(json.reserva || null);
      } catch {
        setError("Error al cargar el detalle de la reserva");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params?.id]);

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header onAuthClick={() => {}} />
      <div className="flex-1 w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
          <div className="flex items-center justify-between mb-6 gap-3">
            <h1 className="text-3xl font-bold text-foreground">Detalle de Reserva</h1>
            <Button variant="outline" onClick={() => router.push("/mis-reservas")}>Volver</Button>
          </div>

          {loading && (
            <Card className="bg-card/90">
              <CardContent className="pt-6 flex items-center gap-2 text-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Cargando reserva...
              </CardContent>
            </Card>
          )}

          {!loading && error && (
            <Card className="bg-card/90">
              <CardContent className="pt-6 text-red-600">{error}</CardContent>
            </Card>
          )}

          {!loading && !error && reserva && (
            <Card className="bg-card/90">
              <CardHeader>
                <CardTitle>{reserva.nombre_evento || "Reserva"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reserva.url_imagen_evento && (
                  <img
                    src={reserva.url_imagen_evento}
                    alt={reserva.nombre_evento || "Evento"}
                    className="w-full max-h-72 object-cover rounded-lg"
                  />
                )}

                <div className="grid md:grid-cols-2 gap-3 text-sm text-foreground">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4" />
                    <span>ID Reserva: {reserva.id_reserva_evento}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4" />
                    <span>Estado: {reserva.estado ? "Activa" : "Cancelada"}</span>
                  </div>
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
                  <div>
                    <span className="font-medium">Tipo documento:</span> {reserva.tipo_documento || "—"}
                  </div>
                  <div>
                    <span className="font-medium">Número documento:</span> {reserva.numero_documento || "—"}
                  </div>
                  <div>
                    <span className="font-medium">Asistentes:</span> {Number(reserva.cuantos_asistiran || 0)}
                  </div>
                  <div>
                    <span className="font-medium">Quiénes asistirán:</span> {reserva.quienes_asistiran || "—"}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
