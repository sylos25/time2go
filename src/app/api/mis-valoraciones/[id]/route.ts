import { NextResponse } from "next/server";
import { dbErrorResponse } from "@/lib/api-error-response";
import { getMisValoracionesAuthenticatedUser } from "@/app/api/mis-valoraciones/lib/mis-valoraciones-auth";
import {
  deleteMisValoracion,
  fetchMisValoracionById,
  updateMisValoracion,
} from "@/app/api/mis-valoraciones/lib/mis-valoraciones-repository";

// ── GET — obtener una valoración por id ─────────────────────────────────────
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getMisValoracionesAuthenticatedUser(req);
    if (!user)
      return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    const idValoracion = Number(id);
    if (!Number.isFinite(idValoracion) || idValoracion <= 0)
      return NextResponse.json({ ok: false, message: "ID de valoración inválido" }, { status: 400 });

    const data = await fetchMisValoracionById(idValoracion, user.id_usuario);
    if (!data?.ok)
      return dbErrorResponse(data, "Error obteniendo la valoracion");

    return NextResponse.json(data);
  } catch (err) {
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
    const user = await getMisValoracionesAuthenticatedUser(req);
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

    const data = await updateMisValoracion(idValoracion, user.id_usuario, valoracion, comentario);
    if (!data?.ok)
      return dbErrorResponse(data, "Error actualizando la valoracion");

    return NextResponse.json({ ok: true, message: "Valoración actualizada" });
  } catch (err) {
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
    const user = await getMisValoracionesAuthenticatedUser(req);
    if (!user)
      return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    const idValoracion = Number(id);
    if (!Number.isFinite(idValoracion) || idValoracion <= 0)
      return NextResponse.json({ ok: false, message: "ID de valoración inválido" }, { status: 400 });

    const data = await deleteMisValoracion(idValoracion, user.id_usuario);
    if (!data?.ok)
      return dbErrorResponse(data, "Error eliminando la valoracion");

    return NextResponse.json({ ok: true, message: "Valoración eliminada correctamente" });
  } catch (err) {
    console.error("[DELETE /api/mis-valoraciones/[id]]", err);
    return NextResponse.json({ ok: false, message: "Error eliminando la valoración" }, { status: 500 });
  }
}