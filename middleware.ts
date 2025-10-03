import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Solo proteger dashboard
  const isDashboardRoute = pathname.startsWith("/dashboard")

  // Get session token from cookies
  const sessionToken = request.cookies.get("better-auth.session_token")

  // Si intenta acceder a dashboard sin sesión, redirigir a login
  if (isDashboardRoute && !sessionToken) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
