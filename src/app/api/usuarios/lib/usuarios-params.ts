import type { UsuariosFilters, UsuariosListingPayload } from "@/app/api/usuarios/lib/usuarios-types"

export function parseUsuariosFilters(req: Request): UsuariosFilters {
  const url = new URL(req.url)
  const roleRaw = url.searchParams.get("role")
  const rolesRaw = url.searchParams.get("roles")
  const estadoRaw = url.searchParams.get("estado")
  const qParam = (url.searchParams.get("q") || "").trim()

  const pageRaw = Number(url.searchParams.get("page") || "1")
  const pageSizeRaw = Number(url.searchParams.get("pageSize") || "25")

  const roleParam = roleRaw && Number.isFinite(Number(roleRaw)) ? Number(roleRaw) : null
  const rolesParam = rolesRaw
    ? rolesRaw
        .split(",")
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isFinite(value))
    : null
  const estadoParam = estadoRaw === null ? null : String(estadoRaw).toLowerCase() === "true"
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1
  const pageSize =
    Number.isFinite(pageSizeRaw) && pageSizeRaw > 0
      ? Math.min(Math.floor(pageSizeRaw), 200)
      : 25

  return {
    roleParam,
    rolesParam,
    estadoParam,
    qParam: qParam || null,
    page,
    pageSize,
  }
}

export function getUsuariosDefaultPayload(
  page: number,
  pageSize: number
): UsuariosListingPayload {
  return {
    usuarios: [],
    pagination: {
      page,
      pageSize,
      total: 0,
      totalPages: 1,
      hasPrev: false,
      hasNext: false,
    },
  }
}
