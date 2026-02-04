import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

const allowed: Record<string, string> = {
  paises: "tabla_paises",
  tipo_sitios: "tabla_tipo_sitios",
  sitios: "tabla_sitios",
  tipo_infraest_disc: "tabla_tipo_infraest_disc",
  sitios_disc: "tabla_sitios_disc",
  categoria_eventos: "tabla_categoria_eventos",
  tipo_eventos: "tabla_tipo_eventos",
  categoria_boletos: "tabla_categoria_boletos",
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const table = url.searchParams.get("table")

    if (!table || !allowed[table]) {
      return NextResponse.json({ error: "Tabla desconocida" }, { status: 400 })
    }

    const tableName = allowed[table]
    // Limit rows to avoid large responses
    const limit = 200

    const result = await pool.query(`SELECT * FROM ${tableName} ORDER BY fecha_creacion DESC LIMIT $1`, [limit])

    return NextResponse.json({ rows: result.rows })
  } catch (error: any) {
    console.error("Error fetching data:", error)
    return NextResponse.json({ error: "Error al obtener datos" }, { status: 500 })
  }
}
