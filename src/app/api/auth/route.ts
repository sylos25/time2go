import pool from '@/lib/db';

export async function POST(req: Request) {
  const { email, password, nombres, apellidos, tipo_documento, numero_documento, id_pais, id_rol } = await req.json();

  try {
    const result = await pool.query(
      `INSERT INTO tabla_usuarios (numero_documento, nombres, apellidos, tipo_documento, id_pais, id_rol, correo, contrasena_hash, fecha_registro, estado, fecha_actualizacion)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,now(), true, now())
       RETURNING *;`,
      [numero_documento, nombres, apellidos, tipo_documento, id_pais, id_rol, email, password]
    );

    const user = result.rows[0];
    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.error('Error creating user:', error);
    return new Response(JSON.stringify({ error: 'Error al crear usuario' }), { status: 500 });
  }
}
