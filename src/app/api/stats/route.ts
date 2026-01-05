import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { auth } from "@/lib/auth";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: Request) {
  try {
    // allow authenticated access via token or session
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

    const eventsRes = await pool.query(`SELECT COUNT(*)::int AS count FROM tabla_eventos WHERE estado = TRUE`);
    // Count only users with role = 1 and estado = TRUE
    const usersRes = await pool.query(`SELECT COUNT(*)::int AS count FROM tabla_usuarios WHERE estado = TRUE AND id_rol = 1`);

    const eventsActive = eventsRes.rows && eventsRes.rows[0] ? eventsRes.rows[0].count : 0;
    const usersActive = usersRes.rows && usersRes.rows[0] ? usersRes.rows[0].count : 0;

    return NextResponse.json({ ok: true, eventsActive, usersActive });
  } catch (err) {
    console.error('/api/stats error:', err);
    return NextResponse.json({ ok: false, message: 'Server error' }, { status: 500 });
  }
}