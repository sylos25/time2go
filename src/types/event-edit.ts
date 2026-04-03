/**
 * Types for event editing functionality
 * Defines all data structures used in the edit-event-modal and related components
 */

/**
 * Database-level event entity
 */
export interface Evento {
  id_evento?: number
  id?: string
  nombre_evento: string
  name?: string
  pulep_evento: string
  responsable_evento: string
  descripcion: string
  fecha_inicio: string
  date?: string
  fecha_fin: string
  hora_inicio: string
  time?: string
  hora_final: string
  cupo: number
  capacity?: number
  id_categoria_evento: number | string
  evento_categoria_id?: number
  id_tipo_evento: number | string
  evento_tipo_id?: number
  id_sitio: number | string
  telefono_1: string
  telefono_2: string
  gratis_pago: boolean
  reservar_anticipado: boolean
  estado?: boolean
  imagenes?: ImagenEvento[]
  valores?: Boleta[]
  informacion_importante?: InformacionImportante
  sitio?: Sitio
  nombre_sitio?: string
  municipio?: Municipio
  nombre_municipio?: string
  nombre?: string
}

/**
 * Event category
 */
export interface Categoria {
  id_categoria_evento?: number
  id?: number
  nombre: string
}

/**
 * Event type (subcategory)
 */
export interface TipoEvento {
  id_tipo_evento?: number
  id?: number
  nombre: string
  id_categoria_evento?: number
  categoria_id?: number
}

/**
 * Event venue/location
 */
export interface Sitio {
  id_sitio?: number
  id?: number | string
  nombre_sitio: string
  nombre?: string
  correo?: string
  telefono?: string
  municipio_id?: number
}

/**
 * Municipality
 */
export interface Municipio {
  id_municipio?: number
  id?: number
  nombre_municipio?: string
  
  nombre?: string
}

/**
 * Event ticket type
 */
export interface Boleta {
  id_categoria_boleto?: number
  id?: number
  nombre_boleto: string
  nombre_categoria_boleto?: string
  precio_boleto: number | string
  valor?: number | string
  servicio: number | string
}

/**
 * Additional info item for event
 */
export interface EventoInfoItem {
  detalle: string
  obligatorio: boolean
}

/**
 * Event important information (aggregated info items)
 */
export interface InformacionImportante {
  detalle: string
  obligatorio: boolean
}

/**
 * Event image entity
 */
export interface ImagenEvento {
  id_imagen?: number
  id_imagen_evento: number
  id?: number
  id_evento?: number
  public_id?: string
  secure_url?: string
  url?: string
  url_imagen_evento: string
  principale?: boolean
  principal?: boolean
  orden?: number
  order?: number
  created_at?: string
}

/**
 * Form data state for event editing
 */
export interface FormDataState {
  nombre_evento: string
  pulep_evento: string
  responsable_evento: string
  descripcion: string
  fecha_inicio: string
  fecha_fin: string
  hora_inicio: string
  hora_final: string
  cupo: string
  id_categoria_evento: string
  id_tipo_evento: string
  id_sitio: string
  telefono_1: string
  telefono_2: string
  gratis_pago: boolean
  reservar_anticipado: boolean
}

/**
 * Form validation errors
 */
export interface FormErrors {
  nombre_evento?: string
  pulep_evento?: string
  responsable_evento?: string
  descripcion?: string
  informacion_adicional_items?: string
  telefono_1?: string
  telefono_2?: string
  fecha_inicio?: string
  fecha_fin?: string
  hora_inicio?: string
  hora_final?: string
  cupo?: string
  id_categoria_evento?: string
  id_tipo_evento?: string
  id_sitio?: string
  boletas?: string
  general?: string
}

/**
 * Hook arguments for useEditEventModal
 */
export interface UseEditEventModalArgs {
  isOpen: boolean
  event: Evento
  onClose: () => void
  onSave: (updatedEvent: Evento) => Promise<void>
}

/**
 * Hook return type for useEditEventModal
 */
export interface UseEditEventModalReturn {
  formData: FormDataState
  formErrors: FormErrors
  isSaving: boolean
  loading: boolean
  categories: Categoria[]
  eventTypes: TipoEvento[]
  sites: Sitio[]
  busquedaSitio: string
  busquedaMunicipio: string
  boletas: Boleta[]
  informacionAdicionalItems: EventoInfoItem[]
  images: File[]
  existingImages: ImagenEvento[]
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  handleSitioInputChange: (value: string) => void
  handleSelectSitio: (sitio: Sitio) => void
  setBusquedaMunicipio: (value: string) => void
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  removeNewImage: (index: number) => void
  removeExistingImage: (imagenId: number) => void
  updateBoleta: (index: number, field: string, value: string) => void
  addBoletaField: () => void
  removeBoletaField: (index: number) => void
  removeAllBoletas: () => void
  addInfoItem: () => void
  updateInfoItem: (index: number, field: keyof EventoInfoItem, value: string | boolean) => void
  removeInfoItem: (index: number) => void
  handleSave: () => Promise<void>
}

/**
 * Props for edit event modal component
 */
export interface EditEventModalProps {
  isOpen: boolean
  onClose: () => void
  event: Evento
  onSave: (updatedEvent: Evento) => Promise<void>
}







