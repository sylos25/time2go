import { NextResponse } from "next/server";
import { getRequesterIdFromRequest } from "@/lib/auth-request";
import { changeUserPassword, validateCurrentPassword } from "@/app/api/change-password/lib/change-password-service";
import {
  parseChangePasswordInput,
  unauthorizedChangePasswordResponse,
} from "@/app/api/change-password/lib/change-password-validation";

// POST /api/change-password
export async function POST(req: Request) {
  try {
    const input = await parseChangePasswordInput(req);
    if (!input.ok) {
      return input.response;
    }

    const { currentPassword, newPassword } = input.data;

    const userId = await getRequesterIdFromRequest(req);
    if (!userId) {
      return unauthorizedChangePasswordResponse(req);
    }

    const isCurrentPasswordValid = await validateCurrentPassword(userId, currentPassword);
    if (isCurrentPasswordValid === null) {
      return NextResponse.json(
        { ok: false, message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { ok: false, message: "La contraseña actual es incorrecta" },
        { status: 400 }
      );
    }

    await changeUserPassword(userId, newPassword);

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
