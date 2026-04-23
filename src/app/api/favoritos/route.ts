import { NextResponse } from "next/server";
import { getRequesterIdLenient } from "@/lib/auth-request";
import { mapFavoriteRowsToIds } from "@/app/api/favoritos/lib/favoritos-mappers";
import {
  addFavorite,
  listFavoriteRows,
  removeFavorite,
} from "@/app/api/favoritos/lib/favoritos-repository";

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

    return NextResponse.json({
      ok: true,
      favoritos: mapFavoriteRowsToIds(await listFavoriteRows(userId)),
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

    await addFavorite(userId, eventId);

    return NextResponse.json({ ok: true, id_evento: eventId });
  } catch (error: unknown) {
    console.error("[POST /api/favoritos]", error);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23503"
    ) {
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

    await removeFavorite(userId, eventId);

    return NextResponse.json({ ok: true, id_evento: eventId });
  } catch (error) {
    console.error("[DELETE /api/favoritos]", error);
    return NextResponse.json({ ok: false, message: "Error eliminando favorito" }, { status: 500 });
  }
}