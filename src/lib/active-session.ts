import { Redis } from "@upstash/redis";

const ACTIVE_SESSION_PREFIX = "active:session:user:";

let redisClient: Redis | null | undefined;

function getRedisClient(): Redis | null {
  if (redisClient !== undefined) {
    return redisClient;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL || "";
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || "";
  if (!url || !token) {
    redisClient = null;
    return null;
  }

  redisClient = new Redis({ url, token });
  return redisClient;
}

function keyForUser(userId: string): string {
  return `${ACTIVE_SESSION_PREFIX}${userId}`;
}

export async function setActiveSession(userId: string, sessionId: string, ttlSeconds: number): Promise<void> {
  if (!userId || !sessionId) return;

  const redis = getRedisClient();
  if (!redis) return;

  try {
    const ttl = Number.isFinite(ttlSeconds) ? Math.max(60, Math.floor(ttlSeconds)) : 7 * 24 * 60 * 60;
    await redis.set(keyForUser(userId), sessionId, { ex: ttl });
  } catch (error) {
    console.error("[active-session] Failed to set active session", error);
  }
}

export async function touchActiveSession(userId: string, sessionId: string, ttlSeconds: number): Promise<boolean> {
  if (!userId || !sessionId) return false;

  const redis = getRedisClient();
  if (!redis) return true;

  try {
    const key = keyForUser(userId);
    const active = await redis.get<string>(key);
    if (typeof active === "string" && active.length > 0 && active !== sessionId) {
      return false;
    }

    const ttl = Number.isFinite(ttlSeconds) ? Math.max(60, Math.floor(ttlSeconds)) : 7 * 24 * 60 * 60;
    await redis.set(key, sessionId, { ex: ttl });
    return true;
  } catch (error) {
    console.error("[active-session] Failed to touch active session", error);
    return true;
  }
}

export async function isActiveSessionValid(userId: string, sessionId?: string | null): Promise<boolean> {
  if (!userId) return false;

  const redis = getRedisClient();
  if (!redis) return true;

  try {
    const active = await redis.get<string>(keyForUser(userId));

    // Si no hay una sesión registrada, no bloqueamos para evitar falsos cierres por expiración de clave.
    if (typeof active !== "string" || active.length === 0) {
      return true;
    }

    return typeof sessionId === "string" && sessionId.length > 0 && active === sessionId;
  } catch (error) {
    console.error("[active-session] Failed to validate active session", error);
    return true;
  }
}
