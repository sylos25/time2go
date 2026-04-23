import crypto from "node:crypto"
import { Redis } from "@upstash/redis"

let redisClient: Redis | null | undefined

function getRedis(): Redis | null {
  if (redisClient !== undefined) {
    return redisClient
  }
  const url = process.env.UPSTASH_REDIS_REST_URL || ""
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || ""
  if (!url || !token) {
    redisClient = null
    return null
  }
  redisClient = new Redis({ url, token })
  return redisClient
}

/**
 * Evita re-procesar el mismo evento de ePayco (reintentos de red).
 * La clave incluye ref + transacción + estado para permitir transiciones (pendiente → aprobado).
 */
export function buildEpaycoIdempotencyKey(parts: { referencia: string; transactionId: string; estado: string }): string {
  return `${parts.referencia}|${parts.transactionId}|${parts.estado}`
}

export async function markEpaycoWebhookIfNew(
  idempotencyKey: string
): Promise<"new" | "duplicate"> {
  const redis = getRedis()
  if (!redis) {
    return "new"
  }
  const digest = crypto.createHash("sha256").update(idempotencyKey, "utf8").digest("hex")
  const key = `epayco:webhook:evt:${digest}`
  try {
    const res = await redis.set(key, "1", { nx: true, ex: 60 * 60 * 24 * 30 })
    if (res === null) {
      return "duplicate"
    }
    return "new"
  } catch (err) {
    console.error("[epayco idempotency] redis set failed", err)
    return "new"
  }
}
