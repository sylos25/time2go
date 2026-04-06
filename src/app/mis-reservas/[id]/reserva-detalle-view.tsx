import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Ticket } from "lucide-react"
import type { ReservaDetalle } from "@/lib/reserva-detalle-types"
import {
  dn,
  formatHora12,
  formatReservaFecha,
  reservaDerivedLabels,
} from "@/lib/reserva-detalle-display"
import { ReservaDetallePdfButton } from "./reserva-detalle-pdf-button"

function isAbsoluteHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

export function ReservaDetalleView({ reserva }: { reserva: ReservaDetalle }) {
  const derived = reservaDerivedLabels(reserva)
  const imageUrl = reserva.url_imagen_evento?.trim() || ""

  return (
    <>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-3xl font-bold text-foreground">Detalle de Reserva</h1>
        <div className="flex items-center gap-2">
          <ReservaDetallePdfButton reserva={reserva} />
          <Button variant="outline" asChild>
            <Link href="/mis-reservas">Volver</Link>
          </Button>
        </div>
      </div>

      <Card className="bg-card/90">
        <CardHeader>
          <CardTitle>{dn(reserva.nombre_evento, "Reserva")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {imageUrl ? (
            <div className="relative w-full aspect-[21/9] max-h-72 rounded-lg overflow-hidden bg-muted">
              {isAbsoluteHttpUrl(imageUrl) ? (
                <Image
                  src={imageUrl}
                  alt={dn(reserva.nombre_evento, "Evento")}
                  fill
                  className="object-cover"
                  sizes="(max-width: 896px) 100vw, 896px"
                  unoptimized
                />
              ) : (
                <Image
                  src={imageUrl}
                  alt={dn(reserva.nombre_evento, "Evento")}
                  fill
                  className="object-cover"
                  sizes="(max-width: 896px) 100vw, 896px"
                />
              )}
            </div>
          ) : null}

          <div className="grid md:grid-cols-2 gap-3 text-sm text-foreground">
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 shrink-0" />
              <span>
                <span className="font-semibold">ID Reserva:</span> {reserva.id_reserva_evento}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>
                <span className="font-semibold">Fecha:</span> {formatReservaFecha(reserva.fecha_inicio)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>
                <span className="font-semibold">Hora inicio:</span> {formatHora12(reserva.hora_inicio)}
                {reserva.hora_final ? (
                  <>
                    {" · "}
                    <span className="font-semibold">Hora fin:</span> {formatHora12(reserva.hora_final)}
                  </>
                ) : null}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>
                <span className="font-semibold">Ubicación:</span>{" "}
                {reserva.nombre_sitio || reserva.nombre_municipio || "—"}
              </span>
            </div>
            <div>
              <span className="font-medium">Categoría:</span> {derived.categoriaEvento}
            </div>
            <div>
              <span className="font-medium">Tipo de evento:</span> {derived.tipoEvento}
            </div>
            <div>
              <span className="font-medium">PULEP:</span> {derived.pulepEvento}
            </div>
            <div>
              <span className="font-medium">Modalidad:</span> {derived.modalidad}
            </div>
            <div>
              <span className="font-medium">Aforo:</span> {derived.aforoTexto}
            </div>
            <div>
              <span className="font-medium">Lugar:</span> {derived.nombreSitio}
            </div>
            <div>
              <span className="font-medium">Dirección:</span> {derived.direccionSitio}
            </div>
            <div>
              <span className="font-medium">Ciudad:</span> {derived.ciudadSitio}
            </div>
            <div>
              <span className="font-medium">Organizadores:</span> {derived.organizadores}
            </div>
            <div>
              <span className="font-medium">Teléfonos organizador:</span> {derived.telefonosOrganizador}
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

            {reserva.asistentes.length > 0 ? (
              <div className="space-y-2">
                {reserva.asistentes.map((asistente, idx) => (
                  <div
                    key={asistente.id_reserva_asistente ?? idx}
                    className="rounded-md border p-3 text-sm"
                  >
                    <p>
                      <span className="font-semibold">Nombre:</span>{" "}
                      {asistente.nombre_asistente || "Sin nombre"}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-semibold text-foreground">Tipo documento:</span>{" "}
                      {asistente.tipo_documento || "—"}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-semibold text-foreground">Número documento:</span>{" "}
                      {asistente.numero_documento || "—"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {reserva.quienes_asistiran?.trim() || "No hay asistentes registrados."}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
