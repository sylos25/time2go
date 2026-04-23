import pool from "@/lib/db";

export async function getUserPasswordHash(userId: string): Promise<string | null> {
  const result = await pool.query(
    `SELECT contrasena_hash FROM tabla_usuarios_credenciales WHERE id_usuario = $1`,
    [userId]
  );

  if (!result.rows || result.rows.length === 0) {
    return null;
  }

  return result.rows[0]?.contrasena_hash ?? null;
}

export async function updateUserPasswordHash(userId: string, passwordHash: string): Promise<void> {
  await pool.query(
    `UPDATE tabla_usuarios_credenciales
     SET contrasena_hash = $1, fecha_actualizacion = CURRENT_TIMESTAMP
     WHERE id_usuario = $2`,
    [passwordHash, userId]
  );
}
