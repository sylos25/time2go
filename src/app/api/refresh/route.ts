import { NextResponse } from "next/server";
import { verifyTokenDetailed } from "@/lib/jwt";
import { revokeTokenJti } from "@/lib/token-revocation";
import { touchActiveSession } from "@/lib/active-session";
import { REFRESH_EXPIRES_IN, createSessionTokenPair } from "@/lib/auth-session";
import { buildSessionCookies, invalidSessionResponse, isTrustedOrigin, readAuthCookies, appendSessionCookies } from "@/lib/auth-session-http";
import { logApiEvent, withRequestId } from "@/lib/observability";

export async function POST(req: Request) {
  const t0 = Date.now();
  const { requestId } = withRequestId(req);

  try {
    if (!isTrustedOrigin(req)) {
      logApiEvent("warn", {
        requestId,
        route: "POST /api/refresh",
        event: "refresh_invalid_origin",
        status: 403,
        durationMs: Date.now() - t0,
      });
      return NextResponse.json({ ok: false, message: "Invalid origin" }, { status: 403 });
    }

    const cookies = readAuthCookies(req);
    const refreshToken = cookies["refresh_token"];
    if (!refreshToken) {
      logApiEvent("info", {
        requestId,
        route: "POST /api/refresh",
        event: "refresh_missing_token",
        status: 401,
        durationMs: Date.now() - t0,
      });
      return NextResponse.json({ ok: false, message: "Refresh token missing" }, { status: 401 });
    }

    const verification = await verifyTokenDetailed(refreshToken, "refresh");
    const payload = verification.payload;
    if (!payload?.id_usuario) {
      const message = verification.reason === "session_replaced"
        ? "Session replaced by a new login"
        : "Invalid refresh token";
      const code = verification.reason === "session_replaced" ? "session_replaced" : "invalid_refresh_token";

      logApiEvent("info", {
        requestId,
        route: "POST /api/refresh",
        event: "refresh_rejected",
        status: 401,
        extra: { code, reason: verification.reason },
        durationMs: Date.now() - t0,
      });
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
    response.headers.set("X-Request-Id", requestId);
    logApiEvent("info", {
      requestId,
      route: "POST /api/refresh",
      userId: String(payload.id_usuario),
      event: "refresh_success",
      status: 200,
      durationMs: Date.now() - t0,
    });

    return appendSessionCookies(response, buildSessionCookies(sessionTokens));
  } catch (error) {
    logApiEvent("error", {
      requestId,
      route: "POST /api/refresh",
      event: "refresh_error",
      status: 401,
      extra: { message: error instanceof Error ? error.message : String(error) },
      durationMs: Date.now() - t0,
    });
    console.error("/api/refresh error:", error);
    return NextResponse.json({ ok: false, message: "Refresh failed" }, { status: 401 });
  }
}
