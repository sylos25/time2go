import { NextResponse } from "next/server";
import { listCategoriaEventos } from "@/app/api/categoria_evento/lib/categoria-evento-repository";

export async function GET() {
  try {
    return NextResponse.json(await listCategoriaEventos(), { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Error al obtener categorías" },
      { status: 500 }
    );
  }
}
