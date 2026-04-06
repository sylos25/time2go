export interface RawMyEventImage {
  url_imagen_evento?: string
}

export interface RawMyEventSite {
  nombre_sitio?: string
}

export interface RawMyEventMunicipio {
  nombre_municipio?: string
}

export interface RawMyEvent {
  id_evento?: number
  nombre_evento?: string
  fecha_inicio?: string
  hora_inicio?: string
  cupo?: number | string
  imagenes?: RawMyEventImage[]
  sitio?: RawMyEventSite
  municipio?: RawMyEventMunicipio
  nombre_municipio?: string
}

export interface MyEventItem {
  id: number
  title: string
  imageUrl: string
  dateText: string
  locationText: string
  capacityText: string
}