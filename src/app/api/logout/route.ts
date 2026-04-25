import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { revokeTokenJti } from "@/lib/token-revocation";
import { appendSessionCookies, buildClearedSessionCookies, isTrustedOrigin, readAuthCookies } from "@/lib/auth-session-http";
import { clearActiveSession } from "@/lib/active-session";

export async function POST(req: Request) {
  if (!isTrustedOrigin(req)) {
    return NextResponse.json({ success: false, message: "Invalid origin" }, { status: 403 });
  }

  const cookies = readAuthCookies(req);
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
    if (accessPayload?.id_usuario) {
      await clearActiveSession(
        String(accessPayload.id_usuario),
        accessPayload.sid ? String(accessPayload.sid) : undefined
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
    if (refreshPayload?.id_usuario) {
      await clearActiveSession(
        String(refreshPayload.id_usuario),
        refreshPayload.sid ? String(refreshPayload.sid) : undefined
      );
    }
  }

  const response = NextResponse.json({ success: true }, { status: 200 });
  return appendSessionCookies(response, buildClearedSessionCookies());
}
