import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nombreSitio = searchParams.get("nombre_sitio")?.trim() ?? "";

  try {
    const query = nombreSitio
      ? `
          SELECT id_sitio, nombre_sitio
          FROM tabla_sitios
          WHERE LOWER(nombre_sitio) LIKE LOWER($1)
          ORDER BY nombre_sitio ASC
          LIMIT 7
        `
      : `
          SELECT id_sitio, nombre_sitio
          FROM tabla_sitios
          ORDER BY nombre_sitio ASC
          LIMIT 7
        `;

    const params = nombreSitio ? [`%${nombreSitio}%`] : [];
    const result = await pool.query(query, params);

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error("Error al buscar sitios:", error);
    return NextResponse.json(
      { message: "Error al buscar sitios" },
      { status: 500 }
    );
  }
}
