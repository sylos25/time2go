import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";
import { serializeCookie } from "@/lib/cookies";

type LoginLimiter = {
  requests: number[];
  lockUntil: number;
};

const ipLimiter = new Map<string, LoginLimiter>();
const credentialLimiter = new Map<string, LoginLimiter>();

const ONE_MINUTE_MS = 60 * 1000;
const FIFTEEN_MINUTES_MS = 15 * ONE_MINUTE_MS;
const THIRTY_MINUTES_MS = 30 * ONE_MINUTE_MS;

function cleanupLimiterMap(map: Map<string, LoginLimiter>, now: number, windowMs: number) {
  for (const [key, value] of map.entries()) {
    value.requests = value.requests.filter((ts) => now - ts <= windowMs);
    if (value.requests.length === 0 && value.lockUntil <= now) {
      map.delete(key);
    }
  }
}

function getOrCreateLimiter(map: Map<string, LoginLimiter>, key: string): LoginLimiter {
  const existing = map.get(key);
  if (existing) {
    return existing;
  }

  const created: LoginLimiter = { requests: [], lockUntil: 0 };
  map.set(key, created);
  return created;
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

function addAttemptAndCheckWindow(
  limiter: LoginLimiter,
  now: number,
  windowMs: number,
  maxAttempts: number
) {
  limiter.requests = limiter.requests.filter((ts) => now - ts <= windowMs);
  limiter.requests.push(now);

  return {
    blocked: limiter.requests.length > maxAttempts,
    count: limiter.requests.length,
  };
}

function setProgressiveLock(limiter: LoginLimiter, now: number, failsInWindow: number) {
  if (failsInWindow >= 10) {
    limiter.lockUntil = Math.max(limiter.lockUntil, now + THIRTY_MINUTES_MS);
  } else if (failsInWindow >= 6) {
    limiter.lockUntil = Math.max(limiter.lockUntil, now + 10 * ONE_MINUTE_MS);
  } else if (failsInWindow >= 4) {
    limiter.lockUntil = Math.max(limiter.lockUntil, now + 3 * ONE_MINUTE_MS);
  }
}

function lockResponse(lockUntil: number) {
  const retryAfter = Math.max(1, Math.ceil((lockUntil - Date.now()) / 1000));
  return NextResponse.json(
    {
      message: "Demasiados intentos. Intenta nuevamente en unos minutos.",
      error: "too_many_attempts",
      retryAfter,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
      },
    }
  );
}

function registerFailedAuth(ip: string, email: string, now: number) {
  const ipEntry = getOrCreateLimiter(ipLimiter, ip);
  const credEntry = getOrCreateLimiter(credentialLimiter, `${ip}::${email}`);

  const ipAttempt = addAttemptAndCheckWindow(ipEntry, now, FIFTEEN_MINUTES_MS, 40);
  const credAttempt = addAttemptAndCheckWindow(credEntry, now, FIFTEEN_MINUTES_MS, 8);

  setProgressiveLock(ipEntry, now, ipAttempt.count);
  setProgressiveLock(credEntry, now, credAttempt.count);
}

function clearSuccessfulAuth(ip: string, email: string) {
  credentialLimiter.delete(`${ip}::${email}`);
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
    const { email, password, turnstileToken } = (await req.json()) as {
      email?: string;
      password?: string;
      turnstileToken?: string | null;
    };

    const normalizedEmail = normalizeEmail(String(email || ""));
    const ip = getClientIp(req);
    const now = Date.now();
    const captchaMode = getCaptchaMode();

    cleanupLimiterMap(ipLimiter, now, FIFTEEN_MINUTES_MS);
    cleanupLimiterMap(credentialLimiter, now, FIFTEEN_MINUTES_MS);

    const ipEntry = getOrCreateLimiter(ipLimiter, ip);
    const credentialKey = `${ip}::${normalizedEmail}`;
    const credentialEntry = getOrCreateLimiter(credentialLimiter, credentialKey);

    if (ipEntry.lockUntil > now) {
      return lockResponse(ipEntry.lockUntil);
    }

    if (credentialEntry.lockUntil > now) {
      return lockResponse(credentialEntry.lockUntil);
    }

    // Limita volumen bruto por IP para reducir ataques distribuidos sobre credenciales.
    const ipWindow = addAttemptAndCheckWindow(ipEntry, now, FIFTEEN_MINUTES_MS, 70);
    if (ipWindow.blocked) {
      ipEntry.lockUntil = Math.max(ipEntry.lockUntil, now + 10 * ONE_MINUTE_MS);
      return lockResponse(ipEntry.lockUntil);
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

        console.warn("[login] Missing turnstile token, degraded mode active");
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
          c.correo,
          p.nombres,
          c.contrasena_hash,
          c.validacion_correo,
          u.estado
        FROM tabla_usuarios u
        INNER JOIN tabla_usuarios_credenciales c ON c.id_usuario = u.id_usuario
        LEFT JOIN tabla_personas p ON p.id_usuario = u.id_usuario
        WHERE c.correo = $1
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

    const secret =
      process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET || "dev-secret";
    const expiresIn = 60 * 60 * 12;
    const token = jwt.sign(
      {
        id_usuario: user.id_usuario,
        name: user.nombres || user.correo.split("@")[0],
      },
      secret,
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