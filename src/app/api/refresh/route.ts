import { NextResponse } from "next/server";
import { parseCookies, serializeCookie } from "@/lib/cookies";
import { signToken, verifyToken } from "@/lib/jwt";
import { revokeTokenJti } from "@/lib/token-revocation";

const ACCESS_EXPIRES_IN = 15 * 60;
const REFRESH_EXPIRES_IN = 7 * 24 * 60 * 60;

function isTrustedOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;

  const requestOrigin = new URL(req.url).origin;
  return origin === requestOrigin;
}

export async function POST(req: Request) {
  try {
    if (!isTrustedOrigin(req)) {
      return NextResponse.json({ ok: false, message: "Invalid origin" }, { status: 403 });
    }

    const cookies = parseCookies(req.headers.get("cookie"));
    const refreshToken = cookies["refresh_token"];
    if (!refreshToken) {
      return NextResponse.json({ ok: false, message: "Refresh token missing" }, { status: 401 });
    }

    const payload = await verifyToken(refreshToken, "refresh");
    if (!payload?.id_usuario) {
      return NextResponse.json({ ok: false, message: "Invalid refresh token" }, { status: 401 });
    }

    if (payload.jti) {
      await revokeTokenJti(String(payload.jti), typeof payload.exp === "number" ? payload.exp : undefined);
    }

    const accessToken = await signToken(
      {
        id_usuario: payload.id_usuario,
        id_rol: payload.id_rol,
        name: payload.name,
        token_type: "access",
      },
      ACCESS_EXPIRES_IN
    );

    const rotatedRefreshToken = await signToken(
      {
        id_usuario: payload.id_usuario,
        id_rol: payload.id_rol,
        name: payload.name,
        token_type: "refresh",
      },
      REFRESH_EXPIRES_IN
    );

    const secure = process.env.NODE_ENV === "production";
    const domain = process.env.COOKIE_DOMAIN;

    const accessCookie = serializeCookie("token", accessToken, {
      maxAge: ACCESS_EXPIRES_IN,
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      domain,
    });

    const refreshCookie = serializeCookie("refresh_token", rotatedRefreshToken, {
      maxAge: REFRESH_EXPIRES_IN,
      httpOnly: true,
      secure,
      sameSite: "strict",
      path: "/",
      domain,
    });

    const response = NextResponse.json(
      {
        ok: true,
        expiresAt: Math.floor(Date.now() / 1000) + ACCESS_EXPIRES_IN,
      },
      { status: 200 }
    );

    response.headers.append("Set-Cookie", accessCookie);
    response.headers.append("Set-Cookie", refreshCookie);

    return response;
  } catch (error) {
    console.error("/api/refresh error:", error);
    return NextResponse.json({ ok: false, message: "Refresh failed" }, { status: 401 });
  }
}
