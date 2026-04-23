import { NextResponse } from "next/server";
import { getRequesterIdFromRequest } from "@/lib/auth-request";
import {
  findPermissionAccess,
  findUserRoleById,
} from "@/app/api/permissions/check/lib/permissions-check-repository";

/**
 * API para verificar si un rol tiene acceso a una funcionalidad específica
 * Query params:
 * - id_accesibilidad: ID de la accesibilidad a verificar (ej: 1 para crear eventos, 6 para dashboard)
 * - id_rol: (opcional) ID del rol a verificar. Si no se proporciona, se obtiene del usuario autenticado
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idAccesibilidad = searchParams.get("id_accesibilidad");
    let idRol = searchParams.get("id_rol");

    if (!idAccesibilidad) {
      return NextResponse.json(
        { ok: false, message: "id_accesibilidad es requerido" },
        { status: 400 }
      );
    }

    // Si no se proporciona id_rol, obtenerlo del usuario autenticado
    if (!idRol) {
      const authHeader = req.headers.get("authorization") || "";
      const userId = await getRequesterIdFromRequest(req);
      if (!userId) {
        const message = authHeader.startsWith("Bearer ") ? "Token inválido" : "Usuario no autenticado";
        return NextResponse.json({ ok: false, message }, { status: 401 });
      }

      // Obtener el rol del usuario
      const resolvedRole = await findUserRoleById(userId)

      if (resolvedRole === null) {
        return NextResponse.json(
          { ok: false, message: "Usuario no encontrado" },
          { status: 404 }
        );
      }

      idRol = String(resolvedRole);
    }

    const accessRow = await findPermissionAccess(idAccesibilidad, idRol)
    const hasAccess = Boolean(accessRow)

    return NextResponse.json({
      ok: true,
      hasAccess,
      id_accesibilidad: Number(idAccesibilidad),
      id_rol: Number(idRol),
      nombre_accesibilidad: accessRow?.nombre_accesibilidad ?? null,
    });
  } catch (err) {
    console.error("/api/permissions/check error:", err);
    return NextResponse.json(
      { ok: false, message: "Error del servidor" },
      { status: 500 }
    );
  }
}
