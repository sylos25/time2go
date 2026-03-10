import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// ── Roles ────────────────────────────────────────────────────────────────────
const ROL_USUARIO    = 1
const ROL_PROMOTOR   = 2
const ROL_MODERADOR  = 3
const ROL_ADMIN      = 4

// ── Definición de rutas protegidas ───────────────────────────────────────────
//
// rolesPermitidos: qué roles pueden acceder.
// Si la ruta no está en esta lista, es pública.
//
const RUTAS_PROTEGIDAS: { pattern: RegExp; rolesPermitidos: number[] }[] = [
  // Documentación interna → solo admin
  { pattern: /^\/docs(\/.*)?$/,             rolesPermitidos: [ROL_ADMIN] },

  // Dashboard → moderador y admin
  { pattern: /^\/dashboard(\/.*)?$/,        rolesPermitidos: [ROL_MODERADOR, ROL_ADMIN] },

  // Crear eventos → promotor, moderador y admin
  { pattern: /^\/eventos\/crear(\/.*)?$/,   rolesPermitidos: [ROL_PROMOTOR, ROL_MODERADOR, ROL_ADMIN] },

  // Mis eventos → promotor, moderador y admin
  { pattern: /^\/mis-eventos(\/.*)?$/,      rolesPermitidos: [ROL_PROMOTOR, ROL_MODERADOR, ROL_ADMIN] },

  // Mis reservas → solo usuario regular
  { pattern: /^\/mis-reservas(\/.*)?$/,     rolesPermitidos: [ROL_USUARIO] },

  // Perfil → cualquier usuario autenticado (todos los roles)
  { pattern: /^\/perfil(\/.*)?$/,           rolesPermitidos: [ROL_USUARIO, ROL_PROMOTOR, ROL_MODERADOR, ROL_ADMIN] },

  // Configuración → cualquier usuario autenticado
  { pattern: /^\/configuracion(\/.*)?$/,    rolesPermitidos: [ROL_USUARIO, ROL_PROMOTOR, ROL_MODERADOR, ROL_ADMIN] },
]

// ── Helper: decodifica el JWT de la cookie ───────────────────────────────────
function decodeToken(token: string): { id_rol?: number; exp?: number } | null {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString("utf-8")
    )
    return payload
  } catch {
    return null
  }
}

// ── Middleware ────────────────────────────────────────────────────────────────
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Buscar si la ruta actual está protegida
  const ruta = RUTAS_PROTEGIDAS.find(({ pattern }) => pattern.test(pathname))

  // Si no está protegida, dejar pasar
  if (!ruta) return NextResponse.next()

  // Leer token desde cookie HttpOnly
  const token = request.cookies.get("token")?.value

  // Sin token → redirigir al login
  if (!token) {
    const loginUrl = new URL("/auth", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Decodificar token
  const payload = decodeToken(token)

  // Token malformado → redirigir al login
  if (!payload) {
    return NextResponse.redirect(new URL("/auth", request.url))
  }

  // Token expirado → redirigir al login
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    const loginUrl = new URL("/auth", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const userRole = Number(payload.id_rol ?? 0)

  // Rol no permitido para esta ruta → redirigir según el caso
  if (!ruta.rolesPermitidos.includes(userRole)) {
    // Si tiene sesión pero no tiene permiso, lo manda al inicio
    // (no al login, ya que sí está autenticado)
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

// ── Matcher: rutas que pasan por el middleware ────────────────────────────────
// Excluye archivos estáticos, _next, favicons, etc.
export const config = {
  matcher: [
    "/docs/:path*",
    "/dashboard/:path*",
    "/eventos/crear/:path*",
    "/mis-eventos/:path*",
    "/mis-reservas/:path*",
    "/perfil/:path*",
    "/configuracion/:path*",
  ],
}