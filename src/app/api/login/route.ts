import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { setActiveSession } from "@/lib/active-session";
import { createSessionTokenPair, REFRESH_EXPIRES_IN } from "@/lib/auth-session";
import { appendSessionCookies, buildSessionCookies } from "@/lib/auth-session-http";
import {
  clearSuccessfulAuth,
  registerFailedAuth,
  runLoginRateLimitPrelude,
} from "@/lib/login-rate-limit";
import { logApiEvent, withRequestId } from "@/lib/observability";

function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const [first] = forwardedFor.split(",");
    if (first && first.trim()) {
      return first.trim();
    }
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp && realIp.trim()) {
    return realIp.trim();
  }

  return "unknown";
}

function normalizeEmail(value: string): string {
  return String(value || "").trim().toLowerCase();
}

async function verifyTurnstileToken(
  token: string,
  ip: string
): Promise<{ ok: true } | { ok: false; kind: "invalid" | "provider_error"; details?: unknown }> {
  const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET;

  if (!secret) {
    return { ok: false, kind: "provider_error", details: ["missing_turnstile_secret"] };
  }

  const params = new URLSearchParams();
  params.append("secret", secret);
  params.append("response", token);
  if (ip !== "unknown") {
    params.append("remoteip", ip);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      signal: controller.signal,
    });

    const json = (await response.json()) as {
      success?: boolean;
      [key: string]: unknown;
    };

    if (json.success === true) {
      return { ok: true };
    }

    return { ok: false, kind: "invalid", details: json["error-codes"] };
  } catch (error) {
    return {
      ok: false,
      kind: "provider_error",
      details: error instanceof Error ? error.message : "unknown_error",
    };
  } finally {
    clearTimeout(timeout);
  }
}

function getCaptchaMode(): "strict" | "degraded" | "disabled" {
  const raw = (process.env.CLOUDFLARE_TURNSTILE_MODE || "strict").toLowerCase();
  if (raw === "disabled") return "disabled";
  if (raw === "degraded") return "degraded";
  return "strict";
}

function withRequestIdHeader(res: NextResponse, requestId: string) {
  res.headers.set("X-Request-Id", requestId);
  return res;
}

