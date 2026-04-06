import type { ReservaDerived, ReservaDetalle } from "../_lib/reserva-detalle";
import { formatDateEs, formatHour12 } from "../_lib/reserva-detalle";

type ReservaDetalleEventoProps = {
  reserva: ReservaDetalle;
  derived: ReservaDerived;
};

export function ReservaDetalleEvento({ reserva, derived }: ReservaDetalleEventoProps) {
  return (
    <div className="space-y-2 text-sm text-foreground">
      <div className="grid md:grid-cols-2 gap-3">
        <div><span className="font-semibold text-teal-700">Categoria:</span> {derived.categoriaEvento}</div>
        <div><span className="font-semibold text-teal-700">Tipo de evento:</span> {derived.tipoEvento}</div>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div><span className="font-semibold text-teal-700">Organizadores:</span> {derived.organizadores}</div>
        <div><span className="font-semibold text-teal-700">PULEP:</span> {derived.pulepEvento}</div>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div><span className="font-semibold text-teal-700">Aforo:</span> {derived.aforoTexto}</div>
        <div><span className="font-semibold text-teal-700">Lugar:</span> {derived.nombreSitio}</div>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div><span className="font-semibold text-teal-700">Direccion:</span> {derived.direccionSitio}</div>
        <div><span className="font-semibold text-teal-700">Municipio:</span> {derived.ciudadSitio}</div>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <span className="font-semibold text-teal-700">Fecha:</span> {formatDateEs(reserva.fecha_inicio)}
        </div>
        <div>
          <span className="font-semibold text-teal-700">Hora inicio:</span> {formatHour12(reserva.hora_inicio)}
          {reserva.hora_final ? " · " : ""}
          {reserva.hora_final ? <><span className="font-semibold text-teal-700">Hora fin:</span> {formatHour12(reserva.hora_final)}</> : ""}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div><span className="font-semibold text-teal-700">Modalidad:</span> {derived.modalidad}</div>
        <div><span className="font-semibold text-teal-700">Cupos reservados:</span> {derived.cuposReservados}</div>
      </div>
    </div>
  );
}
