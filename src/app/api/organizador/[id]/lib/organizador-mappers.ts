import type { OrganizadorEventoRow } from "@/app/api/organizador/[id]/lib/organizador-types"

export function mapOrganizadorEventos(rows: OrganizadorEventoRow[]) {
  return rows.map((ev) => ({
    ...ev,
    imagenes: ev.imagen_portada ? [ev.imagen_portada] : [],
  }))
}
