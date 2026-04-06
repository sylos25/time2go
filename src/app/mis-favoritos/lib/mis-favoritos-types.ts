export interface FavoriteEvent {
  id_evento: number
  id_publico_evento?: string
  nombre_evento: string
  descripcion: string
  fecha_inicio: string
  hora_inicio?: string
  categoria: string
  location: string
  attendees: number
  price: number | string
  image: string | null
}

export interface RawFavoritePayload {
  ok?: boolean
  message?: string
  favoritos?: unknown[]
}

export interface RawEventValue {
  precio_boleto?: number | string | null
  valor?: number | string | null
}

export interface RawEventImage {
  url_imagen_evento?: string
}

export interface RawEventCategory {
  nombre?: string
}

export interface RawEventSite {
  nombre_sitio?: string
}

export interface RawEventMunicipio {
  nombre_municipio?: string
}

export interface RawEvent {
  id_evento?: number
  id_publico_evento?: string
  nombre_evento?: string
  descripcion?: string
  fecha_inicio?: string
  hora_inicio?: string
  categoria?: RawEventCategory
  categoria_nombre?: string
  sitio?: RawEventSite
  nombre_sitio?: string
  municipio?: RawEventMunicipio
  nombre_municipio?: string
  cupo?: number | string
  gratis_pago?: boolean
  valores?: RawEventValue[]
  imagenes?: RawEventImage[]
}

export interface RawEventsPayload {
  ok?: boolean
  message?: string
  eventos?: RawEvent[]
}