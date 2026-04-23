import { Card, CardContent } from "@/components/ui/card"

import type { TransaccionItem } from "@/app/mis-transacciones/lib/mis-transacciones-types"
import {
  formatCopAmount,
  formatDate,
  statusBadgeClass,
} from "@/app/mis-transacciones/lib/mis-transacciones-utils"

type TransactionsListProps = {
  transacciones: TransaccionItem[]
}

export function TransactionsList({ transacciones }: TransactionsListProps) {
  return (
    <div className="space-y-4">
      {transacciones.map((item) => (
        <Card
          key={item.id_suscripcion_organizador}
          className="bg-card/90 backdrop-blur-sm border border-border rounded-sm"
        >
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Fecha de compra</p>
                <p className="font-semibold text-foreground">{formatDate(item.fecha_creacion)}</p>
              </div>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusBadgeClass(item.estado_suscripcion)}`}
              >
                {item.estado_suscripcion}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="font-medium text-foreground">{item.nombre_plan}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Precio</p>
                <p className="font-medium text-foreground">{formatCopAmount(item.monto_pago)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
