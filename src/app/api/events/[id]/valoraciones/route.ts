import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = Number(url.pathname.split('/').slice(-3)[0]); // /api/events/[id]/valoraciones
    if (!id) return NextResponse.json({ ok: false, message: 'Invalid id' }, { status: 400 });

    const res = await pool.query(`SELECT id_valoracion, id_usuario, id_evento, valoracion, comentario, fecha_creacion FROM tabla_valoraciones WHERE id_evento = $1 ORDER BY fecha_creacion DESC`, [id]);
    return NextResponse.json({ ok: true, valoraciones: res.rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: 'Error fetching valoraciones' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const id = Number(url.pathname.split('/').slice(-3)[0]);
    if (!id) return NextResponse.json({ ok: false, message: 'Invalid id' }, { status: 400 });

    const body = await req.json();
    const valoracion = Number(body.valoracion) || 0;
    const comentario = String(body.comentario || null);

    // Determine user from Bearer token if provided
    let id_usuario = body.id_usuario || body.numero_documento || null;
    const authHeader = (req.headers.get('authorization') || '').trim();
    if (authHeader.startsWith('Bearer ')) {
      try {
        const { verifyToken } = await import('@/lib/jwt');
        const t = authHeader.slice(7).trim();
        const payload = verifyToken(t);
        const userIdFromToken = payload?.id_usuario || payload?.numero_documento;
        if (payload && userIdFromToken) id_usuario = userIdFromToken;
      } catch (e) {
        console.error('token verification failed', e);
      }
    }

    if (!id_usuario) return NextResponse.json({ ok: false, message: 'User required' }, { status: 400 });

    const insert = await pool.query(`INSERT INTO tabla_valoraciones (id_usuario, id_evento, valoracion, comentario) VALUES ($1,$2,$3,$4) RETURNING id_valoracion, fecha_creacion`, [id_usuario, id, valoracion, comentario]);

    const newRow = { id_valoracion: insert.rows[0].id_valoracion, id_usuario, valoracion, comentario, fecha_creacion: insert.rows[0].fecha_creacion };
    return NextResponse.json({ ok: true, valoracion: newRow });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: 'Error creating valoracion' }, { status: 500 });
  }
}