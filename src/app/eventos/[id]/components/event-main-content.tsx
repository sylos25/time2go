import dynamic from "next/dynamic"
import {
  Calendar,
  ChevronDown,
  Clock,
  Grid3X3,
  Link as LinkIcon,
  MapPin,
  Phone,
  TagIcon,
  Ticket,
  Users,
} from "lucide-react"

import { EventoReportarDialog } from "@/components/evento-reportar-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import Valoraciones from "../valoraciones"
import { formatShortDate } from "../lib/event-landing-utils"
import type { EventData, EventReservation, EventTicketValue } from "../lib/event-landing-types"

type EventMainContentProps = {
  event: EventData
  tipoEventoNombre: string
  formattedHorario: string
  totalCupo: number
  informacionImportante: string | null
  creatorMode: boolean
  eventReservations: EventReservation[]
  loadingEventReservations: boolean
  isAuthenticated: boolean
  meUserId: number | null
  hasMapCoords: boolean
  showMap: boolean
  sitioLat: number | null
  sitioLng: number | null
  pulepEvento: string
  onToggleMap: () => void
}

const LeafletMap = dynamic(() => import("@/components/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full rounded-xl bg-muted/40 flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Cargando mapa...</p>
    </div>
  ),
})

export function EventMainContent({
  event,
  tipoEventoNombre,
  formattedHorario,
  totalCupo,
  informacionImportante,
  creatorMode,
  eventReservations,
  loadingEventReservations,
  isAuthenticated,
  meUserId,
  hasMapCoords,
  showMap,
  sitioLat,
  sitioLng,
  pulepEvento,
  onToggleMap,
}: EventMainContentProps) {
  const valores = Array.isArray(event.valores) ? event.valores : []

  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <TagIcon className="h-5 w-5 mx-auto mb-2 text-fuchsia-600" />
            <p className="text-xs text-muted-foreground">Categoria</p>
            <p className="font-semibold text-sm truncate">{event.categoria?.nombre || "—"}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Grid3X3 className="h-5 w-5 mx-auto mb-2 text-red-600" />
            <p className="text-xs text-muted-foreground">Tipo</p>
            <p className="font-semibold text-sm truncate">{tipoEventoNombre}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Calendar className="h-5 w-5 mx-auto mb-2 text-fuchsia-600" />
            <p className="text-xs text-muted-foreground">Fecha</p>
            <p className="font-semibold text-sm">{formatShortDate(event.fecha_inicio)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 mx-auto mb-2 text-red-600" />
            <p className="text-xs text-muted-foreground">Hora</p>
            <p className="font-semibold text-sm">{formattedHorario}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto mb-2 text-fuchsia-600" />
            <p className="text-xs text-muted-foreground">Aforo para</p>
            <p className="font-semibold text-sm">{totalCupo.toLocaleString("es-CO")}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader className="flex items-start gap-4">
          <div className="flex-1 text-left w-full">
            <CardTitle className="text-lg">Ubicación</CardTitle>
            <p className="mt-2">{event.sitio?.nombre_sitio || "Lugar por confirmar"}</p>
            <p className="text-sm text-muted-foreground">
              {event.sitio?.direccion} — {event.municipio?.nombre_municipio}
            </p>

            {hasMapCoords && (
              <button
                type="button"
                onClick={onToggleMap}
                className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-75 transition-opacity"
              >
                <MapPin className="h-4 w-4" />
                {showMap ? "Ocultar mapa" : "Ver en el mapa"}
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${showMap ? "rotate-180" : ""}`}
                />
              </button>
            )}

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showMap && hasMapCoords ? "max-h-[320px] mt-3 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {showMap && hasMapCoords && sitioLat !== null && sitioLng !== null && (
                <div className="h-[300px] w-full rounded-xl overflow-hidden border border-border">
                  <LeafletMap
                    center={{ lat: sitioLat, lng: sitioLng }}
                    zoom={16}
                    selectedCoords={{ lat: sitioLat, lng: sitioLng }}
                    onMapClick={() => {}}
                  />
                </div>
              )}
            </div>

            <div className="mt-3 space-y-2">
              <p className="text-sm font-medium">Accesibilidad</p>
              <p className="text-sm text-muted-foreground">
                {event.sitio?.acceso_discapacidad
                  ? "Este sitio reporta acceso para personas con discapacidad."
                  : "Este sitio no reporta acceso para personas con discapacidad."}
              </p>
              {Array.isArray(event.sitio?.infraestructura_discapacitados) &&
                event.sitio.infraestructura_discapacitados.length > 0 && (
                  <div className="space-y-1">
                    {event.sitio.infraestructura_discapacitados.map((infra, index) => (
                      <div
                        key={`${infra.id_sitios_discapacitados || "infra"}-${index}`}
                        className="rounded-md border border-border/60 bg-muted/40 p-2 text-sm"
                      >
                        <p className="font-medium">
                          {infra.nombre_infraestructura_discapacitados || "Infraestructura de accesibilidad"}
                        </p>
                        <p className="text-muted-foreground">{infra.descripcion}</p>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Acerca del evento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 -mt-6">
          <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-line">{event.descripcion}</p>
          <div className="flex items-center justify-between rounded-lg bg-muted/40 border border-border p-3">
            <div>
              <p className="text-xs text-muted-foreground">Responsable del evento</p>
              <p className="text-sm">{event.responsable_evento || "No registrado"}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">PULEP</p>
              <p>{pulepEvento}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {informacionImportante && (
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">Información importante</CardTitle>
          </CardHeader>
          <CardContent className="-mt-5">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{informacionImportante}</p>
          </CardContent>
        </Card>
      )}

      {valores.length > 0 && (
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Tipos de entrada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {valores.map((value: EventTicketValue, index) => (
                <div
                  key={`${value.id_boleto || value.id_valor || "ticket"}-${index}`}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Ticket className="h-5 w-5 text-lime-600" />
                    </div>
                    <span className="font-medium">
                      {value.nombre_boleto ?? value.nombre_categoria_boleto ?? "Boleto"}
                    </span>
                  </div>
                  <span className="font-bold text-lg">
                    ${Number(value.precio_boleto ?? value.valor ?? 0).toLocaleString("es-CO")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {creatorMode && (
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Reservas del evento ({eventReservations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingEventReservations ? (
              <p className="text-sm text-muted-foreground">Cargando reservas...</p>
            ) : eventReservations.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay reservas para este evento.</p>
            ) : (
              <div className="space-y-3">
                {eventReservations.map((reservation) => (
                  <div
                    key={reservation.id_reserva_evento}
                    className="p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <p className="font-medium">
                      {reservation.nombres} {reservation.apellidos}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Documento: {reservation.tipo_documento} · {reservation.numero_documento}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Asistentes: {reservation.cuantos_asistiran} · Reserva: {reservation.fecha_reserva ? new Date(reservation.fecha_reserva).toLocaleString("es-ES") : "—"}
                    </p>
                    {reservation.quienes_asistiran ? (
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{reservation.quienes_asistiran}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Valoraciones</CardTitle>
        </CardHeader>
        <CardContent className="-mt-5">
          <Valoraciones eventId={Number(event.id_evento)} />
        </CardContent>
      </Card>

      <EventoReportarDialog
        eventId={Number(event.id_evento)}
        isAuthenticated={isAuthenticated}
        creatorMode={creatorMode}
        isOwnEvent={meUserId != null && Number(event.id_usuario) === meUserId}
      />
    </div>
  )
}
