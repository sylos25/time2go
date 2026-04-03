import { parseCookies } from "@/lib/cookies";
import type { JwtPayload } from "@/lib/jwt";
import { verifyToken } from "@/lib/jwt";

function payloadFromCookie(cookieHeader: string | null): JwtPayload | null {
  if (!cookieHeader) return null;
  const cookies = parseCookies(cookieHeader);
  const token = cookies["token"];
  if (!token) return null;
  const payload = verifyToken(token);
  return payload?.id_usuario ? payload : null;
}

/**
 * Misma semántica que getJwtPayloadLenient, pero con cabeceras sueltas
 * (p. ej. `headers()` de Next.js en Server Components / `getSession`).
 */
export function getJwtPayloadFromHeaders(
  authorization: string | null | undefined,
  cookieHeader: string | null | undefined
): JwtPayload | null {
  const authHeader = authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    const payload = verifyToken(authHeader.slice(7).trim());
    if (payload?.id_usuario) return payload;
  }
  return payloadFromCookie(cookieHeader ?? null);
}

/**
 * Bearer válido → payload; si la cabecera es Bearer pero el token falla, intenta cookie.
 */
export function getJwtPayloadLenient(req: Request): JwtPayload | null {
  return getJwtPayloadFromHeaders(req.headers.get("authorization"), req.headers.get("cookie"));
}

/**
 * Bearer: solo ese token (sin cookie si Bearer es inválido). Sin Bearer: cookie.
 */
export function getJwtPayloadStrict(req: Request): JwtPayload | null {
  const authHeader = req.headers.get("authorization") || "";
  if (authHeader.startsWith("Bearer ")) {
    const payload = verifyToken(authHeader.slice(7).trim());
    return payload?.id_usuario ? payload : null;
  }
  return payloadFromCookie(req.headers.get("cookie"));
}

export function getRequesterIdLenient(req: Request): string | null {
  const p = getJwtPayloadLenient(req);
  return p?.id_usuario != null ? String(p.id_usuario) : null;
}

/**
 * Si la cabecera es `Bearer` pero el token no es válido, no se usa la cookie.
 */
export function getRequesterIdFromRequest(req: Request): string | null {
  const p = getJwtPayloadStrict(req);
  return p?.id_usuario != null ? String(p.id_usuario) : null;
}
