import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT id_categoria_evento, nombre FROM tabla_categoria_eventos"
    );
    return NextResponse.json(result.rows, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Error al obtener categorías" },
      { status: 500 }
    );
  }
}
