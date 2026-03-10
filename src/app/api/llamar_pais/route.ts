import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT id_pais, nombre_pais FROM tabla_paises ORDER BY nombre_pais ASC"
    );

    const paises = result.rows.map((pais) => ({
      value: pais.id_pais,
      label: pais.nombre_pais,
    }));

    return NextResponse.json(paises, { status: 200 });
  } catch (error) {
    console.error("Error al consultar países:", error);
    return NextResponse.json(
      { error: "Error al consultar países" },
      { status: 500 }
    );
  }
}
