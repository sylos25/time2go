import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getRequesterIdLenient } from "@/lib/auth-request";
import type { ReservaListadoApiResponse, ReservaListadoItem } from "@/types/reservas";

const TIPOS_DOCUMENTO_VALIDOS = [
  "Cédula de Ciudadanía",
  "Cédula de Extranjería",
  "Pasaporte",
] as const;

type TipoDocumento = (typeof TIPOS_DOCUMENTO_VALIDOS)[number];
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

const mapReservaListadoItem = (row: SqlRow): ReservaListadoItem => {
  return {
    id_reserva_evento: asNumber(row.id_reserva_evento),
    id_usuario: asNumber(row.id_usuario),
    id_evento: asNumber(row.id_evento),
    tipo_documento: asString(row.tipo_documento),
    numero_documento: asString(row.numero_documento),
    cuantos_asistiran: asNumber(row.cuantos_asistiran),
    quienes_asistiran: asString(row.quienes_asistiran),
    fecha_reserva: asDateString(row.fecha_reserva),
    estado: asBoolean(row.estado),
    nombre_evento: asString(row.nombre_evento),
    fecha_inicio: asDateString(row.fecha_inicio),
    fecha_fin: asDateString(row.fecha_fin),
    hora_inicio: asString(row.hora_inicio),
    hora_final: asString(row.hora_final),
    gratis_pago: asBoolean(row.gratis_pago),
    id_publico_evento: asString(row.id_publico_evento),
    nombre_sitio: asString(row.nombre_sitio),
    sitio_direccion: asString(row.sitio_direccion),
    nombre_municipio: asString(row.nombre_municipio),
    url_imagen_evento: asString(row.url_imagen_evento),
    nombres: asString(row.nombres),
    apellidos: asString(row.apellidos),
    correo: asString(row.correo),
  };
};

