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

    const [
      eventsActiveRes,
      eventsInactiveRes,
      usersRole1ActiveRes,
      usersBannedRes,
      userRegistrationsRes,
      eventsByCategoryRes,
      topRatedEventsRes,
    ] = await Promise.all([
      pool.query(`SELECT COUNT(1)::int AS count FROM tabla_eventos WHERE estado = TRUE`),
      pool.query(`SELECT COUNT(1)::int AS count FROM tabla_eventos WHERE estado = FALSE`),
      pool.query(`SELECT COUNT(1)::int AS count FROM tabla_usuarios WHERE estado = TRUE AND id_rol = 1`),
      pool.query(`SELECT COUNT(1)::int AS count FROM tabla_usuarios WHERE estado = FALSE`),
      pool.query(
        `SELECT
          to_char(date_trunc('month', fecha_registro), 'YYYY-MM') AS month_key,
          COUNT(1)::int AS total
         FROM tabla_usuarios
         WHERE fecha_registro >= date_trunc('month', CURRENT_DATE) - INTERVAL '5 months'
         GROUP BY 1
         ORDER BY 1 ASC`
      ),
      pool.query(
        `SELECT
          ce.id_categoria_evento,
          ce.nombre,
          COUNT(e.id_evento)::int AS total
         FROM tabla_categoria_eventos ce
         LEFT JOIN tabla_eventos e ON e.id_categoria_evento = ce.id_categoria_evento
         GROUP BY ce.id_categoria_evento, ce.nombre
         ORDER BY total DESC, ce.nombre ASC`
      ),
      pool.query(
        `SELECT
          e.id_evento,
          e.nombre_evento,
          ROUND(AVG(v.valoracion)::numeric, 2) AS promedio_valoracion,
          COUNT(v.id_valoracion)::int AS total_valoraciones
         FROM tabla_eventos e
         INNER JOIN tabla_valoraciones v ON v.id_evento = e.id_evento
         GROUP BY e.id_evento, e.nombre_evento
         ORDER BY promedio_valoracion DESC, total_valoraciones DESC, e.nombre_evento ASC
         LIMIT 8`
      ),
    ]);

    const eventsActive = eventsActiveRes.rows && eventsActiveRes.rows[0] ? eventsActiveRes.rows[0].count : 0;
    const eventsInactive = eventsInactiveRes.rows && eventsInactiveRes.rows[0] ? eventsInactiveRes.rows[0].count : 0;
    const usersRole1Active = usersRole1ActiveRes.rows && usersRole1ActiveRes.rows[0] ? usersRole1ActiveRes.rows[0].count : 0;
    const usersBanned = usersBannedRes.rows && usersBannedRes.rows[0] ? usersBannedRes.rows[0].count : 0;

    const userRegistrationsByMonth = (userRegistrationsRes.rows || []).map((row) => ({
      monthKey: String(row.month_key || ""),
      total: Number(row.total || 0),
    }));

    const eventsByCategory = (eventsByCategoryRes.rows || []).map((row) => ({
      idCategoriaEvento: Number(row.id_categoria_evento || 0),
      nombre: String(row.nombre || "Sin categoría"),
      total: Number(row.total || 0),
    }));

    const topRatedEvents = (topRatedEventsRes.rows || []).map((row) => ({
      idEvento: Number(row.id_evento || 0),
      nombreEvento: String(row.nombre_evento || "Evento"),
      promedioValoracion: Number(row.promedio_valoracion || 0),
      totalValoraciones: Number(row.total_valoraciones || 0),
    }));

    return NextResponse.json({
      ok: true,
      eventsActive,
      eventsInactive,
      usersRole1Active,
      usersBanned,
      userRegistrationsByMonth,
      eventsByCategory,
      topRatedEvents,
    });
  } catch (err) {
    console.error('/api/stats error:', err);
    return NextResponse.json({ ok: false, message: 'Server error' }, { status: 500 });
  }
}