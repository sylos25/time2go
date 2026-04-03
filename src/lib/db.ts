import { Pool, type PoolConfig } from "pg";

function buildConfig(): PoolConfig {
  const connectionString = process.env.DATABASE_URL;
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

const pool = new Pool(buildConfig());

export default pool;