async function getAuthenticatedUser(req: Request) {
  const userId = await getRequesterIdLenient(req);
  if (!userId) return null;

  const userRes = await pool.query(
    `SELECT
       u.id_usuario,
       u.id_rol,
      u.tipo_documento,
      u.numero_documento,
       u.nombres,
       u.apellidos,
       u.telefono_persona AS telefono,
       c.correo_usuario AS correo
     FROM tabla_usuarios u
     LEFT JOIN tabla_usuarios_credenciales c ON c.id_usuario = u.id_usuario
     WHERE u.id_usuario = $1
     LIMIT 1`,
    [userId]
  );

  if (!userRes.rows || userRes.rows.length === 0) return null;
  return userRes.rows[0];
}

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
    }

    const url = new URL(req.url);
    const eventIdParam = (url.searchParams.get("eventId") || "").trim();
    const eventId = eventIdParam ? Number(eventIdParam) : 0;

    if (eventIdParam) {
      if (!Number.isFinite(eventId) || eventId <= 0) {
        return NextResponse.json({ ok: false, message: "Evento inválido" }, { status: 400 });
      }

      const ownership = await pool.query(
        "SELECT id_evento FROM tabla_eventos WHERE id_evento = $1 AND id_usuario = $2 LIMIT 1",
        [eventId, user.id_usuario]
      );

      if (!ownership.rows || ownership.rows.length === 0) {
        return NextResponse.json({ ok: false, message: "No autorizado para ver reservas de este evento" }, { status: 403 });
      }

      const eventReservations = await pool.query(
        `SELECT r.id_reserva_evento,
                r.id_usuario,
                r.id_evento,
                u.tipo_documento,
                u.numero_documento,
                COALESCE(asistentes.cuantos_asistiran, 0) AS cuantos_asistiran,
                COALESCE(asistentes.quienes_asistiran, '') AS quienes_asistiran,
                r.fecha_reserva,
                r.estado,
                u.nombres,
                u.apellidos,
                c.correo_usuario AS correo
         FROM tabla_reserva_eventos r
         LEFT JOIN LATERAL (
           SELECT COUNT(1)::INT AS cuantos_asistiran,
                  STRING_AGG(TRIM(CONCAT_WS(' ', ra.nombres, ra.apellidos)), ', ' ORDER BY ra.id_reserva_asistente) AS quienes_asistiran
           FROM tabla_reserva_asistentes ra
           WHERE ra.id_reserva_evento = r.id_reserva_evento
         ) asistentes ON TRUE
         INNER JOIN tabla_usuarios u ON r.id_usuario = u.id_usuario
         LEFT JOIN tabla_usuarios_credenciales c ON c.id_usuario = u.id_usuario
         WHERE r.id_evento = $1
           AND r.estado = TRUE
         ORDER BY r.fecha_reserva DESC`,
        [eventId]
      );

      const response: ReservaListadoApiResponse = {
        ok: true,
        reservas: (eventReservations.rows || []).map((row) => mapReservaListadoItem(row as SqlRow)),
      };

      return NextResponse.json(response);
    }

    const result = await pool.query(
      `SELECT r.id_reserva_evento,
              r.id_evento,
              u.tipo_documento,
              u.numero_documento,
              COALESCE(asistentes.cuantos_asistiran, 0) AS cuantos_asistiran,
              COALESCE(asistentes.quienes_asistiran, '') AS quienes_asistiran,
              r.fecha_reserva,
              r.estado,
              e.nombre_evento,
              e.fecha_inicio,
              e.fecha_fin,
              e.hora_inicio,
              e.hora_final,
              e.gratis_pago,
              e.id_publico_evento,
              s.nombre_sitio,
              s.direccion AS sitio_direccion,
              m.nombre_municipio,
              img.url_imagen_evento
       FROM tabla_reserva_eventos r
            INNER JOIN tabla_usuarios u ON r.id_usuario = u.id_usuario
       INNER JOIN tabla_eventos e ON r.id_evento = e.id_evento
            LEFT JOIN LATERAL (
              SELECT COUNT(1)::INT AS cuantos_asistiran,
                STRING_AGG(TRIM(CONCAT_WS(' ', ra.nombres, ra.apellidos)), ', ' ORDER BY ra.id_reserva_asistente) AS quienes_asistiran
              FROM tabla_reserva_asistentes ra
              WHERE ra.id_reserva_evento = r.id_reserva_evento
            ) asistentes ON TRUE
       LEFT JOIN tabla_sitios s ON e.id_sitio = s.id_sitio
       LEFT JOIN tabla_municipios m ON s.id_municipio = m.id_municipio
       LEFT JOIN LATERAL (
         SELECT i.url_imagen_evento
         FROM tabla_imagenes_eventos i
         WHERE i.id_evento = e.id_evento
         ORDER BY i.principal DESC, i.id_imagen_evento ASC
         LIMIT 1
       ) img ON TRUE
       WHERE r.id_usuario = $1
         AND r.estado = TRUE
         AND e.estado = TRUE
       ORDER BY r.fecha_reserva DESC`,
      [user.id_usuario]
    );

    const response: ReservaListadoApiResponse = {
      ok: true,
      reservas: (result.rows || []).map((row) => mapReservaListadoItem(row as SqlRow)),
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "Error obteniendo reservas" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const client = await pool.connect();
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
    }

    if (Number(user.id_rol) !== 1) {
      return NextResponse.json(
        { ok: false, message: "Solo los usuarios con rol Usuario pueden realizar reservas" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const id_evento = Number(body?.id_evento || 0);
    const titularRaw = body?.titular || {};
    const tipo_documento = String(titularRaw?.tipo_documento || "") as TipoDocumento;
    const numero_documento = String(titularRaw?.numero_documento || "").trim();
    const titular_nombres = String(titularRaw?.nombres || "").trim();
    const titular_apellidos = String(titularRaw?.apellidos || "").trim();
    const titular_telefono = String(titularRaw?.telefono || "").trim();
    const asistentesRaw = Array.isArray(body?.asistentes) ? body.asistentes : [];

    const asistentes = asistentesRaw
      .map((item: any) => ({
        tipo_documento: String(item?.tipo_documento || "").trim() as TipoDocumento,
        numero_documento: String(item?.numero_documento || "").trim(),
        nombres: String(item?.nombres || "").trim(),
        apellidos: String(item?.apellidos || "").trim(),
        telefono: String(item?.telefono || "").trim(),
        correo: String(item?.correo || "").trim().toLowerCase(),
      }))
      .filter((item: any) => item.tipo_documento || item.numero_documento || item.nombres || item.apellidos || item.telefono || item.correo);

    const totalInvitados = asistentes.length;

    const tipo_documento_final =
      (String(user?.tipo_documento || "").trim() as TipoDocumento) || tipo_documento;
    const numero_documento_final = String(user?.numero_documento || "").trim() || numero_documento;
    const titular_nombres_final = String(user?.nombres || "").trim() || titular_nombres;
    const titular_apellidos_final = String(user?.apellidos || "").trim() || titular_apellidos;
    const titular_telefono_final = String(user?.telefono || "").trim() || titular_telefono;

    if (!id_evento) {
      return NextResponse.json({ ok: false, message: "Evento inválido" }, { status: 400 });
    }

    if (!TIPOS_DOCUMENTO_VALIDOS.includes(tipo_documento_final)) {
      return NextResponse.json({ ok: false, message: "Tipo de documento inválido" }, { status: 400 });
    }

    if (!numero_documento_final) {
      return NextResponse.json({ ok: false, message: "Número de documento requerido" }, { status: 400 });
    }

    if (!titular_nombres_final || titular_nombres_final.length < 3) {
      return NextResponse.json({ ok: false, message: "Nombre del titular inválido" }, { status: 400 });
    }

    if (!titular_apellidos_final || titular_apellidos_final.length < 3) {
      return NextResponse.json({ ok: false, message: "Apellido del titular inválido" }, { status: 400 });
    }

    if (!titular_telefono_final || titular_telefono_final.length < 10) {
      return NextResponse.json({ ok: false, message: "Teléfono del titular inválido" }, { status: 400 });
    }

    if (!Number.isFinite(totalInvitados) || totalInvitados < 0 || totalInvitados > 3) {
      return NextResponse.json({ ok: false, message: "Solo se permite hasta 3 acompañantes por reserva" }, { status: 400 });
    }

    for (const asistente of asistentes) {
      if (!TIPOS_DOCUMENTO_VALIDOS.includes(asistente.tipo_documento)) {
        return NextResponse.json({ ok: false, message: "Tipo de documento de asistente inválido" }, { status: 400 });
      }
      if (!asistente.numero_documento) {
        return NextResponse.json({ ok: false, message: "Número de documento de acompañante requerido" }, { status: 400 });
      }
      if (!asistente.nombres || asistente.nombres.length < 3) {
        return NextResponse.json({ ok: false, message: "El nombre del acompañante debe tener mínimo 3 caracteres" }, { status: 400 });
      }
      if (!asistente.apellidos || asistente.apellidos.length < 3) {
        return NextResponse.json({ ok: false, message: "El apellido del acompañante debe tener mínimo 3 caracteres" }, { status: 400 });
      }
      if (!asistente.telefono || asistente.telefono.length < 10) {
        return NextResponse.json({ ok: false, message: "El teléfono del acompañante es inválido" }, { status: 400 });
      }
      if (!asistente.correo || !/\S+@\S+\.\S+/.test(asistente.correo)) {
        return NextResponse.json({ ok: false, message: "El correo del acompañante es inválido" }, { status: 400 });
      }
    }

    await client.query("BEGIN");

    const eventExists = await client.query(
      "SELECT id_evento FROM tabla_eventos WHERE id_evento = $1 AND estado = TRUE LIMIT 1",
      [id_evento]
    );

    if (!eventExists.rows || eventExists.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ ok: false, message: "El evento no existe o no está disponible" }, { status: 404 });
    }

    await client.query(
      `UPDATE tabla_usuarios
       SET tipo_documento = CASE WHEN tipo_documento IS NULL THEN $2::tip_doc ELSE tipo_documento END,
           numero_documento = CASE WHEN numero_documento IS NULL OR BTRIM(numero_documento) = '' THEN $3 ELSE numero_documento END,
           nombres = CASE WHEN nombres IS NULL OR BTRIM(nombres) = '' THEN $4 ELSE nombres END,
           apellidos = CASE WHEN apellidos IS NULL OR BTRIM(apellidos) = '' THEN $5 ELSE apellidos END,
           telefono_persona = CASE WHEN telefono_persona IS NULL THEN $6::DECIMAL(10,0) ELSE telefono_persona END,
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id_usuario = $1`,
      [
        user.id_usuario,
        tipo_documento_final,
        numero_documento_final,
        titular_nombres_final,
        titular_apellidos_final,
        titular_telefono_final,
      ]
    );

    const insertRes = await client.query(
      `INSERT INTO tabla_reserva_eventos (
        id_usuario,
        id_evento
      ) VALUES ($1,$2)
      ON CONFLICT (id_usuario, id_evento)
      DO UPDATE SET
        estado = TRUE,
        fecha_reserva = CURRENT_TIMESTAMP,
        fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE tabla_reserva_eventos.estado = FALSE
      RETURNING id_reserva_evento, fecha_reserva, estado`,
      [
        user.id_usuario,
        id_evento,
      ]
    );

    if (!insertRes.rows || insertRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ ok: false, message: "Ya tienes una reserva para este evento" }, { status: 409 });
    }

    const idReservaEvento = insertRes.rows[0].id_reserva_evento;

    await client.query(
      `DELETE FROM tabla_reserva_asistentes
       WHERE id_reserva_evento = $1`,
      [idReservaEvento]
    );

    for (const asistente of asistentes) {
      await client.query(
        `INSERT INTO tabla_reserva_asistentes (
          id_reserva_evento,
          tipo_documento,
          numero_documento,
          nombres,
          apellidos,
          telefono,
          correo
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          idReservaEvento,
          asistente.tipo_documento,
          asistente.numero_documento,
          asistente.nombres,
          asistente.apellidos,
          asistente.telefono,
          asistente.correo,
        ]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json({
      ok: true,
      reserva: {
        id_reserva_evento: insertRes.rows[0].id_reserva_evento,
        id_evento,
        fecha_reserva: insertRes.rows[0].fecha_reserva,
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return NextResponse.json({ ok: false, message: "Error creando reserva" }, { status: 500 });
  } finally {
    client.release();
  }
}
