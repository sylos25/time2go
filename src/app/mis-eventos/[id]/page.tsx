"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Users, User, FileText, Ticket } from "lucide-react";

export default function ReservaDetallePage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(Array.isArray(params?.id) ? params.id[0] : params?.id);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reserva, setReserva] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

        const res = await fetch(`/api/reservas/${id}`, {
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
        setError("Error cargando la reserva");
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
    else {
      setError("Reserva inválida");
      setLoading(false);
    }
  }, [id]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-sky-100 flex flex-col">
      <Header onAuthClick={() => {}} />
      <div className="flex-1 w-full">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Detalle de mi reserva</h1>
          <Button variant="outline" onClick={() => router.push("/mis-eventos")}>Volver</Button>
        </div>

        {loading && <p className="text-muted-foreground">Cargando reserva...</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        {reserva && (
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-white/90">
              <CardHeader>
                <CardTitle>{reserva.nombre_evento}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reserva.url_imagen_evento && (
                  <img
                    src={reserva.url_imagen_evento}
                    alt={reserva.nombre_evento}
                    className="w-full h-56 object-cover rounded-lg"
                  />
                )}

                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-muted/40 p-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {reserva.fecha_inicio ? new Date(reserva.fecha_inicio).toLocaleDateString("es-ES") : "—"}
                    </span>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {reserva.hora_inicio ? String(reserva.hora_inicio).slice(0, 5) : "—"}
                      {reserva.hora_final ? ` - ${String(reserva.hora_final).slice(0, 5)}` : ""}
                    </span>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3 flex items-center gap-2 sm:col-span-2">
                    <MapPin className="h-4 w-4" />
                    <span>{reserva.nombre_sitio || reserva.nombre_municipio || "—"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90">
              <CardHeader>
                <CardTitle>Datos de reserva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="rounded-lg bg-muted/40 p-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{reserva.tipo_documento}</span>
                </div>
                <div className="rounded-lg bg-muted/40 p-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{reserva.numero_documento}</span>
                </div>
                <div className="rounded-lg bg-muted/40 p-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Asistentes: {reserva.cuantos_asistiran}</span>
                </div>
                <div className="rounded-lg bg-muted/40 p-3 flex items-center gap-2">
                  <Ticket className="h-4 w-4" />
                  <span>Estado: {reserva.estado ? "Activa" : "Inactiva"}</span>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground mb-1">Quiénes asistirán</p>
                  <p className="whitespace-pre-line">{reserva.quienes_asistiran}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  Reserva creada: {reserva.fecha_reserva ? new Date(reserva.fecha_reserva).toLocaleString("es-ES") : "—"}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      </div>
      <Footer />
    </main>
  );
}
