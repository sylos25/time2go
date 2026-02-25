import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuth } from "@/lib/auth";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: Request) {
  try {
    // allow authenticated access via token or session
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
    if (role !== 4) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    const eventsActiveRes = await pool.query(`SELECT COUNT(*)::int AS count FROM tabla_eventos WHERE estado = TRUE`);
    const eventsInactiveRes = await pool.query(`SELECT COUNT(*)::int AS count FROM tabla_eventos WHERE estado = FALSE`);
    const usersRole1ActiveRes = await pool.query(`SELECT COUNT(*)::int AS count FROM tabla_usuarios WHERE estado = TRUE AND id_rol = 1`);
    const usersBannedRes = await pool.query(`SELECT COUNT(*)::int AS count FROM tabla_usuarios WHERE estado = FALSE`);

    const eventsActive = eventsActiveRes.rows && eventsActiveRes.rows[0] ? eventsActiveRes.rows[0].count : 0;
    const eventsInactive = eventsInactiveRes.rows && eventsInactiveRes.rows[0] ? eventsInactiveRes.rows[0].count : 0;
    const usersRole1Active = usersRole1ActiveRes.rows && usersRole1ActiveRes.rows[0] ? usersRole1ActiveRes.rows[0].count : 0;
    const usersBanned = usersBannedRes.rows && usersBannedRes.rows[0] ? usersBannedRes.rows[0].count : 0;

    return NextResponse.json({ ok: true, eventsActive, eventsInactive, usersRole1Active, usersBanned });
  } catch (err) {
    console.error('/api/stats error:', err);
    return NextResponse.json({ ok: false, message: 'Server error' }, { status: 500 });
  }
}