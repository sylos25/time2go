import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";
import { serializeCookie } from "@/lib/cookies";

export async function POST(req: Request) {
  try {
    const { email, password, turnstileToken } = (await req.json()) as {
      email?: string;
      password?: string;
      turnstileToken?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email y contraseña requeridos" },
        { status: 400 }
      );
    }

    const turnstileSecret = process.env.CLOUDFLARE_TURNSTILE_SECRET;
    if (!turnstileSecret) {
      console.warn("Turnstile secret no configurado; omitiendo captcha");
    } else {
      if (!turnstileToken) {
        return NextResponse.json(
          { message: "Captcha requerido" },
          { status: 400 }
        );
      }

      const params = new URLSearchParams();
      params.append("secret", turnstileSecret);
      params.append("response", String(turnstileToken));

      const verifyRes = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params.toString(),
        }
      );

      const verifyJson = (await verifyRes.json()) as {
        success?: boolean;
        [key: string]: unknown;
      };

      if (!verifyJson.success) {
        return NextResponse.json(
          {
            message: "Falló la verificación del captcha",
            error: "turnstile_failed",
            details: verifyJson["error-codes"],
          },
          { status: 403 }
        );
      }
    }

    const userResult = await pool.query(
      `
        SELECT id_usuario, correo, nombres, contrasena_hash, validacion_correo, estado
        FROM tabla_usuarios
        WHERE correo = $1
        LIMIT 1
      `,
      [email]
    );

    if (userResult.rowCount === 0) {
      return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
    }

    const user = userResult.rows[0] as {
      id_usuario: string | number;
      correo: string;
      nombres?: string | null;
      contrasena_hash?: string | null;
      validacion_correo?: boolean;
      estado?: boolean;
    };

    if (user.estado === false) {
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
      return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
    }

    const match = await bcrypt.compare(String(password), hash);
    if (!match) {
      return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
    }

    const secret =
      process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET || "dev-secret";
    const expiresIn = 60 * 30;
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
        id_usuario: user.id_usuario,
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
