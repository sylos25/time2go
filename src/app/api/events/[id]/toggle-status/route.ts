import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const eventId = Number(id);
  const client = await pool.connect();
  try {
    if (!eventId) {
      return NextResponse.json({ ok: false, message: "Invalid event ID" }, { status: 400 });
    }

    // Verify user owns the event or is admin
    const authHeader = (req.headers.get("authorization") || "").trim();
    let userId = "";
    if (authHeader.startsWith("Bearer ")) {
      try {
        const { verifyToken } = await import("@/lib/jwt");
        const t = authHeader.slice(7).trim();
        const payload = verifyToken(t);
        const userIdFromToken = payload?.id_usuario || payload?.numero_documento;
        if (payload && userIdFromToken) userId = String(userIdFromToken);
      } catch (e) {
        console.error("token verification failed", e);
      }
    }

    if (!userId) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    // Check event exists and user owns it
    const eventCheck = await client.query("SELECT id_usuario FROM tabla_eventos WHERE id_evento = $1", [eventId]);
    if (!eventCheck.rows || eventCheck.rows.length === 0) {
      return NextResponse.json({ ok: false, message: "Event not found" }, { status: 404 });
    }

    if (String(eventCheck.rows[0].id_usuario) !== userId) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const newStatus = body.estado === true || body.estado === "true";

    // Update event status
    const result = await client.query(
      `UPDATE tabla_eventos SET 
        estado = $1,
        fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id_evento = $2
      RETURNING id_evento, nombre_evento, estado`,
      [newStatus, eventId]
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ ok: false, message: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      message: newStatus ? "Evento validado correctamente" : "Evento inhabilitado correctamente",
      event: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "Error updating event status" }, { status: 500 });
  } finally {
    client.release();
  }
}
