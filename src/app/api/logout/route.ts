import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { revokeTokenJti } from "@/lib/token-revocation";
import { appendSessionCookies, buildClearedSessionCookies, isTrustedOrigin, readAuthCookies } from "@/lib/auth-session-http";

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

  const response = NextResponse.json({ success: true }, { status: 200 });
  return appendSessionCookies(response, buildClearedSessionCookies());
}
