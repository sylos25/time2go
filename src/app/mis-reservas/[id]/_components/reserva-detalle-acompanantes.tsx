import type { ReservaDetalle } from "../_lib/reserva-detalle";

type ReservaDetalleAcompanantesProps = {
  reserva: ReservaDetalle;
};

export function ReservaDetalleAcompanantes({ reserva }: ReservaDetalleAcompanantesProps) {
  return (
    <div className="space-y-2">
      <p className="text-xl font-semibold text-green-700">Listado de acompanantes</p>

      {Array.isArray(reserva.asistentes) && reserva.asistentes.length > 0 ? (
        <div className="space-y-2">
          {reserva.asistentes.map((asistente, idx) => (
            <div key={asistente.id_reserva_asistente || idx} className="rounded-md border p-3 text-sm">
              <div className="grid md:grid-cols-2 gap-2 text-muted-foreground">
                <div>
                  <span className="font-semibold text-teal-700">Tipo documento:</span> {asistente.tipo_documento || "-"}
                </div>
                <div>
                  <span className="font-semibold text-teal-700">Numero documento:</span> {asistente.numero_documento || "-"}
                </div>
                <div>
                  <span className="font-semibold text-teal-700">Nombres:</span> {asistente.nombres || "-"}
                </div>
                <div>
                  <span className="font-semibold text-teal-700">Apellidos:</span> {asistente.apellidos || "-"}
                </div>
                <div>
                  <span className="font-semibold text-teal-700">Telefono:</span> {asistente.telefono || "-"}
                </div>
                <div>
                  <span className="font-semibold text-teal-700">Correo:</span> {asistente.correo || "-"}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{reserva.quienes_asistiran || "No hay asistentes registrados."}</p>
      )}
    </div>
  );
}
