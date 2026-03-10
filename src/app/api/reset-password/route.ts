import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "@/lib/db";
import { sendResetPasswordEmail, generateRandomPassword } from "@/lib/email";

export async function POST(req: Request) {
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
        SELECT id_usuario, correo, nombres
        FROM tabla_usuarios
        WHERE correo = $1
        LIMIT 1
      `,
      [email]
    );

    if (userResult.rowCount === 0) {
      return NextResponse.json(
        {
          success: true,
          message: "Si el correo existe, recibirás una nueva contraseña",
        },
        { status: 200 }
      );
    }

    const user = userResult.rows[0] as { id_usuario: string | number };
    const newPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `
        UPDATE tabla_usuarios
        SET contrasena_hash = $1
        WHERE id_usuario = $2
      `,
      [hashedPassword, user.id_usuario]
    );

    const emailSent = await sendResetPasswordEmail(email, newPassword);

    if (!emailSent) {
      console.error("Error enviando correo a:", email);
      return NextResponse.json(
        { error: "Error al enviar el correo. Intenta nuevamente más tarde." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Nueva contraseña enviada al correo",
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
