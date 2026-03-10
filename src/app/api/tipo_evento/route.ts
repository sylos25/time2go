import { NextResponse } from "next/server";
import pool from "@/lib/db";

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

    const result = await pool.query(
      "SELECT id_tipo_evento, nombre FROM tabla_tipo_eventos WHERE id_categoria_evento = $1",
      [id]
    );

    return NextResponse.json(result.rows, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Error al obtener tipos de evento" },
      { status: 500 }
    );
  }
}
