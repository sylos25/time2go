import pool from "@/lib/db"

import type { CategoriaEventoRow } from "@/app/api/categoria_evento/lib/categoria-evento-types"

export async function listCategoriaEventos(): Promise<CategoriaEventoRow[]> {
  const result = await pool.query<CategoriaEventoRow>(
    "SELECT id_categoria_evento, nombre FROM tabla_categoria_eventos"
  )

  return result.rows || []
}
