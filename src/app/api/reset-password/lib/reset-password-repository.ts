import pool from "@/lib/db";
import type { ResetPasswordTokenRow, ResetPasswordUserRow } from "@/app/api/reset-password/lib/reset-password-types";

export async function findResetToken(token: string): Promise<ResetPasswordTokenRow | undefined> {
  const result = await pool.query(
    `
      SELECT id_token_recuperacion, id_usuario, estado, fecha_expiracion
      FROM tabla_recuperacion_contrasena_tokens
      WHERE token = $1
      LIMIT 1
    `,
    [token]
  );

  return result.rows[0] as ResetPasswordTokenRow | undefined;
}

export async function markResetTokenExpiredById(tokenId: number): Promise<void> {
  await pool.query(
    `
      UPDATE tabla_recuperacion_contrasena_tokens
      SET estado = 'Caducado', fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id_token_recuperacion = $1
    `,
    [tokenId]
  );
}

export async function findResetUserByEmail(email: string): Promise<ResetPasswordUserRow | undefined> {
  const result = await pool.query(
    `
      SELECT c.id_usuario, c.correo_usuario AS correo, u.nombres
      FROM tabla_usuarios_credenciales c
      INNER JOIN tabla_usuarios u ON u.id_usuario = c.id_usuario
      WHERE c.correo_usuario = $1
      LIMIT 1
    `,
    [email]
  );

  return result.rows[0] as ResetPasswordUserRow | undefined;
}

export async function expirePendingResetTokensByUserId(userId: string | number): Promise<void> {
  await pool.query(
    `
      UPDATE tabla_recuperacion_contrasena_tokens
      SET estado = 'Caducado', fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id_usuario = $1 AND estado = 'Pendiente'
    `,
    [userId]
  );
}

export async function insertPendingResetToken(input: {
  userId: string | number;
  token: string;
  ipAddress: string | null;
  userAgent: string | null;
}): Promise<void> {
  await pool.query(
    `
      INSERT INTO tabla_recuperacion_contrasena_tokens (
        id_usuario,
        token,
        estado,
        direccion_ip,
        user_agent
      )
      VALUES ($1, $2, 'Pendiente', $3, $4)
    `,
    [input.userId, input.token, input.ipAddress, input.userAgent]
  );
}

export async function expireResetTokenByToken(token: string): Promise<void> {
  await pool.query(
    `
      UPDATE tabla_recuperacion_contrasena_tokens
      SET estado = 'Caducado', fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE token = $1
    `,
    [token]
  );
}

export async function withResetTransaction<T>(work: (client: import("pg").PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
