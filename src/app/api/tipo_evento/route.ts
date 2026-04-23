import { NextResponse } from "next/server";
import { listTiposEventoByCategoriaId } from "@/app/api/tipo_evento/lib/tipo-evento-repository";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categoriaId = searchParams.get("categoriaId");

  if (!categoriaId) {
    return NextResponse.json(
      { message: "Falta el ID de categoría" },
      { status: 400 }
    );
  }

  try {
    const id = Number(categoriaId);
    if (Number.isNaN(id)) {
      return NextResponse.json(
        { message: "ID de categoría inválido" },
        { status: 400 }
      );
    }

    return NextResponse.json(await listTiposEventoByCategoriaId(id), { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Error al obtener tipos de evento" },
      { status: 500 }
    );
  }
}
