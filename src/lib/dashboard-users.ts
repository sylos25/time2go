export type BanCategory = {
  id: number
  nombre: string
}

export type BanReason = {
  id: number
  categoria: number
  motivo: string
}

export type UserRow = {
  id_usuario: number
  id_rol?: number
  id_google?: string | null
  nombres?: string
  apellidos?: string
  telefono?: string | null
  correo?: string
  validacion_correo?: boolean
  estado?: boolean
}

export type MeUser = {
  id_usuario: number
  id_rol?: number | string
  nombre_rol?: string
  nombres?: string
  apellidos?: string
}

export type BanFormState = {
  id_usuario: number
  id_categoria: number
  id_motivo_ban: number
  inicio_ban: string
  duracion_dias: number
}

export type UsersMessage = {
  type: "error" | "success"
  text: string
} | null

export const CATEGORIAS_BAN: BanCategory[] = [
  { id: 1, nombre: "Cuenta y verificacion" },
  { id: 2, nombre: "Seguridad del sistema" },
  { id: 3, nombre: "Fraude y transacciones" },
  { id: 4, nombre: "Contenido inapropiado o ilegal" },
  { id: 5, nombre: "Comportamiento y resenas" },
  { id: 6, nombre: "Organizacion de eventos" },
  { id: 7, nombre: "Abuso del sistema" },
  { id: 8, nombre: "Administrativo" },
]

export const MOTIVOS_BAN: BanReason[] = [
  { id: 1, categoria: 1, motivo: "Uso de identidad falsa o suplantacion de identidad" },
  { id: 2, categoria: 1, motivo: "Provision de datos personales falsos en la verificacion" },
  { id: 3, categoria: 1, motivo: "Creacion de multiples cuentas para evadir bloqueos o restricciones" },
  { id: 4, categoria: 1, motivo: "Uso de bots o automatizaciones no autorizadas en la plataforma" },
  { id: 5, categoria: 2, motivo: "Intento de hackeo o manipulacion del sistema" },
  { id: 6, categoria: 2, motivo: "Acceso no autorizado a cuentas ajenas" },
  { id: 7, categoria: 2, motivo: "Explotacion de vulnerabilidades del sistema (exploits)" },
  { id: 8, categoria: 2, motivo: "Generacion de intentos maliciosos y repetitivos de autenticacion" },
  { id: 9, categoria: 3, motivo: "Intento de fraude o manipulacion en pagos de la plataforma" },
  { id: 10, categoria: 3, motivo: "Solicitudes de reembolso fraudulentas o sin justificacion valida" },
  { id: 11, categoria: 3, motivo: "Compra o venta de entradas fuera del sistema oficial de la plataforma" },
  { id: 12, categoria: 3, motivo: "Reventa ilegal o manipulacion de precios dentro de la plataforma" },
  { id: 13, categoria: 4, motivo: "Publicacion de contenido ilegal dentro de la plataforma" },
  { id: 14, categoria: 4, motivo: "Publicacion de contenido violento, amenazante o intimidatorio" },
  { id: 15, categoria: 4, motivo: "Uso de lenguaje discriminatorio, racista o discurso de odio" },
  { id: 16, categoria: 4, motivo: "Publicacion de contenido sexual explicito o inapropiado" },
  { id: 17, categoria: 4, motivo: "Difusion de informacion personal de otros usuarios (doxxing)" },
  { id: 18, categoria: 5, motivo: "Publicacion de valoraciones o resenas falsas de forma reiterada" },
  { id: 19, categoria: 5, motivo: "Spam en comentarios, resenas o secciones de la plataforma" },
  { id: 20, categoria: 5, motivo: "Acoso reiterado hacia otros usuarios de la plataforma" },
  { id: 21, categoria: 5, motivo: "Amenazas hacia usuarios, moderadores o administradores del sistema" },
  { id: 22, categoria: 6, motivo: "Cancelacion reiterada de eventos sin justificacion valida" },
  { id: 23, categoria: 6, motivo: "Organizacion de eventos sin contar con los permisos legales requeridos" },
  { id: 24, categoria: 6, motivo: "Publicacion de eventos con informacion enganosa, falsa o fraudulenta" },
  { id: 25, categoria: 6, motivo: "Incumplimiento de medidas de seguridad en eventos organizados" },
  { id: 26, categoria: 6, motivo: "Reproduccion de contenido con derechos de autor sin autorizacion en eventos" },
  { id: 27, categoria: 6, motivo: "Incumplimiento deliberado de las normas de accesibilidad del sistema" },
  { id: 28, categoria: 7, motivo: "Creacion de eventos falsos con intencion de spam o engano" },
  { id: 29, categoria: 7, motivo: "Manipulacion de algoritmos de visibilidad o busqueda del sistema" },
  { id: 30, categoria: 7, motivo: "Uso indebido y reiterado de herramientas de reporte con falsos reportes" },
  { id: 31, categoria: 7, motivo: "Evasion deliberada de restricciones o penalizaciones activas" },
  { id: 32, categoria: 8, motivo: "Incumplimiento reiterado de las normativas generales del software" },
  { id: 33, categoria: 8, motivo: "Negativa a cumplir solicitudes o directrices del equipo administrativo" },
  { id: 34, categoria: 8, motivo: "Conductas que afectan gravemente la experiencia de otros usuarios" },
  { id: 35, categoria: 8, motivo: "Acciones que generan riesgo legal o reputacional para la plataforma" },
]

