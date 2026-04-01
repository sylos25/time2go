import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sitioId = Number(searchParams.get("sitioId"));

    if (!sitioId) {
      const result = await pool.query(
        `SELECT m.id_municipio, m.nombre_municipio, m.id_departamento
         FROM tabla_municipios m
         ORDER BY m.nombre_municipio ASC`
      );

      return NextResponse.json(result.rows, { status: 200 });
    }

    const result = await pool.query(
      `SELECT m.id_municipio, m.nombre_municipio, m.id_departamento FROM tabla_municipios m
        INNER JOIN tabla_sitios s ON m.id_municipio = s.id_municipio
          WHERE s.id_sitio = $1`,
      [sitioId]
    );

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener municipios" },
      { status: 500 }
    );
  }
}
