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

const columnAliases: Record<string, Record<string, string>> = {
  tabla_paises: {
    id_pais: "Código",
    nombre_pais: "Nombre del País",
    fecha_creacion: "Fecha de Creación",
    fecha_actualizacion: "Fecha de Actualización",
  },
  tabla_tipo_sitios: {
    id_tipo_sitio: "Código",
    nombre_tipo_sitio: "Tipo de Sitio",
    fecha_creacion: "Fecha de Creación",
    fecha_actualizacion: "Fecha de Actualización",
  },
  tabla_sitios: {
    id_sitio: "Código",
    nombre_sitio: "Nombre del Sitio",
    id_tipo_sitio: "Tipo de Sitio ID",
    acceso_discapacidad: "Acceso para discapacitados",
    id_municipio: "Municipio ID",
    direccion: "Dirección",
    latitud: "Latitud",
    longitud: "Longitud",
    telefono_1: "Teléfono 1",
    telefono_2: "Teléfono 2",
    sitio_web: "Sitio Web",
    fecha_creacion: "Fecha de Creación",
    fecha_actualizacion: "Fecha de Actualización",
  },
  tabla_tipo_infraest_disc: {
    id_infraest_disc: "Código",
    nombre_infraest_disc: "Tipo de Acceso",
    fecha_creacion: "Fecha de Creación",
    fecha_actualizacion: "Fecha de Actualización",
  },
  tabla_sitios_disc: {
    id_sitios_disc: "Código",
    id_sitio: "Sitio ID",
    id_infraest_disc: "Tipo de Acceso ID",
    descripcion: "Descripción",
    fecha_creacion: "Fecha de Creación",
    fecha_actualizacion: "Fecha de Actualización",
  },
  tabla_categoria_eventos: {
    id_categoria_evento: "Código",
    nombre: "Nombre de Categoría",
    fecha_creacion: "Fecha de Creación",
    fecha_actualizacion: "Fecha de Actualización",
  },
  tabla_tipo_eventos: {
    id_tipo_evento: "Código",
    nombre: "Tipo de Evento",
    id_categoria_evento: "Categoría ID",
    fecha_creacion: "Fecha de Creación",
    fecha_actualizacion: "Fecha de Actualización",
  },
  tabla_categoria_boletos: {
    id_categoria_boleto: "Código",
    nombre_categoria_boleto: "Nombre de Categoría Boleto",
    fecha_creacion: "Fecha de Creación",
    fecha_actualizacion: "Fecha de Actualización",
  },
};


const queryMap: Record<string, string> = {
  sitios: `
    SELECT 
      s.id_sitio as "Código",
      s.nombre_sitio as "Nombre del Sitio",
      ts.nombre_tipo_sitio as "Tipo del Sitio",
      s.acceso_discapacidad as "Acceso para discapacitados",
      m.nombre_municipio as "Municipio",
      s.direccion as "Dirección",
      s.latitud as "Latitud",
      s.longitud as "Longitud",
      s.telefono_1 as "Teléfono 1",
      s.telefono_2 as "Teléfono 2",
      s.sitio_web as "Sitio Web",
      s.fecha_creacion as "Fecha de Creación",
      s.fecha_actualizacion as "Fecha de Actualización"
    FROM tabla_sitios s
    LEFT JOIN tabla_tipo_sitios ts ON s.id_tipo_sitio = ts.id_tipo_sitio
    LEFT JOIN tabla_municipios m ON s.id_municipio = m.id_municipio
    ORDER BY s.fecha_creacion DESC
    LIMIT $1
  `,
  sitios_disc: `
    SELECT 
      sd.id_sitios_disc as "Código",
      s.nombre_sitio as "Sitio",
      tid.nombre_infraest_disc as "Tipo de Acceso",
      sd.descripcion as "Descripción",
      sd.fecha_creacion as "Fecha de Creación",
      sd.fecha_actualizacion as "Fecha de Actualización"
    FROM tabla_sitios_disc sd
    LEFT JOIN tabla_sitios s ON sd.id_sitio = s.id_sitio
    LEFT JOIN tabla_tipo_infraest_disc tid ON sd.id_infraest_disc = tid.id_infraest_disc
    ORDER BY sd.fecha_creacion DESC
    LIMIT $1
  `,
  tipo_eventos: `
    SELECT 
      te.id_tipo_evento as "Código",
      te.nombre as "Tipo de Evento",
      ce.nombre as "Nombre de Categoría",
      te.fecha_creacion as "Fecha de Creación",
      te.fecha_actualizacion as "Fecha de Actualización"
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

    const aliases = columnAliases[tableName] || {}
    const rowsWithAliases = result.rows.map((row: any) => {
      const newRow: any = {}
      for (const key in row) {
         const alias = aliases[key] || key
         newRow[alias] = row[key] 
        } 
        return newRow 
      })

    return NextResponse.json({ rows: rowsWithAliases })
  } catch (error: any) {
    console.error("Error fetching data:", error)
    return NextResponse.json({ error: "Error al obtener datos" }, { status: 500 })
  }
}
