import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getRequesterIdLenient } from "@/lib/auth-request";

const ADICIONAL_MAX = 2000;
/** Texto libre moderado: sin HTML; permite saltos de línea y puntuación habitual */
const ADICIONAL_REGEX =
  /^[\sA-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ.,;:()"'¿?¡!\-_/@#%&+*=]+$/u;

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const eventId = Number(id);
    if (!eventId || !Number.isFinite(eventId)) {
      return NextResponse.json({ ok: false, message: "ID de evento inválido" }, { status: 400 });
    }

    const userId = await getRequesterIdLenient(req);
    if (!userId) {
      return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
    }

    const existing = await pool.query(
      `SELECT id_denuncia_evento, estado, fecha_creacion
       FROM tabla_denuncia_eventos
       WHERE id_usuario = $1 AND id_evento = $2
       LIMIT 1`,
      [Number(userId), eventId]
    );

    if (!existing.rows?.length) {
      return NextResponse.json({ ok: true, alreadyReported: false, denuncia: null });
    }

    const row = existing.rows[0];
    return NextResponse.json({
      ok: true,
      alreadyReported: true,
      denuncia: {
        id_denuncia_evento: Number(row.id_denuncia_evento),
        estado: String(row.estado),
        fecha_creacion: row.fecha_creacion,
      },
    });
  } catch (e) {
    console.error("[events/[id]/denuncia GET]", e);
    return NextResponse.json({ ok: false, message: "Error al consultar denuncia" }, { status: 500 });
  }
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const client = await pool.connect();
  try {
    const { id } = await context.params;
    const eventId = Number(id);
    if (!eventId || !Number.isFinite(eventId)) {
      return NextResponse.json({ ok: false, message: "ID de evento inválido" }, { status: 400 });
    }

    const userIdRaw = await getRequesterIdLenient(req);
    const userId = userIdRaw ? Number(userIdRaw) : NaN;
    if (!Number.isFinite(userId) || userId <= 0) {
      return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const idMotivoEvento = Number(body?.id_motivo_denuncia_evento);
    const adicionalRaw =
      typeof body?.descripcion_adicional === "string" ? body.descripcion_adicional.trim() : "";
    const descripcionAdicional = adicionalRaw.length > 0 ? adicionalRaw : null;

    if (!Number.isInteger(idMotivoEvento) || idMotivoEvento <= 0) {
      return NextResponse.json(
        { ok: false, message: "Debes elegir un motivo de la lista" },
        { status: 400 }
      );
    }

    if (descripcionAdicional) {
      if (descripcionAdicional.length > ADICIONAL_MAX) {
        return NextResponse.json(
          { ok: false, message: `El texto adicional no puede superar ${ADICIONAL_MAX} caracteres` },
          { status: 400 }
        );
      }
      if (!ADICIONAL_REGEX.test(descripcionAdicional)) {
        return NextResponse.json(
          { ok: false, message: "El texto adicional contiene caracteres no permitidos" },
          { status: 400 }
        );
      }
    }

    const eventRow = await client.query(
      `SELECT id_evento, id_usuario, estado
       FROM tabla_eventos
       WHERE id_evento = $1
       LIMIT 1`,
      [eventId]
    );
    if (!eventRow.rows?.length) {
      return NextResponse.json({ ok: false, message: "Evento no encontrado" }, { status: 404 });
    }

    const ev = eventRow.rows[0];
    if (ev.estado !== true) {
      return NextResponse.json({ ok: false, message: "Este evento no está disponible para denuncias" }, { status: 404 });
    }

    if (Number(ev.id_usuario) === userId) {
      return NextResponse.json(
        { ok: false, message: "No puedes denunciar un evento que tú creaste" },
        { status: 403 }
      );
    }

    const motivoOk = await client.query(
      `SELECT 1 FROM tabla_motivos_denuncia_eventos WHERE id_motivo_denuncia_evento = $1 LIMIT 1`,
      [idMotivoEvento]
    );
    if (!motivoOk.rows?.length) {
      return NextResponse.json({ ok: false, message: "El motivo seleccionado no es válido" }, { status: 400 });
    }

    const insert = await client.query(
      `INSERT INTO tabla_denuncia_eventos (
         id_usuario, id_evento, id_motivo_denuncia_evento,
         descripcion_adicional, estado
       )
       VALUES ($1, $2, $3, $4, 'pendiente')
       RETURNING id_denuncia_evento`,
      [userId, eventId, idMotivoEvento, descripcionAdicional]
    );

    const newId = insert.rows?.[0]?.id_denuncia_evento;
    return NextResponse.json({ ok: true, id_denuncia_evento: Number(newId) });
  } catch (e: unknown) {
    const code = typeof e === "object" && e !== null && "code" in e ? String((e as { code: string }).code) : "";
    if (code === "23505") {
      return NextResponse.json(
        { ok: false, message: "Ya enviaste una denuncia para este evento" },
        { status: 409 }
      );
    }
    console.error("[events/[id]/denuncia POST]", e);
    return NextResponse.json({ ok: false, message: "No se pudo registrar la denuncia" }, { status: 500 });
  } finally {
    client.release();
  }
}
