import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  canCancelReservation,
  getReservationDateLabel,
  getTotalAsistentes,
  type ReservaItem,
} from "../_lib/mis-reservas";

type ReservationCardProps = {
  reserva: ReservaItem;
  cancellingId: number | null;
  onView: (reservaId: number) => void;
  onCancel: (reserva: ReservaItem) => void;
};

export function ReservationCard({
  reserva,
  cancellingId,
  onView,
  onCancel,
}: ReservationCardProps) {
  const canCancel = canCancelReservation(reserva);

  return (
    <Card className="bg-card/90 backdrop-blur-sm border border-border rounded-sm overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold text-foreground line-clamp-2">
          {reserva.nombre_evento}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {reserva.url_imagen_evento && (
          <img
            src={reserva.url_imagen_evento}
            alt={reserva.nombre_evento ?? "Evento"}
            className="w-full h-36 object-cover rounded-lg"
          />
        )}

        <div className="text-sm text-muted-foreground space-y-1">
          <div>
            <span>{getReservationDateLabel(reserva)}</span>
          </div>
          <div>
            <span>{reserva.nombre_sitio || reserva.nombre_municipio || "—"}</span>
          </div>
          <div>
            <span>{reserva.sitio_direccion || "—"}</span>
          </div>
          <div>
            <span>Asistentes: {getTotalAsistentes(reserva)}</span>
          </div>
        </div>

        <div className="pt-2 grid grid-cols-2 gap-2">
          <Button
            size="sm"
            className="w-full bg-gradient-to-tr from-green-600 to-lime-500 text-white hover:from-green-500 hover:to-lime-400"
            onClick={() => onView(Number(reserva.id_reserva_evento))}
          >
            Ver reserva
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-border text-foreground hover:border-red-400 hover:text-red-600"
            disabled={cancellingId === reserva.id_reserva_evento || !canCancel}
            onClick={() => onCancel(reserva)}
            title={
              canCancel
                ? "Cancelar reserva"
                : "Solo puedes cancelar hasta 12 horas antes del evento"
            }
          >
            {cancellingId === reserva.id_reserva_evento ? "Cancelando..." : "Cancelar reserva"}
          </Button>
        </div>

        {!canCancel && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-sm px-2 py-1">
            La cancelación se permite únicamente hasta 12 horas antes del inicio.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
