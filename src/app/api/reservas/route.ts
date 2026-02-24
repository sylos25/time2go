import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { parseCookies } from "@/lib/cookies";

const TIPOS_DOCUMENTO_VALIDOS = [
  "Cédula de Ciudadanía",
  "Cédula de Extranjería",
  "Pasaporte",
] as const;

type TipoDocumento = (typeof TIPOS_DOCUMENTO_VALIDOS)[number];

async function getAuthenticatedUser(req: Request) {
  const authHeader = (req.headers.get("authorization") || "").trim();
  let userId: string | null = null;

  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    const payload = verifyToken(token);
    const userIdFromToken = payload?.id_usuario || payload?.numero_documento;
    if (payload && userIdFromToken) {
      userId = String(userIdFromToken);
    }
  }

  if (!userId) {
    const cookieHeader = req.headers.get("cookie");
    const cookies = parseCookies(cookieHeader);
    const token = cookies["token"];
    if (token) {
      const payload = verifyToken(token);
      const userIdFromToken = payload?.id_usuario || payload?.numero_documento;
      if (payload && userIdFromToken) {
        userId = String(userIdFromToken);
      }
    }
  }

  if (!userId) return null;

  const userRes = await pool.query(
    "SELECT id_usuario, id_rol, nombres, apellidos FROM tabla_usuarios WHERE id_usuario = $1 LIMIT 1",
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
                r.tipo_documento,
                r.numero_documento,
                r.cuantos_asistiran,
                r.quienes_asistiran,
                r.fecha_reserva,
                r.estado,
                u.nombres,
                u.apellidos,
                u.correo
         FROM tabla_reserva_eventos r
         INNER JOIN tabla_usuarios u ON r.id_usuario = u.id_usuario
         WHERE r.id_evento = $1
         ORDER BY r.fecha_reserva DESC`,
        [eventId]
      );

      return NextResponse.json({ ok: true, reservas: eventReservations.rows });
    }

    const result = await pool.query(
      `SELECT r.id_reserva_evento,
              r.id_evento,
              r.tipo_documento,
              r.numero_documento,
              r.cuantos_asistiran,
              r.quienes_asistiran,
              r.fecha_reserva,
              r.estado,
              e.nombre_evento,
              e.fecha_inicio,
              e.hora_inicio,
              e.hora_final,
              e.gratis_pago,
              e.id_publico_evento,
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
       WHERE r.id_usuario = $1
         AND e.estado = TRUE
       ORDER BY r.fecha_reserva DESC`,
      [user.id_usuario]
    );

    return NextResponse.json({ ok: true, reservas: result.rows });
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
    const tipo_documento = String(body?.tipo_documento || "") as TipoDocumento;
    const numero_documento = String(body?.numero_documento || "").trim();
    const cuantos_asistiran = Number(body?.cuantos_asistiran || 0);
    const quienes_asistiran = String(body?.quienes_asistiran || "").trim();

    if (!id_evento) {
      return NextResponse.json({ ok: false, message: "Evento inválido" }, { status: 400 });
    }

    if (!TIPOS_DOCUMENTO_VALIDOS.includes(tipo_documento)) {
      return NextResponse.json({ ok: false, message: "Tipo de documento inválido" }, { status: 400 });
    }

    if (!numero_documento) {
      return NextResponse.json({ ok: false, message: "Número de documento requerido" }, { status: 400 });
    }

    if (!Number.isFinite(cuantos_asistiran) || cuantos_asistiran < 1 || cuantos_asistiran > 4) {
      return NextResponse.json({ ok: false, message: "La cantidad de asistentes debe estar entre 1 y 4" }, { status: 400 });
    }

    if (!quienes_asistiran || quienes_asistiran.length < 3) {
      return NextResponse.json(
        { ok: false, message: "Debes indicar quiénes asistirán (mínimo 3 caracteres)" },
        { status: 400 }
      );
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

    const insertRes = await client.query(
      `INSERT INTO tabla_reserva_eventos (
        id_usuario,
        id_evento,
        tipo_documento,
        numero_documento,
        cuantos_asistiran,
        quienes_asistiran
      ) VALUES ($1,$2,$3,$4,$5,$6)
      ON CONFLICT (id_usuario, id_evento) DO NOTHING
      RETURNING id_reserva_evento, fecha_reserva`,
      [user.id_usuario, id_evento, tipo_documento, numero_documento, cuantos_asistiran, quienes_asistiran]
    );

    if (!insertRes.rows || insertRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ ok: false, message: "Ya tienes una reserva para este evento" }, { status: 409 });
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
