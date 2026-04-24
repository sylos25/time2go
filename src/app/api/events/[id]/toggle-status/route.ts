import { NextResponse } from "next/server";
import type { PoolClient } from "pg";
import pool from "@/lib/db";
import { getRequesterIdLenient } from "@/lib/auth-request";
import { sendEventApprovedEmail } from "@/lib/email";

function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000"
  );
}

async function getAuthenticatedUser(req: Request, client: PoolClient) {
  const userId = await getRequesterIdLenient(req);
  if (!userId) return null;

  const roleRes = await client.query(
    "SELECT id_usuario, id_rol FROM tabla_usuarios WHERE id_usuario = $1 LIMIT 1",
    [userId]
  );
  if (!roleRes.rows || roleRes.rows.length === 0) return null;

  return {
    id_usuario: String(roleRes.rows[0].id_usuario),
    id_rol: Number(roleRes.rows[0].id_rol),
  };
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const eventId = Number(id);
  const client = await pool.connect();
  try {
    if (!eventId) {
      return NextResponse.json({ ok: false, message: "Invalid event ID" }, { status: 400 });
    }

    const user = await getAuthenticatedUser(req, client);
    if (!user) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    if (user.id_rol !== 4) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    const eventCheck = await client.query(
      "SELECT estado, destacado, id_usuario, nombre_evento FROM tabla_eventos WHERE id_evento = $1",
      [eventId]
    );
    if (!eventCheck.rows || eventCheck.rows.length === 0) {
      return NextResponse.json({ ok: false, message: "Event not found" }, { status: 404 });
    }

    const body = await req.json();
    const hasDestacado = typeof body.destacado !== "undefined";

    if (hasDestacado) {
      const requestedDestacado = body.destacado === true || body.destacado === "true";

      if (requestedDestacado && eventCheck.rows[0].estado !== true) {
        return NextResponse.json(
          { ok: false, message: "Solo puedes destacar eventos aprobados" },
          { status: 400 }
        );
      }

      const highlightedResult = await client.query(
        `UPDATE tabla_eventos
         SET destacado = $1,
             destacado_por_usuario = CASE WHEN $1::boolean THEN $2::int ELSE NULL::int END,
             fecha_destacado = CASE WHEN $1 THEN CURRENT_TIMESTAMP ELSE NULL END,
             fecha_actualizacion = CURRENT_TIMESTAMP
         WHERE id_evento = $3
         RETURNING id_evento, nombre_evento, destacado, destacado_por_usuario AS destacado_por, fecha_destacado`,
        [requestedDestacado, Number(user.id_usuario), eventId]
      );

      if (!highlightedResult.rows || highlightedResult.rows.length === 0) {
        return NextResponse.json({ ok: false, message: "Event not found" }, { status: 404 });
      }

      return NextResponse.json({
        ok: true,
        message: requestedDestacado
          ? "Evento destacado correctamente"
          : "Evento removido de destacados",
        event: highlightedResult.rows[0],
      });
    }

    const requestedStatus = body.estado === true || body.estado === "true";

    if (requestedStatus && eventCheck.rows[0].estado === true) {
      return NextResponse.json({ ok: true, message: "El evento ya está aprobado" });
    }

    if (!requestedStatus && eventCheck.rows[0].estado === false) {
      return NextResponse.json({ ok: true, message: "El evento ya está rechazado" });
    }

    const rejectionReason = String(body?.motivo_rechazo || "").trim();
    const rejectedBy = Number(body?.rechazado_por || user.id_usuario);

    if (!requestedStatus && rejectionReason.length > 0 && rejectionReason.length < 10) {
      return NextResponse.json({ ok: false, message: "El motivo de rechazo debe tener mínimo 10 caracteres" }, { status: 400 });
    }

    // Update event status (approve or reject)
    const result = await client.query(
      `UPDATE tabla_eventos
       SET estado = $1,
           motivo_rechazo = CASE WHEN $1::boolean THEN NULL ELSE NULLIF($2::text, '') END,
           rechazo_por = CASE WHEN $1::boolean THEN NULL ELSE $3::int END,
           destacado = CASE WHEN $1::boolean THEN destacado ELSE FALSE END,
           destacado_por_usuario = CASE WHEN $1::boolean THEN destacado_por_usuario ELSE NULL END,
           fecha_destacado = CASE WHEN $1::boolean THEN fecha_destacado ELSE NULL END,
           fecha_desactivacion = CASE WHEN $1::boolean THEN NULL ELSE CURRENT_TIMESTAMP END,
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id_evento = $4
       RETURNING id_evento, nombre_evento, estado, motivo_rechazo, rechazo_por`,
      [requestedStatus, rejectionReason, rejectedBy, eventId]
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ ok: false, message: "Event not found" }, { status: 404 });
    }

    if (requestedStatus && eventCheck.rows[0].estado !== true) {
      const orgId = Number(eventCheck.rows[0].id_usuario);
      if (Number.isFinite(orgId) && orgId > 0) {
        const mailRes = await client.query(
          "SELECT correo_usuario AS correo FROM tabla_usuarios_credenciales WHERE id_usuario = $1 LIMIT 1",
          [orgId]
        );
        const correoOrg = mailRes.rows[0]?.correo;
        if (correoOrg) {
          void sendEventApprovedEmail(
            String(correoOrg),
            String(result.rows[0].nombre_evento || eventCheck.rows[0].nombre_evento || "Tu evento"),
            appBaseUrl(),
            eventId
          );
        }
      }
    }

    return NextResponse.json({
      ok: true,
      message: requestedStatus ? "Evento aprobado correctamente" : "Evento rechazado correctamente",
      event: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "Error updating event status" }, { status: 500 });
  } finally {
    client.release();
  }
}
