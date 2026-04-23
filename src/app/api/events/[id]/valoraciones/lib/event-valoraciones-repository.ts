import pool from "@/lib/db"

import type { EventValoracionRow } from "@/app/api/events/[id]/valoraciones/lib/event-valoraciones-types"

export async function listEventValoraciones(eventId: number): Promise<EventValoracionRow[]> {
  const result = await pool.query<EventValoracionRow>(
    `SELECT
      v.id_valoracion,
      v.id_usuario,
      v.id_evento,
      v.valoracion,
      v.comentario,
      v.fecha_creacion,
      u.nombres,
      u.apellidos
    FROM tabla_valoraciones v
    INNER JOIN tabla_usuarios u ON u.id_usuario = v.id_usuario
    WHERE v.id_evento = $1
    ORDER BY v.fecha_creacion DESC`,
    [eventId]
  )

  return result.rows || []
}

export async function isEventAvailableForRatings(eventId: number): Promise<boolean> {
  const result = await pool.query(
    "SELECT id_evento FROM tabla_eventos WHERE id_evento = $1 AND estado = TRUE LIMIT 1",
    [eventId]
  )

  return Boolean(result.rows?.length)
}

export async function findExistingEventValoracion(userId: number, eventId: number): Promise<number | null> {
  const result = await pool.query(
    `SELECT id_valoracion
     FROM tabla_valoraciones
     WHERE id_usuario = $1 AND id_evento = $2
     ORDER BY fecha_creacion DESC
     LIMIT 1`,
    [userId, eventId]
  )

  return result.rows?.[0] ? Number(result.rows[0].id_valoracion) : null
}

export async function updateEventValoracion(
  idValoracion: number,
  valoracion: number,
  comentario: string | null
): Promise<EventValoracionRow | null> {
  const result = await pool.query<EventValoracionRow>(
    `UPDATE tabla_valoraciones
     SET valoracion = $1,
         comentario = $2,
         fecha_actualizacion = CURRENT_TIMESTAMP
     WHERE id_valoracion = $3
     RETURNING id_valoracion, id_usuario, id_evento, valoracion, comentario, fecha_creacion, fecha_actualizacion`,
    [valoracion, comentario, idValoracion]
  )

  return result.rows?.[0] ?? null
}

export async function createEventValoracion(
  userId: number,
  eventId: number,
  valoracion: number,
  comentario: string | null
): Promise<EventValoracionRow | null> {
  const result = await pool.query<EventValoracionRow>(
    `INSERT INTO tabla_valoraciones (id_usuario, id_evento, valoracion, comentario)
     VALUES ($1, $2, $3, $4)
     RETURNING id_valoracion, id_usuario, id_evento, valoracion, comentario, fecha_creacion`,
    [userId, eventId, valoracion, comentario]
  )

  return result.rows?.[0] ?? null
}

export async function userOwnsEventValoracion(
  idValoracion: number,
  eventId: number,
  userId: number
): Promise<boolean> {
  const result = await pool.query(
    `SELECT id_valoracion
     FROM tabla_valoraciones
     WHERE id_valoracion = $1
       AND id_evento = $2
       AND id_usuario = $3
     LIMIT 1`,
    [idValoracion, eventId, userId]
  )

  return Boolean(result.rows?.length)
}

export async function deleteEventValoracion(idValoracion: number): Promise<void> {
  await pool.query(
    `DELETE FROM tabla_valoraciones
     WHERE id_valoracion = $1`,
    [idValoracion]
  )
}
