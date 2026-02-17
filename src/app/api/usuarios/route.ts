import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { auth } from "@/lib/auth";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: Request) {
  try {
    // Accept Bearer token or session cookie (like /api/me)
    const authHeader = req.headers.get("authorization") || "";
    let requesterId: string | null = null;

    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7).trim();
      const payload = verifyToken(token);
      if (!payload || !payload.numero_documento) {
        return NextResponse.json({ ok: false, message: "Invalid token" }, { status: 401 });
      }
      requesterId = String(payload.numero_documento);
    } else {
      const session = await auth.api.getSession({ headers: req.headers as any });
      const sid = (session && session.user && (session.user as any).numero_documento) || null;
      if (!sid) {
        return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
      }
      requesterId = String(sid);
    }

    // Return detailed user info with joins to get pais and rol names
    // allow optional filters: role and estado (true/false)
    const url = new URL(req.url);
    const roleParam = url.searchParams.get('role');
    const estadoParam = url.searchParams.get('estado');

    let whereClauses: string[] = [];
    let params: any[] = [];
    let idx = 1;

    if (roleParam) {
      whereClauses.push(`u.id_rol = $${idx}`);
      params.push(Number(roleParam));
      idx++;
    }

    if (estadoParam !== null) {
      const estadoBool = String(estadoParam).toLowerCase() === 'true';
      whereClauses.push(`u.estado = $${idx}`);
      params.push(estadoBool);
      idx++;
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const res = await pool.query(`
      SELECT
        u.id_usuario AS numero_documento,
        u.nombres,
        u.apellidos,
        p.nombre_pais AS pais,
        u.telefono,
        u.validacion_telefono,
        u.correo,
        u.validacion_correo,
        u.estado,
        u.id_rol,
        r.nombre_rol,
        u.fecha_registro,
        u.fecha_desactivacion,
        u.fecha_actualizacion
      FROM tabla_usuarios u
      LEFT JOIN tabla_paises p ON u.id_pais = p.id_pais
      LEFT JOIN tabla_roles r ON u.id_rol = r.id_rol
      ${whereSql}
      ORDER BY u.nombres
      LIMIT 500
    `, params);

    return NextResponse.json({ ok: true, usuarios: res.rows });
  } catch (err) {
    console.error("/api/usuarios error:", err);
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}