export async function POST(req: Request) {
  const t0 = Date.now();
  const { requestId } = withRequestId(req);

  try {
    const { email, password, turnstileToken } = (await req.json()) as {
      email?: string;
      password?: string;
      turnstileToken?: string | null;
    };

    const normalizedEmail = normalizeEmail(String(email || ""));
    const ip = getClientIp(req);
    const now = Date.now();
    const captchaMode = getCaptchaMode();

    const limited = await runLoginRateLimitPrelude(ip, normalizedEmail, now);
    if (limited) {
      withRequestIdHeader(limited, requestId);
      logApiEvent("warn", {
        requestId,
        route: "POST /api/login",
        event: "rate_limited_prelude",
        status: 429,
        durationMs: Date.now() - t0,
      });
      return limited;
    }

    if (!normalizedEmail || !password) {
      const failLimit = await registerFailedAuth(ip, normalizedEmail || "missing", now);
      if (failLimit) {
        withRequestIdHeader(failLimit, requestId);
        return failLimit;
      }
      const res = NextResponse.json({ message: "Email y contraseña requeridos" }, { status: 400 });
      return withRequestIdHeader(res, requestId);
    }

    if (captchaMode !== "disabled") {
      if (!turnstileToken) {
        if (captchaMode === "strict") {
          const failLimit = await registerFailedAuth(ip, normalizedEmail, now);
          if (failLimit) {
            withRequestIdHeader(failLimit, requestId);
            return failLimit;
          }
          const res = NextResponse.json(
            { message: "Captcha requerido", error: "turnstile_required" },
            { status: 400 }
          );
          return withRequestIdHeader(res, requestId);
        }

        console.warn("[login] Missing turnstile token, degraded mode active");
      }

      if (turnstileToken) {
        const captchaResult = await verifyTurnstileToken(String(turnstileToken), ip);
        if (!captchaResult.ok) {
          if (captchaResult.kind === "invalid") {
            const failLimit = await registerFailedAuth(ip, normalizedEmail, now);
            if (failLimit) {
              withRequestIdHeader(failLimit, requestId);
              return failLimit;
            }
            const res = NextResponse.json(
              {
                message: "Falló la verificación del captcha",
                error: "turnstile_failed",
                details: captchaResult.details,
              },
              { status: 403 }
            );
            return withRequestIdHeader(res, requestId);
          }

          if (captchaMode === "strict") {
            const res = NextResponse.json(
              {
                message:
                  "No se pudo validar el captcha por un incidente del proveedor. Intenta nuevamente en unos minutos.",
                error: "turnstile_provider_unavailable",
              },
              { status: 503 }
            );
            return withRequestIdHeader(res, requestId);
          }

          console.warn("[login] Turnstile provider unavailable, degraded mode active", captchaResult.details);
        }
      }
    }

    const userResult = await pool.query(
      `
        SELECT
          u.id_usuario,
          u.id_publico,
          u.id_rol,
          c.correo_usuario AS correo,
          u.nombres,
          c.contrasena_hash,
          c.validacion_correo,
          u.estado_usuario AS estado
        FROM tabla_usuarios u
        INNER JOIN tabla_usuarios_credenciales c ON c.id_usuario = u.id_usuario
        WHERE c.correo_usuario = $1
        LIMIT 1
      `,
      [normalizedEmail]
    );

    if (userResult.rowCount === 0) {
      const failLimit = await registerFailedAuth(ip, normalizedEmail, now);
      if (failLimit) {
        withRequestIdHeader(failLimit, requestId);
        return failLimit;
      }
      const res = NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
      withRequestIdHeader(res, requestId);
      logApiEvent("info", {
        requestId,
        route: "POST /api/login",
        event: "login_failed",
        status: 401,
        extra: { reason: "user_not_found" },
        durationMs: Date.now() - t0,
      });
      return res;
    }

    const user = userResult.rows[0] as {
      id_usuario: string | number;
      id_publico: string;
      id_rol: number;
      correo: string;
      nombres?: string | null;
      contrasena_hash?: string | null;
      validacion_correo?: boolean;
      estado?: boolean;
    };

    if (user.estado === false) {
      const failLimit = await registerFailedAuth(ip, normalizedEmail, now);
      if (failLimit) {
        withRequestIdHeader(failLimit, requestId);
        return failLimit;
      }
      const res = NextResponse.json(
        {
          error: "Usuario baneado",
          message: "Tu cuenta está baneada temporalmente. Contacta al administrador.",
          banned: true,
        },
        { status: 403 }
      );
      return withRequestIdHeader(res, requestId);
    }

    if (!user.validacion_correo) {
      const failLimit = await registerFailedAuth(ip, normalizedEmail, now);
      if (failLimit) {
        withRequestIdHeader(failLimit, requestId);
        return failLimit;
      }
      const res = NextResponse.json(
        {
          error: "Email no validado",
          message:
            "Debes validar tu correo electrónico antes de poder acceder. Revisa tu buzón de entrada y haz clic en el link de validación.",
          requiresEmailValidation: true,
        },
        { status: 403 }
      );
      return withRequestIdHeader(res, requestId);
    }

    const hash = user.contrasena_hash;
    if (!hash || hash.trim() === "") {
      const failLimit = await registerFailedAuth(ip, normalizedEmail, now);
      if (failLimit) {
        withRequestIdHeader(failLimit, requestId);
        return failLimit;
      }
      const res = NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
      withRequestIdHeader(res, requestId);
      logApiEvent("info", {
        requestId,
        route: "POST /api/login",
        event: "login_failed",
        status: 401,
        extra: { reason: "no_password_hash" },
        durationMs: Date.now() - t0,
      });
      return res;
    }

    const match = await bcrypt.compare(String(password), hash);
    if (!match) {
      const failLimit = await registerFailedAuth(ip, normalizedEmail, now);
      if (failLimit) {
        withRequestIdHeader(failLimit, requestId);
        return failLimit;
      }
      const res = NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
      withRequestIdHeader(res, requestId);
      logApiEvent("info", {
        requestId,
        route: "POST /api/login",
        event: "login_failed",
        userId: String(user.id_usuario),
        status: 401,
        extra: { reason: "bad_password" },
        durationMs: Date.now() - t0,
      });
      return res;
    }

    clearSuccessfulAuth(ip, normalizedEmail);

    const sessionId = crypto.randomUUID();
    await setActiveSession(String(user.id_usuario), sessionId, REFRESH_EXPIRES_IN);

    const sessionTokens = await createSessionTokenPair({
      userId: String(user.id_usuario),
      roleId: user.id_rol,
      name: user.nombres || user.correo.split("@")[0],
      sessionId,
    });

    const response = NextResponse.json(
      {
        success: true,
        id_publico: user.id_publico,
        id_rol: user.id_rol,
        expiresAt: sessionTokens.expiresAt,
        name: user.nombres || user.correo.split("@")[0],
      },
      { status: 200 }
    );

    withRequestIdHeader(response, requestId);
    logApiEvent("info", {
      requestId,
      route: "POST /api/login",
      userId: String(user.id_usuario),
      event: "login_success",
      status: 200,
      durationMs: Date.now() - t0,
    });

    return appendSessionCookies(response, buildSessionCookies(sessionTokens));
  } catch (err) {
    logApiEvent("error", {
      requestId,
      route: "POST /api/login",
      event: "login_error",
      status: 500,
      extra: { message: err instanceof Error ? err.message : String(err) },
      durationMs: Date.now() - t0,
    });
    console.error("Login error:", err);
    const res = NextResponse.json({ message: "Error interno" }, { status: 500 });
    return withRequestIdHeader(res, requestId);
  }
}
