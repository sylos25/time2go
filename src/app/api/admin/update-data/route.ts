import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

type TableConfig = {
  tableName: string
  idColumn: string
  editableColumns: string[]
}

const TABLE_CONFIG: Record<string, TableConfig> = {
  paises: {
    tableName: "tabla_paises",
    idColumn: "id_pais",
    editableColumns: ["nombre_pais"],
  },
  departamentos: {
    tableName: "tabla_departamentos",
    idColumn: "id_departamento",
    editableColumns: ["nombre_departamento"],
  },
  municipios: {
    tableName: "tabla_municipios",
    idColumn: "id_municipio",
    editableColumns: ["nombre_municipio", "distrito", "area_metropolitana"],
  },
  tipo_sitios: {
    tableName: "tabla_tipo_sitios",
    idColumn: "id_tipo_sitio",
    editableColumns: ["nombre_tipo_sitio"],
  },
  sitios: {
    tableName: "tabla_sitios",
    idColumn: "id_sitio",
    editableColumns: ["nombre_sitio", "acceso_discapacidad", "direccion", "latitud", "longitud", "telefono_1", "telefono_2", "sitio_web"],
  },
  tipo_infraestructura_discapacitados: {
    tableName: "tabla_tipo_infraestructura_discapacitados",
    idColumn: "id_infraestructura_discapacitados",
    editableColumns: ["nombre_infraestructura_discapacitados"],
  },
  sitios_discapacitados: {
    tableName: "tabla_sitios_discapacitados",
    idColumn: "id_sitios_discapacitados",
    editableColumns: ["descripcion"],
  },
  categoria_eventos: {
    tableName: "tabla_categoria_eventos",
    idColumn: "id_categoria_evento",
    editableColumns: ["nombre"],
  },
  tipo_eventos: {
    tableName: "tabla_tipo_eventos",
    idColumn: "id_tipo_evento",
    editableColumns: ["nombre"],
  },
  eventos: {
    tableName: "tabla_eventos",
    idColumn: "id_evento",
    editableColumns: [
      "id_publico_evento",
      "pulep_evento",
      "nombre_evento",
      "responsable_evento",
      "descripcion",
      "telefono_1",
      "telefono_2",
      "fecha_inicio",
      "fecha_fin",
      "hora_inicio",
      "hora_final",
      "gratis_pago",
      "cupo",
      "reservar_anticipado",
      "estado",
    ],
  },
  eventos_informacion_importante: {
    tableName: "tabla_evento_informacion_importante",
    idColumn: "id_evento_info_item",
    editableColumns: ["detalle", "obligatorio"],
  },
  boleteria: {
    tableName: "tabla_boleteria",
    idColumn: "id_boleto",
    editableColumns: ["nombre_boleto", "precio_boleto", "servicio"],
  },
  links: {
    tableName: "tabla_links",
    idColumn: "id_link",
    editableColumns: ["link"],
  },
}

export async function PUT(req: NextRequest) {
  try {
    const { table, id, data } = await req.json()

    if (!table || id === undefined || id === null || !data || typeof data !== "object") {
      return NextResponse.json({ error: "table, id y data son requeridos" }, { status: 400 })
    }

    const config = TABLE_CONFIG[table]
    if (!config) {
      return NextResponse.json({ error: `Tabla desconocida: ${table}` }, { status: 400 })
    }

    const filteredEntries = Object.entries(data).filter(([key]) => config.editableColumns.includes(key))

    if (filteredEntries.length === 0) {
      return NextResponse.json({ error: "No hay campos editables para actualizar" }, { status: 400 })
    }

    const setClauses = filteredEntries.map(([key], index) => `${key} = $${index + 1}`)
    const values = filteredEntries.map(([, value]) => value)
    values.push(id)

    const query = `
      UPDATE ${config.tableName}
      SET ${setClauses.join(", ")}
      WHERE ${config.idColumn} = $${values.length}
      RETURNING *
    `

    const result = await pool.query(query, values)

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Registro actualizado correctamente",
      data: result.rows[0],
    })
  } catch (error: any) {
    console.error("Error updating data:", error)

    let errorMessage = "Error al actualizar los datos"

    if (error.code === "23503") {
      errorMessage = "Error de integridad referencial: uno de los valores relacionados no existe"
    } else if (error.code === "23502") {
      errorMessage = "Falta un campo obligatorio"
    } else if (error.code === "22001") {
      errorMessage = "Uno de los valores excede el tamaño permitido"
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
