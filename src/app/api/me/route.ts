import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getRequesterIdFromRequest } from "@/lib/auth-request";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const userId = await getRequesterIdFromRequest(req);
    if (!userId) {
      const message = authHeader.startsWith("Bearer ") ? "Invalid token" : "No authenticated user";
      return NextResponse.json({ ok: false, message }, { status: 401 });
    }

    const result = await pool.query(
      `SELECT 
        u.id_publico,
        u.nombres, 
        u.apellidos, 
        c.correo_usuario AS correo, 
        u.id_rol, 
        u.id_pais, 
        u.telefono_persona AS telefono,
        c.validacion_correo,
        u.fecha_creacion AS fecha_registro,
        p.nombre_pais,
        r.nombre_rol
      FROM tabla_usuarios u
      LEFT JOIN tabla_usuarios_credenciales c ON c.id_usuario = u.id_usuario
      LEFT JOIN tabla_paises p ON u.id_pais = p.id_pais
      LEFT JOIN tabla_roles r ON u.id_rol = r.id_rol
      WHERE u.id_usuario = $1 LIMIT 1`,
      [userId]
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });
    }

    const user = result.rows[0];

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error("/api/me error:", err);
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
