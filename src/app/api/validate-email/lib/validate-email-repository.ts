import pool from "@/lib/db";

export type EmailValidationTokenRow = {
  id_usuario: string | number;
  utilizado: boolean;
  fecha_expiracion: string;
};

export async function findEmailValidationToken(token: string): Promise<EmailValidationTokenRow | undefined> {
  const result = await pool.query(
    `SELECT id_usuario, utilizado, fecha_expiracion
     FROM tabla_validacion_email_tokens
     WHERE token = $1`,
    [token]
  );

  return result.rows[0] as EmailValidationTokenRow | undefined;
}

export async function markUserEmailValidated(userId: string | number): Promise<void> {
  await pool.query(
    `UPDATE tabla_usuarios_credenciales
     SET validacion_correo = TRUE, fecha_actualizacion = CURRENT_TIMESTAMP
     WHERE id_usuario = $1`,
    [userId]
  );
}

export async function markEmailTokenAsUsed(token: string): Promise<void> {
  await pool.query(
    `UPDATE tabla_validacion_email_tokens
     SET utilizado = TRUE, fecha_validacion = CURRENT_TIMESTAMP
     WHERE token = $1`,
    [token]
  );
}
