import { headers } from "next/headers";
import { getJwtPayloadFromHeaders } from "@/lib/auth-request";

export type SessionUser = {
  id_usuario: string;
  name?: string;
  id_rol?: number;
};

export type Session = { user: SessionUser };

/**
 * Sesión desde cabeceras del request actual (Bearer o cookie `token`).
 * Útil en Server Components; misma lógica “lenient” que otras rutas (Bearer inválido → intenta cookie).
 */
export async function getSession(): Promise<Session | null> {
  const hdrs = await headers();
  const payload = await getJwtPayloadFromHeaders(hdrs.get("authorization"), hdrs.get("cookie"));
  if (!payload?.id_usuario) {
    return null;
  }

  const user: SessionUser = {
    id_usuario: String(payload.id_usuario),
    name: payload.name,
  };
  if (payload.id_rol !== undefined && payload.id_rol !== null) {
    const r = Number(payload.id_rol);
    if (Number.isFinite(r)) {
      user.id_rol = r;
    }
  }

  return { user };
}
