import { getRequesterIdLenient } from "@/lib/auth-request"
import pool from "@/lib/db"

import type { EventValoracionUser } from "@/app/api/events/[id]/valoraciones/lib/event-valoraciones-types"

export async function getEventValoracionAuthenticatedUser(
  req: Request
): Promise<EventValoracionUser | null> {
  const userId = await getRequesterIdLenient(req)
  if (!userId) return null

  const userQuery = await pool.query<EventValoracionUser>(
    `SELECT u.id_usuario, u.nombres, u.apellidos
     FROM tabla_usuarios u
     WHERE u.id_usuario = $1
     LIMIT 1`,
    [userId]
  )

  return userQuery.rows?.[0] ?? null
}
