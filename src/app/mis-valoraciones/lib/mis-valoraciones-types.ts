export interface Valoracion {
  id_valoracion: number
  valoracion: number
  comentario: string | null
  fecha_creacion: string
  id_publico_evento?: string
  id_evento?: number
  nombre_evento: string
  fecha_inicio: string
  hora_inicio: string
  imagen_evento: string | null
}

export interface MisValoracionesResponse {
  ok?: boolean
  message?: string
  valoraciones?: unknown[]
}

export interface MisValoracionesMutationResponse {
  ok?: boolean
  message?: string
}
