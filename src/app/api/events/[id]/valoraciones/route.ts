import { NextResponse } from "next/server";
import { getEventValoracionAuthenticatedUser } from "@/app/api/events/[id]/valoraciones/lib/event-valoraciones-auth";
import {
  createEventValoracion,
  deleteEventValoracion,
  findExistingEventValoracion,
  isEventAvailableForRatings,
  listEventValoraciones,
  updateEventValoracion,
  userOwnsEventValoracion,
} from "@/app/api/events/[id]/valoraciones/lib/event-valoraciones-repository";
import {
  normalizeComentario,
  parseEventId,
  parseValoracion,
  parseValoracionId,
  validateComentario,
} from "@/app/api/events/[id]/valoraciones/lib/event-valoraciones-validation";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const eventId = parseEventId(id);
    if (!eventId) {
      return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, valoraciones: await listEventValoraciones(eventId) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "Error fetching valoraciones" }, { status: 500 });
  }
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const eventId = parseEventId(id);
    if (!eventId) {
      return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });
    }

    const user = await getEventValoracionAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
    }

    if (!(await isEventAvailableForRatings(eventId))) {
      return NextResponse.json({ ok: false, message: "Evento no disponible" }, { status: 404 });
    }

    const body = await req.json();
    const valoracion = parseValoracion(body?.valoracion);
    if (valoracion === null) {
      return NextResponse.json(
        { ok: false, message: "La calificación debe estar entre 1 y 5" },
        { status: 400 }
      );
    }

    const comentario = normalizeComentario(body?.comentario);
    const comentarioError = validateComentario(comentario);
    if (comentarioError) {
      return NextResponse.json(
        { ok: false, message: comentarioError },
        { status: 400 }
      );
    }

    const existingId = await findExistingEventValoracion(user.id_usuario, eventId);
    if (existingId) {
      const updated = await updateEventValoracion(existingId, valoracion, comentario);
      return NextResponse.json({ ok: true, valoracion: updated, updated: true });
    }

    const created = await createEventValoracion(user.id_usuario, eventId, valoracion, comentario);

    return NextResponse.json({ ok: true, valoracion: created, updated: false });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "Error creating valoracion" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const eventId = parseEventId(id);
    if (!eventId) {
      return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });
    }

    const user = await getEventValoracionAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const idValoracion = parseValoracionId(body?.id_valoracion);
    if (!idValoracion) {
      return NextResponse.json({ ok: false, message: "id_valoracion inválido" }, { status: 400 });
    }

    if (!(await userOwnsEventValoracion(idValoracion, eventId, user.id_usuario))) {
      return NextResponse.json({ ok: false, message: "No autorizado para eliminar esta valoración" }, { status: 403 });
    }

    await deleteEventValoracion(idValoracion);

    return NextResponse.json({ ok: true, deleted: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "Error deleting valoracion" }, { status: 500 });
  }
}