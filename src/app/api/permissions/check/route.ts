import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { parseCookies } from "@/lib/cookies";

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
      let userId: string | null = null;

      if (authHeader.startsWith("Bearer ")) {
        const token = authHeader.slice(7).trim();
        const payload = verifyToken(token);
        const userIdFromToken = payload?.id_usuario;
        if (!payload || !userIdFromToken) {
          return NextResponse.json(
            { ok: false, message: "Token inválido" },
            { status: 401 }
          );
        }
        userId = String(userIdFromToken);
      } else {
        const cookieHeader = req.headers.get("cookie");
        if (cookieHeader) {
          const cookies = parseCookies(cookieHeader);
          const token = cookies["token"];
          if (token) {
            const payload = verifyToken(token);
            const userIdFromToken = payload?.id_usuario;
            if (payload && userIdFromToken) {
              userId = String(userIdFromToken);
            }
          }
        }
      }

      if (!userId) {
        return NextResponse.json(
          { ok: false, message: "Usuario no autenticado" },
          { status: 401 }
        );
      }

      // Obtener el rol del usuario
      const userResult = await pool.query(
        "SELECT id_rol FROM tabla_usuarios WHERE id_usuario = $1",
        [userId]
      );

      if (!userResult.rows || userResult.rows.length === 0) {
        return NextResponse.json(
          { ok: false, message: "Usuario no encontrado" },
          { status: 404 }
        );
      }

      idRol = String(userResult.rows[0].id_rol);
    }

    // Verificar si el rol tiene acceso a la accesibilidad
    const result = await pool.query(
      `SELECT 
        axr.id_accesibilidad_menu_x_rol,
        axr.id_accesibilidad,
        axr.id_rol,
        am.nombre_accesibilidad
       FROM tabla_accesibilidad_menu_x_rol axr
       INNER JOIN tabla_accesibilidad_menu am ON axr.id_accesibilidad = am.id_accesibilidad
       WHERE axr.id_accesibilidad = $1 AND axr.id_rol = $2`,
      [idAccesibilidad, idRol]
    );

    const hasAccess = result.rows && result.rows.length > 0;

    return NextResponse.json({
      ok: true,
      hasAccess,
      id_accesibilidad: Number(idAccesibilidad),
      id_rol: Number(idRol),
      nombre_accesibilidad: hasAccess ? result.rows[0].nombre_accesibilidad : null,
    });
  } catch (err) {
    console.error("/api/permissions/check error:", err);
    return NextResponse.json(
      { ok: false, message: "Error del servidor" },
      { status: 500 }
    );
  }
}
