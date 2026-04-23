import { randomUUID } from "node:crypto";

type LogLevel = "info" | "warn" | "error";

export type ApiLogContext = {
  requestId: string;
  route: string;
  userId?: string;
  event: string;
  status?: number;
  durationMs?: number;
  extra?: Record<string, unknown>;
};

function getOrCreateRequestId(req: Request): string {
  const fromHeader = req.headers.get("x-request-id")?.trim();
  if (fromHeader) return fromHeader.slice(0, 64);
  return randomUUID();
}

export function withRequestId(req: Request): { requestId: string } {
  return { requestId: getOrCreateRequestId(req) };
}

/**
 * Línea JSON estructurada para logs en runtime (Vercel, Docker, etc.).
 */
export function logApiEvent(level: LogLevel, ctx: ApiLogContext): void {
  const line = {
    t: new Date().toISOString(),
    level,
    service: "time2go",
    ...ctx,
  };
  const serialized = JSON.stringify(line);
  if (level === "error") {
    console.error(serialized);
  } else if (level === "warn") {
    console.warn(serialized);
  } else {
    console.log(serialized);
  }
}
