import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getRequesterIdFromRequest } from "@/lib/auth-request";
import bcrypt from "bcryptjs";
import { changePasswordBodySchema } from "@/lib/validation/api-schemas";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 20;

function validatePassword(password: string): string[] {
  const errors: string[] = [];
  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH)
    errors.push(`La contraseña debe tener entre ${MIN_PASSWORD_LENGTH} y ${MAX_PASSWORD_LENGTH} caracteres`);
  if (!/[a-zA-Z]/.test(password)) errors.push("Debe incluir al menos una letra");
  if (!/[0-9]/.test(password)) errors.push("Debe incluir al menos un número");
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push("Debe incluir al menos un carácter especial");
  return errors;
}

// POST /api/change-password
export async function POST(req: Request) {
  try {
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return NextResponse.json({ ok: false, message: "JSON inválido" }, { status: 400 });
    }

    const parsed = changePasswordBodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: "Datos inválidos" }, { status: 400 });
    }

    const { currentPassword, newPassword, confirmPassword } = parsed.data;

    // Validar que las contraseñas nuevas coincidan
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { ok: false, message: "Las contraseñas no coinciden" },
        { status: 400 }
      );
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      return NextResponse.json(
        { ok: false, message: passwordErrors.join(". ") },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("authorization") || "";
    const userId = getRequesterIdFromRequest(req);
    if (!userId) {
      const message = authHeader.startsWith("Bearer ") ? "Token inválido" : "No autorizado";
      return NextResponse.json({ ok: false, message }, { status: 401 });
    }

    // Obtener el usuario de la base de datos
    const userResult = await pool.query(
      `SELECT contrasena_hash FROM tabla_usuarios_credenciales WHERE id_usuario = $1`,
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
      `UPDATE tabla_usuarios_credenciales
       SET contrasena_hash = $1, fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id_usuario = $2`,
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
