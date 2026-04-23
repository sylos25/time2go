import pool from "@/lib/db"

import type { DepartamentoRow } from "@/app/api/departamentos/lib/departamentos-types"

export async function listDepartamentos(): Promise<DepartamentoRow[]> {
  const result = await pool.query<DepartamentoRow>(
    "SELECT id_departamento, nombre_departamento FROM tabla_departamentos ORDER BY nombre_departamento ASC"
  )

  return result.rows || []
}
