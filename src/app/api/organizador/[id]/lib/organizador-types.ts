export type OrganizadorRow = {
  id_usuario: number
  nombres: string | null
  apellidos: string | null
  telefono_1: string | null
  telefono_2: string | null
}

export type OrganizadorEventoRow = {
  id_evento: number
  id_publico_evento: string
  nombre_evento: string
  descripcion: string
  fecha_inicio: string | null
  fecha_fin: string | null
  hora_inicio: string | null
  hora_final: string | null
  gratis_pago: boolean
  cupo: number
  reservar_anticipado: boolean
  categoria: unknown
  tipo_evento: unknown
  sitio: unknown
  municipio: unknown
  imagen_portada: { url_imagen_evento: string } | null
}
