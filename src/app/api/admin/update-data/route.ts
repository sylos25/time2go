import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { PERMISSION_IDS, requirePermission } from "@/lib/permissions"
type ApiErrorWithCode = { code?: string }

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
    editableColumns: ["nombre_municipio", "es_distrito", "area_metropolitana"],
  },
  tipo_sitios: {
    tableName: "tabla_tipo_sitios",
    idColumn: "id_tipo_sitio",
    editableColumns: ["nombre_tipo_sitio"],
  },
  sitios: {
    tableName: "tabla_sitios",
    idColumn: "id_sitio",
    editableColumns: ["nombre_sitio", "direccion", "latitud", "longitud", "telefono_1", "telefono_2", "sitio_web"],
  },
  tipo_infraestructura_discapacitados: {
    tableName: "tabla_tipo_infraestructura_discapacitados",
    idColumn: "id_infraestructura_discapacitados",
    editableColumns: ["nombre_infraestructura_discapacitados"],
  },
  sitios_discapacitados: {
    tableName: "tabla_sitios_discapacitados",
    idColumn: "id_sitios_discapacitados",
    editableColumns: ["descripcion_relacional"],
  },
  categoria_eventos: {
    tableName: "tabla_categoria_eventos",
    idColumn: "id_categoria_evento",
    editableColumns: ["nombre"],
  },
  tipo_eventos: {
    tableName: "tabla_tipo_eventos",
    idColumn: "id_tipo_evento",
    editableColumns: ["nombre_tipo_evento"],
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
      "fecha_inicio",
      "fecha_fin",
      "hora_inicio",
      "hora_final",
      "gratis_pago",
      "cupo",
      "reservar_anticipado",
      "estado",
      "motivo_rechazo",
      "rechazo_por",
      "destacado",
      "destacado_por_usuario",
      "fecha_destacado",
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
  const denied = await requirePermission(req, PERMISSION_IDS.INGRESAR_DATOS)
  if (denied) return denied

  try {
    const { table, id, data } = await req.json()

    if (!table || id === undefined || id === null || !data || typeof data !== "object") {
      return NextResponse.json({ error: "table, id y data son requeridos" }, { status: 400 })
    }

    const config = TABLE_CONFIG[table]
    if (!config) {
      return NextResponse.json({ error: `Tabla desconocida: ${table}` }, { status: 400 })
    }

    const normalizedData = { ...data }
    if (table === "municipios" && Object.prototype.hasOwnProperty.call(normalizedData, "distrito")) {
      normalizedData.es_distrito = normalizedData.distrito
      delete normalizedData.distrito
    }

    if (table === "sitios_discapacitados" && Object.prototype.hasOwnProperty.call(normalizedData, "descripcion")) {
      normalizedData.descripcion_relacional = normalizedData.descripcion
      delete normalizedData.descripcion
    }

    if (table === "tipo_eventos" && Object.prototype.hasOwnProperty.call(normalizedData, "nombre")) {
      normalizedData.nombre_tipo_evento = normalizedData.nombre
      delete normalizedData.nombre
    }

    if (table === "eventos" && Object.prototype.hasOwnProperty.call(normalizedData, "destacado_por")) {
      normalizedData.destacado_por_usuario = normalizedData.destacado_por
      delete normalizedData.destacado_por
    }

    if (table === "sitios") {
      const siteFields = ["nombre_sitio", "direccion", "latitud", "longitud", "sitio_web"]
      const siteEntries = Object.entries(normalizedData).filter(([key]) => siteFields.includes(key))
      const phone1 = typeof normalizedData.telefono_1 === "string" ? normalizedData.telefono_1.trim() : normalizedData.telefono_1
      const phone2 = typeof normalizedData.telefono_2 === "string" ? normalizedData.telefono_2.trim() : normalizedData.telefono_2
      const client = await pool.connect()
      try {
        await client.query("BEGIN")
        if (siteEntries.length > 0) {
          const setClauses = siteEntries.map(([key], index) => `${key} = $${index + 1}`)
          const values = siteEntries.map(([, value]) => value)
          values.push(id)
          await client.query(
            `UPDATE tabla_sitios
             SET ${setClauses.join(", ")}
             WHERE id_sitio = $${values.length}`,
            values
          )
        }

        for (const [rawPhone, isPrimary] of [[phone1, true], [phone2, false]] as const) {
          const sanitizedPhone = rawPhone ? String(rawPhone).replace(/\D/g, "") : ""
          await client.query(
            `DELETE FROM tabla_sitios_telefonos
             WHERE id_sitio = $1 AND es_principal = $2`,
            [id, isPrimary]
          )

          if (sanitizedPhone) {
            await client.query(
              `INSERT INTO tabla_sitios_telefonos (id_sitio, telefono_sitio, es_principal)
               VALUES ($1, $2, $3)`,
              [id, sanitizedPhone, isPrimary]
            )
          }
        }

        const result = await client.query(
          `SELECT
             s.id_sitio,
             s.nombre_sitio,
             s.direccion,
             s.latitud,
             s.longitud,
             s.sitio_web,
             tel_principal.telefono_sitio AS telefono_1,
             tel_secundario.telefono_sitio AS telefono_2
           FROM tabla_sitios s
           LEFT JOIN LATERAL (
             SELECT telefono_sitio
             FROM tabla_sitios_telefonos
             WHERE id_sitio = s.id_sitio AND es_principal = TRUE
             ORDER BY fecha_creacion ASC
             LIMIT 1
           ) tel_principal ON TRUE
           LEFT JOIN LATERAL (
             SELECT telefono_sitio
             FROM tabla_sitios_telefonos
             WHERE id_sitio = s.id_sitio AND es_principal = FALSE
             ORDER BY fecha_creacion ASC
             LIMIT 1
           ) tel_secundario ON TRUE
           WHERE s.id_sitio = $1`,
          [id]
        )

        await client.query("COMMIT")

        if (result.rows.length === 0) {
          return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          message: "Registro actualizado correctamente",
          data: result.rows[0],
        })
      } catch (error) {
        await client.query("ROLLBACK")
        throw error
      } finally {
        client.release()
      }
    }

    const filteredEntries = Object.entries(normalizedData).filter(([key]) => config.editableColumns.includes(key))

    if (filteredEntries.length === 0) {
      return NextResponse.json({ error: "No hay campos editables para actualizar" }, { status: 400 })
    }

    const setClauses = filteredEntries.map(([key], index) => `${key} = $${index + 1}`)
    const values = filteredEntries.map(([, value]) => value)
    values.push(id)
    const returningColumns = [config.idColumn, ...config.editableColumns].join(", ")

    const query = `
      UPDATE ${config.tableName}
      SET ${setClauses.join(", ")}
      WHERE ${config.idColumn} = $${values.length}
      RETURNING ${returningColumns}
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
  } catch (error: unknown) {
    console.error("Error updating data:", error)

    let errorMessage = "Error al actualizar los datos"
    const errorCode = (error as ApiErrorWithCode).code

    if (errorCode === "23503") {
      errorMessage = "Error de integridad referencial: uno de los valores relacionados no existe"
    } else if (errorCode === "23502") {
      errorMessage = "Falta un campo obligatorio"
    } else if (errorCode === "22001") {
      errorMessage = "Uno de los valores excede el tamaño permitido"
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
