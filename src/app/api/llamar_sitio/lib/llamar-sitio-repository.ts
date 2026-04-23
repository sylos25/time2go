import pool from "@/lib/db"

import type { SitioLookupRow } from "@/app/api/llamar_sitio/lib/llamar-sitio-types"

export async function searchSitios(nombreSitio: string): Promise<SitioLookupRow[]> {
  const query = nombreSitio
    ? `
        SELECT id_sitio, nombre_sitio
        FROM tabla_sitios
        WHERE LOWER(nombre_sitio) LIKE LOWER($1)
        ORDER BY nombre_sitio ASC
        LIMIT 7
      `
    : `
        SELECT id_sitio, nombre_sitio
        FROM tabla_sitios
        ORDER BY nombre_sitio ASC
        LIMIT 7
      `

  const params = nombreSitio ? [`%${nombreSitio}%`] : []
  const result = await pool.query<SitioLookupRow>(query, params)

  return result.rows || []
}
