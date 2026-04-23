export type UserRow = {
  id_usuario: number
  id_rol: number
  nombre_rol: string
  estado: boolean
  nombres: string | null
  apellidos: string | null
  correo: string | null
}

export type RoleRow = {
  id_rol: number
  nombre_rol: string
}

export type AccessRow = {
  id_accesibilidad: number
  nombre_accesibilidad: string
}

export type LoadPayload = {
  users: UserRow[]
  roles: RoleRow[]
  accessibilityItems: AccessRow[]
  selectedRoleId: number
  selectedRoleAccessIds: number[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasPrev: boolean
    hasNext: boolean
  }
}

type QueryParams = {
  page: number
  pageSize: number
  roleId: number
  q?: string
}

type ApiResponse = {
  ok?: boolean
  message?: string
  [key: string]: unknown
}

export function getAuthHeaders(contentTypeJson = false): HeadersInit {
  const headers: HeadersInit = {}
  if (contentTypeJson) {
    headers["Content-Type"] = "application/json"
  }
  return headers
}

async function parseApiJson(response: Response): Promise<ApiResponse> {
  return response.json().catch(() => ({})) as Promise<ApiResponse>
}

export async function fetchCurrentUserRole(): Promise<number> {
  const response = await fetch("/api/me", {
    headers: getAuthHeaders(),
    credentials: "include",
  })

  const data = await parseApiJson(response)
  return Number((data as { user?: { id_rol?: number } })?.user?.id_rol)
}

export async function fetchRoleAccessData(params: QueryParams): Promise<LoadPayload> {
  const query = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    roleId: String(params.roleId),
  })

  if (params.q?.trim()) {
    query.set("q", params.q.trim())
  }

  const response = await fetch(`/api/admin/role-access?${query.toString()}`, {
    headers: getAuthHeaders(),
    credentials: "include",
  })

  const data = await parseApiJson(response)
  if (!response.ok || !data.ok) {
    throw new Error(data.message || "No se pudo cargar la administración de roles")
  }

  return data as unknown as LoadPayload
}

export async function updateUserRole(userId: number, newRoleId: number) {
  const response = await fetch("/api/admin/role-access", {
    method: "PUT",
    headers: getAuthHeaders(true),
    credentials: "include",
    body: JSON.stringify({
      action: "updateUserRole",
      userId,
      newRoleId,
    }),
  })

  const data = await parseApiJson(response)
  if (!response.ok || !data.ok) {
    throw new Error(data.message || "No fue posible actualizar el rol")
  }
}

export async function updateRoleAccess(roleId: number, accessIds: number[]) {
  const response = await fetch("/api/admin/role-access", {
    method: "PUT",
    headers: getAuthHeaders(true),
    credentials: "include",
    body: JSON.stringify({
      action: "setRoleAccess",
      roleId,
      accessIds,
    }),
  })

  const data = await parseApiJson(response)
  if (!response.ok || !data.ok) {
    throw new Error(data.message || "No fue posible actualizar la accesibilidad del rol")
  }
}
