import { Redis } from "@upstash/redis";

const REVOCATION_PREFIX = "revoked:jti:";

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

function keyForJti(jti: string): string {
  return `${REVOCATION_PREFIX}${jti}`;
}

export async function revokeTokenJti(jti: string, exp?: number): Promise<void> {
  if (!jti) return;

  const redis = getRedisClient();
  if (!redis) return;

  try {
    const now = Math.floor(Date.now() / 1000);
    const ttl = exp && Number.isFinite(exp) ? Math.max(1, exp - now) : 7 * 24 * 60 * 60;
    await redis.set(keyForJti(jti), "1", { ex: ttl });
  } catch (error) {
    console.error("[token-revocation] Failed to revoke jti", error);
  }
}

export async function isTokenJtiRevoked(jti: string): Promise<boolean> {
  if (!jti) return false;

  const redis = getRedisClient();
  if (!redis) return false;

  try {
    const value = await redis.get<string>(keyForJti(jti));
    return value === "1";
  } catch (error) {
    console.error("[token-revocation] Failed to read jti revocation", error);
    return false;
  }
}
