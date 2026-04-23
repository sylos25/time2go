import pool from "@/lib/db"

import type { UsuariosFilters, UsuariosListingPayload } from "@/app/api/usuarios/lib/usuarios-types"

export async function findRequesterRole(requesterId: string): Promise<number | null> {
  const result = await pool.query(
    "SELECT id_rol FROM tabla_usuarios WHERE id_usuario = $1 LIMIT 1",
    [requesterId]
  )

  return result.rows?.[0] ? Number(result.rows[0].id_rol) : null
}

export async function listUsuarios(filters: UsuariosFilters): Promise<UsuariosListingPayload | null> {
  const result = await pool.query(
    `SELECT fn_listar_usuarios_paginado_json($1, $2, $3, $4, $5, $6) AS payload`,
    [
      filters.roleParam,
      filters.rolesParam && filters.rolesParam.length > 0 ? filters.rolesParam : null,
      filters.estadoParam,
      filters.qParam,
      filters.page,
      filters.pageSize,
    ]
  )

  return (result.rows?.[0]?.payload as UsuariosListingPayload | null) ?? null
}
