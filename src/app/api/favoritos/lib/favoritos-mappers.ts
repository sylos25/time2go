import type { FavoriteRow } from "@/app/api/favoritos/lib/favoritos-types"

export function mapFavoriteRowsToIds(rows: FavoriteRow[]): number[] {
  return rows
    .map((row) => Number(row.id_evento))
    .filter((value) => Number.isFinite(value))
}
