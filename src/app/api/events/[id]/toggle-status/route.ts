import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { parseCookies } from "@/lib/cookies";

async function getAuthenticatedUser(req: Request, client: any) {
  const authHeader = (req.headers.get("authorization") || "").trim();
  let userId: string | null = null;

  if (authHeader.startsWith("Bearer ")) {
    try {
      const t = authHeader.slice(7).trim();
      const payload = verifyToken(t);
      const userIdFromToken = payload?.id_usuario || payload?.numero_documento;
      if (payload && userIdFromToken) userId = String(userIdFromToken);
    } catch (e) {
      console.error("token verification failed", e);
    }
  }

  if (!userId) {
    const cookies = parseCookies(req.headers.get("cookie"));
    const token = cookies["token"];
    if (token) {
      try {
        const payload = verifyToken(token);
        const userIdFromToken = payload?.id_usuario || payload?.numero_documento;
        if (payload && userIdFromToken) userId = String(userIdFromToken);
      } catch (e) {
        console.error("cookie token verification failed", e);
      }
    }
  }

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

    const eventCheck = await client.query("SELECT estado FROM tabla_eventos WHERE id_evento = $1", [eventId]);
    if (!eventCheck.rows || eventCheck.rows.length === 0) {
      return NextResponse.json({ ok: false, message: "Event not found" }, { status: 404 });
    }

    const body = await req.json();
    const requestedStatus = body.estado === true || body.estado === "true";

    if (!requestedStatus) {
      return NextResponse.json({ ok: false, message: "Solo se permite aprobar eventos (FALSE -> TRUE)" }, { status: 400 });
    }

    if (eventCheck.rows[0].estado === true) {
      return NextResponse.json({ ok: true, message: "El evento ya está aprobado" });
    }

    // Update event status
    const result = await client.query(
      `UPDATE tabla_eventos SET 
        estado = $1,
        fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id_evento = $2
      RETURNING id_evento, nombre_evento, estado`,
      [true, eventId]
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ ok: false, message: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      message: "Evento aprobado correctamente",
      event: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "Error updating event status" }, { status: 500 });
  } finally {
    client.release();
  }
}
