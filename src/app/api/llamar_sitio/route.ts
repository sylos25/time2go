import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nombreSitio = searchParams.get("nombre_sitio");

  if (!nombreSitio || typeof nombreSitio !== "string") {
    return NextResponse.json(
      { message: "Falta el parámetro 'nombre'" },
      { status: 400 }
    );
  }

  try {
    const result = await pool.query(
      "SELECT id_sitio, nombre_sitio FROM tabla_sitios WHERE LOWER(nombre_sitio) LIKE LOWER($1) LIMIT 10",
      [`%${nombreSitio}%`]
    );

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error("Error al buscar sitios:", error);
    return NextResponse.json(
      { message: "Error al buscar sitios" },
      { status: 500 }
    );
  }
}
