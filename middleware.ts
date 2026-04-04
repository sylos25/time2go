import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { extractBearerOrCookieToken, isPublicApiRoute } from "@/lib/api-route-policy";
import { verifyToken } from "@/lib/jwt";
import { resolveJwtSecret } from "@/lib/jwt-secret";

function apiAuthJsonResponse(message: string, status: number) {
  return NextResponse.json({ ok: false, message }, { status });
}

// ── Roles ────────────────────────────────────────────────────────────────────
const ROL_USUARIO = 1;
const ROL_PROMOTOR = 2;
const ROL_MODERADOR = 3;
const ROL_ADMIN = 4;

// ── Definición de rutas protegidas ───────────────────────────────────────────
const RUTAS_PROTEGIDAS: { pattern: RegExp; rolesPermitidos: number[] }[] = [
  { pattern: /^\/docs(\/.*)?$/, rolesPermitidos: [ROL_ADMIN] },
  { pattern: /^\/dashboard(\/.*)?$/, rolesPermitidos: [ROL_MODERADOR, ROL_ADMIN] },
  { pattern: /^\/eventos\/crear(\/.*)?$/, rolesPermitidos: [ROL_PROMOTOR, ROL_MODERADOR, ROL_ADMIN] },
  { pattern: /^\/mis-eventos(\/.*)?$/, rolesPermitidos: [ROL_PROMOTOR, ROL_MODERADOR, ROL_ADMIN] },
  { pattern: /^\/mis-reservas(\/.*)?$/, rolesPermitidos: [ROL_USUARIO] },
  {
    pattern: /^\/perfil(\/.*)?$/,
    rolesPermitidos: [ROL_USUARIO, ROL_PROMOTOR, ROL_MODERADOR, ROL_ADMIN],
  },
  {
    pattern: /^\/configuracion(\/.*)?$/,
    rolesPermitidos: [ROL_USUARIO, ROL_PROMOTOR, ROL_MODERADOR, ROL_ADMIN],
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

    let secretBytes: Uint8Array;
    try {
      secretBytes = new TextEncoder().encode(resolveJwtSecret());
    } catch {
      console.error("[middleware] JWT_SECRET / BETTER_AUTH_SECRET no configurado (API)");
      return apiAuthJsonResponse("Authentication is not configured", 503);
    }

    try {
      const { payload } = await jwtVerify(token, secretBytes, {
        algorithms: ["HS256"],
      });
      const idUser = payload.id_usuario;
      if (idUser == null || String(idUser).length === 0) {
        return apiAuthJsonResponse("Invalid token", 401);
      }
      return NextResponse.next();
    } catch {
      const isBearer = (request.headers.get("authorization") || "").startsWith("Bearer ");
      return apiAuthJsonResponse(isBearer ? "Invalid token" : "Not authenticated", 401);
    }
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
  ],
};
