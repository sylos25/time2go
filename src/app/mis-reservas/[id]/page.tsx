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
  const [downloadingPdf, setDownloadingPdf] = useState(false);

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

  const categoriaEvento = reserva?.categoria_nombre || "No registrado";
  const tipoEvento = reserva?.tipo_nombre || "No registrado";
  const pulepEvento = reserva?.pulep_evento || "No registrado";
  const nombreSitio = reserva?.nombre_sitio || "No registrado";
  const direccionSitio = reserva?.sitio_direccion || "No registrada";
  const ciudadSitio = reserva?.nombre_municipio || "No registrada";
  const aforo = Number(reserva?.cupo ?? 0);
  const aforoTexto = aforo > 0 ? aforo.toLocaleString("es-CO") : "No registrado";
  const organizadores = [
    String(reserva?.responsable_evento || "").trim(),
    `${String(reserva?.creador_nombres || "").trim()} ${String(reserva?.creador_apellidos || "").trim()}`.trim(),
  ]
    .filter((value, index, arr) => value.length > 0 && arr.indexOf(value) === index)
    .join(" / ") || "No registrado";
  const telefonosOrganizador = [reserva?.telefono_1, reserva?.telefono_2]
    .map((value) => String(value || "").trim())
    .filter((value, index, arr) => value.length > 0 && arr.indexOf(value) === index)
    .join(" / ") || "No registrado";
  const modalidad = reserva?.gratis_pago ? "Pago" : "Gratis";
  const formatHour12 = (value: string | null | undefined) => {
    if (!value) return "—";
    const parts = String(value).split(":");
    const rawHour = Number(parts[0]);
    const rawMinute = Number(parts[1]);
    if (!Number.isFinite(rawHour) || !Number.isFinite(rawMinute)) {
      return String(value);
    }
    const period = rawHour >= 12 ? "p.m." : "a.m.";
    const hour12 = rawHour % 12 === 0 ? 12 : rawHour % 12;
    return `${String(hour12).padStart(2, "0")}:${String(rawMinute).padStart(2, "0")} ${period}`;
  };

  const handleDownloadPdf = async () => {
    if (!reserva || downloadingPdf) return;
    try {
      setDownloadingPdf(true);
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });

      let y = 14;
      const pageHeight = 287;
      const addTextBlock = (text: string, size = 11, bold = false) => {
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setFontSize(size);
        const lines = doc.splitTextToSize(text, 180);
        if (y + lines.length * 6 > pageHeight) {
          doc.addPage();
          y = 14;
        }
        doc.text(lines, 14, y);
        y += lines.length * 6;
      };

      const addGap = (value = 2) => {
        y += value;
      };

      addTextBlock("Detalle de reserva", 16, true);
      addGap(1);
      addTextBlock(`Evento: ${reserva?.nombre_evento || "No registrado"}`, 12, true);
      addGap(1);

      addTextBlock("Datos del evento", 12, true);
      addTextBlock(`ID reserva: ${String(reserva?.id_reserva_evento || "-")}`);
      addTextBlock(`Fecha: ${reserva?.fecha_inicio ? new Date(reserva.fecha_inicio).toLocaleDateString("es-ES") : "-"}`);
      addTextBlock(`Hora inicio: ${formatHour12(reserva?.hora_inicio)}${reserva?.hora_final ? ` | Hora fin: ${formatHour12(reserva?.hora_final)}` : ""}`);
      addTextBlock(`Categoria: ${categoriaEvento}`);
      addTextBlock(`Tipo de evento: ${tipoEvento}`);
      addTextBlock(`PULEP: ${pulepEvento}`);
      addTextBlock(`Modalidad: ${modalidad}`);
      addTextBlock(`Aforo: ${aforoTexto}`);
      addTextBlock(`Lugar: ${nombreSitio}`);
      addTextBlock(`Direccion: ${direccionSitio}`);
      addTextBlock(`Ciudad: ${ciudadSitio}`);
      addTextBlock(`Organizadores: ${organizadores}`);
      addTextBlock(`Telefonos organizador: ${telefonosOrganizador}`);

      addGap(1);
      addTextBlock("Datos del titular", 12, true);
      addTextBlock(`Tipo documento: ${reserva?.tipo_documento || "-"}`);
      addTextBlock(`Numero documento: ${reserva?.numero_documento || "-"}`);

      addGap(1);
      addTextBlock("Listado de asistentes", 12, true);
      if (Array.isArray(reserva?.asistentes) && reserva.asistentes.length > 0) {
        reserva.asistentes.forEach((asistente: any, index: number) => {
          addTextBlock(`Invitado ${index + 1}: ${asistente?.nombre_asistente || "Sin nombre"}`, 11, true);
          addTextBlock(`Tipo documento: ${asistente?.tipo_documento || "-"}`);
          addTextBlock(`Numero documento: ${asistente?.numero_documento || "-"}`);
          addGap(1);
        });
      } else {
        addTextBlock("No hay asistentes registrados.");
      }

      const fileName = `reserva-${String(reserva?.id_reserva_evento || "detalle")}.pdf`;
      doc.save(fileName);
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header onAuthClick={() => {}} />
      <div className="flex-1 w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
          <div className="flex items-center justify-between mb-6 gap-3">
            <h1 className="text-3xl font-bold text-foreground">Detalle de Reserva</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleDownloadPdf} disabled={!reserva || downloadingPdf}>
                {downloadingPdf ? "Generando PDF..." : "Descargar PDF"}
              </Button>
              <Button variant="outline" onClick={() => router.push("/mis-reservas")}>Volver</Button>
            </div>
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
                    <span><span className="font-semibold">ID Reserva:</span> {reserva.id_reserva_evento}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      <span className="font-semibold">Fecha:</span> {reserva.fecha_inicio ? new Date(reserva.fecha_inicio).toLocaleDateString("es-ES") : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      <span className="font-semibold">Hora inicio:</span> {formatHour12(reserva.hora_inicio)}
                      {reserva.hora_final ? ` · ` : ""}
                      {reserva.hora_final ? <><span className="font-semibold">Hora fin:</span> {formatHour12(reserva.hora_final)}</> : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span><span className="font-semibold">Ubicación:</span> {reserva.nombre_sitio || reserva.nombre_municipio || "—"}</span>
                  </div>
                  <div>
                    <span className="font-medium">Categoría:</span> {categoriaEvento}
                  </div>
                  <div>
                    <span className="font-medium">Tipo de evento:</span> {tipoEvento}
                  </div>
                  <div>
                    <span className="font-medium">PULEP:</span> {pulepEvento}
                  </div>
                  <div>
                    <span className="font-medium">Modalidad:</span> {modalidad}
                  </div>
                  <div>
                    <span className="font-medium">Aforo:</span> {aforoTexto}
                  </div>
                  <div>
                    <span className="font-medium">Lugar:</span> {nombreSitio}
                  </div>
                  <div>
                    <span className="font-medium">Dirección:</span> {direccionSitio}
                  </div>
                  <div>
                    <span className="font-medium">Ciudad:</span> {ciudadSitio}
                  </div>
                  <div>
                    <span className="font-medium">Organizadores:</span> {organizadores}
                  </div>
                  <div>
                    <span className="font-medium">Teléfonos organizador:</span> {telefonosOrganizador}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="font-bold text-foreground">Datos del titular</p>
                  <div className="rounded-md border p-3">
                  <div className="grid md:grid-cols-2 gap-2 text-foreground">
                    <div>
                      <span className="font-semibold">Tipo documento:</span> {reserva.tipo_documento || "—"}
                    </div>
                    <div>
                      <span className="font-semibold">Número documento:</span> {reserva.numero_documento || "—"}
                    </div>
                  </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-foreground">Listado de asistentes</p>

                  {Array.isArray(reserva.asistentes) && reserva.asistentes.length > 0 ? (
                    <div className="space-y-2">
                      {reserva.asistentes.map((asistente: any, idx: number) => (
                        <div key={asistente.id_reserva_asistente || idx} className="rounded-md border p-3 text-sm">
                          <p><span className="font-semibold">Nombre:</span> {asistente.nombre_asistente || "Sin nombre"}</p>
                          <p className="text-muted-foreground">
                            <span className="font-semibold text-foreground">Tipo documento:</span> {asistente.tipo_documento || "—"}
                          </p>
                          <p className="text-muted-foreground">
                            <span className="font-semibold text-foreground">Número documento:</span> {asistente.numero_documento || "—"}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {reserva.quienes_asistiran || "No hay asistentes registrados."}
                    </p>
                  )}
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
