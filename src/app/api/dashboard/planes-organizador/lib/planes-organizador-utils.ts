const SUBSCRIPTION_STATES = new Set([
  "pendiente",
  "activa",
  "vencida",
  "cancelada",
  "rechazada",
  "error",
])

export function normalizePositiveInt(value: unknown, fallback = 0) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.floor(n)
}

export function isValidSubscriptionState(value: string): boolean {
  return SUBSCRIPTION_STATES.has(value)
}
