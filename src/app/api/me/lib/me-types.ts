export type MeRow = {
  id_publico: string | null
  tipo_documento: string | null
  numero_documento: string | null
  nombres: string | null
  apellidos: string | null
  correo: string | null
  id_rol: number | string | null
  id_pais: number | string | null
  telefono: string | number | null
  validacion_correo: boolean | null
  fecha_registro: string | null
  nombre_pais: string | null
  nombre_rol: string | null
}

export type MeDto = {
  id_publico: string | null
  tipo_documento: string | null
  numero_documento: string | null
  nombres: string | null
  apellidos: string | null
  correo: string | null
  id_rol: number | null
  id_pais: number | null
  telefono: string | null
  validacion_correo: boolean | null
  fecha_registro: string | null
  nombre_pais: string | null
  nombre_rol: string | null
}
