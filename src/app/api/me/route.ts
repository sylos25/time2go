import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { auth } from "@/lib/auth";
import { verifyToken } from "@/lib/jwt";
import { parseCookies } from "@/lib/cookies";


export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    let userId: string | null = null;

    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7).trim();
      const payload = verifyToken(token);
      const userIdFromToken = payload?.id_usuario || payload?.numero_documento;
      if (!payload || !userIdFromToken) {
        return NextResponse.json({ ok: false, message: "Invalid token" }, { status: 401 });
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

      if (!userId) {
      const session = await auth.api.getSession({ headers: req.headers as any });
      const sid = (session && session.user && ((session.user as any).id_usuario || (session.user as any).numero_documento)) || null;
      if (!sid) {
        return NextResponse.json({ ok: false, message: "No authenticated user" }, { status: 401 });
      }
      userId = String(sid);
      }
    }

    if (!userId) {
      return NextResponse.json({ ok: false, message: "No authenticated user" }, { status: 401 });
    }

    const result = await pool.query(
      `SELECT 
        u.id_usuario,
        u.nombres, 
        u.apellidos, 
        u.correo, 
        u.id_rol, 
        u.id_pais, 
        u.telefono,
        u.validacion_telefono,
        u.validacion_correo,
        u.fecha_registro,
        p.nombre_pais,
        r.nombre_rol
      FROM tabla_usuarios u
      LEFT JOIN tabla_paises p ON u.id_pais = p.id_pais
      LEFT JOIN tabla_roles r ON u.id_rol = r.id_rol
      WHERE u.id_usuario = $1 LIMIT 1`,
      [userId]
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });
    }

    const user = result.rows[0];
    delete user.contrasena_hash;

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error("/api/me error:", err);
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
