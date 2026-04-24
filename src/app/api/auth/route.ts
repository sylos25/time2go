import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { dbErrorResponse, internalErrorResponse } from '@/lib/api-error-response';
import {
  authRegisterBodySchema,
  parseOptionalNumericId,
} from '@/lib/validation/api-schemas';

const DEFAULT_PUBLIC_REGISTER_ROLES = [1];

function getAllowedPublicRegisterRoles(): number[] {
  const raw = (process.env.PUBLIC_REGISTER_ALLOWED_ROLE_IDS || "").trim();
  if (!raw) return DEFAULT_PUBLIC_REGISTER_ROLES;

  const parsed = raw
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((id) => Number.isInteger(id) && id > 0);

  return parsed.length > 0 ? parsed : DEFAULT_PUBLIC_REGISTER_ROLES;
}

function resolveRequestedRoleId(requestedRole: number | null): number | null {
  const allowedRoles = getAllowedPublicRegisterRoles();

  if (requestedRole === null) {
    return allowedRoles[0] ?? DEFAULT_PUBLIC_REGISTER_ROLES[0];
  }

  return allowedRoles.includes(requestedRole) ? requestedRole : null;
}

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
  const requestedRole = parseOptionalNumericId(id_rol ?? undefined);
  const idRolNum = resolveRequestedRoleId(requestedRole);

  if (idRolNum === null) {
    return NextResponse.json(
      { ok: false, message: "El rol solicitado no está habilitado para registro público" },
      { status: 403 }
    );
  }

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
