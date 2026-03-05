import pool from '@/lib/db';

export async function POST(req: Request) {
  const { email, password, nombres, apellidos, id_pais, id_rol } = await req.json();

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const userResult = await client.query(
        `INSERT INTO tabla_usuarios (id_rol, terminos_condiciones, fecha_registro, estado, fecha_actualizacion)
         VALUES ($1, TRUE, now(), true, now())
         RETURNING id_usuario, id_publico;`,
        [id_rol ?? 1]
      );

      const user = userResult.rows[0];

      await client.query(
        `INSERT INTO tabla_personas (id_usuario, nombres, apellidos, id_pais)
         VALUES ($1, $2, $3, $4);`,
        [user.id_usuario, nombres ?? null, apellidos ?? null, id_pais ?? null]
      );

      await client.query(
        `INSERT INTO tabla_usuarios_credenciales (id_usuario, correo, contrasena_hash)
         VALUES ($1, $2, $3);`,
        [user.id_usuario, email, password]
      );

      await client.query('COMMIT');

      return new Response(
        JSON.stringify({ id_publico: user.id_publico }),
        { status: 200 }
      );
    } catch (txError) {
      await client.query('ROLLBACK');
      throw txError;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating user:', error);
    return new Response(JSON.stringify({ error: 'Error al crear usuario' }), { status: 500 });
  }
}
