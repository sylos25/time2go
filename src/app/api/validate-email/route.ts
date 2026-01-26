import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token no proporcionado" },
        { status: 400 }
      );
    }


    const tokenResult = await pool.query(
      `SELECT numero_documento, utilizado, fecha_expiracion 
       FROM tabla_validacion_email_tokens 
       WHERE token = $1`,
      [token]
    );

    if (tokenResult.rowCount === 0) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 404 }
      );
    }

    const tokenData = tokenResult.rows[0];


    if (tokenData.utilizado) {
      return NextResponse.json(
        { error: "Este token ya ha sido utilizado" },
        { status: 400 }
      );
    }


    const now = new Date();
    const expirationDate = new Date(tokenData.fecha_expiracion);
    if (now > expirationDate) {
      return NextResponse.json(
        { error: "El token ha expirado" },
        { status: 400 }
      );
    }


    await pool.query(
      `UPDATE tabla_usuarios 
       SET validacion_correo = TRUE, fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE numero_documento = $1`,
      [tokenData.numero_documento]
    );


    await pool.query(
      `UPDATE tabla_validacion_email_tokens 
       SET utilizado = TRUE, fecha_validacion = CURRENT_TIMESTAMP
       WHERE token = $1`,
      [token]
    );

    return NextResponse.json(
      { 
        message: "Correo validado correctamente",
        numero_documento: tokenData.numero_documento
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en validate-email:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
