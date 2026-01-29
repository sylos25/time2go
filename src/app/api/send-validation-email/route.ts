import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import pool from "@/lib/db";
import { sendEmailValidationEmail, generateEmailValidationToken } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email, numero_documento, baseUrl } = await req.json();

    if (!email || !numero_documento) {
      return NextResponse.json(
        { error: "Email y número de documento son requeridos" },
        { status: 400 }
      );
    }


    const userCheck = await pool.query(
      "SELECT numero_documento FROM tabla_usuarios WHERE numero_documento = $1 AND correo = $2",
      [numero_documento, email]
    );

    if (userCheck.rowCount === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }


    const token = generateEmailValidationToken();
    const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000);


    await pool.query(
      `INSERT INTO tabla_validacion_email_tokens (numero_documento, token, fecha_expiracion)
       VALUES ($1, $2, $3)`,
      [numero_documento, token, expirationTime]
    );


    const baseUrlToUse = baseUrl || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const emailSent = await sendEmailValidationEmail(email, token, baseUrlToUse);

    if (!emailSent) {
      return NextResponse.json(
        { error: "Error al enviar el email de validación" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Email de validación enviado correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en send-validation-email:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
