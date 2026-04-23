import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { mapOrganizadorEventos } from "@/app/api/organizador/[id]/lib/organizador-mappers";
import {
  findOrganizadorById,
  listOrganizadorEventos,
} from "@/app/api/organizador/[id]/lib/organizador-repository";

export const runtime = "nodejs";

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const organizadorId = Number(id);

    if (!organizadorId || isNaN(organizadorId)) {
        return NextResponse.json(
            { ok: false, message: "ID de organizador inválido" },
            { status: 400 }
        );
    }

    const client = await pool.connect();
    try {
        const organizador = await findOrganizadorById(client, organizadorId)

        if (!organizador) {
            return NextResponse.json(
                { ok: false, message: "Organizador no encontrado" },
                { status: 404 }
            );
        }
        const eventos = mapOrganizadorEventos(await listOrganizadorEventos(client, organizadorId))

        return NextResponse.json({
            ok: true,
            organizador,
            eventos,
        });
    } catch (err) {
        console.error("Error en /api/organizador/[id]:", err);
        return NextResponse.json(
            { ok: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}