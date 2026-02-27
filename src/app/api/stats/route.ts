import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { parseCookies } from "@/lib/cookies";

export async function GET(req: Request) {
  try {
    // allow authenticated access via token or session
    const authHeader = req.headers.get("authorization") || "";
    let requesterId: string | null = null;

    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7).trim();
      const payload = verifyToken(token);
      const userIdFromToken = payload?.id_usuario;
      if (!payload || !userIdFromToken) {
        return NextResponse.json({ ok: false, message: "Invalid token" }, { status: 401 });
      }
      requesterId = String(userIdFromToken);
    } else {
      const cookieHeader = req.headers.get("cookie");
      if (cookieHeader) {
        const cookies = parseCookies(cookieHeader);
        const token = cookies["token"];
        if (token) {
          const payload = verifyToken(token);
          const userIdFromToken = payload?.id_usuario;
          if (payload && userIdFromToken) {
            requesterId = String(userIdFromToken);
          }
        }
      }
      if (!requesterId) {
        return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
      }
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