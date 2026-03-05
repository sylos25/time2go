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
        SELECT
          u.id_usuario,
          u.id_publico,
          u.id_rol,
          u.estado,
          c.correo,
          c.id_google,
          c.validacion_correo,
          p.nombres
        FROM tabla_usuarios u
        INNER JOIN tabla_usuarios_credenciales c ON c.id_usuario = u.id_usuario
        LEFT JOIN tabla_personas p ON p.id_usuario = u.id_usuario
        WHERE c.id_google = $1 OR c.correo = $2
        LIMIT 1
      `,
      [igGoogle, email]
    );

    let user = existing.rows[0] as
      | {
          id_usuario: string | number;
          id_publico?: string;
          id_rol: number;
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
          UPDATE tabla_usuarios_credenciales
          SET id_google = COALESCE(id_google, $1),
              validacion_correo = TRUE,
              fecha_actualizacion = CURRENT_TIMESTAMP
          WHERE id_usuario = $2
          RETURNING id_usuario
        `,
        [igGoogle, user.id_usuario]
      );

      if (nombres || apellidos) {
        await pool.query(
          `
            INSERT INTO tabla_personas (id_usuario, nombres, apellidos)
            VALUES ($1, $2, $3)
            ON CONFLICT (id_usuario)
            DO UPDATE
            SET nombres = COALESCE(tabla_personas.nombres, EXCLUDED.nombres),
                apellidos = COALESCE(tabla_personas.apellidos, EXCLUDED.apellidos),
                fecha_actualizacion = CURRENT_TIMESTAMP
          `,
          [user.id_usuario, nombres || null, apellidos || null]
        );
      }

      const refreshed = await pool.query(
        `
          SELECT
            u.id_usuario,
            u.id_publico,
            u.id_rol,
            c.correo,
            p.nombres
          FROM tabla_usuarios u
          INNER JOIN tabla_usuarios_credenciales c ON c.id_usuario = u.id_usuario
          LEFT JOIN tabla_personas p ON p.id_usuario = u.id_usuario
          WHERE u.id_usuario = $1
          LIMIT 1
        `,
        [updated.rows[0].id_usuario]
      );
      user = refreshed.rows[0];
    } else {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const createdUser = await client.query(
          `
            INSERT INTO tabla_usuarios (
              terminos_condiciones,
              estado,
              id_rol,
              fecha_registro,
              fecha_actualizacion
            ) VALUES (TRUE,TRUE,1,NOW(),NOW())
            RETURNING id_usuario, id_publico
          `
        );

        const newUserId = createdUser.rows[0].id_usuario;

        await client.query(
          `
            INSERT INTO tabla_usuarios_credenciales (
              id_usuario,
              id_google,
              correo,
              validacion_correo,
              fecha_creacion,
              fecha_actualizacion
            ) VALUES ($1,$2,$3,TRUE,NOW(),NOW())
          `,
          [newUserId, igGoogle, email]
        );

        await client.query(
          `
            INSERT INTO tabla_personas (
              id_usuario,
              nombres,
              apellidos,
              fecha_creacion,
              fecha_actualizacion
            ) VALUES ($1,$2,$3,NOW(),NOW())
          `,
          [newUserId, nombres || null, apellidos || null]
        );

        await client.query("COMMIT");

        const created = await pool.query(
          `
            SELECT
              u.id_usuario,
              u.id_publico,
              u.id_rol,
              c.correo,
              p.nombres
            FROM tabla_usuarios u
            INNER JOIN tabla_usuarios_credenciales c ON c.id_usuario = u.id_usuario
            LEFT JOIN tabla_personas p ON p.id_usuario = u.id_usuario
            WHERE u.id_usuario = $1
            LIMIT 1
          `,
          [newUserId]
        );
        user = created.rows[0];
      } catch (txError) {
        await client.query("ROLLBACK");
        throw txError;
      } finally {
        client.release();
      }
    }

    if (!user) {
      return NextResponse.json({ message: "No fue posible resolver el usuario" }, { status: 500 });
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
        id_publico: user.id_publico,
        id_rol: user.id_rol,
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
