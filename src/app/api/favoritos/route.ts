import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getRequesterIdLenient } from "@/lib/auth-request";

async function getUserIdNumber(req: Request): Promise<number | null> {
  const raw = await getRequesterIdLenient(req);
  return raw ? Number(raw) : null;
}

export async function GET(req: Request) {
  try {
    const userId = await getUserIdNumber(req);
    if (!userId) {
      return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
    }

    const result = await pool.query(
      `SELECT id_evento
       FROM tabla_favoritos
       WHERE id_usuario = $1
       ORDER BY fecha_creacion DESC`,
      [userId]
    );

    return NextResponse.json({
      ok: true,
      favoritos: result.rows.map((row) => Number(row.id_evento)).filter((value) => Number.isFinite(value)),
    });
  } catch (error) {
    console.error("[GET /api/favoritos]", error);
    return NextResponse.json({ ok: false, message: "Error obteniendo favoritos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserIdNumber(req);
    if (!userId) {
      return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
    }

    const body = (await req.json()) as { id_evento?: number | string };
    const eventId = Number(body?.id_evento);
    if (!Number.isFinite(eventId) || eventId <= 0) {
      return NextResponse.json({ ok: false, message: "id_evento inválido" }, { status: 400 });
    }

    await pool.query(
      `INSERT INTO tabla_favoritos (id_usuario, id_evento)
       VALUES ($1, $2)
       ON CONFLICT (id_usuario, id_evento) DO NOTHING`,
      [userId, eventId]
    );

    return NextResponse.json({ ok: true, id_evento: eventId });
  } catch (error: any) {
    console.error("[POST /api/favoritos]", error);
    if (error?.code === "23503") {
      return NextResponse.json({ ok: false, message: "Evento no válido" }, { status: 404 });
    }
    return NextResponse.json({ ok: false, message: "Error agregando favorito" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getUserIdNumber(req);
    if (!userId) {
      return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
    }

    const url = new URL(req.url);
    const eventId = Number(url.searchParams.get("id_evento"));
    if (!Number.isFinite(eventId) || eventId <= 0) {
      return NextResponse.json({ ok: false, message: "id_evento inválido" }, { status: 400 });
    }

    await pool.query(
      `DELETE FROM tabla_favoritos
       WHERE id_usuario = $1 AND id_evento = $2`,
      [userId, eventId]
    );

    return NextResponse.json({ ok: true, id_evento: eventId });
  } catch (error) {
    console.error("[DELETE /api/favoritos]", error);
    return NextResponse.json({ ok: false, message: "Error eliminando favorito" }, { status: 500 });
  }
}