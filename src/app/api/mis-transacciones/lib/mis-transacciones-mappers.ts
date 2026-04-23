import type {
  TransactionDto,
  TransactionRow,
} from "@/app/api/mis-transacciones/lib/mis-transacciones-types"

export function mapTransactionRow(row: TransactionRow): TransactionDto {
  return {
    id_suscripcion_organizador: Number(row.id_suscripcion_organizador),
    fecha_creacion: String(row.fecha_creacion || ""),
    nombre_plan: String(row.nombre_plan || ""),
    monto_pago: String(row.monto_pago || "0"),
    estado_suscripcion: String(row.estado_suscripcion || ""),
  }
}

export function mapTransactionRows(rows: TransactionRow[]): TransactionDto[] {
  return rows.map(mapTransactionRow)
}
