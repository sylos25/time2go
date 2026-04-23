import pool from "@/lib/db"

import type { MunicipioRow } from "@/app/api/municipios/lib/municipios-types"

export async function listMunicipios(): Promise<MunicipioRow[]> {
  const result = await pool.query<MunicipioRow>(
    `SELECT m.id_municipio, m.nombre_municipio, m.id_departamento
     FROM tabla_municipios m
     ORDER BY m.nombre_municipio ASC`
  )

  return result.rows || []
}

export async function listMunicipiosBySitioId(sitioId: number): Promise<MunicipioRow[]> {
  const result = await pool.query<MunicipioRow>(
    `SELECT m.id_municipio, m.nombre_municipio, m.id_departamento
     FROM tabla_municipios m
     INNER JOIN tabla_sitios s ON m.id_municipio = s.id_municipio
     WHERE s.id_sitio = $1`,
    [sitioId]
  )

  return result.rows || []
}
