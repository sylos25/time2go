export interface CategoriaEvento {
  id_categoria_evento: number
  nombre: string
}

export type EventFilterType = "category" | "time" | "price" | "access" | "location"

export interface RawEventImage {
  id_imagen_evento?: number
  url_imagen_evento?: string
}

export interface RawEventCategory {
  id_categoria_evento?: number
  nombre?: string
}

export interface RawEventMunicipio {
  nombre_municipio?: string
}

export interface RawEventSitio {
  nombre_sitio?: string
}

export interface RawTicketValue {
  precio_boleto?: number | string | null
  valor?: number | string | null
}

export interface RawEvent {
  id_evento?: number
  id_publico_evento?: string | null
  nombre_evento?: string
  descripcion?: string
  fecha_inicio?: string
  hora_inicio?: string
  hora_final?: string
  cupo?: number | string
  estado?: boolean
  gratis_pago?: boolean
  id_categoria_evento?: number
  evento_categoria_id?: number
  categoria?: RawEventCategory
  municipio?: RawEventMunicipio
  sitio?: RawEventSitio
  valores?: RawTicketValue[]
  imagenes?: RawEventImage[]
  [key: string]: unknown
}

export interface EventCardItem {
  id_evento: number
  id_publico_evento: string | null
  title: string
  category: string
  description: string
  image: string
  date: string
  time: string
  location: string
  attendees: number
  id_categoria_evento: number
  price: number | string
  raw: RawEvent
}
