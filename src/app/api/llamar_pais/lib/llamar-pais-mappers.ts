import type { PaisOption, PaisRow } from "@/app/api/llamar_pais/lib/llamar-pais-types"

export function mapPaisesToOptions(rows: PaisRow[]): PaisOption[] {
  return rows.map((pais) => ({
    value: Number(pais.id_pais),
    label: String(pais.nombre_pais || ""),
  }))
}
