import type { ReservaDetalle } from "../_lib/reserva-detalle";

type ReservaDetalleTitularProps = {
  reserva: ReservaDetalle;
};

export function ReservaDetalleTitular({ reserva }: ReservaDetalleTitularProps) {
  return (
    <div className="space-y-2 text-sm">
      <p className="text-xl font-semibold text-green-700">Datos del titular</p>
      <div className="rounded-md border p-3">
        <div className="grid md:grid-cols-2 gap-2 text-foreground">
          <div>
            <span className="font-semibold text-teal-700">Tipo documento:</span> {reserva.tipo_documento || "-"}
          </div>
          <div>
            <span className="font-semibold text-teal-700">Numero documento:</span> {reserva.numero_documento || "-"}
          </div>
          <div>
            <span className="font-semibold text-teal-700">Nombres:</span> {reserva.nombres || "-"}
          </div>
          <div>
            <span className="font-semibold text-teal-700">Apellidos:</span> {reserva.apellidos || "-"}
          </div>
          <div>
            <span className="font-semibold text-teal-700">Telefono:</span> {reserva.telefono_titular || "-"}
          </div>
          <div>
            <span className="font-semibold text-teal-700">Correo:</span> {reserva.correo_titular || "-"}
          </div>
        </div>
      </div>
    </div>
  );
}
