import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type LoginLimiter = {
  requests: number[];
  lockUntil: number;
};

const ipLimiter = new Map<string, LoginLimiter>();
const credentialLimiter = new Map<string, LoginLimiter>();

const ONE_MINUTE_MS = 60 * 1000;
const FIFTEEN_MINUTES_MS = 15 * ONE_MINUTE_MS;
const THIRTY_MINUTES_MS = 30 * ONE_MINUTE_MS;

let upstashIp: Ratelimit | null = null;
let upstashCred: Ratelimit | null = null;

function getUpstashLimiters(): { ip: Ratelimit; cred: Ratelimit } | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  if (!upstashIp || !upstashCred) {
    const redis = Redis.fromEnv();
    upstashIp = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(70, "15 m"),
      prefix: "login:ip",
    });
    upstashCred = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(8, "15 m"),
      prefix: "login:cred",
    });
  }
  return { ip: upstashIp, cred: upstashCred };
}

function cleanupLimiterMap(map: Map<string, LoginLimiter>, now: number, windowMs: number) {
  for (const [key, value] of map.entries()) {
    value.requests = value.requests.filter((ts) => now - ts <= windowMs);
    if (value.requests.length === 0 && value.lockUntil <= now) {
      map.delete(key);
    }
  }
}

function getOrCreateLimiter(map: Map<string, LoginLimiter>, key: string): LoginLimiter {
  const existing = map.get(key);
  if (existing) {
    return existing;
  }
  const created: LoginLimiter = { requests: [], lockUntil: 0 };
  map.set(key, created);
  return created;
}

function addAttemptAndCheckWindow(
  limiter: LoginLimiter,
  now: number,
  windowMs: number,
  maxAttempts: number
) {
  limiter.requests = limiter.requests.filter((ts) => now - ts <= windowMs);
  limiter.requests.push(now);
  return {
    blocked: limiter.requests.length > maxAttempts,
    count: limiter.requests.length,
  };
}

function setProgressiveLock(limiter: LoginLimiter, now: number, failsInWindow: number) {
  if (failsInWindow >= 10) {
    limiter.lockUntil = Math.max(limiter.lockUntil, now + THIRTY_MINUTES_MS);
  } else if (failsInWindow >= 6) {
    limiter.lockUntil = Math.max(limiter.lockUntil, now + 10 * ONE_MINUTE_MS);
  } else if (failsInWindow >= 4) {
    limiter.lockUntil = Math.max(limiter.lockUntil, now + 3 * ONE_MINUTE_MS);
  }
}

export function lockResponse(lockUntil: number) {
  const retryAfter = Math.max(1, Math.ceil((lockUntil - Date.now()) / 1000));
  return NextResponse.json(
    {
      message: "Demasiados intentos. Intenta nuevamente en unos minutos.",
      error: "too_many_attempts",
      retryAfter,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
      },
    }
  );
}

function upstashTooMany(reset: number) {
  const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return NextResponse.json(
    {
      message: "Demasiados intentos. Intenta nuevamente en unos minutos.",
      error: "too_many_attempts",
      retryAfter,
    },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfter) },
    }
  );
}

export async function runLoginRateLimitPrelude(
  ip: string,
  normalizedEmail: string,
  now: number
): Promise<NextResponse | null> {
  const upstash = getUpstashLimiters();
  if (upstash) {
    const [ipRes, credRes] = await Promise.all([
      upstash.ip.limit(ip),
      upstash.cred.limit(`${ip}::${normalizedEmail}`),
    ]);
    if (!ipRes.success) {
      return upstashTooMany(ipRes.reset);
    }
    if (!credRes.success) {
      return upstashTooMany(credRes.reset);
    }
    return null;
  }

  cleanupLimiterMap(ipLimiter, now, FIFTEEN_MINUTES_MS);
  cleanupLimiterMap(credentialLimiter, now, FIFTEEN_MINUTES_MS);

  const ipEntry = getOrCreateLimiter(ipLimiter, ip);
  const credentialKey = `${ip}::${normalizedEmail}`;
  const credentialEntry = getOrCreateLimiter(credentialLimiter, credentialKey);

  if (ipEntry.lockUntil > now) {
    return lockResponse(ipEntry.lockUntil);
  }
  if (credentialEntry.lockUntil > now) {
    return lockResponse(credentialEntry.lockUntil);
  }

  const ipWindow = addAttemptAndCheckWindow(ipEntry, now, FIFTEEN_MINUTES_MS, 70);
  if (ipWindow.blocked) {
    ipEntry.lockUntil = Math.max(ipEntry.lockUntil, now + 10 * ONE_MINUTE_MS);
    return lockResponse(ipEntry.lockUntil);
  }

  return null;
}

export function registerFailedAuth(ip: string, email: string, now: number) {
  if (getUpstashLimiters()) {
    return;
  }
  const ipEntry = getOrCreateLimiter(ipLimiter, ip);
  const credEntry = getOrCreateLimiter(credentialLimiter, `${ip}::${email}`);
  const ipAttempt = addAttemptAndCheckWindow(ipEntry, now, FIFTEEN_MINUTES_MS, 40);
  const credAttempt = addAttemptAndCheckWindow(credEntry, now, FIFTEEN_MINUTES_MS, 8);
  setProgressiveLock(ipEntry, now, ipAttempt.count);
  setProgressiveLock(credEntry, now, credAttempt.count);
}

export function clearSuccessfulAuth(ip: string, email: string) {
  if (getUpstashLimiters()) {
    return;
  }
  credentialLimiter.delete(`${ip}::${email}`);
}
