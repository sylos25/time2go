import { NextResponse } from "next/server"

import { checkUserPermission, PERMISSION_IDS } from "@/lib/permissions"

export async function ensurePlanesAdmin(req: Request) {
  const permission = await checkUserPermission(req, PERMISSION_IDS.VER_DASHBOARD)
  if (!permission.hasAccess) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { ok: false, message: permission.error || "No autorizado para gestionar planes" },
        { status: permission.error?.includes("autenticado") ? 401 : 403 }
      ),
    }
  }

  if (permission.userRole !== 4) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { ok: false, message: "Solo el rol Administrador puede acceder a esta sección" },
        { status: 403 }
      ),
    }
  }

  return { ok: true as const }
}
