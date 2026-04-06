import { Calendar, Clock, Link as LinkIcon, Phone, Ticket } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import type { CalendarDayCell } from "../lib/event-landing-utils"
import { formatLongDate } from "../lib/event-landing-utils"
import type { EventCreator, EventLink } from "../lib/event-landing-types"

type EventSidebarProps = {
  gratisPago: boolean
  priceLabel: string
  reserveButtonText: string
  reserveDisabled: boolean
  canReserveByRole: boolean
  cuposDisponibles: number
  links: EventLink[]
  fechaInicio?: string | null
  fechaFin?: string | null
  formattedHorario: string
  calendarCells: CalendarDayCell[]
  organizerPhones: string
  creator?: EventCreator | null
  onReserve: () => void
}

export function EventSidebar({
  gratisPago,
  priceLabel,
  reserveButtonText,
  reserveDisabled,
  canReserveByRole,
  cuposDisponibles,
  links,
  fechaInicio,
  fechaFin,
  formattedHorario,
  calendarCells,
  organizerPhones,
  creator,
  onReserve,
}: EventSidebarProps) {
  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-card/80 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-1">{gratisPago ? "Desde" : "Entrada"}</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-lime-600 bg-clip-text text-transparent">
              {priceLabel}
            </p>
          </div>

          {canReserveByRole && (
            <Button
              onClick={onReserve}
              className="w-full mb-3 bg-gradient-to-r from-red-500 to-fuchsia-500 text-white hover:from-red-600 hover:to-fuchsia-700"
              size="lg"
              disabled={reserveDisabled}
            >
              <Ticket className="h-5 w-5 mr-2" />
              {reserveButtonText}
            </Button>
          )}

          <p className="text-sm text-center text-muted-foreground mt-2">
            Cupos disponibles: <span className="font-semibold text-foreground">{cuposDisponibles.toLocaleString("es-CO")}</span>
          </p>

          {links.length > 0 && (
            <div className="space-y-2">
              {links.map((link, index) => (
                <a
                  key={`${link.id_link || "link"}-${index}`}
                  href={link.link || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full bg-transparent" size="sm">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Ver boletería
                  </Button>
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Fecha y hora
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Inicio</span>
            <span className="font-medium">{formatLongDate(fechaInicio)}</span>
          </div>
          {fechaFin && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fin</span>
              <span className="font-medium">{formatLongDate(fechaFin)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Horario</span>
            <span className="font-medium">{formattedHorario}</span>
          </div>

          {calendarCells.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-muted-foreground mb-3 font-medium">Días del evento</p>
              <div className="grid grid-cols-7 gap-1">
                {["D", "L", "M", "M", "J", "V", "S"].map((day, index) => (
                  <div key={`header-${day}-${index}`} className="text-center text-xs font-semibold text-muted-foreground py-1">
                    {day}
                  </div>
                ))}
                {calendarCells.map((cell) => (
                  <div
                    key={cell.key}
                    className={`text-center py-1.5 text-xs rounded-md ${
                      cell.dayLabel.length === 0
                        ? ""
                        : cell.isEventDay
                          ? "bg-gradient-to-tr from-lime-500 to-green-600 text-white font-bold"
                          : "text-muted-foreground"
                    }`}
                  >
                    {cell.dayLabel}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-1">
          <CardTitle className="text-base">Organizador</CardTitle>
        </CardHeader>
        <CardContent className="text-sm -mt-6">
          {creator && (
            <div className="flex items-center gap-3">
              <div>
                <p className="font-medium">
                  {creator.nombres} {creator.apellidos}
                </p>
                <p className="text-xs text-muted-foreground">Organizador</p>
              </div>
            </div>
          )}
          {organizerPhones !== "—" && (
            <div className="flex items-center gap-2 text-muted-foreground mt-2">
              <Phone className="h-4 w-4" />
              <span>{organizerPhones}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
