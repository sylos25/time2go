/**
 * Utilidad para verificar permisos en rutas de API y páginas del servidor
 * Uso en API routes o Server Components
 */

import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { parseCookies } from "@/lib/cookies";

export interface PermissionCheckResult {
  hasAccess: boolean;
  userId?: string;
  userRole?: number;
  error?: string;
}

/**
 * Verifica si un usuario tiene acceso a una funcionalidad específica
 * @param req - Request object
 * @param idAccesibilidad - ID de la accesibilidad a verificar
 * @returns Resultado de la verificación con información del usuario
 */
export async function checkUserPermission(
  req: Request,
  idAccesibilidad: number
): Promise<PermissionCheckResult> {
  try {
    // Obtener el usuario autenticado
    const authHeader = req.headers.get("authorization") || "";
    let userId: string | null = null;

    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7).trim();
      const payload = verifyToken(token);
      const userIdFromToken = payload?.id_usuario || payload?.numero_documento;
      if (!payload || !userIdFromToken) {
        return { hasAccess: false, error: "Token inválido" };
      }
      userId = String(userIdFromToken);
    } else {
      const cookieHeader = req.headers.get("cookie");
      if (cookieHeader) {
        const cookies = parseCookies(cookieHeader);
        const token = cookies["token"];
        if (token) {
          const payload = verifyToken(token);
          const userIdFromToken = payload?.id_usuario || payload?.numero_documento;
          if (payload && userIdFromToken) {
            userId = String(userIdFromToken);
          }
        }
      }
    }

    if (!userId) {
      return { hasAccess: false, error: "Usuario no autenticado" };
    }

    // Obtener el rol del usuario
    const userResult = await pool.query(
      "SELECT id_rol FROM tabla_usuarios WHERE id_usuario = $1",
      [userId]
    );

    if (!userResult.rows || userResult.rows.length === 0) {
      return { hasAccess: false, error: "Usuario no encontrado" };
    }

    const userRole = Number(userResult.rows[0].id_rol);

    // Verificar si el rol tiene acceso a la accesibilidad
    const permissionResult = await pool.query(
      `SELECT id_accesibilidad_menu_x_rol
       FROM tabla_accesibilidad_menu_x_rol
       WHERE id_accesibilidad = $1 AND id_rol = $2`,
      [idAccesibilidad, userRole]
    );

    const hasAccess = permissionResult.rows && permissionResult.rows.length > 0;

    return {
      hasAccess,
      userId,
      userRole,
    };
  } catch (error) {
    console.error("Error checking user permission:", error);
    return { hasAccess: false, error: "Error al verificar permisos" };
  }
}

/**
 * IDs de accesibilidad del sistema
 * Mantener sincronizado con la tabla tabla_accesibilidad_menu
 */
export const PERMISSION_IDS = {
  CREAR_EVENTOS: 1,
  GESTIONAR_RESERVAS: 2,
  GESTIONAR_EVENTOS: 3,
  VER_DASHBOARD: 4,
  AGREGAR_DATA: 5,
  EDITAR_DATA: 6,
  ELIMINAR_DATA: 7,
  GESTIONAR_USUARIOS: 8,
  GESTIONAR_ROLES: 9,
  GESTIONAR_ACCESIBILIDAD_SISTEMA: 10,
  GESTIONAR_BANEADOS: 11,
} as const;

/**
 * Middleware helper para proteger rutas de API
 * @param req - Request object
 * @param idAccesibilidad - ID de la accesibilidad requerida
 * @returns Response con error si no tiene acceso, o null si tiene acceso
 */
export async function requirePermission(
  req: Request,
  idAccesibilidad: number
): Promise<Response | null> {
  const result = await checkUserPermission(req, idAccesibilidad);

  if (!result.hasAccess) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: result.error || "No tienes permiso para realizar esta acción",
      }),
      {
        status: result.error?.includes("autenticado") ? 401 : 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return null; // Sin error, continuar
}
