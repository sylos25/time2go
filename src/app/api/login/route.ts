import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";
import { serializeCookie } from "@/lib/cookies";
import { getJwtSecret } from "@/lib/jwt";
import {
  runLoginRateLimitPrelude,
  registerFailedAuth,
  clearSuccessfulAuth,
} from "@/lib/login-rate-limit";
import { loginPostBodySchema } from "@/lib/validation/api-schemas";

function devWarn(...args: unknown[]) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(...args);
  }
}

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


export async function POST(req: Request) {
  try {
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return NextResponse.json({ message: "Cuerpo JSON inválido" }, { status: 400 });
    }

    const parsedBody = loginPostBodySchema.safeParse(raw);
    if (!parsedBody.success) {
      return NextResponse.json({ message: "Solicitud inválida" }, { status: 400 });
    }

    const { email, password, turnstileToken } = parsedBody.data;

    const normalizedEmail = normalizeEmail(String(email || ""));
    const ip = getClientIp(req);
    const now = Date.now();
    const captchaMode = getCaptchaMode();

    const rateLimited = await runLoginRateLimitPrelude(ip, normalizedEmail, now);
    if (rateLimited) {
      return rateLimited;
    }

    if (!normalizedEmail || !password) {
      registerFailedAuth(ip, normalizedEmail || "missing", now);
      return NextResponse.json(
        { message: "Email y contraseña requeridos" },
        { status: 400 }
      );
    }

    if (captchaMode !== "disabled") {
      if (!turnstileToken) {
        if (captchaMode === "strict") {
          registerFailedAuth(ip, normalizedEmail, now);
          return NextResponse.json({ message: "Captcha requerido", error: "turnstile_required" }, { status: 400 });
        }

        devWarn("[login] Missing turnstile token, degraded mode active");
      }

      if (turnstileToken) {
        const captchaResult = await verifyTurnstileToken(String(turnstileToken), ip);
        if (!captchaResult.ok) {
          if (captchaResult.kind === "invalid") {
            registerFailedAuth(ip, normalizedEmail, now);
            return NextResponse.json(
              {
                message: "Falló la verificación del captcha",
                error: "turnstile_failed",
                details: captchaResult.details,
              },
              { status: 403 }
            );
          }

          if (captchaMode === "strict") {
            return NextResponse.json(
              {
                message: "No se pudo validar el captcha por un incidente del proveedor. Intenta nuevamente en unos minutos.",
                error: "turnstile_provider_unavailable",
              },
              { status: 503 }
            );
          }

          // Modo degradado: permite autenticar, pero con límites de intentos activos.
          devWarn("[login] Turnstile provider unavailable, degraded mode active", captchaResult.details);
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
      registerFailedAuth(ip, normalizedEmail, now);
      return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
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
      registerFailedAuth(ip, normalizedEmail, now);
      return NextResponse.json(
        {
          error: "Usuario baneado",
          message: "Tu cuenta está baneada temporalmente. Contacta al administrador.",
          banned: true,
        },
        { status: 403 }
      );
    }

    if (!user.validacion_correo) {
      registerFailedAuth(ip, normalizedEmail, now);
      return NextResponse.json(
        {
          error: "Email no validado",
          message:
            "Debes validar tu correo electrónico antes de poder acceder. Revisa tu buzón de entrada y haz clic en el link de validación.",
          requiresEmailValidation: true,
        },
        { status: 403 }
      );
    }

    const hash = user.contrasena_hash;
    if (!hash || hash.trim() === "") {
      registerFailedAuth(ip, normalizedEmail, now);
      return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
    }

    const match = await bcrypt.compare(String(password), hash);
    if (!match) {
      registerFailedAuth(ip, normalizedEmail, now);
      return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
    }

    clearSuccessfulAuth(ip, normalizedEmail);

    const expiresIn = 60 * 60 * 12;
    const token = jwt.sign(
      {
        id_usuario: user.id_usuario,
        id_rol: user.id_rol,
        name: user.nombres || user.correo.split("@")[0],
      },
      getJwtSecret(),
      { expiresIn }
    );

    const secure = process.env.NODE_ENV === "production";
    const cookie = serializeCookie("token", token, {
      maxAge: expiresIn,
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      domain: process.env.COOKIE_DOMAIN,
    });

    return NextResponse.json(
      {
        success: true,
        token,
        id_publico: user.id_publico,
        id_rol: user.id_rol,
        expiresAt: Math.floor(Date.now() / 1000) + expiresIn,
        name: user.nombres || user.correo.split("@")[0],
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": cookie,
        },
      }
    );
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}