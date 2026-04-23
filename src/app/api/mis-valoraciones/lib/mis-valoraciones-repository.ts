import pool from "@/lib/db"

export async function fetchMisValoraciones(userId: number) {
  const { rows } = await pool.query(
    "SELECT app_api.fn_valoraciones_obtener($1) AS result",
    [userId]
  )

  return rows[0]?.result
}

export async function createMisValoracion(
  userId: number,
  idEvento: number,
  valoracion: number,
  comentario: string | null
) {
  const { rows } = await pool.query(
    "SELECT app_api.fn_valoraciones_crear($1,$2,$3,$4) AS result",
    [userId, idEvento, valoracion, comentario]
  )

  return rows[0]?.result
}

export async function fetchMisValoracionById(idValoracion: number, userId: number) {
  const { rows } = await pool.query(
    "SELECT app_api.fn_valoraciones_obtener_por_id($1,$2) AS result",
    [idValoracion, userId]
  )

  return rows[0]?.result
}

export async function updateMisValoracion(
  idValoracion: number,
  userId: number,
  valoracion: number | null,
  comentario: string | null
) {
  const { rows } = await pool.query(
    "SELECT app_api.fn_valoraciones_actualizar($1,$2,$3,$4) AS result",
    [idValoracion, userId, valoracion, comentario]
  )

  return rows[0]?.result
}

export async function deleteMisValoracion(idValoracion: number, userId: number) {
  const { rows } = await pool.query(
    "SELECT app_api.fn_valoraciones_eliminar($1,$2) AS result",
    [idValoracion, userId]
  )

  return rows[0]?.result
}
