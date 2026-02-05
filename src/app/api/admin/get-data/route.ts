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

// Define queries with JOINs for foreign key relationships
const queryMap: Record<string, string> = {
  sitios: `
    SELECT 
      s.id_sitio,
      s.nombre_sitio,
      ts.nombre_tipo_sitio,
      s.acceso_discapacidad,
      s.id_municipio,
      s.direccion,
      s.latitud,
      s.longitud,
      s.telefono_1,
      s.telefono_2,
      s.sitio_web,
      s.fecha_creacion,
      s.fecha_actualizacion
    FROM tabla_sitios s
    LEFT JOIN tabla_tipo_sitios ts ON s.id_tipo_sitio = ts.id_tipo_sitio
    ORDER BY s.fecha_creacion DESC
    LIMIT $1
  `,
  sitios_disc: `
    SELECT 
      sd.id_sitios_disc,
      s.nombre_sitio,
      tid.nombre_infraest_disc,
      sd.descripcion,
      sd.fecha_creacion,
      sd.fecha_actualizacion
    FROM tabla_sitios_disc sd
    LEFT JOIN tabla_sitios s ON sd.id_sitio = s.id_sitio
    LEFT JOIN tabla_tipo_infraest_disc tid ON sd.id_infraest_disc = tid.id_infraest_disc
    ORDER BY sd.fecha_creacion DESC
    LIMIT $1
  `,
  tipo_eventos: `
    SELECT 
      te.id_tipo_evento,
      te.nombre,
      ce.nombre as nombre_categoria_evento,
      te.fecha_creacion,
      te.fecha_actualizacion
    FROM tabla_tipo_eventos te
    LEFT JOIN tabla_categoria_eventos ce ON te.id_categoria_evento = ce.id_categoria_evento
    ORDER BY te.fecha_creacion DESC
    LIMIT $1
  `,
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const table = url.searchParams.get("table")

    if (!table || !allowed[table]) {
      return NextResponse.json({ error: "Tabla desconocida" }, { status: 400 })
    }

    const tableName = allowed[table]
    const limit = 200

    let query: string

    // Use custom query with JOINs if available, otherwise use simple SELECT
    if (queryMap[table]) {
      query = queryMap[table]
    } else {
      query = `SELECT * FROM ${tableName} ORDER BY fecha_creacion DESC LIMIT $1`
    }

    const result = await pool.query(query, [limit])

    return NextResponse.json({ rows: result.rows })
  } catch (error: any) {
    console.error("Error fetching data:", error)
    return NextResponse.json({ error: "Error al obtener datos" }, { status: 500 })
  }
}
