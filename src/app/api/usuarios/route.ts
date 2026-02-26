import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuth } from "@/lib/auth";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: Request) {
  try {
    // Accept Bearer token or session cookie (like /api/me)
    const authHeader = req.headers.get("authorization") || "";
    let requesterId: string | null = null;

    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7).trim();
      const payload = verifyToken(token);
      const userIdFromToken = payload?.id_usuario || payload?.numero_documento;
      if (!payload || !userIdFromToken) {
        return NextResponse.json({ ok: false, message: "Invalid token" }, { status: 401 });
      }
      requesterId = String(userIdFromToken);
    } else {
      const session = await getAuth().api.getSession({ headers: req.headers as any });
      const sid = (session && session.user && ((session.user as any).id_usuario || (session.user as any).numero_documento)) || null;
      if (!sid) {
        return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
      }
      requesterId = String(sid);
    }

    const roleRes = await pool.query(
      "SELECT id_rol FROM tabla_usuarios WHERE id_usuario = $1 LIMIT 1",
      [requesterId]
    );
    const role = roleRes.rows && roleRes.rows[0] ? Number(roleRes.rows[0].id_rol) : null;
    if (role !== 4 && role !== 3) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
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

    // En gestión de usuarios del dashboard solo se visualizan usuarios y promotores
    whereClauses.push(`u.id_rol IN (1, 2)`)

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const res = await pool.query(`
      SELECT
        u.id_usuario,
        r.nombre_rol AS id_rol,
        u.ig_google,
        u.nombres,
        u.apellidos,
        u.telefono,
        u.validacion_telefono,
        u.correo,
        u.validacion_correo,
        u.terminos_condiciones,
        u.estado
      FROM tabla_usuarios u
      LEFT JOIN tabla_roles r ON u.id_rol = r.id_rol
      ${whereSql}
      ORDER BY u.id_usuario DESC
      LIMIT 500
    `, params);

    return NextResponse.json({ ok: true, usuarios: res.rows });
  } catch (err) {
    console.error("/api/usuarios error:", err);
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}