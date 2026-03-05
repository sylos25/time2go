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
        u.id_publico,
        p2.nombres, 
        p2.apellidos, 
        c.correo, 
        u.id_rol, 
        p2.id_pais, 
        p2.telefono,
        p2.validacion_telefono,
        c.validacion_correo,
        u.fecha_registro,
        p.nombre_pais,
        r.nombre_rol
      FROM tabla_usuarios u
      LEFT JOIN tabla_personas p2 ON p2.id_usuario = u.id_usuario
      LEFT JOIN tabla_usuarios_credenciales c ON c.id_usuario = u.id_usuario
      LEFT JOIN tabla_paises p ON p2.id_pais = p.id_pais
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
