export interface UserData {
  id_usuario: string
  nombres: string
  apellidos: string
  correo: string
  id_rol: number
  id_pais: number
  nombre_pais?: string
  nombre_rol?: string
  telefono?: string
  validacion_correo?: boolean
  fecha_registro?: string
}

export type DeactivateStep = 1 | 2

export interface MeResponse {
  ok?: boolean
  user?: UserData
  message?: string
}

export interface OrganizerPaymentResponse {
  ok?: boolean
  message?: string
  checkout_url?: string
}

export interface MutationResponse {
  ok?: boolean
  message?: string
}
