import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { table, data } = await req.json()

    if (!table || !data) {
      return NextResponse.json({ error: "Tabla y datos son requeridos" }, { status: 400 })
    }

    let query = ""
    let values: any[] = []
    let result

    switch (table) {
      case "paises":
        query = `INSERT INTO tabla_paises (id_pais, nombre_pais) VALUES ($1, $2) RETURNING id_pais, nombre_pais`
        values = [data.id_pais, data.nombre_pais]
        break

      case "departamentos":
      case "municipios":
        return NextResponse.json(
          { error: `Insercion deshabilitada para la tabla: ${table}` },
          { status: 400 }
        )

      case "tipo_sitios":
        query = `INSERT INTO tabla_tipo_sitios (id_tipo_sitio, nombre_tipo_sitio) VALUES ($1, $2) RETURNING id_tipo_sitio, nombre_tipo_sitio`
        values = [data.id_tipo_sitio, data.nombre_tipo_sitio]
        break

      case "sitios":
        result = await pool.query(
          `INSERT INTO tabla_sitios (id_sitio, nombre_sitio, id_tipo_sitio, id_municipio, direccion, latitud, longitud, sitio_web)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id_sitio, nombre_sitio, id_tipo_sitio, id_municipio, direccion, latitud, longitud, sitio_web`,
          [
            data.id_sitio,
            data.nombre_sitio,
            data.id_tipo_sitio,
            data.id_municipio,
            data.direccion,
            data.latitud,
            data.longitud,
            data.sitio_web || null,
          ]
        )

        if (data.telefono_1) {
          await pool.query(
            `INSERT INTO tabla_sitios_telefonos (id_sitio, telefono, es_principal)
             VALUES ($1, $2, TRUE)
             ON CONFLICT (telefono) DO NOTHING`,
            [data.id_sitio, data.telefono_1]
          )
        }

        if (data.telefono_2) {
          await pool.query(
            `INSERT INTO tabla_sitios_telefonos (id_sitio, telefono, es_principal)
             VALUES ($1, $2, FALSE)
             ON CONFLICT (telefono) DO NOTHING`,
            [data.id_sitio, data.telefono_2]
          )
        }

        return NextResponse.json(
          {
            success: true,
            message: `Datos insertados exitosamente en ${table}`,
            data: {
              ...result.rows[0],
              telefono_1: data.telefono_1 || null,
              telefono_2: data.telefono_2 || null,
              acceso_discapacidad: false,
            },
          },
          { status: 201 }
        )

      case "tipo_infraestructura_discapacitados":
      case "tipo_infraest_disc":
        query = `INSERT INTO tabla_tipo_infraestructura_discapacitados (id_infraestructura_discapacitados, nombre_infraestructura_discapacitados)
                 VALUES ($1, $2) RETURNING id_infraestructura_discapacitados, nombre_infraestructura_discapacitados`
        values = [
          data.id_infraestructura_discapacitados ?? data.id_infraest_disc,
          data.nombre_infraestructura_discapacitados ?? data.nombre_infraest_disc,
        ]
        break

      case "sitios_discapacitados":
      case "sitios_disc":
        query = `INSERT INTO tabla_sitios_discapacitados (id_sitios_discapacitados, id_sitio, id_infraestructura_discapacitados, descripcion)
                 VALUES ($1, $2, $3, $4) RETURNING id_sitios_discapacitados, id_sitio, id_infraestructura_discapacitados, descripcion`
        values = [
          data.id_sitios_discapacitados ?? data.id_sitios_disc,
          data.id_sitio,
          data.id_infraestructura_discapacitados ?? data.id_infraest_disc,
          data.descripcion,
        ]
        break

      case "tipo_eventos":
        query = `INSERT INTO tabla_tipo_eventos (id_tipo_evento, id_categoria_evento, nombre) 
                 VALUES ($1, $2, $3) RETURNING id_tipo_evento, id_categoria_evento, nombre`
        values = [data.id_tipo_evento, data.id_categoria_evento, data.nombre]
        break

      default:
        return NextResponse.json({ error: `Tabla desconocida: ${table}` }, { status: 400 })
    }

    result = await pool.query(query, values)

    return NextResponse.json(
      { 
        success: true, 
        message: `Datos insertados exitosamente en ${table}`,
        data: result.rows[0]
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error inserting data:", error)

    // Manejo específico de errores de base de datos
    let errorMessage = "Error al insertar los datos"

    if (error.code === "23505") {
      errorMessage = "El registro ya existe (violación de unicidad)"
    } else if (error.code === "23503") {
      errorMessage = "Error de integridad referencial: la clave foránea no existe"
    } else if (error.code === "23502") {
      errorMessage = "Falta un campo obligatorio"
    } else if (error.code === "22001") {
      errorMessage = "El valor es demasiado largo para el campo"
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
