import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { dbErrorResponse, internalErrorResponse } from '@/lib/api-error-response';
import {
  authRegisterBodySchema,
  parseOptionalNumericId,
} from '@/lib/validation/api-schemas';

/**
 * Registro vía función SQL `fn_auth_crear_usuario`.
 * El flujo web principal del sitio suele ser POST /api/usuario_formulario; conserva esta ruta
 * solo si tienes clientes (scripts, apps) que dependan de ella.
 */
export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'JSON inválido' }, { status: 400 });
  }

  const parsed = authRegisterBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: 'Datos inválidos' }, { status: 400 });
  }

  const { email, password, nombres, apellidos, id_pais, id_rol } = parsed.data;
  const idPaisNum = parseOptionalNumericId(id_pais ?? undefined);
  const idRolNum = parseOptionalNumericId(id_rol ?? undefined) ?? 1;

  try {
    const result = await pool.query(
      `SELECT app_api.fn_auth_crear_usuario($1, $2, $3, $4, $5, $6) AS payload`,
      [
        email,
        password,
        nombres ?? null,
        apellidos ?? null,
        idPaisNum,
        idRolNum,
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
