import type { TransaccionItem } from "@/app/mis-transacciones/lib/mis-transacciones-types"

export function getToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null
}

export function getSummaryText(loading: boolean, count: number): string {
  if (loading) {
    return "Estamos cargando tus compras de planes."
  }

  if (count === 0) {
    return "Aun no tienes compras de planes registradas."
  }

  return `Tienes ${count} transaccion${count !== 1 ? "es" : ""} registrada${count !== 1 ? "s" : ""}.`
}

export function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Fecha no disponible"

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

export function formatCopAmount(value: string): string {
  const amount = Number(value || 0)
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0)
}

export function statusBadgeClass(status: string): string {
  switch (status) {
    case "activa":
      return "bg-emerald-100 text-emerald-700 border border-emerald-200"
    case "pendiente":
      return "bg-amber-100 text-amber-700 border border-amber-200"
    case "vencida":
      return "bg-slate-100 text-slate-700 border border-slate-200"
    case "cancelada":
      return "bg-rose-100 text-rose-700 border border-rose-200"
    case "rechazada":
    case "error":
      return "bg-red-100 text-red-700 border border-red-200"
    default:
      return "bg-muted text-muted-foreground border border-border"
  }
}

export function normalizeTransactions(items: TransaccionItem[] | undefined): TransaccionItem[] {
  if (!Array.isArray(items)) {
    return []
  }

  return items.map((item) => ({
    id_suscripcion_organizador: Number(item.id_suscripcion_organizador),
    fecha_creacion: String(item.fecha_creacion || ""),
    nombre_plan: String(item.nombre_plan || "Plan no disponible"),
    monto_pago: String(item.monto_pago || "0"),
    estado_suscripcion: String(item.estado_suscripcion || "desconocido"),
  }))
}
