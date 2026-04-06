import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getRequesterIdLenient } from "@/lib/auth-request";
import { getReservaDetalleForUser } from "@/lib/reserva-detalle-server";
import type { ReservaDetalleApiResponse } from "@/types/reservas";

async function getAuthenticatedUserId(req: Request) {
  return await getRequesterIdLenient(req);
}

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const reservaId = Number(id);
    if (!reservaId) {
      return NextResponse.json({ ok: false, message: "Reserva inválida" }, { status: 400 });
    }

    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
    }

    const reserva = await getReservaDetalleForUser(userId, reservaId);
    if (!reserva) {
      return NextResponse.json({ ok: false, message: "Reserva no encontrada" }, { status: 404 });
    }

    const response: ReservaDetalleApiResponse = { ok: true, reserva };
    return NextResponse.json(response);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "Error obteniendo reserva" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const client = await pool.connect();
  try {
    const { id } = await context.params;
    const reservaId = Number(id);
    if (!reservaId) {
      return NextResponse.json({ ok: false, message: "Reserva inválida" }, { status: 400 });
    }

    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
    }

    const reservationRes = await client.query(
      `SELECT r.id_reserva_evento,
              r.id_usuario,
              r.id_evento,
              r.estado,
              (e.fecha_inicio::timestamp + e.hora_inicio) AS fecha_hora_inicio_evento
       FROM tabla_reserva_eventos r
       INNER JOIN tabla_eventos e ON r.id_evento = e.id_evento
       WHERE r.id_reserva_evento = $1 AND r.id_usuario = $2
       LIMIT 1`,
      [reservaId, userId]
    );

    if (!reservationRes.rows || reservationRes.rows.length === 0) {
      return NextResponse.json({ ok: false, message: "Reserva no encontrada" }, { status: 404 });
    }

    const reservation = reservationRes.rows[0];

    if (reservation.estado === false) {
      return NextResponse.json({ ok: false, message: "La reserva ya está cancelada" }, { status: 409 });
    }

    const limitRes = await client.query(
      `SELECT ((e.fecha_inicio::timestamp + e.hora_inicio) - INTERVAL '12 hours') AS fecha_limite_cancelacion
       FROM tabla_eventos e
       WHERE e.id_evento = $1
       LIMIT 1`,
      [reservation.id_evento]
    );

    const fechaLimiteCancelacion = limitRes.rows?.[0]?.fecha_limite_cancelacion;
    if (!fechaLimiteCancelacion) {
      return NextResponse.json({ ok: false, message: "No se pudo validar la fecha del evento" }, { status: 500 });
    }

    const canCancelRes = await client.query(
      `SELECT (CURRENT_TIMESTAMP <= $1::timestamp) AS puede_cancelar`,
      [fechaLimiteCancelacion]
    );

    const puedeCancelar = canCancelRes.rows?.[0]?.puede_cancelar === true;
    if (!puedeCancelar) {
      return NextResponse.json(
        { ok: false, message: "Solo puedes cancelar la reserva hasta 12 horas antes del inicio del evento" },
        { status: 400 }
      );
    }

    const updateRes = await client.query(
      `UPDATE tabla_reserva_eventos
       SET estado = FALSE,
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id_reserva_evento = $1 AND id_usuario = $2
       RETURNING id_reserva_evento, estado, fecha_actualizacion`,
      [reservaId, userId]
    );

    if (!updateRes.rows || updateRes.rows.length === 0) {
      return NextResponse.json({ ok: false, message: "No se pudo cancelar la reserva" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: "Reserva cancelada correctamente",
      reserva: updateRes.rows[0],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "Error cancelando reserva" }, { status: 500 });
  } finally {
    client.release();
  }
}
