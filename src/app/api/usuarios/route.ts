import { NextResponse } from "next/server";
import { getRequesterIdFromRequest } from "@/lib/auth-request";
import {
  getUsuariosDefaultPayload,
  parseUsuariosFilters,
} from "@/app/api/usuarios/lib/usuarios-params";
import { findRequesterRole, listUsuarios } from "@/app/api/usuarios/lib/usuarios-repository";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const requesterId = await getRequesterIdFromRequest(req);
    if (!requesterId) {
      const message = authHeader.startsWith("Bearer ") ? "Invalid token" : "Not authenticated";
      return NextResponse.json({ ok: false, message }, { status: 401 });
    }

    const role = await findRequesterRole(requesterId);
    if (role !== 4 && role !== 3) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    const filters = parseUsuariosFilters(req);
    const payload =
      (await listUsuarios(filters)) || getUsuariosDefaultPayload(filters.page, filters.pageSize);

    return NextResponse.json({ ok: true, ...payload });
  } catch (err) {
    console.error("/api/usuarios error:", err);
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}