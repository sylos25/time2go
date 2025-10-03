import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes
  const publicRoutes = ["/", "/login", "/signup"]
  const isPublicRoute = publicRoutes.includes(pathname)

  // Admin routes
  const adminRoutes = ["/dashboard", "/admin"]
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  // Get session token from cookies
  const sessionToken = request.cookies.get("better-auth.session_token")

  // If no session and trying to access protected route
  if (!sessionToken && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If has session and on login/signup, redirect to home
  if (sessionToken && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Add security headers
  const response = NextResponse.next()
  response.headers.set("Cache-Control", "no-store, must-revalidate")
  response.headers.set("Pragma", "no-cache")
  response.headers.set("Expires", "0")

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
