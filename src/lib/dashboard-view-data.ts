export type TableKey =
  | "paises"
  | "departamentos"
  | "municipios"
  | "tipo_sitios"
  | "sitios"
  | "tipo_infraestructura_discapacitados"
  | "sitios_discapacitados"
  | "categoria_eventos"
  | "tipo_eventos"

export type DataRow = Record<string, unknown>

export const COLUMN_LABELS: Record<string, string> = {
  id_pais: "ID Pais",
  nombre_pais: "Pais",
  id_departamento: "ID Departamento",
  nombre_departamento: "Departamento",
  id_municipio: "ID Municipio",
  nombre_municipio: "Municipio",
  distrito: "Distrito",
  area_metropolitana: "Area Metropolitana",
  id_tipo_sitio: "ID Tipo de Sitio",
  nombre_tipo_sitio: "Tipo de Sitio",
  id_sitio: "ID Sitio",
  nombre_sitio: "Sitio",
  acceso_discapacidad: "Acceso para Discapacidad",
  direccion: "Direccion",
  latitud: "Latitud",
  longitud: "Longitud",
  infraestructura_discapacitados: "Infraestructura de Accesibilidad",
  telefono_1: "Telefono 1",
  telefono_2: "Telefono 2",
  sitio_web: "Sitio Web",
  id_infraestructura_discapacitados: "ID Infraestructura Discapacitados",
  nombre_infraestructura_discapacitados: "Infraestructura para Discapacitados",
  id_sitios_discapacitados: "ID Sitio Discapacitados",
  descripcion: "Descripcion",
  id_categoria_evento: "ID Categoria",
  categoria_evento: "Categoria",
  nombre_categoria_evento: "Categoria de Evento",
  id_tipo_evento: "ID Tipo de Evento",
  id_evento: "ID Evento",
  id_evento_info_item: "ID Info Evento",
  id_publico_evento: "ID Publico Evento",
  pulep_evento: "PULEP",
  nombre_evento: "Nombre del Evento",
  responsable_evento: "Responsable",
  usuario_creador: "Usuario Creador",
  tipo_evento: "Tipo de Evento",
  detalle: "Detalle",
  obligatorio: "Obligatorio",
  gratis_pago: "De Pago o Gratis",
  cupo: "Cupo",
  reservar_anticipado: "Requiere Reserva Anticipada",
  estado: "Estado",
  fecha_inicio: "Fecha Inicio",
  fecha_fin: "Fecha Final",
  hora_inicio: "Hora Inicio",
  hora_final: "Hora Final",
  fecha_desactivacion: "Fecha Desactivacion",
  fecha_creacion: "Fecha Creacion",
  fecha_actualizacion: "Fecha Actualizacion",
  id_boleto: "ID Boleto",
  nombre_boleto: "Boleto",
  precio_boleto: "Precio",
  servicio: "Servicio",
  id_link: "ID Link",
  link: "Link",
}

export const TABLE_ID_COLUMN: Record<TableKey, string> = {
  paises: "id_pais",
  departamentos: "id_departamento",
  municipios: "id_municipio",
  tipo_sitios: "id_tipo_sitio",
  sitios: "id_sitio",
  tipo_infraestructura_discapacitados: "id_infraestructura_discapacitados",
  sitios_discapacitados: "id_sitios_discapacitados",
  categoria_eventos: "id_categoria_evento",
  tipo_eventos: "id_tipo_evento",
}

export const TABLE_EDITABLE_FIELDS: Record<TableKey, string[]> = {
  paises: ["nombre_pais"],
  departamentos: ["nombre_departamento"],
  municipios: ["nombre_municipio", "distrito", "area_metropolitana"],
  tipo_sitios: ["nombre_tipo_sitio"],
  sitios: ["nombre_sitio", "direccion", "telefono_1", "telefono_2", "sitio_web"],
  tipo_infraestructura_discapacitados: ["nombre_infraestructura_discapacitados"],
  sitios_discapacitados: ["descripcion"],
  categoria_eventos: ["nombre"],
  tipo_eventos: ["nombre"],
}

