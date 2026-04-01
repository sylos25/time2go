import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { generatePasswordResetToken, sendPasswordResetTokenEmail } from "@/lib/email";
import bcrypt from "bcryptjs";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 20;

function validatePassword(password: string): string[] {
  const errors: string[] = [];
  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    errors.push(`La contraseña debe tener entre ${MIN_PASSWORD_LENGTH} y ${MAX_PASSWORD_LENGTH} caracteres`);
  }
  if (!/[a-zA-Z]/.test(password)) errors.push("Debe incluir al menos una letra");
  if (!/[0-9]/.test(password)) errors.push("Debe incluir al menos un número");
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Debe incluir al menos un carácter especial");
  }
  return errors;
}

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ ok: false, error: "Token no proporcionado" }, { status: 400 });
    }

    const tokenResult = await pool.query(
      `
        SELECT id_token_recuperacion, estado, fecha_expiracion
        FROM tabla_recuperacion_contrasena_tokens
        WHERE token = $1
        LIMIT 1
      `,
      [token]
    );

    if (tokenResult.rowCount === 0) {
      return NextResponse.json({ ok: false, error: "Token inválido" }, { status: 404 });
    }

    const tokenData = tokenResult.rows[0] as {
      id_token_recuperacion: number;
      estado: "Pendiente" | "Caducado" | "Validado";
      fecha_expiracion: string;
    };

    if (tokenData.estado === "Validado") {
      return NextResponse.json({ ok: false, error: "Este token ya fue utilizado" }, { status: 400 });
    }

    const now = new Date();
    const expirationDate = new Date(tokenData.fecha_expiracion);
    if (tokenData.estado === "Caducado" || now > expirationDate) {
      if (tokenData.estado !== "Caducado") {
        await pool.query(
          `
            UPDATE tabla_recuperacion_contrasena_tokens
            SET estado = 'Caducado', fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id_token_recuperacion = $1
          `,
          [tokenData.id_token_recuperacion]
        );
      }
      return NextResponse.json({ ok: false, error: "El token ha caducado" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, message: "Token válido" }, { status: 200 });
  } catch (err) {
    console.error("Reset password token validation error:", err);
    return NextResponse.json({ ok: false, error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email?: string };

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Correo electrónico requerido" },
        { status: 400 }
      );
    }

    const userResult = await pool.query(
      `
        SELECT c.id_usuario, c.correo_usuario AS correo, u.nombres
        FROM tabla_usuarios_credenciales c
        INNER JOIN tabla_usuarios u ON u.id_usuario = c.id_usuario
        WHERE c.correo_usuario = $1
        LIMIT 1
      `,
      [email]
    );

    if (userResult.rowCount === 0) {
      return NextResponse.json(
        {
          success: true,
          message: "Si el correo existe, recibirás un enlace para restablecer tu contraseña",
        },
        { status: 200 }
      );
    }

    const user = userResult.rows[0] as { id_usuario: string | number; correo: string };
    const resetToken = generatePasswordResetToken();
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
    const userAgent = req.headers.get("user-agent") || null;
    const appBaseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL ||
      process.env.BETTER_AUTH_URL ||
      "http://localhost:3000";

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        `
          UPDATE tabla_recuperacion_contrasena_tokens
          SET estado = 'Caducado', fecha_actualizacion = CURRENT_TIMESTAMP
          WHERE id_usuario = $1 AND estado = 'Pendiente'
        `,
        [user.id_usuario]
      );

      await client.query(
        `
          INSERT INTO tabla_recuperacion_contrasena_tokens (
            id_usuario,
            token,
            estado,
            direccion_ip,
            user_agent
          )
          VALUES ($1, $2, 'Pendiente', $3, $4)
        `,
        [user.id_usuario, resetToken, ipAddress, userAgent]
      );

      await client.query("COMMIT");
    } catch (dbError) {
      await client.query("ROLLBACK");
      throw dbError;
    } finally {
      client.release();
    }

    const emailSent = await sendPasswordResetTokenEmail(user.correo, resetToken, appBaseUrl);

    if (!emailSent) {
      console.error("Error enviando correo a:", email);
      await pool.query(
        `
          UPDATE tabla_recuperacion_contrasena_tokens
          SET estado = 'Caducado', fecha_actualizacion = CURRENT_TIMESTAMP
          WHERE token = $1
        `,
        [resetToken]
      );
      return NextResponse.json(
        { error: "Error al enviar el correo. Intenta nuevamente más tarde." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Si el correo existe, recibirás un enlace para restablecer tu contraseña",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { token, newPassword, confirmPassword } = (await req.json()) as {
      token?: string;
      newPassword?: string;
      confirmPassword?: string;
    };

    if (!token || typeof token !== "string") {
      return NextResponse.json({ ok: false, error: "Token no proporcionado" }, { status: 400 });
    }

    if (!newPassword || !confirmPassword) {
      return NextResponse.json(
        { ok: false, error: "La nueva contraseña y su confirmación son obligatorias" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ ok: false, error: "Las contraseñas no coinciden" }, { status: 400 });
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      return NextResponse.json({ ok: false, error: passwordErrors.join(". ") }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const tokenResult = await client.query(
        `
          SELECT id_token_recuperacion, id_usuario, estado, fecha_expiracion
          FROM tabla_recuperacion_contrasena_tokens
          WHERE token = $1
          FOR UPDATE
        `,
        [token]
      );

      if (tokenResult.rowCount === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json({ ok: false, error: "Token inválido" }, { status: 404 });
      }

      const tokenData = tokenResult.rows[0] as {
        id_token_recuperacion: number;
        id_usuario: number;
        estado: "Pendiente" | "Caducado" | "Validado";
        fecha_expiracion: string;
      };

      if (tokenData.estado === "Validado") {
        await client.query("ROLLBACK");
        return NextResponse.json({ ok: false, error: "Este token ya fue utilizado" }, { status: 400 });
      }

      const now = new Date();
      const expirationDate = new Date(tokenData.fecha_expiracion);
      if (tokenData.estado === "Caducado" || now > expirationDate) {
        await client.query(
          `
            UPDATE tabla_recuperacion_contrasena_tokens
            SET estado = 'Caducado', fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id_token_recuperacion = $1
          `,
          [tokenData.id_token_recuperacion]
        );
        await client.query("COMMIT");
        return NextResponse.json({ ok: false, error: "El token ha caducado" }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await client.query(
        `
          UPDATE tabla_usuarios_credenciales
          SET contrasena_hash = $1, fecha_actualizacion = CURRENT_TIMESTAMP
          WHERE id_usuario = $2
        `,
        [hashedPassword, tokenData.id_usuario]
      );

      await client.query(
        `
          UPDATE tabla_recuperacion_contrasena_tokens
          SET estado = 'Validado', fecha_validacion = CURRENT_TIMESTAMP, fecha_actualizacion = CURRENT_TIMESTAMP
          WHERE id_token_recuperacion = $1
        `,
        [tokenData.id_token_recuperacion]
      );

      await client.query(
        `
          UPDATE tabla_recuperacion_contrasena_tokens
          SET estado = 'Caducado', fecha_actualizacion = CURRENT_TIMESTAMP
          WHERE id_usuario = $1 AND estado = 'Pendiente' AND id_token_recuperacion <> $2
        `,
        [tokenData.id_usuario, tokenData.id_token_recuperacion]
      );

      await client.query("COMMIT");

      return NextResponse.json(
        { ok: true, message: "Tu contraseña se restableció correctamente" },
        { status: 200 }
      );
    } catch (dbError) {
      await client.query("ROLLBACK");
      throw dbError;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Reset password confirmation error:", err);
    return NextResponse.json({ ok: false, error: "Error interno del servidor" }, { status: 500 });
  }
}
