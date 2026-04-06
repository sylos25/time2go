import { Pool, type PoolConfig } from "pg";

function buildConfig(): PoolConfig {
  const connectionString = process.env.DATABASE_URL?.trim() || undefined;
  if (
    process.env.NODE_ENV === "production" &&
    !connectionString &&
    process.env.SKIP_DATABASE_URL_CHECK !== "true"
  ) {
    throw new Error(
      "DATABASE_URL es obligatorio en producción. En build/CI sin base de datos, define SKIP_DATABASE_URL_CHECK=true (solo si no importas módulos que ejecuten queries en build).",
    );
  }
  const max = Math.min(100, Math.max(1, Number(process.env.PGPOOL_MAX || 20)));
  const idleTimeoutMillis = Number(process.env.PG_IDLE_TIMEOUT_MS || 30_000);
  const connectionTimeoutMillis = Number(process.env.PG_CONNECTION_TIMEOUT_MS || 10_000);

  let ssl: PoolConfig["ssl"] = undefined;
  if (connectionString) {
    const sslExplicit = process.env.DATABASE_SSL === "true";
    const sslHeuristic = /\.neon\.tech|amazonaws\.com|azure\.com|supabase\.co/i.test(connectionString);
    if (sslExplicit || sslHeuristic) {
      ssl = { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false" };
    }
  }

  return {
    connectionString,
    max,
    idleTimeoutMillis,
    connectionTimeoutMillis,
    ssl,
  };
}

/**
 * Un solo Pool por proceso Node (HMR en dev y warm instances en serverless reutilizan globalThis).
 * Sigue siendo necesario un pooler (PgBouncer) y PGPOOL_MAX bajo por instancia si hay mucha concurrencia.
 */
const globalForPool = globalThis as typeof globalThis & {
  __time2goPgPool?: Pool;
};

function getOrCreatePool(): Pool {
  if (!globalForPool.__time2goPgPool) {
    globalForPool.__time2goPgPool = new Pool(buildConfig());
  }
  return globalForPool.__time2goPgPool;
}

const pool = getOrCreatePool();

export default pool;
