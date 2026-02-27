import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";
import { serializeCookie } from "@/lib/cookies";

const GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo";

export async function POST(req: Request) {
  try {
    const { credential } = (await req.json()) as { credential?: string };

    if (!credential) {
      return NextResponse.json({ message: "Token requerido" }, { status: 400 });
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        { message: "Google Client ID no configurado" },
        { status: 500 }
      );
    }

    const verifyRes = await fetch(
      `${GOOGLE_TOKENINFO_URL}?id_token=${encodeURIComponent(String(credential))}`
    );

    if (!verifyRes.ok) {
      return NextResponse.json({ message: "Token de Google invalido" }, { status: 401 });
    }

    const tokenInfo = (await verifyRes.json()) as {
      aud?: string;
      email_verified?: boolean | string;
      sub?: string;
      email?: string;
      given_name?: string;
      family_name?: string;
    };

    if (tokenInfo.aud !== clientId) {
      return NextResponse.json({ message: "Audience no valido" }, { status: 401 });
    }

    const emailVerified =
      tokenInfo.email_verified === true || tokenInfo.email_verified === "true";
    if (!emailVerified) {
      return NextResponse.json(
        { message: "Email de Google no verificado" },
        { status: 403 }
      );
    }

    const igGoogle = String(tokenInfo.sub || "").trim();
    const email = String(tokenInfo.email || "").trim();
    const nombres = String(tokenInfo.given_name || "").trim();
    const apellidos = String(tokenInfo.family_name || "").trim();

    if (!igGoogle || !email) {
      return NextResponse.json(
        { message: "Datos de Google incompletos" },
        { status: 400 }
      );
    }

    const existing = await pool.query(
      `
        SELECT id_usuario, id_publico, correo, nombres, validacion_correo, ig_google, estado
        FROM tabla_usuarios
        WHERE ig_google = $1 OR correo = $2
        LIMIT 1
      `,
      [igGoogle, email]
    );

    let user = existing.rows[0] as
      | {
          id_usuario: string | number;
          id_publico?: string;
          correo: string;
          nombres?: string | null;
          estado?: boolean;
        }
      | undefined;

    if (user) {
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

      const updated = await pool.query(
        `
          UPDATE tabla_usuarios
          SET ig_google = COALESCE(ig_google, $1),
              validacion_correo = TRUE,
              nombres = COALESCE(nombres, $3),
              apellidos = COALESCE(apellidos, $4),
              fecha_actualizacion = CURRENT_TIMESTAMP
          WHERE id_usuario = $2
          RETURNING id_usuario, id_publico, correo, nombres
        `,
        [igGoogle, user.id_usuario, nombres || null, apellidos || null]
      );
      user = updated.rows[0];
    } else {
      const created = await pool.query(
        `
          INSERT INTO tabla_usuarios (
            ig_google,
            nombres,
            apellidos,
            correo,
            validacion_correo,
            terminos_condiciones,
            estado,
            id_rol,
            fecha_registro,
            fecha_actualizacion
          ) VALUES ($1,$2,$3,$4,TRUE,TRUE,TRUE,1,NOW(),NOW())
          RETURNING id_usuario, id_publico, correo, nombres
        `,
        [igGoogle, nombres || null, apellidos || null, email]
      );
      user = created.rows[0];
    }

    const secret = process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET || "dev-secret";
    const expiresIn = 60 * 30;
    const userId = String(user.id_usuario);
    const token = jwt.sign(
      { id_usuario: userId, name: user.nombres || email.split("@")[0] },
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
        id_usuario: userId,
        id_publico: user.id_publico,
        expiresAt: Math.floor(Date.now() / 1000) + expiresIn,
        name: user.nombres || email.split("@")[0],
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": cookie,
        },
      }
    );
  } catch (err) {
    console.error("Login Google error:", err);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
