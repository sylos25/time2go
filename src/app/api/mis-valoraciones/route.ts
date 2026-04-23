import { NextResponse } from "next/server";
import { dbErrorResponse } from "@/lib/api-error-response";
import { getMisValoracionesAuthenticatedUser } from "@/app/api/mis-valoraciones/lib/mis-valoraciones-auth";
import {
  createMisValoracion,
  fetchMisValoraciones,
} from "@/app/api/mis-valoraciones/lib/mis-valoraciones-repository";

// ── GET — listar todas las valoraciones ─────────────────────────────────────
export async function GET(req: Request) {
  try {
    const user = await getMisValoracionesAuthenticatedUser(req);
    if (!user)
      return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });

    const data = await fetchMisValoraciones(user.id_usuario);
    if (!data?.ok) {
      return dbErrorResponse(data, "Error obteniendo valoraciones");
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("[GET /api/mis-valoraciones]", err);
    return NextResponse.json({ ok: false, message: "Error obteniendo valoraciones" }, { status: 500 });
  }
}

// ── POST — crear una valoración ──────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const user = await getMisValoracionesAuthenticatedUser(req);
    if (!user)
      return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const idEvento   = body?.id_evento   !== undefined ? Number(body.id_evento)            : undefined;
    const valoracion = body?.valoracion  !== undefined ? Number(body.valoracion)           : undefined;
    const comentario = body?.comentario  !== undefined ? String(body.comentario).trim()    : null;

    if (!idEvento || !Number.isFinite(idEvento) || idEvento <= 0)
      return NextResponse.json({ ok: false, message: "id_evento inválido" }, { status: 400 });

    if (valoracion === undefined || !Number.isFinite(valoracion) || !Number.isInteger(valoracion) || valoracion < 1 || valoracion > 5)
      return NextResponse.json({ ok: false, message: "La valoración debe ser un entero entre 1 y 5" }, { status: 400 });

    const data = await createMisValoracion(user.id_usuario, idEvento, valoracion, comentario);
    if (!data?.ok)
      return dbErrorResponse(data, "Error creando la valoracion");

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("[POST /api/mis-valoraciones]", err);
    return NextResponse.json({ ok: false, message: "Error creando la valoración" }, { status: 500 });
  }
}