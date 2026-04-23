export type EventValoracionUser = {
  id_usuario: number
  nombres: string | null
  apellidos: string | null
}

export type EventValoracionRow = {
  id_valoracion: number
  id_usuario: number
  id_evento: number
  valoracion: number
  comentario: string | null
  fecha_creacion: string
  fecha_actualizacion?: string
  nombres: string | null
  apellidos: string | null
}
