export type UsuariosListingPayload = {
  usuarios: unknown[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasPrev: boolean
    hasNext: boolean
  }
}

export type UsuariosFilters = {
  roleParam: number | null
  rolesParam: number[] | null
  estadoParam: boolean | null
  qParam: string | null
  page: number
  pageSize: number
}
