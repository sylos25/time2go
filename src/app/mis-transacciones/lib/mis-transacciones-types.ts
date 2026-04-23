export type TransaccionItem = {
  id_suscripcion_organizador: number
  fecha_creacion: string
  nombre_plan: string
  monto_pago: string
  estado_suscripcion: string
}

export type TransaccionesResponse = {
  ok: boolean
  message?: string
  transacciones?: TransaccionItem[]
}
