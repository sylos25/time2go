import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { auth } from "@/lib/auth";
import { verifyToken } from "@/lib/jwt";

// GET /api/me - returns the authenticated user's public profile if session exists
export async function GET(req: Request) {
  try {
    // First: check Authorization: Bearer <token>
    const authHeader = req.headers.get("authorization") || "";
    let userId: number | null = null;

    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7).trim();
      const payload = verifyToken(token);
      if (!payload || !payload.numero_documento) {
        return NextResponse.json({ ok: false, message: "Invalid token" }, { status: 401 });
      }
      // numero_documento is stored as string
      var numeroDocumento = String(payload.numero_documento);
    } else {
      // Fallback to better-auth session (cookie)
      const session = await auth.api.getSession({ headers: req.headers as any });
      const sid = (session && session.user && (session.user as any).numero_documento) || null;
      if (!sid) {
        return NextResponse.json({ ok: false, message: "No authenticated user" }, { status: 401 });
      }
      var numeroDocumento = String(sid);
    }

    const result = await pool.query(
      `SELECT numero_documento, nombres, apellidos, correo, id_rol, id_pais FROM tabla_usuarios WHERE numero_documento = $1 LIMIT 1`,
      [numeroDocumento]
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });
    }

    const user = result.rows[0];
    // hide sensitive fields if any
    delete user.contrasena_hash;

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error("/api/me error:", err);
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
