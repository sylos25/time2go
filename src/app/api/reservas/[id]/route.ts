import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { parseCookies } from "@/lib/cookies";

async function getAuthenticatedUserId(req: Request) {
  const authHeader = (req.headers.get("authorization") || "").trim();
  let userId: string | null = null;

  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    const payload = verifyToken(token);
    const fromToken = payload?.id_usuario;
    if (payload && fromToken) userId = String(fromToken);
  }

  if (!userId) {
    const cookies = parseCookies(req.headers.get("cookie"));
    const token = cookies["token"];
    if (token) {
      const payload = verifyToken(token);
      const fromToken = payload?.id_usuario;
      if (payload && fromToken) userId = String(fromToken);
    }
  }

  return userId;
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

    const result = await pool.query(
      `SELECT r.id_reserva_evento,
              r.id_usuario,
              r.id_evento,
              r.tipo_documento,
              r.numero_documento,
              r.cuantos_asistiran,
              r.quienes_asistiran,
              r.fecha_reserva,
              r.estado,
              r.fecha_actualizacion,
              e.nombre_evento,
              e.id_publico_evento,
              e.fecha_inicio,
              e.fecha_fin,
              e.hora_inicio,
              e.hora_final,
              e.gratis_pago,
              s.nombre_sitio,
              m.nombre_municipio,
              img.url_imagen_evento
       FROM tabla_reserva_eventos r
       INNER JOIN tabla_eventos e ON r.id_evento = e.id_evento
       LEFT JOIN tabla_sitios s ON e.id_sitio = s.id_sitio
       LEFT JOIN tabla_municipios m ON s.id_municipio = m.id_municipio
       LEFT JOIN LATERAL (
         SELECT i.url_imagen_evento
         FROM tabla_imagenes_eventos i
         WHERE i.id_evento = e.id_evento
         ORDER BY i.id_imagen_evento ASC
         LIMIT 1
       ) img ON TRUE
       WHERE r.id_reserva_evento = $1 AND r.id_usuario = $2
       LIMIT 1`,
      [reservaId, userId]
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ ok: false, message: "Reserva no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, reserva: result.rows[0] });
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
