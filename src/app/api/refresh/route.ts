import { NextResponse } from "next/server";
import { verifyTokenDetailed } from "@/lib/jwt";
import { revokeTokenJti } from "@/lib/token-revocation";
import { touchActiveSession } from "@/lib/active-session";
import { REFRESH_EXPIRES_IN, createSessionTokenPair } from "@/lib/auth-session";
import { buildSessionCookies, invalidSessionResponse, isTrustedOrigin, readAuthCookies, appendSessionCookies } from "@/lib/auth-session-http";

export async function POST(req: Request) {
  try {
    if (!isTrustedOrigin(req)) {
      return NextResponse.json({ ok: false, message: "Invalid origin" }, { status: 403 });
    }

    const cookies = readAuthCookies(req);
    const refreshToken = cookies["refresh_token"];
    if (!refreshToken) {
      return NextResponse.json({ ok: false, message: "Refresh token missing" }, { status: 401 });
    }

    const verification = await verifyTokenDetailed(refreshToken, "refresh");
    const payload = verification.payload;
    if (!payload?.id_usuario) {
      const message = verification.reason === "session_replaced"
        ? "Session replaced by a new login"
        : "Invalid refresh token";
      const code = verification.reason === "session_replaced" ? "session_replaced" : "invalid_refresh_token";

      return invalidSessionResponse(message, code);
    }

    if (payload.sid) {
      const touched = await touchActiveSession(
        String(payload.id_usuario),
        String(payload.sid),
        REFRESH_EXPIRES_IN
      );
      if (!touched) {
        return invalidSessionResponse("Session replaced by a new login", "session_replaced");
      }
    }

    if (payload.jti) {
      await revokeTokenJti(String(payload.jti), typeof payload.exp === "number" ? payload.exp : undefined);
    }

    const sessionTokens = await createSessionTokenPair({
      userId: String(payload.id_usuario),
      roleId: payload.id_rol,
      name: payload.name,
      sessionId: String(payload.sid || ""),
    });

    const response = NextResponse.json(
      {
        ok: true,
        expiresAt: sessionTokens.expiresAt,
      },
      { status: 200 }
    );

    return appendSessionCookies(response, buildSessionCookies(sessionTokens));
  } catch (error) {
    console.error("/api/refresh error:", error);
    return NextResponse.json({ ok: false, message: "Refresh failed" }, { status: 401 });
  }
}
