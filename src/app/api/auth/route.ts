import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { dbErrorResponse, internalErrorResponse } from '@/lib/api-error-response';

export async function POST(req: Request) {
  const { email, password, nombres, apellidos, id_pais, id_rol } = await req.json();

  try {
    const result = await pool.query(
      `SELECT app_api.fn_auth_crear_usuario($1, $2, $3, $4, $5, $6) AS payload`,
      [
        email,
        password,
        nombres ?? null,
        apellidos ?? null,
        id_pais ?? null,
        id_rol ?? 1,
      ]
    );

    const payload = result.rows?.[0]?.payload;
    if (!payload?.ok) {
      return dbErrorResponse(payload, 'Error al crear usuario');
    }

    return NextResponse.json({ id_publico: payload.id_publico }, { status: 200 });
  } catch (error) {
    console.error('Error creating user:', error);
    return internalErrorResponse('Error al crear usuario');
  }
}
