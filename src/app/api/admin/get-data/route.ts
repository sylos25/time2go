import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

const allowed: Record<string, string> = {
  paises: "tabla_paises",
  departamentos: "tabla_departamentos",
  municipios: "tabla_municipios",
  tipo_sitios: "tabla_tipo_sitios",
  sitios: "tabla_sitios",
  tipo_infraestructura_discapacitados: "tabla_tipo_infraestructura_discapacitados",
  sitios_discapacitados: "tabla_sitios_discapacitados",
  categoria_eventos: "tabla_categoria_eventos",
  tipo_eventos: "tabla_tipo_eventos",
  eventos: "tabla_eventos",
  eventos_informacion_importante: "tabla_evento_informacion_importante",
  boleteria: "tabla_boleteria",
  links: "tabla_links",

  // Compatibilidad con claves antiguas
  tipo_infraest_disc: "tabla_tipo_infraestructura_discapacitados",
  sitios_disc: "tabla_sitios_discapacitados",
  categoria_boletos: "tabla_categoria_boletos",
}

// Define queries with JOINs for foreign key relationships
const queryMap: Record<string, string> = {
  departamentos: `
    SELECT
      d.id_departamento,
      d.nombre_departamento,
      p.nombre_pais,
      d.fecha_creacion,
      d.fecha_actualizacion
    FROM tabla_departamentos d
    LEFT JOIN tabla_paises p ON d.id_pais = p.id_pais
    ORDER BY d.fecha_creacion DESC
    LIMIT $1
  `,
  municipios: `
    SELECT
      m.id_municipio,
      m.nombre_municipio,
      m.distrito,
      m.area_metropolitana,
      d.nombre_departamento,
      p.nombre_pais,
      m.fecha_creacion,
      m.fecha_actualizacion
    FROM tabla_municipios m
    LEFT JOIN tabla_departamentos d ON m.id_departamento = d.id_departamento
    LEFT JOIN tabla_paises p ON d.id_pais = p.id_pais
    ORDER BY m.fecha_creacion DESC
    LIMIT $1
  `,
  sitios: `
    SELECT 
      s.id_sitio,
      s.nombre_sitio,
      ts.nombre_tipo_sitio,
      s.acceso_discapacidad,
      m.nombre_municipio,
      d.nombre_departamento,
      p.nombre_pais,
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
    LEFT JOIN tabla_municipios m ON s.id_municipio = m.id_municipio
    LEFT JOIN tabla_departamentos d ON m.id_departamento = d.id_departamento
    LEFT JOIN tabla_paises p ON d.id_pais = p.id_pais
    ORDER BY s.fecha_creacion DESC
    LIMIT $1
  `,
  sitios_discapacitados: `
    SELECT 
      sd.id_sitios_discapacitados,
      s.nombre_sitio,
      tid.nombre_infraestructura_discapacitados,
      sd.descripcion,
      sd.fecha_creacion,
      sd.fecha_actualizacion
    FROM tabla_sitios_discapacitados sd
    LEFT JOIN tabla_sitios s ON sd.id_sitio = s.id_sitio
    LEFT JOIN tabla_tipo_infraestructura_discapacitados tid ON sd.id_infraestructura_discapacitados = tid.id_infraestructura_discapacitados
    ORDER BY sd.fecha_creacion DESC
    LIMIT $1
  `,
  tipo_infraestructura_discapacitados: `
    SELECT
      id_infraestructura_discapacitados,
      nombre_infraestructura_discapacitados,
      fecha_creacion,
      fecha_actualizacion
    FROM tabla_tipo_infraestructura_discapacitados
    ORDER BY fecha_creacion DESC
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
  eventos: `
    SELECT
      e.id_evento,
      e.id_publico_evento,
      e.pulep_evento,
      e.nombre_evento,
      e.responsable_evento,
      u.nombres || ' ' || u.apellidos AS usuario_creador,
      ce.nombre AS categoria_evento,
      te.nombre AS tipo_evento,
      s.nombre_sitio,
      e.descripcion,
      e.telefono_1,
      e.telefono_2,
      e.fecha_inicio,
      e.fecha_fin,
      e.hora_inicio,
      e.hora_final,
      e.gratis_pago,
      e.cupo,
      e.reservar_anticipado,
      e.estado,
      e.fecha_creacion,
      e.fecha_actualizacion,
      e.fecha_desactivacion
    FROM tabla_eventos e
    LEFT JOIN tabla_usuarios u ON e.id_usuario = u.id_usuario
    LEFT JOIN tabla_categoria_eventos ce ON e.id_categoria_evento = ce.id_categoria_evento
    LEFT JOIN tabla_tipo_eventos te ON e.id_tipo_evento = te.id_tipo_evento
    LEFT JOIN tabla_sitios s ON e.id_sitio = s.id_sitio
    ORDER BY e.fecha_creacion DESC
    LIMIT $1
  `,
  eventos_informacion_importante: `
    SELECT
      ei.id_evento_info_item,
      e.nombre_evento,
      ei.detalle,
      ei.obligatorio,
      ei.fecha_creacion,
      ei.fecha_actualizacion
    FROM tabla_evento_informacion_importante ei
    LEFT JOIN tabla_eventos e ON ei.id_evento = e.id_evento
    ORDER BY ei.fecha_creacion DESC
    LIMIT $1
  `,
  boleteria: `
    SELECT
      b.id_boleto,
      e.nombre_evento,
      b.nombre_boleto,
      b.precio_boleto,
      b.servicio,
      b.fecha_creacion,
      b.fecha_actualizacion
    FROM tabla_boleteria b
    LEFT JOIN tabla_eventos e ON b.id_evento = e.id_evento
    ORDER BY b.fecha_creacion DESC
    LIMIT $1
  `,
  links: `
    SELECT
      l.id_link,
      e.nombre_evento,
      l.link,
      l.fecha_creacion,
      l.fecha_actualizacion
    FROM tabla_links l
    LEFT JOIN tabla_eventos e ON l.id_evento = e.id_evento
    ORDER BY l.fecha_creacion DESC
    LIMIT $1
  `,

  // Compatibilidad con claves antiguas
  tipo_infraest_disc: `
    SELECT
      id_infraestructura_discapacitados,
      nombre_infraestructura_discapacitados,
      fecha_creacion,
      fecha_actualizacion
    FROM tabla_tipo_infraestructura_discapacitados
    ORDER BY fecha_creacion DESC
    LIMIT $1
  `,
  sitios_disc: `
    SELECT 
      sd.id_sitios_discapacitados,
      s.nombre_sitio,
      tid.nombre_infraestructura_discapacitados,
      sd.descripcion,
      sd.fecha_creacion,
      sd.fecha_actualizacion
    FROM tabla_sitios_discapacitados sd
    LEFT JOIN tabla_sitios s ON sd.id_sitio = s.id_sitio
    LEFT JOIN tabla_tipo_infraestructura_discapacitados tid ON sd.id_infraestructura_discapacitados = tid.id_infraestructura_discapacitados
    ORDER BY sd.fecha_creacion DESC
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
