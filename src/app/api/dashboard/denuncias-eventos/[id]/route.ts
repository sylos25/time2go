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
  return { userId: Number(uid) };
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireModerator(req);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await context.params;
    const idDenuncia = Number(id);
    if (!idDenuncia || !Number.isFinite(idDenuncia)) {
      return NextResponse.json({ ok: false, message: "ID inválido" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const estado = String(body?.estado || "").trim().toLowerCase();
    if (!ESTADOS.has(estado)) {
      return NextResponse.json({ ok: false, message: "Estado no válido" }, { status: 400 });
    }

    const fechaResolucion =
      estado === "resuelta" || estado === "desestimada" ? new Date().toISOString() : null;

    const res = await pool.query(
      `UPDATE tabla_denuncia_eventos
       SET
         estado = $1,
         revisada_por = $2,
         fecha_resolucion = $3,
         fecha_actualizacion = NOW()
       WHERE id_denuncia_evento = $4
       RETURNING id_denuncia_evento, estado, revisada_por, fecha_resolucion`,
      [estado, auth.userId, fechaResolucion, idDenuncia]
    );

    if (!res.rows?.length) {
      return NextResponse.json({ ok: false, message: "Denuncia no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, denuncia: res.rows[0] });
  } catch (e) {
    console.error("[dashboard/denuncias-eventos/[id] PATCH]", e);
    return NextResponse.json({ ok: false, message: "Error al actualizar" }, { status: 500 });
  }
}
