// app/api/mis-valoraciones/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { parseCookies } from "@/lib/cookies";

// ── Mismo helper de autenticación que usas en mis-reservas ───────────────────
async function getAuthenticatedUser(req: Request) {
  const authHeader = (req.headers.get("authorization") || "").trim();
  let userId: string | null = null;

  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    const payload = verifyToken(token);
    const userIdFromToken = payload?.id_usuario;
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
      const userIdFromToken = payload?.id_usuario;
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

// ── GET — listar todas las valoraciones del usuario autenticado ──────────────
export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { rows } = await pool.query(
      `SELECT
         v.id_valoracion,
         v.valoracion,
         v.comentario,
         v.fecha_creacion,
         v.fecha_actualizacion,
         e.id_publico_evento,
         e.nombre_evento,
         e.fecha_inicio,
         e.hora_inicio,
         img.url_imagen_evento AS imagen_evento
       FROM tabla_valoraciones v
       JOIN tabla_eventos e ON v.id_evento = e.id_evento
       LEFT JOIN LATERAL (
         SELECT i.url_imagen_evento
         FROM tabla_imagenes_eventos i
         WHERE i.id_evento = e.id_evento
         ORDER BY i.id_imagen_evento ASC
         LIMIT 1
       ) img ON TRUE
       WHERE v.id_usuario = $1
       ORDER BY v.fecha_creacion DESC`,
      [user.id_usuario]
    );

    return NextResponse.json({ ok: true, valoraciones: rows });
  } catch (err) {
    console.error("[GET /api/mis-valoraciones]", err);
    return NextResponse.json(
      { ok: false, message: "Error obteniendo valoraciones" },
      { status: 500 }
    );
  }
}