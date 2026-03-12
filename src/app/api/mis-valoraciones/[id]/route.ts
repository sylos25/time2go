import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { parseCookies } from "@/lib/cookies";

async function getAuthenticatedUser(req: Request) {
  // ... sin cambios
}

// ── GET — obtener una valoración por id ─────────────────────────────────────
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user)
      return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });

    const idValoracion = Number(params.id);
    if (!Number.isFinite(idValoracion) || idValoracion <= 0)
      return NextResponse.json({ ok: false, message: "ID de valoración inválido" }, { status: 400 });

    const { rows } = await pool.query(
      "SELECT app_api.fn_valoraciones_obtener_por_id($1,$2) AS result",
      [idValoracion, user.id_usuario]
    );

    const data = rows[0].result;
    if (!data.ok)
      return NextResponse.json(data, { status: 404 });

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[GET /api/mis-valoraciones/[id]]", err);
    return NextResponse.json({ ok: false, message: "Error obteniendo la valoración" }, { status: 500 });
  }
}

// ── PUT — editar estrellas y/o comentario ────────────────────────────────────
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user)
      return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });

    const idValoracion = Number(params.id);
    if (!Number.isFinite(idValoracion) || idValoracion <= 0)
      return NextResponse.json({ ok: false, message: "ID de valoración inválido" }, { status: 400 });

    const body = await req.json();
    const valoracion = body?.valoracion !== undefined ? Number(body.valoracion)        : null;
    const comentario = body?.comentario !== undefined ? String(body.comentario).trim() : null;

    if (valoracion !== null && (!Number.isFinite(valoracion) || !Number.isInteger(valoracion) || valoracion < 1 || valoracion > 5))
      return NextResponse.json({ ok: false, message: "La valoración debe ser un entero entre 1 y 5" }, { status: 400 });

    const { rows } = await pool.query(
      "SELECT app_api.fn_valoraciones_actualizar($1,$2,$3,$4) AS result",
      [idValoracion, user.id_usuario, valoracion, comentario]
    );

    const data = rows[0].result;
    if (!data.ok)
      return NextResponse.json(data, { status: 404 });

    return NextResponse.json({ ok: true, message: "Valoración actualizada" });
  } catch (err: any) {
    console.error("[PUT /api/mis-valoraciones/[id]]", err);
    return NextResponse.json({ ok: false, message: "Error actualizando la valoración" }, { status: 500 });
  }
}

// ── DELETE — eliminar una valoración ─────────────────────────────────────────
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user)
      return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });

    const idValoracion = Number(params.id);
    if (!Number.isFinite(idValoracion) || idValoracion <= 0)
      return NextResponse.json({ ok: false, message: "ID de valoración inválido" }, { status: 400 });

    const { rows } = await pool.query(
      "SELECT app_api.fn_valoraciones_eliminar($1,$2) AS result",
      [idValoracion, user.id_usuario]
    );

    const data = rows[0].result;
    if (!data.ok)
      return NextResponse.json(data, { status: 404 });

    return NextResponse.json({ ok: true, message: "Valoración eliminada correctamente" });
  } catch (err: any) {
    console.error("[DELETE /api/mis-valoraciones/[id]]", err);
    return NextResponse.json({ ok: false, message: "Error eliminando la valoración" }, { status: 500 });
  }
}