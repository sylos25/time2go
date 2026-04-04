import { parseCookies } from "@/lib/cookies";
import type { JwtPayload } from "@/lib/jwt";
import { verifyToken } from "@/lib/jwt";

async function payloadFromCookie(cookieHeader: string | null): Promise<JwtPayload | null> {
  if (!cookieHeader) return null;
  const cookies = parseCookies(cookieHeader);
  const token = cookies["token"];
  if (!token) return null;
  const payload = await verifyToken(token);
  return payload?.id_usuario ? payload : null;
}

/**
 * Misma semántica que getJwtPayloadLenient, pero con cabeceras sueltas
 * (p. ej. `headers()` de Next.js en Server Components / `getSession`).
 */
export async function getJwtPayloadFromHeaders(
  authorization: string | null | undefined,
  cookieHeader: string | null | undefined
): Promise<JwtPayload | null> {
  const authHeader = authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    const payload = await verifyToken(authHeader.slice(7).trim());
    if (payload?.id_usuario) return payload;
  }
  return await payloadFromCookie(cookieHeader ?? null);
}

/**
 * Bearer válido → payload; si la cabecera es Bearer pero el token falla, intenta cookie.
 */
export async function getJwtPayloadLenient(req: Request): Promise<JwtPayload | null> {
  return await getJwtPayloadFromHeaders(req.headers.get("authorization"), req.headers.get("cookie"));
}

/**
 * Bearer: solo ese token (sin cookie si Bearer es inválido). Sin Bearer: cookie.
 */
export async function getJwtPayloadStrict(req: Request): Promise<JwtPayload | null> {
  const authHeader = req.headers.get("authorization") || "";
  if (authHeader.startsWith("Bearer ")) {
    const payload = await verifyToken(authHeader.slice(7).trim());
    return payload?.id_usuario ? payload : null;
  }
  return await payloadFromCookie(req.headers.get("cookie"));
}

export async function getRequesterIdLenient(req: Request): Promise<string | null> {
  const p = await getJwtPayloadLenient(req);
  return p?.id_usuario != null ? String(p.id_usuario) : null;
}

/**
 * Si la cabecera es `Bearer` pero el token no es válido, no se usa la cookie.
 */
export async function getRequesterIdFromRequest(req: Request): Promise<string | null> {
  const p = await getJwtPayloadStrict(req);
  return p?.id_usuario != null ? String(p.id_usuario) : null;
}
