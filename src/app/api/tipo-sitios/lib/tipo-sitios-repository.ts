import pool from "@/lib/db"

import type { TipoSitioRow } from "@/app/api/tipo-sitios/lib/tipo-sitios-types"

export async function listTipoSitios(): Promise<TipoSitioRow[]> {
  const result = await pool.query<TipoSitioRow>(
    "SELECT id_tipo_sitio, nombre_tipo_sitio FROM tabla_tipo_sitios ORDER BY nombre_tipo_sitio ASC"
  )

  return result.rows || []
}
