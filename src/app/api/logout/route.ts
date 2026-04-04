import { NextResponse } from "next/server";
import { clearCookieHeader, parseCookies } from "@/lib/cookies";
import { verifyToken } from "@/lib/jwt";
import { revokeTokenJti } from "@/lib/token-revocation";

function isTrustedOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  return origin === new URL(req.url).origin;
}

export async function POST(req: Request) {
  if (!isTrustedOrigin(req)) {
    return NextResponse.json({ success: false, message: "Invalid origin" }, { status: 403 });
  }

  const cookies = parseCookies(req.headers.get("cookie"));
  const accessToken = cookies["token"];
  const refreshToken = cookies["refresh_token"];

  if (accessToken) {
    const accessPayload = await verifyToken(accessToken, "access");
    if (accessPayload?.jti) {
      await revokeTokenJti(
        String(accessPayload.jti),
        typeof accessPayload.exp === "number" ? accessPayload.exp : undefined
      );
    }
  }

  if (refreshToken) {
    const refreshPayload = await verifyToken(refreshToken, "refresh");
    if (refreshPayload?.jti) {
      await revokeTokenJti(
        String(refreshPayload.jti),
        typeof refreshPayload.exp === "number" ? refreshPayload.exp : undefined
      );
    }
  }

  const secure = process.env.NODE_ENV === "production";
  const domain = process.env.COOKIE_DOMAIN;

  const accessCookie = clearCookieHeader("token", {
    path: "/",
    httpOnly: true,
    secure,
    sameSite: "lax",
    domain,
  });

  const refreshCookie = clearCookieHeader("refresh_token", {
    path: "/",
    httpOnly: true,
    secure,
    sameSite: "strict",
    domain,
  });

  const response = NextResponse.json({ success: true }, { status: 200 });
  response.headers.append("Set-Cookie", accessCookie);
  response.headers.append("Set-Cookie", refreshCookie);
  return response;
}
