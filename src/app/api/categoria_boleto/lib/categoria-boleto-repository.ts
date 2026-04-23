import pool from "@/lib/db"

import type { CategoriaBoletoRow } from "@/app/api/categoria_boleto/lib/categoria-boleto-types"

export async function listCategoriaBoletos(): Promise<CategoriaBoletoRow[]> {
  const result = await pool.query<CategoriaBoletoRow>(
    "SELECT id_categoria_boleto, nombre_categoria_boleto FROM tabla_categoria_boletos ORDER BY nombre_categoria_boleto"
  )

  return result.rows || []
}
