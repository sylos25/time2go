import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getRequesterIdLenient } from "@/lib/auth-request";

async function requireModerator(req: Request) {
  const uid = await getRequesterIdLenient(req);
  if (!uid) {
    return { error: NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 }) };
  }
  const q = await pool.query(`SELECT id_rol FROM tabla_usuarios WHERE id_usuario = $1 LIMIT 1`, [Number(uid)]);
  const role = Number(q.rows[0]?.id_rol);
  if (role !== 3 && role !== 4) {
    return { error: NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 }) };
  }
  return { userId: Number(uid), role };
}

function parsePositiveInt(value: string | null, fallback: number, max: number): number {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(max, n);
}

/**
 * Eventos con muchos reportes en una ventana de días (priorización de moderación).
 * Umbrales por defecto: env DENUNCIAS_ALERTA_MIN, DENUNCIAS_ALERTA_DIAS o query ?minCount=&days=
 */
export async function GET(req: Request) {
  const auth = await requireModerator(req);
  if ("error" in auth) return auth.error;

  try {
    const url = new URL(req.url);
    const envMin = parseInt(process.env.DENUNCIAS_ALERTA_MIN || "3", 10);
    const envDays = parseInt(process.env.DENUNCIAS_ALERTA_DIAS || "30", 10);
    const minCount = parsePositiveInt(url.searchParams.get("minCount"), Number.isFinite(envMin) && envMin > 0 ? envMin : 3, 500);
    const days = parsePositiveInt(url.searchParams.get("days"), Number.isFinite(envDays) && envDays > 0 ? envDays : 30, 365);

    const listRes = await pool.query(
      `SELECT
        d.id_evento,
        e.nombre_evento,
        e.id_publico_evento,
        COUNT(*)::INT AS reportes_count
      FROM tabla_denuncia_eventos d
      INNER JOIN tabla_eventos e ON e.id_evento = d.id_evento
      WHERE d.fecha_creacion >= CURRENT_TIMESTAMP - ($1::int * INTERVAL '1 day')
      GROUP BY d.id_evento, e.nombre_evento, e.id_publico_evento
      HAVING COUNT(*) >= $2::int
      ORDER BY reportes_count DESC, e.nombre_evento ASC
      LIMIT 100`,
      [days, minCount]
    );

    return NextResponse.json({
      ok: true,
      umbral: { minCount, days },
      eventos: listRes.rows || [],
    });
  } catch (e) {
    console.error("[dashboard/denuncias-eventos/alertas GET]", e);
    return NextResponse.json({ ok: false, message: "Error al calcular alertas" }, { status: 500 });
  }
}
