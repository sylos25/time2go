import type { NextRequest } from "next/server";

/**
 * Rutas públicas alineadas con los route handlers bajo src/app/api (catalogación, auth,
 * lectura pública de eventos, organizador, valoraciones GET, reset-password, webhooks).
 * Si añades un endpoint anónimo, actualiza esta lista; si no, el middleware responderá 401.
 */

/**
 * Token para rutas API: si hay cabecera Authorization con esquema Bearer, solo se usa ese valor
 * (alineado con getRequesterIdFromRequest / getJwtPayloadStrict).
 * Si no hay Bearer, se usa la cookie de nombre "token".
 */
export function extractBearerOrCookieToken(request: NextRequest): string | null {
  const auth = request.headers.get("authorization") || "";
  if (auth.startsWith("Bearer ")) {
    const t = auth.slice(7).trim();
    return t.length > 0 ? t : null;
  }
  return request.cookies.get("token")?.value ?? null;
}

const PUBLIC_GET_PATHS = new Set([
  "/api/categoria_boleto",
  "/api/categoria_evento",
  /** Catálogo de categorías/motivos para denunciar eventos (lectura pública). */
  "/api/denuncias-eventos/catalogo",
  "/api/departamentos",
  "/api/home-config",
  "/api/llamar_pais",
  "/api/llamar_sitio",
  "/api/municipios",
  "/api/tipo-sitios",
  "/api/tipo_evento",
  "/api/validate-email",
]);

const PUBLIC_POST_PATHS = new Set([
  "/api/auth",
  "/api/contact",
  "/api/login",
  "/api/login-google",
  "/api/logout",
  // POST /api/refresh: público; usa cookie refresh_token aunque el access (cookie token) esté expirado.
  "/api/refresh",
  "/api/send-validation-email",
  "/api/usuario_formulario",
  "/api/wompi/webhook",
  /** Mantenimiento programado: el handler exige CRON_SECRET (Bearer o cabecera dedicada). */
  "/api/cron/maintenance",
]);

// GET/HEAD en rutas que suelen ser solo POST: evita 401 si el cliente o un proxy hace HEAD.
const PUBLIC_READ_AUTH_FLOW_PATHS = new Set(["/api/auth", "/api/login", "/api/logout"]);

// GET, POST y PUT usados en el flujo de recuperación de contraseña
const RESET_PASSWORD_PATH = "/api/reset-password";

function isReadLike(method: string): boolean {
  return method === "GET" || method === "HEAD";
}

/**
 * Rutas bajo la ruta /api que no exigen JWT en el middleware.
 * El resto debe presentar token válido antes de llegar al route handler.
 * La autorización fina (roles, IDOR) sigue en cada ruta; aquí solo hay autenticación.
 */
export function isPublicApiRoute(method: string, pathname: string): boolean {
  const m = method.toUpperCase();

  if (m === "OPTIONS") {
    return true;
  }

  if (PUBLIC_GET_PATHS.has(pathname) && isReadLike(m)) {
    return true;
  }

  if (PUBLIC_POST_PATHS.has(pathname) && m === "POST") {
    return true;
  }

  if (PUBLIC_READ_AUTH_FLOW_PATHS.has(pathname) && isReadLike(m)) {
    return true;
  }

  if (pathname === RESET_PASSWORD_PATH && (isReadLike(m) || m === "POST" || m === "PUT")) {
    return true;
  }

  if (pathname === "/api/events/image" && isReadLike(m)) {
    return true;
  }

  if (pathname === "/api/events" && isReadLike(m)) {
    return true;
  }

  if (isReadLike(m)) {
    if (/^\/api\/organizador\/[^/]+$/.test(pathname)) {
      return true;
    }
    if (/^\/api\/events\/[^/]+\/valoraciones$/.test(pathname)) {
      return true;
    }
    const singleUnderEvents = pathname.match(/^\/api\/events\/([^/]+)$/);
    if (singleUnderEvents) {
      const seg = singleUnderEvents[1];
      if (seg !== "image" && seg !== "document") {
        return true;
      }
    }
  }

  return false;
}
