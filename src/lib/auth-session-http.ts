import { NextResponse } from "next/server";
import { clearCookieHeader, parseCookies, serializeCookie } from "@/lib/cookies";
import { ACCESS_EXPIRES_IN, REFRESH_EXPIRES_IN } from "@/lib/auth-session";

export type SessionCookiePair = {
  accessCookie: string;
  refreshCookie: string;
};

function getCookieSecurityOptions() {
  return {
    secure: process.env.NODE_ENV === "production",
    domain: process.env.COOKIE_DOMAIN,
  };
}

export function isTrustedOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;

  return origin === new URL(req.url).origin;
}

export function readAuthCookies(req: Request): Record<string, string> {
  return parseCookies(req.headers.get("cookie"));
}

export function buildSessionCookies(tokens: {
  accessToken: string;
  refreshToken: string;
}): SessionCookiePair {
  const { secure, domain } = getCookieSecurityOptions();

  return {
    accessCookie: serializeCookie("token", tokens.accessToken, {
      maxAge: ACCESS_EXPIRES_IN,
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      domain,
    }),
    refreshCookie: serializeCookie("refresh_token", tokens.refreshToken, {
      maxAge: REFRESH_EXPIRES_IN,
      httpOnly: true,
      secure,
      sameSite: "strict",
      path: "/",
      domain,
    }),
  };
}

export function buildClearedSessionCookies(): SessionCookiePair {
  const { secure, domain } = getCookieSecurityOptions();

  return {
    accessCookie: clearCookieHeader("token", {
      path: "/",
      httpOnly: true,
      secure,
      sameSite: "lax",
      domain,
    }),
    refreshCookie: clearCookieHeader("refresh_token", {
      path: "/",
      httpOnly: true,
      secure,
      sameSite: "strict",
      domain,
    }),
  };
}

export function appendSessionCookies(response: NextResponse, cookies: SessionCookiePair): NextResponse {
  response.headers.append("Set-Cookie", cookies.accessCookie);
  response.headers.append("Set-Cookie", cookies.refreshCookie);
  return response;
}

export function invalidSessionResponse(message: string, code: string): NextResponse {
  const response = NextResponse.json({ ok: false, message, code }, { status: 401 });
  return appendSessionCookies(response, buildClearedSessionCookies());
}
