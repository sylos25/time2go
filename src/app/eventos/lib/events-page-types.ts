export interface CategoriaEvento {
  id_categoria_evento: number
  nombre: string
}

export interface DepartmentOption {
  id_departamento: number
  nombre_departamento: string
}

export interface MunicipalityOption {
  id_municipio: number
  nombre_municipio: string
  id_departamento: number
}

export interface EventTypeOption {
  id_tipo_evento: number
  nombre: string
  id_categoria_evento: number | null
}

export type PriceMode = "all" | "free" | "paid"

export type AvailabilityFilter = "all" | "with-reservation" | "without-reservation"

export interface EventFilters {
  categoryId: number | null
  eventTypeId: number | null
  departmentId: number | null
  municipalityId: number | null
  startDate: string
  endDate: string
  priceMode: PriceMode
  minPrice: number | null
  maxPrice: number | null
  availability: AvailabilityFilter
}

export interface RawEventImage {
  id_imagen_evento?: number
  url_imagen_evento?: string
}

export interface RawEventCategory {
  id_categoria_evento?: number
  nombre?: string
}

export interface RawEventDepartment {
  id_departamento?: number
  nombre_departamento?: string
}

export interface RawEventMunicipio {
  id_municipio?: number
  nombre_municipio?: string
  id_departamento?: number
  departamento?: RawEventDepartment
}

export interface RawEventSitio {
  nombre_sitio?: string
}

export interface RawEventType {
  id_tipo_evento?: number
  nombre?: string
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
  fecha_fin?: string
  hora_inicio?: string
  hora_final?: string
  cupo?: number | string
  estado?: boolean
  gratis_pago?: boolean
  reservar_anticipado?: boolean
  id_categoria_evento?: number
  id_tipo_evento?: number
  evento_categoria_id?: number
  categoria?: RawEventCategory
  tipo_evento?: RawEventType
  municipio?: RawEventMunicipio
  departamento?: RawEventDepartment
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
