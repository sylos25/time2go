import { Redis } from "@upstash/redis";

const ACTIVE_SESSION_PREFIX = "active:session:user:";
const ACTIVE_SESSION_KEY_VERSION = "v2";

let redisClient: Redis | null | undefined;
let activeSessionHmacSecret: string | null | undefined;
let warnedMissingHmacSecret = false;

function hasUpstashConfig(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

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

function getActiveSessionHmacSecret(): string | null {
  if (activeSessionHmacSecret !== undefined) {
    return activeSessionHmacSecret;
  }

  const configured = (process.env.ACTIVE_SESSION_HMAC_SECRET || "").trim();
  if (configured.length > 0) {
    activeSessionHmacSecret = configured;
    return activeSessionHmacSecret;
  }

  // En desarrollo permitimos fallback para no romper el entorno local.
  if (process.env.NODE_ENV !== "production") {
    const fallback = (process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET || "").trim();
    if (fallback.length > 0) {
      activeSessionHmacSecret = fallback;
      return activeSessionHmacSecret;
    }
  }

  activeSessionHmacSecret = null;

  if (hasUpstashConfig() && !warnedMissingHmacSecret) {
    warnedMissingHmacSecret = true;
    console.error(
      "[active-session] ACTIVE_SESSION_HMAC_SECRET is required when Upstash is configured. " +
        "Active-session checks are disabled until it is set."
    );
  }

  return activeSessionHmacSecret;
}

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function keyForUser(userId: string): Promise<string | null> {
  const normalizedUserId = String(userId || "").trim();
  if (!normalizedUserId) {
    return null;
  }

  const secret = getActiveSessionHmacSecret();
  if (!secret) {
    return null;
  }

  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(normalizedUserId));
  const digest = toHex(signature);

  return `${ACTIVE_SESSION_PREFIX}${ACTIVE_SESSION_KEY_VERSION}:${digest}`;
}

function legacyKeyForUser(userId: string): string {
  return `${ACTIVE_SESSION_PREFIX}${userId}`;
}

export async function setActiveSession(userId: string, sessionId: string, ttlSeconds: number): Promise<void> {
  if (!userId || !sessionId) return;

  const redis = getRedisClient();
  if (!redis) return;

  const key = await keyForUser(userId);
  if (!key) return;

  try {
    const ttl = Number.isFinite(ttlSeconds) ? Math.max(60, Math.floor(ttlSeconds)) : 7 * 24 * 60 * 60;
    await redis.set(key, sessionId, { ex: ttl });
  } catch (error) {
    console.error("[active-session] Failed to set active session", error);
  }
}

export async function touchActiveSession(userId: string, sessionId: string, ttlSeconds: number): Promise<boolean> {
  if (!userId || !sessionId) return false;

  const redis = getRedisClient();
  if (!redis) return true;

  const key = await keyForUser(userId);
  if (!key) return true;

  try {
    const active = await redis.get<string>(key);

    // Compatibilidad temporal de migracion: si no existe clave HMAC, revisa la clave legacy.
    const legacyActive =
      typeof active !== "string" || active.length === 0
        ? await redis.get<string>(legacyKeyForUser(userId))
        : null;
    const effectiveActive =
      typeof active === "string" && active.length > 0 ? active : typeof legacyActive === "string" ? legacyActive : "";

    if (effectiveActive.length > 0 && effectiveActive !== sessionId) {
      return false;
    }

    const ttl = Number.isFinite(ttlSeconds) ? Math.max(60, Math.floor(ttlSeconds)) : 7 * 24 * 60 * 60;
    await redis.set(key, sessionId, { ex: ttl });

    if (typeof legacyActive === "string" && legacyActive.length > 0) {
      await redis.del(legacyKeyForUser(userId));
    }

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

  const key = await keyForUser(userId);
  if (!key) return true;

  try {
    const active = await redis.get<string>(key);
    const legacyActive =
      typeof active !== "string" || active.length === 0
        ? await redis.get<string>(legacyKeyForUser(userId))
        : null;
    const effectiveActive =
      typeof active === "string" && active.length > 0 ? active : typeof legacyActive === "string" ? legacyActive : "";

    // Si no hay una sesión registrada, no bloqueamos para evitar falsos cierres por expiración de clave.
    if (effectiveActive.length === 0) {
      return true;
    }

    return typeof sessionId === "string" && sessionId.length > 0 && effectiveActive === sessionId;
  } catch (error) {
    console.error("[active-session] Failed to validate active session", error);
    return true;
  }
}
