import pool from "@/lib/db"

import type { PermissionCheckRow } from "@/app/api/permissions/check/lib/permissions-check-types"

export async function findUserRoleById(userId: string): Promise<number | null> {
  const result = await pool.query(
    "SELECT id_rol FROM tabla_usuarios WHERE id_usuario = $1",
    [userId]
  )

  return result.rows?.[0] ? Number(result.rows[0].id_rol) : null
}

export async function findPermissionAccess(
  idAccesibilidad: string,
  idRol: string
): Promise<PermissionCheckRow | null> {
  const result = await pool.query<PermissionCheckRow>(
    `SELECT 
      axr.id_accesibilidad_menu_x_rol,
      axr.id_accesibilidad,
      axr.id_rol,
      am.nombre_accesibilidad
     FROM tabla_accesibilidad_menu_x_rol axr
     INNER JOIN tabla_accesibilidad_menu am ON axr.id_accesibilidad = am.id_accesibilidad
     WHERE axr.id_accesibilidad = $1 AND axr.id_rol = $2`,
    [idAccesibilidad, idRol]
  )

  return result.rows?.[0] ?? null
}
