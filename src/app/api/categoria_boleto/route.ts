import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const result = await pool.query(
      "SELECT id_categoria_boleto, nombre_categoria_boleto FROM tabla_categoria_boleto ORDER BY nombre_categoria_boleto"
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching categorías de boleto:", error);
    return NextResponse.json(
      { error: "Error al obtener las categorías de boleto" },
      { status: 500 }
    );
  }
}
