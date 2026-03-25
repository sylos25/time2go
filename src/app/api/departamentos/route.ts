import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT id_departamento, nombre_departamento FROM tabla_departamentos ORDER BY nombre_departamento ASC"
    )
    
    return NextResponse.json({ departamentos: result.rows })
  } catch (error) {
    console.error("Error fetching departamentos:", error)
    return NextResponse.json(
      { error: "Error al obtener departamentos" },
      { status: 500 }
    )
  }
}
