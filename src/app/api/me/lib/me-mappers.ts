import type { MeDto, MeRow } from "@/app/api/me/lib/me-types"

function toNumber(value: unknown): number | null {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function mapMeRow(row: MeRow): MeDto {
  return {
    id_publico: row.id_publico ? String(row.id_publico) : null,
    tipo_documento: row.tipo_documento ? String(row.tipo_documento) : null,
    numero_documento: row.numero_documento ? String(row.numero_documento) : null,
    nombres: row.nombres ? String(row.nombres) : null,
    apellidos: row.apellidos ? String(row.apellidos) : null,
    correo: row.correo ? String(row.correo) : null,
    id_rol: toNumber(row.id_rol),
    id_pais: toNumber(row.id_pais),
    telefono: row.telefono != null ? String(row.telefono) : null,
    validacion_correo: typeof row.validacion_correo === "boolean" ? row.validacion_correo : null,
    fecha_registro: row.fecha_registro ? String(row.fecha_registro) : null,
    nombre_pais: row.nombre_pais ? String(row.nombre_pais) : null,
    nombre_rol: row.nombre_rol ? String(row.nombre_rol) : null,
  }
}