export function formatDateTimeLocal(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

export function addDaysToDateTimeLocal(dateTimeLocal: string, days: number) {
  const date = new Date(dateTimeLocal)
  if (Number.isNaN(date.getTime())) {
    return formatDateTimeLocal(new Date(Date.now() + days * 86400000))
  }

  date.setTime(date.getTime() + days * 86400000)
  return formatDateTimeLocal(date)
}

function getAuthHeaders(contentType = false): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const headers: Record<string, string> = {}

  if (contentType) {
    headers["Content-Type"] = "application/json"
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export async function fetchCurrentUser() {
  const response = await fetch("/api/me", { headers: getAuthHeaders(false) })
  if (!response.ok) return null

  const data = await response.json().catch(() => ({}))
  return (data?.user || null) as MeUser | null
}

export async function fetchUsers(params: { search: string; page: number; pageSize: number }) {
  const query = new URLSearchParams({
    roles: "1,2",
    page: String(params.page),
    pageSize: String(params.pageSize),
  })

  if (params.search.trim()) {
    query.set("q", params.search.trim())
  }

  const response = await fetch(`/api/usuarios?${query.toString()}`, { headers: getAuthHeaders(false) })
  if (!response.ok) {
    return {
      usuarios: [] as UserRow[],
      total: 0,
      totalPages: 1,
    }
  }

  const data = await response.json().catch(() => ({}))
  return {
    usuarios: (data.usuarios || []) as UserRow[],
    total: Number(data?.pagination?.total || 0),
    totalPages: Number(data?.pagination?.totalPages || 1),
  }
}

export async function banUser(payload: {
  idUsuario: number
  idMotivoBan: number
  inicioBan: string
  finBan: string
  responsable: number
}) {
  const response = await fetch(`/api/usuarios/${encodeURIComponent(String(payload.idUsuario))}/ban`, {
    method: "PUT",
    headers: getAuthHeaders(true),
    body: JSON.stringify({
      action: "ban",
      id_usuario: payload.idUsuario,
      motivo_ban: payload.idMotivoBan,
      inicio_ban: payload.inicioBan,
      fin_ban: payload.finBan,
      responsable: payload.responsable,
    }),
  })

  const data = await response.json().catch(() => ({}))
  return {
    ok: response.ok && !!data?.ok,
    message: data?.message as string | undefined,
  }
}

export async function validateUserAccount(idUsuario: number) {
  const response = await fetch(`/api/usuarios/${encodeURIComponent(String(idUsuario))}/ban`, {
    method: "PUT",
    headers: getAuthHeaders(true),
    body: JSON.stringify({ action: "validate" }),
  })

  const data = await response.json().catch(() => ({}))
  return {
    ok: response.ok && !!data?.ok,
    message: data?.message as string | undefined,
  }
}
