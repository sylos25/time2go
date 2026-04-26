import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { extractBearerOrCookieToken, isPublicApiRoute } from "@/lib/api-route-policy";
import { verifyToken, verifyTokenDetailed } from "@/lib/jwt";
import { resolveJwtSecret } from "@/lib/jwt-secret";

function apiAuthJsonResponse(message: string, status: number, code?: string) {
  return NextResponse.json({ ok: false, message, code }, { status });
}

// ── Roles ────────────────────────────────────────────────────────────────────
const ROL_USUARIO = 1;
const ROL_ORGANIZADOR = 2;
const ROL_MODERADOR = 3;
const ROL_ADMIN = 4;

// ── Definición de rutas protegidas ───────────────────────────────────────────
const RUTAS_PROTEGIDAS: { pattern: RegExp; rolesPermitidos: number[] }[] = [
  { pattern: /^\/docs(\/.*)?$/, rolesPermitidos: [ROL_ADMIN] },
  {
    pattern: /^\/dashboard(?:\/(resumen|ingresar-datos|sitios-mapa|usuarios|denuncias-eventos)(?:\/.*)?)?$/,
    rolesPermitidos: [ROL_MODERADOR, ROL_ADMIN],
  },
  { pattern: /^\/dashboard(\/.*)?$/, rolesPermitidos: [ROL_ADMIN] },
  { pattern: /^\/eventos\/crear(\/.*)?$/, rolesPermitidos: [ROL_ORGANIZADOR, ROL_MODERADOR, ROL_ADMIN] },
  { pattern: /^\/mis-eventos(\/.*)?$/, rolesPermitidos: [ROL_ORGANIZADOR, ROL_MODERADOR, ROL_ADMIN] },
  { pattern: /^\/mis-reservas(\/.*)?$/, rolesPermitidos: [ROL_USUARIO] },
  {
    pattern: /^\/perfil(\/.*)?$/,
    rolesPermitidos: [ROL_USUARIO, ROL_ORGANIZADOR, ROL_MODERADOR, ROL_ADMIN],
  },
  {
    pattern: /^\/configuracion(\/.*)?$/,
    rolesPermitidos: [ROL_USUARIO, ROL_ORGANIZADOR, ROL_MODERADOR, ROL_ADMIN],
  },
  {
    pattern: /^\/mis-favoritos(\/.*)?$/,
    rolesPermitidos: [ROL_USUARIO, ROL_ORGANIZADOR, ROL_MODERADOR, ROL_ADMIN],
  },
  {
    pattern: /^\/mis-valoraciones(\/.*)?$/,
    rolesPermitidos: [ROL_USUARIO, ROL_ORGANIZADOR, ROL_MODERADOR, ROL_ADMIN],
  },
  {
    pattern: /^\/mis-transacciones(\/.*)?$/,
    rolesPermitidos: [ROL_USUARIO, ROL_ORGANIZADOR],
  },
  {
    pattern: /^\/cambiar-contrasena(\/.*)?$/,
    rolesPermitidos: [ROL_USUARIO, ROL_ORGANIZADOR, ROL_MODERADOR, ROL_ADMIN],
  },
];

function roleFromPayload(idRol: unknown): number {
  if (typeof idRol === "number" && Number.isFinite(idRol)) {
    return idRol;
  }
  if (typeof idRol === "string") {
    const n = Number(idRol);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function redirectLogin(request: NextRequest, pathname: string) {
  const loginUrl = new URL("/auth", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── API: JWT obligatorio salvo lista explícita de rutas públicas ───────────
  if (pathname.startsWith("/api/")) {
    if (isPublicApiRoute(request.method, pathname)) {
      return NextResponse.next();
    }

    const token = extractBearerOrCookieToken(request);
    if (!token) {
      return apiAuthJsonResponse("Not authenticated", 401);
    }

    try {
      resolveJwtSecret();
    } catch {
      console.error("[middleware] JWT_SECRET / BETTER_AUTH_SECRET no configurado (API)");
      return apiAuthJsonResponse("Authentication is not configured", 503);
    }

    const verification = await verifyTokenDetailed(token, "access");
    const payload = verification.payload;
    if (!payload?.id_usuario) {
      const isBearer = (request.headers.get("authorization") || "").startsWith("Bearer ");
      if (verification.reason === "session_replaced") {
        return apiAuthJsonResponse("Session replaced by a new login", 401, "session_replaced");
      }
      return apiAuthJsonResponse(isBearer ? "Invalid token" : "Not authenticated", 401);
    }
    return NextResponse.next();
  }

  const ruta = RUTAS_PROTEGIDAS.find(({ pattern }) => pattern.test(pathname));
  if (!ruta) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  if (!token) {
    return redirectLogin(request, pathname);
  }

  try {
    const payload = await verifyToken(token, "access");
    if (!payload) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    const userRole = roleFromPayload(payload.id_rol);

    if (!ruta.rolesPermitidos.includes(userRole)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/auth", request.url));
  }
}

export const config = {
  matcher: [
    "/api/:path*",
    "/docs/:path*",
    "/dashboard/:path*",
    "/eventos/crear/:path*",
    "/mis-eventos/:path*",
    "/mis-reservas/:path*",
    "/perfil/:path*",
    "/configuracion/:path*",
    "/mis-favoritos/:path*",
    "/mis-valoraciones/:path*",
    "/mis-transacciones/:path*",
    "/cambiar-contrasena/:path*",
  ],
};
