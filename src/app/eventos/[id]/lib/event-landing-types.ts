export type EventImage = {
  url_imagen_evento?: string | null
}

export type EventTicketValue = {
  id_boleto?: number | string
  id_valor?: number | string
  nombre_boleto?: string | null
  nombre_categoria_boleto?: string | null
  precio_boleto?: number | string | null
  valor?: number | string | null
}

export type EventLink = {
  id_link?: number | string
  link?: string | null
}

export type AccessibilityInfrastructure = {
  id_sitios_discapacitados?: number | string
  nombre_infraestructura_discapacitados?: string | null
  descripcion?: string | null
}

export type EventSite = {
  nombre_sitio?: string | null
  direccion?: string | null
  latitud?: unknown
  longitud?: unknown
  acceso_discapacidad?: boolean | null
  infraestructura_discapacitados?: AccessibilityInfrastructure[]
}

export type EventCreator = {
  nombres?: string | null
  apellidos?: string | null
}

export type EventReservation = {
  id_reserva_evento: number | string
  nombres?: string | null
  apellidos?: string | null
  tipo_documento?: string | null
  numero_documento?: string | null
  cuantos_asistiran?: number | string | null
  fecha_reserva?: string | null
  quienes_asistiran?: string | null
}

export type EventData = {
  id_evento: number | string
  id_publico_evento?: string | null
  id_usuario?: number | string | null
  nombre_evento?: string | null
  descripcion?: string | null
  fecha_inicio?: string | null
  fecha_fin?: string | null
  hora_inicio?: string | null
  hora_final?: string | null
  gratis_pago?: boolean | null
  cupo?: number | string | null
  reservas_asistentes?: number | string | null
  categoria?: { nombre?: string | null } | null
  tipo_evento?: { nombre?: string | null } | null
  tipo_nombre?: string | null
  municipio?: { nombre_municipio?: string | null } | null
  sitio?: EventSite | null
  creador?: EventCreator | null
  responsable_evento?: string | null
  pulep_evento?: string | null
  informacion_importante?: { detalle?: string | null } | null
  dias_evento?: Array<string | number | Date>
  dias?: Array<string | number | Date>
  imagenes?: EventImage[]
  valores?: EventTicketValue[]
  links?: EventLink[]
  telefono_1?: string | null
  telefono_2?: string | null
  event_telefono_1?: string | null
  event_telefono_2?: string | null
}
