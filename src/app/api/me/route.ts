import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { parseCookies } from "@/lib/cookies";


export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    let userId: string | null = null;

    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7).trim();
      const payload = verifyToken(token);
      const userIdFromToken = payload?.id_usuario;
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
          const userIdFromToken = payload?.id_usuario;
          if (payload && userIdFromToken) {
            userId = String(userIdFromToken);
          }
        }
      }

      if (!userId) {
        return NextResponse.json({ ok: false, message: "No authenticated user" }, { status: 401 });
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
