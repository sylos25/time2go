import pool from "@/lib/db";
import type { GoogleIdentity, GoogleLoginUser } from "@/app/api/login-google/lib/login-google-types";

export async function findGoogleLoginUser(googleId: string, email: string): Promise<GoogleLoginUser | undefined> {
  const existing = await pool.query(
    `
      SELECT
        u.id_usuario,
        u.id_publico,
        u.id_rol,
        u.estado_usuario AS estado,
        c.correo_usuario AS correo,
        c.id_google,
        c.validacion_correo,
        u.nombres
      FROM tabla_usuarios u
      INNER JOIN tabla_usuarios_credenciales c ON c.id_usuario = u.id_usuario
      WHERE c.id_google = $1 OR c.correo_usuario = $2
      LIMIT 1
    `,
    [googleId, email]
  );

  return existing.rows[0] as GoogleLoginUser | undefined;
}

export async function syncExistingGoogleLoginUser(userId: string | number, identity: GoogleIdentity): Promise<void> {
  await pool.query(
    `
      UPDATE tabla_usuarios_credenciales
      SET id_google = COALESCE(id_google, $1),
          validacion_correo = TRUE,
          fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id_usuario = $2
    `,
    [identity.googleId, userId]
  );

  if (identity.nombres || identity.apellidos) {
    await pool.query(
      `
        UPDATE tabla_usuarios
        SET nombres = COALESCE(NULLIF(nombres, ''), $1),
            apellidos = COALESCE(NULLIF(apellidos, ''), $2),
            fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id_usuario = $3
      `,
      [identity.nombres || null, identity.apellidos || null, userId]
    );
  }
}

export async function findGoogleLoginUserById(userId: string | number): Promise<GoogleLoginUser | undefined> {
  const result = await pool.query(
    `
      SELECT
        u.id_usuario,
        u.id_publico,
        u.id_rol,
        c.correo_usuario AS correo,
        u.nombres
      FROM tabla_usuarios u
      INNER JOIN tabla_usuarios_credenciales c ON c.id_usuario = u.id_usuario
      WHERE u.id_usuario = $1
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] as GoogleLoginUser | undefined;
}

export async function createGoogleLoginUser(identity: GoogleIdentity): Promise<GoogleLoginUser | undefined> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const createdUser = await client.query(
      `
        INSERT INTO tabla_usuarios (
          nombres,
          apellidos,
          terminos_condiciones,
          estado_usuario,
          id_rol,
          fecha_actualizacion
        ) VALUES ($1,$2,TRUE,TRUE,1,NOW())
        RETURNING id_usuario
      `,
      [identity.nombres || null, identity.apellidos || null]
    );

    const newUserId = createdUser.rows[0]?.id_usuario;

    await client.query(
      `
        INSERT INTO tabla_usuarios_credenciales (
          id_usuario,
          id_google,
          correo_usuario,
          validacion_correo,
          fecha_creacion,
          fecha_actualizacion
        ) VALUES ($1,$2,$3,TRUE,NOW(),NOW())
      `,
      [newUserId, identity.googleId, identity.email]
    );

    await client.query("COMMIT");
    return await findGoogleLoginUserById(newUserId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
