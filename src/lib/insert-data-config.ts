export type DataTable =
  | "paises"
  | "tipo_sitios"
  | "sitios"
  | "tipo_infraestructura_discapacitados"
  | "sitios_discapacitados"
  | "tipo_eventos"

export const DEFAULT_TABLE: DataTable = "sitios"

export type FormState = {
  [key: string]: string | number | boolean
}

export type FieldConfig = {
  name: string
  type: string
  required: boolean
  label: string
  minLength?: number
  maxLength?: number
  minValue?: number
  maxValue?: number
  pattern?: string
  validationMessage?: string
}

export const tableConfigs: Record<DataTable, { fields: FieldConfig[] }> = {
  paises: {
    fields: [
      { name: "id_pais", type: "number", required: true, label: "ID Pais", minValue: 1 },
      { name: "nombre_pais", type: "text", required: true, label: "Nombre del Pais", minLength: 3 },
    ],
  },
  tipo_sitios: {
    fields: [
      { name: "id_tipo_sitio", type: "number", required: true, label: "ID Tipo de Sitio", minValue: 1 },
      { name: "nombre_tipo_sitio", type: "text", required: true, label: "Nombre del Tipo de Sitio", minLength: 4 },
    ],
  },
  sitios: {
    fields: [
      { name: "id_sitio", type: "number", required: true, label: "ID Sitio", minValue: 1 },
      { name: "nombre_sitio", type: "text", required: true, label: "Nombre del Sitio", minLength: 3 },
      { name: "id_tipo_sitio", type: "number", required: true, label: "ID Tipo de Sitio", minValue: 1 },
      { name: "id_municipio", type: "number", required: true, label: "ID Municipio", minValue: 1 },
      { name: "direccion", type: "text", required: true, label: "Direccion", minLength: 6 },
      { name: "latitud", type: "text", required: true, label: "Latitud" },
      { name: "longitud", type: "text", required: true, label: "Longitud" },
      {
        name: "telefono_1",
        type: "number",
        required: true,
        label: "Telefono 1",
        minLength: 10,
        maxLength: 10,
        pattern: "^[3-9][0-9]{9}$",
        validationMessage: "Debe ser un telefono de 10 digitos y comenzar en 3 o superior",
      },
      {
        name: "telefono_2",
        type: "number",
        required: false,
        label: "Telefono 2",
        minLength: 10,
        maxLength: 10,
        pattern: "^[3-9][0-9]{9}$",
        validationMessage: "Debe ser un telefono de 10 digitos y comenzar en 3 o superior",
      },
      { name: "sitio_web", type: "text", required: false, label: "Sitio Web" },
    ],
  },
  tipo_infraestructura_discapacitados: {
    fields: [
      { name: "id_infraestructura_discapacitados", type: "number", required: true, label: "ID Infraestructura", minValue: 1 },
      {
        name: "nombre_infraestructura_discapacitados",
        type: "text",
        required: true,
        label: "Nombre de Infraestructura",
        minLength: 4,
      },
    ],
  },
  sitios_discapacitados: {
    fields: [
      { name: "id_sitios_discapacitados", type: "number", required: true, label: "ID Sitio Discapacidad", minValue: 1 },
      { name: "id_sitio", type: "number", required: true, label: "ID Sitio", minValue: 1 },
      { name: "id_infraestructura_discapacitados", type: "number", required: true, label: "ID Infraestructura", minValue: 1 },
      { name: "descripcion", type: "textarea", required: true, label: "Descripcion", minLength: 10 },
    ],
  },
  tipo_eventos: {
    fields: [
      { name: "id_tipo_evento", type: "number", required: true, label: "ID Tipo de Evento", minValue: 1 },
      { name: "id_categoria_evento", type: "number", required: true, label: "ID Categoria del Evento", minValue: 1 },
      { name: "nombre", type: "text", required: true, label: "Nombre del Tipo de Evento", minLength: 3 },
    ],
  },
}

export const TABLE_NAV_ITEMS: Array<{ key: DataTable; label: string }> = [
  { key: "paises", label: "Paises" },
  { key: "tipo_sitios", label: "Tipo de sitios" },
  { key: "sitios", label: "Sitios" },
  { key: "tipo_infraestructura_discapacitados", label: "Infraestructura para discapacitados" },
  { key: "sitios_discapacitados", label: "Sitios con acceso inclusivo" },
  { key: "tipo_eventos", label: "Tipo de eventos" },
]

export const LETTERS_ONLY_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/

export const isStrictTable = (table: DataTable) => table === "paises"
export const isStrictIdField = (fieldName: string) => fieldName === "id_pais"
export const isStrictNameField = (fieldName: string) => fieldName === "nombre_pais"

export const isNumericField = (table: DataTable, fieldName: string): boolean => {
  const field = tableConfigs[table]?.fields.find((item) => item.name === fieldName)
  return field?.type === "number"
}

export function validateField(field: FieldConfig, fieldValue: string | number | boolean | undefined): string | null {
  const isEmpty = fieldValue === undefined || fieldValue === null || String(fieldValue).trim() === ""

  if (field.required && field.type !== "checkbox" && isEmpty) {
    return `El campo ${field.label} es obligatorio`
  }
  if (!field.required && isEmpty) {
    return null
  }

  const valueAsString = String(fieldValue ?? "").trim()

  if (field.type === "number") {
    if (!/^\d+$/.test(valueAsString)) {
      return `${field.label} solo permite numeros`
    }
    if (field.minLength && valueAsString.length < field.minLength) {
      return `${field.label} debe tener minimo ${field.minLength} caracteres`
    }
    if (field.maxLength && valueAsString.length > field.maxLength) {
      return `${field.label} debe tener maximo ${field.maxLength} caracteres`
    }
    const numericValue = Number(valueAsString)
    if (field.minValue !== undefined && numericValue < field.minValue) {
      return `${field.label} debe ser mayor o igual a ${field.minValue}`
    }
    if (field.maxValue !== undefined && numericValue > field.maxValue) {
      return `${field.label} debe ser menor o igual a ${field.maxValue}`
    }
    if (field.pattern && !new RegExp(field.pattern).test(valueAsString)) {
      return field.validationMessage || `${field.label} tiene un formato invalido`
    }
    return null
  }

  if (field.type === "text" || field.type === "textarea") {
    if (field.minLength && valueAsString.length < field.minLength) {
      return `${field.label} debe tener minimo ${field.minLength} caracteres`
    }
    if (field.maxLength && valueAsString.length > field.maxLength) {
      return `${field.label} debe tener maximo ${field.maxLength} caracteres`
    }
    if (field.pattern && !new RegExp(field.pattern).test(valueAsString)) {
      return field.validationMessage || `${field.label} tiene un formato invalido`
    }
  }

  return null
}
