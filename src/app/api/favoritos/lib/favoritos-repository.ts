import pool from "@/lib/db"

import type { FavoriteRow } from "@/app/api/favoritos/lib/favoritos-types"

export async function listFavoriteRows(userId: number): Promise<FavoriteRow[]> {
  const result = await pool.query<FavoriteRow>(
    `SELECT id_evento
     FROM tabla_favoritos
     WHERE id_usuario = $1
     ORDER BY fecha_creacion DESC`,
    [userId]
  )

  return result.rows || []
}

export async function addFavorite(userId: number, eventId: number): Promise<void> {
  await pool.query(
    `INSERT INTO tabla_favoritos (id_usuario, id_evento)
     VALUES ($1, $2)
     ON CONFLICT (id_usuario, id_evento) DO NOTHING`,
    [userId, eventId]
  )
}

export async function removeFavorite(userId: number, eventId: number): Promise<void> {
  await pool.query(
    `DELETE FROM tabla_favoritos
     WHERE id_usuario = $1 AND id_evento = $2`,
    [userId, eventId]
  )
}
