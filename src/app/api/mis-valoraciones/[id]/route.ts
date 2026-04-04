import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getJwtPayloadLenient } from "@/lib/auth-request";
import { dbErrorResponse } from "@/lib/api-error-response";

async function getAuthenticatedUser(req: Request) {
  const payload = await getJwtPayloadLenient(req);
  if (!payload?.id_usuario) return null;
  return { id_usuario: Number(payload.id_usuario), name: payload.name };
}

// ── GET — obtener una valoración por id ─────────────────────────────────────
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user)
      return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    const idValoracion = Number(id);
    if (!Number.isFinite(idValoracion) || idValoracion <= 0)
      return NextResponse.json({ ok: false, message: "ID de valoración inválido" }, { status: 400 });

    const { rows } = await pool.query(
      "SELECT app_api.fn_valoraciones_obtener_por_id($1,$2) AS result",
      [idValoracion, user.id_usuario]
    );

    const data = rows[0].result;
    if (!data?.ok)
      return dbErrorResponse(data, "Error obteniendo la valoracion");

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[GET /api/mis-valoraciones/[id]]", err);
    return NextResponse.json({ ok: false, message: "Error obteniendo la valoración" }, { status: 500 });
  }
}

// ── PUT — editar estrellas y/o comentario ────────────────────────────────────
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user)
      return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    const idValoracion = Number(id);
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
    if (!data?.ok)
      return dbErrorResponse(data, "Error actualizando la valoracion");

    return NextResponse.json({ ok: true, message: "Valoración actualizada" });
  } catch (err: any) {
    console.error("[PUT /api/mis-valoraciones/[id]]", err);
    return NextResponse.json({ ok: false, message: "Error actualizando la valoración" }, { status: 500 });
  }
}

// ── DELETE — eliminar una valoración ─────────────────────────────────────────
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user)
      return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    const idValoracion = Number(id);
    if (!Number.isFinite(idValoracion) || idValoracion <= 0)
      return NextResponse.json({ ok: false, message: "ID de valoración inválido" }, { status: 400 });

    const { rows } = await pool.query(
      "SELECT app_api.fn_valoraciones_eliminar($1,$2) AS result",
      [idValoracion, user.id_usuario]
    );

    const data = rows[0].result;
    if (!data?.ok)
      return dbErrorResponse(data, "Error eliminando la valoracion");

    return NextResponse.json({ ok: true, message: "Valoración eliminada correctamente" });
  } catch (err: any) {
    console.error("[DELETE /api/mis-valoraciones/[id]]", err);
    return NextResponse.json({ ok: false, message: "Error eliminando la valoración" }, { status: 500 });
  }
}