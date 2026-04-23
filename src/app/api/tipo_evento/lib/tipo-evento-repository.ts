import pool from "@/lib/db"

import type { TipoEventoRow } from "@/app/api/tipo_evento/lib/tipo-evento-types"

export async function listTiposEventoByCategoriaId(categoriaId: number): Promise<TipoEventoRow[]> {
  const result = await pool.query<TipoEventoRow>(
    "SELECT id_tipo_evento, nombre_tipo_evento AS nombre FROM tabla_tipo_eventos WHERE id_categoria_evento = $1",
    [categoriaId]
  )

  return result.rows || []
}
