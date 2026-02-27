import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { parseCookies } from "@/lib/cookies";

async function getAuthenticatedUser(req: Request) {
  const authHeader = (req.headers.get("authorization") || "").trim();
  let userId: string | null = null;

  if (authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.slice(7).trim();
      const payload = verifyToken(token);
      const userIdFromToken = payload?.id_usuario;
      if (payload && userIdFromToken) {
        userId = String(userIdFromToken);
      }
    } catch {
      userId = null;
    }
  }

  if (!userId) {
    const cookies = parseCookies(req.headers.get("cookie"));
    const token = cookies["token"];
    if (token) {
      try {
        const payload = verifyToken(token);
        const userIdFromToken = payload?.id_usuario;
        if (payload && userIdFromToken) {
          userId = String(userIdFromToken);
        }
      } catch {
        userId = null;
      }
    }
  }

  if (!userId) return null;

  const userQuery = await pool.query(
    "SELECT id_usuario, nombres, apellidos FROM tabla_usuarios WHERE id_usuario = $1 LIMIT 1",
    [userId]
  );

  if (!userQuery.rows || userQuery.rows.length === 0) return null;
  return userQuery.rows[0];
}

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const eventId = Number(id);
    if (!eventId || !Number.isFinite(eventId)) {
      return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });
    }

    const res = await pool.query(
      `SELECT
        v.id_valoracion,
        v.id_usuario,
        v.id_evento,
        v.valoracion,
        v.comentario,
        v.fecha_creacion,
        u.nombres,
        u.apellidos
      FROM tabla_valoraciones v
      INNER JOIN tabla_usuarios u ON u.id_usuario = v.id_usuario
      WHERE v.id_evento = $1
      ORDER BY v.fecha_creacion DESC`,
      [eventId]
    );
    return NextResponse.json({ ok: true, valoraciones: res.rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "Error fetching valoraciones" }, { status: 500 });
  }
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const eventId = Number(id);
    if (!eventId || !Number.isFinite(eventId)) {
      return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });
    }

    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
    }

    const eventCheck = await pool.query(
      "SELECT id_evento FROM tabla_eventos WHERE id_evento = $1 AND estado = TRUE LIMIT 1",
      [eventId]
    );
    if (!eventCheck.rows || eventCheck.rows.length === 0) {
      return NextResponse.json({ ok: false, message: "Evento no disponible" }, { status: 404 });
    }

    const body = await req.json();
    const valoracion = Number(body?.valoracion);
    if (!Number.isInteger(valoracion) || valoracion < 1 || valoracion > 5) {
      return NextResponse.json(
        { ok: false, message: "La calificación debe estar entre 1 y 5" },
        { status: 400 }
      );
    }

    const comentarioRaw = typeof body?.comentario === "string" ? body.comentario.trim() : "";
    const comentario = comentarioRaw.length > 0 ? comentarioRaw : null;

    if (comentario && comentario.length > 1000) {
      return NextResponse.json(
        { ok: false, message: "El comentario no puede superar 1000 caracteres" },
        { status: 400 }
      );
    }

    const existing = await pool.query(
      `SELECT id_valoracion
       FROM tabla_valoraciones
       WHERE id_usuario = $1 AND id_evento = $2
       ORDER BY fecha_creacion DESC
       LIMIT 1`,
      [user.id_usuario, eventId]
    );

    if (existing.rows && existing.rows.length > 0) {
      const update = await pool.query(
        `UPDATE tabla_valoraciones
         SET valoracion = $1,
             comentario = $2,
             fecha_actualizacion = CURRENT_TIMESTAMP
         WHERE id_valoracion = $3
         RETURNING id_valoracion, id_usuario, id_evento, valoracion, comentario, fecha_creacion, fecha_actualizacion`,
        [valoracion, comentario, existing.rows[0].id_valoracion]
      );

      return NextResponse.json({ ok: true, valoracion: update.rows[0], updated: true });
    }

    const insert = await pool.query(
      `INSERT INTO tabla_valoraciones (id_usuario, id_evento, valoracion, comentario)
       VALUES ($1, $2, $3, $4)
       RETURNING id_valoracion, id_usuario, id_evento, valoracion, comentario, fecha_creacion`,
      [user.id_usuario, eventId, valoracion, comentario]
    );

    return NextResponse.json({ ok: true, valoracion: insert.rows[0], updated: false });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "Error creating valoracion" }, { status: 500 });
  }
}