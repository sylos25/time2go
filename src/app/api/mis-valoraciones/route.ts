import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { parseCookies } from "@/lib/cookies";
import { dbErrorResponse } from "@/lib/api-error-response";

async function getAuthenticatedUser(req: Request) {
  const authHeader = req.headers.get("authorization") || "";

  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    const payload = verifyToken(token);
    const userId = payload?.id_usuario;
    if (payload && userId) {
      return { id_usuario: Number(userId), name: payload.name };
    }
  }

  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    const cookies = parseCookies(cookieHeader);
    const token = cookies["token"];
    if (token) {
      const payload = verifyToken(token);
      const userId = payload?.id_usuario;
      if (payload && userId) {
        return { id_usuario: Number(userId), name: payload.name };
      }
    }
  }

  return null;
}

// ── GET — listar todas las valoraciones ─────────────────────────────────────
export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user)
      return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });

    const { rows } = await pool.query(
      "SELECT app_api.fn_valoraciones_obtener($1) AS result",
      [user.id_usuario]
    );

    const data = rows[0].result;
    if (!data?.ok) {
      return dbErrorResponse(data, "Error obteniendo valoraciones");
    }
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[GET /api/mis-valoraciones]", err);
    return NextResponse.json({ ok: false, message: "Error obteniendo valoraciones" }, { status: 500 });
  }
}

// ── POST — crear una valoración ──────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
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

    const { rows } = await pool.query(
      "SELECT app_api.fn_valoraciones_crear($1,$2,$3,$4) AS result",
      [user.id_usuario, idEvento, valoracion, comentario]
    );

    const data = rows[0].result;
    if (!data?.ok)
      return dbErrorResponse(data, "Error creando la valoracion");

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/mis-valoraciones]", err);
    return NextResponse.json({ ok: false, message: "Error creando la valoración" }, { status: 500 });
  }
}