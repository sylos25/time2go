import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getRequesterIdLenient } from "@/lib/auth-request";

const ESTADOS = new Set(["pendiente", "revisando", "resuelta", "desestimada"]);

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

/**
 * Lista denuncias de eventos para moderación (roles 3 y 4).
 */
export async function GET(req: Request) {
  const auth = await requireModerator(req);
  if ("error" in auth) return auth.error;

  try {
    const url = new URL(req.url);
    const estadoParam = (url.searchParams.get("estado") || "").trim().toLowerCase();
    const page = Math.max(1, Number(url.searchParams.get("page") || 1) || 1);
    const pageSize = Math.min(50, Math.max(5, Number(url.searchParams.get("pageSize") || 20) || 20));
    const offset = (page - 1) * pageSize;

    const filters: string[] = [];
    const params: (string | number)[] = [];
    if (estadoParam && ESTADOS.has(estadoParam)) {
      params.push(estadoParam);
      filters.push(`d.estado = $${params.length}`);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    const countRes = await pool.query(
      `SELECT COUNT(*)::INT AS n FROM tabla_denuncia_eventos d ${where}`,
      params
    );
    const total = Number(countRes.rows[0]?.n || 0);

    params.push(pageSize, offset);
    const listRes = await pool.query(
      `SELECT
        d.id_denuncia_evento,
        d.id_usuario,
        d.id_evento,
        d.estado,
        d.descripcion_adicional,
        d.fecha_creacion,
        d.fecha_resolucion,
        d.revisada_por,
        e.nombre_evento,
        e.id_publico_evento,
        m.nombre_motivo,
        m.id_motivo_denuncia_evento,
        c.nombre_categoria_denuncia,
        ru.nombres AS report_nombres,
        ru.apellidos AS report_apellidos
      FROM tabla_denuncia_eventos d
      INNER JOIN tabla_eventos e ON e.id_evento = d.id_evento
      INNER JOIN tabla_motivos_denuncia_eventos m ON m.id_motivo_denuncia_evento = d.id_motivo_denuncia_evento
      INNER JOIN tabla_categoria_denuncia_evento c ON c.id_categoria_denuncia = m.id_categoria_denuncia
      INNER JOIN tabla_usuarios ru ON ru.id_usuario = d.id_usuario
      ${where}
      ORDER BY d.fecha_creacion DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return NextResponse.json({
      ok: true,
      denuncias: listRes.rows || [],
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (e) {
    console.error("[dashboard/denuncias-eventos GET]", e);
    return NextResponse.json({ ok: false, message: "Error al listar denuncias" }, { status: 500 });
  }
}
