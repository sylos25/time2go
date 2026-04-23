import pool from "@/lib/db"

import type { TransactionRow } from "@/app/api/mis-transacciones/lib/mis-transacciones-types"

export async function listUserTransactions(userId: number): Promise<TransactionRow[]> {
  const result = await pool.query<TransactionRow>(
    `SELECT
       s.id_suscripcion_organizador,
       s.fecha_creacion::text,
       p.nombre_plan,
       s.monto_pago::text,
       s.estado_suscripcion
     FROM tabla_suscripciones_organizador s
     INNER JOIN tabla_planes_organizador p ON p.id_plan = s.id_plan
     WHERE s.id_usuario = $1
     ORDER BY s.fecha_creacion DESC, s.id_suscripcion_organizador DESC`,
    [userId]
  )

  return result.rows || []
}
