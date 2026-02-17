import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import bcrypt from "bcryptjs";

// POST /api/change-password
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // Validar que los campos requeridos existan
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { ok: false, message: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Validar que las contraseñas nuevas coincidan
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { ok: false, message: "Las contraseñas no coinciden" },
        { status: 400 }
      );
    }

    // Validar longitud mínima
    if (newPassword.length < 8) {
      return NextResponse.json(
        { ok: false, message: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }

    // Obtener el usuario del token
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { ok: false, message: "No autorizado" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7).trim();
    const payload = verifyToken(token);

    const userIdFromToken = payload?.id_usuario || payload?.numero_documento;
    if (!payload || !userIdFromToken) {
      return NextResponse.json(
        { ok: false, message: "Token inválido" },
        { status: 401 }
      );
    }

    const userId = String(userIdFromToken);

    // Obtener el usuario de la base de datos
    const userResult = await pool.query(
      `SELECT contrasena_hash FROM tabla_usuarios WHERE id_usuario = $1`,
      [userId]
    );

    if (!userResult.rows || userResult.rows.length === 0) {
      return NextResponse.json(
        { ok: false, message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    // Verificar que la contraseña actual sea correcta
    const isPasswordValid = await bcrypt.compare(currentPassword, user.contrasena_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { ok: false, message: "La contraseña actual es incorrecta" },
        { status: 400 }
      );
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña en la base de datos
    await pool.query(
      `UPDATE tabla_usuarios SET contrasena_hash = $1, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id_usuario = $2`,
      [hashedPassword, userId]
    );

    return NextResponse.json({
      ok: true,
      message: "Contraseña actualizada correctamente",
    });
  } catch (err) {
    console.error("/api/change-password error:", err);
    return NextResponse.json(
      { ok: false, message: "Error del servidor" },
      { status: 500 }
    );
  }
}
