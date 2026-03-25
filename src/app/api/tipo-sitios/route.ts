import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT id_tipo_sitio, nombre_tipo_sitio FROM tabla_tipo_sitios ORDER BY nombre_tipo_sitio ASC"
    )
    
    return NextResponse.json({ tipos: result.rows })
  } catch (error) {
    console.error("Error fetching tipo sitios:", error)
    return NextResponse.json(
      { error: "Error al obtener tipos de sitios" },
      { status: 500 }
    )
  }
}
