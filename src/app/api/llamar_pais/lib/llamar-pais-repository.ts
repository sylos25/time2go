import pool from "@/lib/db"

import type { PaisRow } from "@/app/api/llamar_pais/lib/llamar-pais-types"

export async function listPaises(): Promise<PaisRow[]> {
  const result = await pool.query<PaisRow>(
    "SELECT id_pais, nombre_pais FROM tabla_paises ORDER BY nombre_pais ASC"
  )

  return result.rows || []
}
