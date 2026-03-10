// app/api/mis-valoraciones/[id]/route.ts
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

// ── GET — obtener una valoración por id ──────────────────────────────────────
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const idValoracion = Number(params.id);
    if (!Number.isFinite(idValoracion) || idValoracion <= 0) {
      return NextResponse.json(
        { ok: false, message: "ID de valoración inválido" },
        { status: 400 }
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
       WHERE v.id_valoracion = $1
         AND v.id_usuario    = $2`,  -- 🔒 valida que le pertenece al usuario
      [idValoracion, user.id_usuario]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { ok: false, message: "Valoración no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, valoracion: rows[0] });
  } catch (err) {
    console.error("[GET /api/mis-valoraciones/[id]]", err);
    return NextResponse.json(
      { ok: false, message: "Error obteniendo la valoración" },
      { status: 500 }
    );
  }
}

// ── PUT — editar estrellas y/o comentario ────────────────────────────────────
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const idValoracion = Number(params.id);
    if (!Number.isFinite(idValoracion) || idValoracion <= 0) {
      return NextResponse.json(
        { ok: false, message: "ID de valoración inválido" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const valoracion  = body?.valoracion  !== undefined ? Number(body.valoracion)         : undefined;
    const comentario  = body?.comentario  !== undefined ? String(body.comentario).trim()  : undefined;

    // Validar estrellas si se envían
    if (valoracion !== undefined) {
      if (!Number.isFinite(valoracion) || valoracion < 1 || valoracion > 5 || !Number.isInteger(valoracion)) {
        return NextResponse.json(
          { ok: false, message: "La valoración debe ser un número entero entre 1 y 5" },
          { status: 400 }
        );
      }
    }

    // Verificar que la valoración existe y le pertenece al usuario
    const check = await pool.query(
      "SELECT id_valoracion FROM tabla_valoraciones WHERE id_valoracion = $1 AND id_usuario = $2 LIMIT 1",
      [idValoracion, user.id_usuario]
    );

    if (!check.rows || check.rows.length === 0) {
      return NextResponse.json(
        { ok: false, message: "Valoración no encontrada" },
        { status: 404 }
      );
    }

    const { rows } = await pool.query(
      `UPDATE tabla_valoraciones
       SET
         valoracion          = COALESCE($1, valoracion),
         comentario          = COALESCE($2, comentario),
         fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id_valoracion = $3
         AND id_usuario    = $4
       RETURNING id_valoracion, valoracion, comentario, fecha_actualizacion`,
      [
        valoracion  ?? null,
        comentario  !== undefined ? (comentario || null) : null,
        idValoracion,
        user.id_usuario,
      ]
    );

    return NextResponse.json({
      ok: true,
      message: "Valoración actualizada",
      valoracion: rows[0],
    });
  } catch (err) {
    console.error("[PUT /api/mis-valoraciones/[id]]", err);
    return NextResponse.json(
      { ok: false, message: "Error actualizando la valoración" },
      { status: 500 }
    );
  }
}

// ── DELETE — eliminar una valoración ────────────────────────────────────────
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const idValoracion = Number(params.id);
    if (!Number.isFinite(idValoracion) || idValoracion <= 0) {
      return NextResponse.json(
        { ok: false, message: "ID de valoración inválido" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `DELETE FROM tabla_valoraciones
       WHERE id_valoracion = $1
         AND id_usuario    = $2`, -- 🔒 solo puede borrar las propias
      [idValoracion, user.id_usuario]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { ok: false, message: "Valoración no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Valoración eliminada correctamente",
    });
  } catch (err) {
    console.error("[DELETE /api/mis-valoraciones/[id]]", err);
    return NextResponse.json(
      { ok: false, message: "Error eliminando la valoración" },
      { status: 500 }
    );
  }
}