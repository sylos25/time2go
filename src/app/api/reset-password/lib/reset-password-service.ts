import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { generatePasswordResetToken, sendPasswordResetTokenEmail } from "@/lib/email";
import {
  expireResetTokenByToken,
  findResetToken,
  findResetUserByEmail,
  markResetTokenExpiredById,
  withResetTransaction,
} from "@/app/api/reset-password/lib/reset-password-repository";
import type { ResetPasswordTokenRow } from "@/app/api/reset-password/lib/reset-password-types";

function isResetTokenExpired(tokenData: ResetPasswordTokenRow): boolean {
  const now = new Date();
  const expirationDate = new Date(tokenData.fecha_expiracion);
  return tokenData.estado === "Caducado" || now > expirationDate;
}

export async function validateResetToken(token: string): Promise<NextResponse> {
  const tokenData = await findResetToken(token);

  if (!tokenData) {
    return NextResponse.json({ ok: false, error: "Token inválido" }, { status: 404 });
  }

  if (tokenData.estado === "Validado") {
    return NextResponse.json({ ok: false, error: "Este token ya fue utilizado" }, { status: 400 });
  }

  if (isResetTokenExpired(tokenData)) {
    if (tokenData.estado !== "Caducado") {
      await markResetTokenExpiredById(tokenData.id_token_recuperacion);
    }
    return NextResponse.json({ ok: false, error: "El token ha caducado" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, message: "Token válido" }, { status: 200 });
}

export async function requestPasswordReset(req: NextRequest, email: string): Promise<NextResponse> {
  const genericOkResponse = NextResponse.json(
    {
      success: true,
      message: "Si el correo existe, recibirás un enlace para restablecer tu contraseña",
    },
    { status: 200 }
  );

  const user = await findResetUserByEmail(email);
  if (!user) {
    return genericOkResponse;
  }

  const resetToken = generatePasswordResetToken();
  const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const userAgent = req.headers.get("user-agent") || null;
  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000";

  await withResetTransaction(async (client) => {
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
  });

  const emailSent = await sendPasswordResetTokenEmail(user.correo, resetToken, appBaseUrl);
  if (!emailSent) {
    console.error("Error enviando correo a:", email);
    await expireResetTokenByToken(resetToken);
    return NextResponse.json(
      { error: "Error al enviar el correo. Intenta nuevamente más tarde." },
      { status: 500 }
    );
  }

  return genericOkResponse;
}

export async function confirmPasswordReset(token: string, newPassword: string): Promise<NextResponse> {
  const result = await withResetTransaction(async (client) => {
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
      return NextResponse.json({ ok: false, error: "Token inválido" }, { status: 404 });
    }

    const tokenData = tokenResult.rows[0] as ResetPasswordTokenRow;

    if (tokenData.estado === "Validado") {
      return NextResponse.json({ ok: false, error: "Este token ya fue utilizado" }, { status: 400 });
    }

    if (isResetTokenExpired(tokenData)) {
      await client.query(
        `
          UPDATE tabla_recuperacion_contrasena_tokens
          SET estado = 'Caducado', fecha_actualizacion = CURRENT_TIMESTAMP
          WHERE id_token_recuperacion = $1
        `,
        [tokenData.id_token_recuperacion]
      );

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

    return NextResponse.json(
      { ok: true, message: "Tu contraseña se restableció correctamente" },
      { status: 200 }
    );
  });

  return result;
}
