import pool from "@/lib/db"

import type { MeRow } from "@/app/api/me/lib/me-types"

export async function findUserProfileById(userId: string | number): Promise<MeRow | null> {
  const result = await pool.query<MeRow>(
    `SELECT 
      u.id_publico,
      u.tipo_documento,
      u.numero_documento,
      u.nombres, 
      u.apellidos, 
      c.correo_usuario AS correo, 
      u.id_rol, 
      u.id_pais, 
      u.telefono_persona AS telefono,
      c.validacion_correo,
      u.fecha_creacion AS fecha_registro,
      p.nombre_pais,
      r.nombre_rol
    FROM tabla_usuarios u
    LEFT JOIN tabla_usuarios_credenciales c ON c.id_usuario = u.id_usuario
    LEFT JOIN tabla_paises p ON u.id_pais = p.id_pais
    LEFT JOIN tabla_roles r ON u.id_rol = r.id_rol
    WHERE u.id_usuario = $1 LIMIT 1`,
    [userId]
  )

  return result.rows?.[0] ?? null
}