export const TABLE_HIDDEN_COLUMNS: Partial<Record<TableKey, string[]>> = {
  sitios: ["infraestructura_discapacitados", "latitud", "longitud", "acceso_discapacidad", "nombre_pais", "pais"],
}

export const TABLE_NAV_ITEMS: Array<{ key: TableKey; label: string }> = [
  { key: "paises", label: "Paises" },
  { key: "departamentos", label: "Departamentos" },
  { key: "municipios", label: "Municipios" },
  { key: "tipo_sitios", label: "Tipos de sitio" },
  { key: "sitios", label: "Sitios para eventos" },
  { key: "tipo_infraestructura_discapacitados", label: "Infraestructura para discapacitados" },
  { key: "sitios_discapacitados", label: "Sitios con acceso inclusivo" },
  { key: "categoria_eventos", label: "Categorias de eventos" },
  { key: "tipo_eventos", label: "Tipos de eventos" },
]

export function isTableKey(value: string | null): value is TableKey {
  if (!value) return false
  return TABLE_NAV_ITEMS.some((item) => item.key === value)
}

export function getColumnLabel(column: string): string {
  if (COLUMN_LABELS[column]) return COLUMN_LABELS[column]
  return column
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function isIdColumn(column: string): boolean {
  const normalized = column.toLowerCase()
  return normalized.startsWith("id_") || normalized.endsWith("_id")
}

function isDateLikeColumn(column: string): boolean {
  const normalized = column.toLowerCase()
  return normalized.includes("fecha") || normalized.includes("date")
}

function formatDateTimeReadable(value: unknown): string {
  if (value === null || value === undefined || value === "") return ""

  const raw = String(value).trim()
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return raw

  const day = String(parsed.getDate()).padStart(2, "0")
  const month = String(parsed.getMonth() + 1).padStart(2, "0")
  const year = parsed.getFullYear()
  const hours = String(parsed.getHours()).padStart(2, "0")
  const minutes = String(parsed.getMinutes()).padStart(2, "0")

  return `${day}/${month}/${year} - ${hours}:${minutes}`
}

export function formatCellValue(column: string, value: unknown): string {
  if (typeof value === "boolean") {
    return value ? "Si" : "No"
  }

  if (isDateLikeColumn(column)) {
    return formatDateTimeReadable(value)
  }

  const normalized = String(value ?? "").trim().toLowerCase()
  if (normalized === "true") return "Si"
  if (normalized === "false") return "No"

  return String(value ?? "")
}

export function buildEditPayload(editingRow: DataRow, editFormData: DataRow): DataRow {
  const payloadData: DataRow = {}

  Object.keys(editFormData).forEach((field) => {
    const originalValue = editingRow[field]
    const incomingValue = editFormData[field]

    if (typeof originalValue === "boolean") {
      payloadData[field] = incomingValue === true || incomingValue === "true"
      return
    }

    if (typeof originalValue === "number") {
      payloadData[field] = incomingValue === "" || incomingValue === null ? null : Number(incomingValue)
      return
    }

    payloadData[field] = incomingValue === null || incomingValue === undefined ? "" : String(incomingValue)
  })

  return payloadData
}

export async function fetchTableRows(table: TableKey) {
  const response = await fetch(`/api/admin/get-data?table=${encodeURIComponent(table)}`)
  if (!response.ok) {
    throw new Error(`Error ${response.status}`)
  }

  const data = await response.json().catch(() => ({}))
  return (data.rows || []) as DataRow[]
}

export async function updateTableRow(payload: {
  table: TableKey
  id: unknown
  data: DataRow
}) {
  const response = await fetch("/api/admin/update-data", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error((result as { error?: string })?.error || "No fue posible actualizar el registro")
  }

  return result
}
