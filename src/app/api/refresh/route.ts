import { NextResponse } from "next/server";
import { clearCookieHeader, parseCookies, serializeCookie } from "@/lib/cookies";
import { signToken, verifyTokenDetailed } from "@/lib/jwt";
import { revokeTokenJti } from "@/lib/token-revocation";
import { touchActiveSession } from "@/lib/active-session";

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

    const verification = await verifyTokenDetailed(refreshToken, "refresh");
    const payload = verification.payload;
    if (!payload?.id_usuario) {
      const secure = process.env.NODE_ENV === "production";
      const domain = process.env.COOKIE_DOMAIN;

      const expiredAccess = clearCookieHeader("token", {
        path: "/",
        httpOnly: true,
        secure,
        sameSite: "lax",
        domain,
      });
      const expiredRefresh = clearCookieHeader("refresh_token", {
        path: "/",
        httpOnly: true,
        secure,
        sameSite: "strict",
        domain,
      });

      const message = verification.reason === "session_replaced"
        ? "Session replaced by a new login"
        : "Invalid refresh token";
      const code = verification.reason === "session_replaced" ? "session_replaced" : "invalid_refresh_token";

      const denied = NextResponse.json({ ok: false, message, code }, { status: 401 });
      denied.headers.append("Set-Cookie", expiredAccess);
      denied.headers.append("Set-Cookie", expiredRefresh);
      return denied;
    }

    if (payload.sid) {
      const touched = await touchActiveSession(
        String(payload.id_usuario),
        String(payload.sid),
        REFRESH_EXPIRES_IN
      );
      if (!touched) {
        const secure = process.env.NODE_ENV === "production";
        const domain = process.env.COOKIE_DOMAIN;
        const expiredAccess = clearCookieHeader("token", {
          path: "/",
          httpOnly: true,
          secure,
          sameSite: "lax",
          domain,
        });
        const expiredRefresh = clearCookieHeader("refresh_token", {
          path: "/",
          httpOnly: true,
          secure,
          sameSite: "strict",
          domain,
        });

        const denied = NextResponse.json(
          { ok: false, message: "Session replaced by a new login", code: "session_replaced" },
          { status: 401 }
        );
        denied.headers.append("Set-Cookie", expiredAccess);
        denied.headers.append("Set-Cookie", expiredRefresh);
        return denied;
      }
    }

    if (payload.jti) {
      await revokeTokenJti(String(payload.jti), typeof payload.exp === "number" ? payload.exp : undefined);
    }

    const accessToken = await signToken(
      {
        id_usuario: payload.id_usuario,
        id_rol: payload.id_rol,
        name: payload.name,
        sid: payload.sid,
        token_type: "access",
      },
      ACCESS_EXPIRES_IN
    );

    const rotatedRefreshToken = await signToken(
      {
        id_usuario: payload.id_usuario,
        id_rol: payload.id_rol,
        name: payload.name,
        sid: payload.sid,
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
