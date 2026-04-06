import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getRequesterIdLenient } from "@/lib/auth-request";
import type { ReservaAsistente, ReservaDetalle, ReservaDetalleApiResponse } from "@/types/reservas";

async function getAuthenticatedUserId(req: Request) {
  return await getRequesterIdLenient(req);
}

type SqlRow = Record<string, unknown>;

const asString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const asDateString = (value: unknown): string | null => {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value.toISOString();
  }
  return asString(value);
};

const asNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const asBoolean = (value: unknown): boolean | null => {
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "1") return true;
  if (value === 0 || value === "0") return false;
  return null;
};

const mapAsistente = (row: SqlRow): ReservaAsistente => {
  return {
    id_reserva_asistente: asNumber(row.id_reserva_asistente),
    nombre_asistente: asString(row.nombre_asistente),
    tipo_documento: asString(row.tipo_documento),
    numero_documento: asString(row.numero_documento),
    nombres: asString(row.nombres),
    apellidos: asString(row.apellidos),
    telefono: asString(row.telefono),
    correo: asString(row.correo),
  };
};

const mapReservaDetalle = (row: SqlRow, asistentes: ReservaAsistente[]): ReservaDetalle => {
  return {
    id_reserva_evento: asNumber(row.id_reserva_evento),
    nombre_evento: asString(row.nombre_evento),
    url_imagen_evento: asString(row.url_imagen_evento),
    categoria_nombre: asString(row.categoria_nombre),
    tipo_nombre: asString(row.tipo_nombre),
    pulep_evento: asString(row.pulep_evento),
    nombre_sitio: asString(row.nombre_sitio),
    sitio_direccion: asString(row.sitio_direccion),
    nombre_municipio: asString(row.nombre_municipio),
    cupo: asNumber(row.cupo),
    responsable_evento: asString(row.responsable_evento),
    creador_nombres: asString(row.creador_nombres),
    creador_apellidos: asString(row.creador_apellidos),
    telefono_1: asString(row.telefono_1),
    telefono_2: asString(row.telefono_2),
    gratis_pago: asBoolean(row.gratis_pago),
    cuantos_asistiran: asNumber(row.cuantos_asistiran),
    fecha_inicio: asDateString(row.fecha_inicio),
    fecha_fin: asDateString(row.fecha_fin),
    hora_inicio: asString(row.hora_inicio),
    hora_final: asString(row.hora_final),
    tipo_documento: asString(row.tipo_documento),
    numero_documento: asString(row.numero_documento),
    nombres: asString(row.nombres),
    apellidos: asString(row.apellidos),
    telefono_titular: asString(row.telefono_titular),
    correo_titular: asString(row.correo_titular),
    quienes_asistiran: asString(row.quienes_asistiran),
    asistentes,
  };
};

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
              u.tipo_documento,
              u.numero_documento,
              u.nombres,
              u.apellidos,
              u.telefono_persona AS telefono_titular,
              c.correo_usuario AS correo_titular,
              COALESCE(asistentes.cuantos_asistiran, 0) AS cuantos_asistiran,
              COALESCE(asistentes.quienes_asistiran, '') AS quienes_asistiran,
              r.fecha_reserva,
              r.estado,
              r.fecha_actualizacion,
              e.nombre_evento,
              e.id_publico_evento,
              e.pulep_evento,
              e.responsable_evento,
              e.cupo,
              e.fecha_inicio,
              e.fecha_fin,
              e.hora_inicio,
              e.hora_final,
              e.gratis_pago,
              s.nombre_sitio,
              s.direccion AS sitio_direccion,
              m.nombre_municipio,
              ce.nombre AS categoria_nombre,
              te.nombre_tipo_evento AS tipo_nombre,
              tel_evento_principal.telefono AS telefono_1,
              tel_evento_secundario.telefono AS telefono_2,
              uc.nombres AS creador_nombres,
              uc.apellidos AS creador_apellidos,
              img.url_imagen_evento
       FROM tabla_reserva_eventos r
            INNER JOIN tabla_usuarios u ON r.id_usuario = u.id_usuario
        LEFT JOIN tabla_usuarios_credenciales c ON c.id_usuario = u.id_usuario
       INNER JOIN tabla_eventos e ON r.id_evento = e.id_evento
       LEFT JOIN tabla_categoria_eventos ce ON e.id_categoria_evento = ce.id_categoria_evento
       LEFT JOIN tabla_tipo_eventos te ON e.id_tipo_evento = te.id_tipo_evento
            LEFT JOIN LATERAL (
              SELECT COUNT(1)::INT AS cuantos_asistiran,
                STRING_AGG(TRIM(CONCAT_WS(' ', ra.nombres, ra.apellidos)), ', ' ORDER BY ra.id_reserva_asistente) AS quienes_asistiran
              FROM tabla_reserva_asistentes ra
              WHERE ra.id_reserva_evento = r.id_reserva_evento
            ) asistentes ON TRUE
       LEFT JOIN LATERAL (
         SELECT telefono
         FROM tabla_eventos_telefonos
         WHERE id_evento = e.id_evento AND es_principal = TRUE
         ORDER BY fecha_creacion ASC
         LIMIT 1
       ) tel_evento_principal ON TRUE
       LEFT JOIN LATERAL (
         SELECT telefono
         FROM tabla_eventos_telefonos
         WHERE id_evento = e.id_evento AND es_principal = FALSE
         ORDER BY fecha_creacion ASC
         LIMIT 1
       ) tel_evento_secundario ON TRUE
       LEFT JOIN tabla_sitios s ON e.id_sitio = s.id_sitio
       LEFT JOIN tabla_municipios m ON s.id_municipio = m.id_municipio
       LEFT JOIN tabla_usuarios uc ON uc.id_usuario = e.id_usuario
       LEFT JOIN LATERAL (
         SELECT i.url_imagen_evento
         FROM tabla_imagenes_eventos i
         WHERE i.id_evento = e.id_evento
         ORDER BY i.principal DESC, i.id_imagen_evento ASC
         LIMIT 1
       ) img ON TRUE
       WHERE r.id_reserva_evento = $1 AND r.id_usuario = $2
       LIMIT 1`,
      [reservaId, userId]
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ ok: false, message: "Reserva no encontrada" }, { status: 404 });
    }

    const reservaRow = result.rows[0] as SqlRow;

    const asistentesRes = await pool.query(
      `SELECT id_reserva_asistente,
              TRIM(CONCAT_WS(' ', nombres, apellidos)) AS nombre_asistente,
              tipo_documento,
              numero_documento,
              nombres,
              apellidos,
              telefono,
              correo
       FROM tabla_reserva_asistentes
       WHERE id_reserva_evento = $1
       ORDER BY id_reserva_asistente ASC`,
      [reservaId]
    );

    const asistentes = (asistentesRes.rows || []).map((row) => mapAsistente(row as SqlRow));
    const reserva = mapReservaDetalle(reservaRow, asistentes);

    const response: ReservaDetalleApiResponse = {
      ok: true,
      reserva,
    };

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
