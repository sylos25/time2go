import { NextResponse } from "next/server";
import pool from "@/lib/db";

function authorizeCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return false;
  }
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const headerSecret = req.headers.get("x-cron-secret")?.trim() || "";
  return bearer === secret || headerSecret === secret;
}

type StepMetric = { ok: boolean; ms: number; detail?: unknown };

/**
 * Tareas programadas: archivar eventos con fecha_fin pasada, limpiar tokens caducados,
 * comprobar conectividad a la base (salud).
 * Protección: CRON_SECRET (Authorization: Bearer … o cabecera x-cron-secret).
 */
export async function POST(req: Request) {
  if (!authorizeCron(req)) {
    const configured = Boolean(process.env.CRON_SECRET?.trim());
    return NextResponse.json(
      { ok: false, message: configured ? "Forbidden" : "CRON_SECRET no configurado" },
      { status: configured ? 403 : 503 }
    );
  }

  const started = Date.now();
  const steps: Record<string, StepMetric> = {};

  const runStep = async (name: string, fn: () => Promise<unknown>) => {
    const t0 = Date.now();
    try {
      const detail = await fn();
      steps[name] = { ok: true, ms: Date.now() - t0, detail };
    } catch (e) {
      console.error(`[cron/maintenance] ${name}`, e);
      steps[name] = { ok: false, ms: Date.now() - t0, detail: String(e) };
    }
  };

  await runStep("dbPing", async () => {
    const r = await pool.query(`SELECT 1::int AS one`);
    return { one: r.rows[0]?.one };
  });

  await runStep("archivePastEvents", async () => {
    const r = await pool.query(
      `UPDATE tabla_eventos
       SET proceso = TRUE,
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE estado = TRUE
         AND COALESCE(proceso, FALSE) = FALSE
         AND fecha_fin < CURRENT_DATE`
    );
    return { rowCount: r.rowCount ?? 0 };
  });

  await runStep("purgeValidationTokens", async () => {
    const r = await pool.query(
      `DELETE FROM tabla_validacion_email_tokens WHERE fecha_expiracion < CURRENT_TIMESTAMP`
    );
    return { rowCount: r.rowCount ?? 0 };
  });

  await runStep("purgeRecoveryTokens", async () => {
    const r = await pool.query(
      `DELETE FROM tabla_recuperacion_contrasena_tokens
       WHERE fecha_expiracion < CURRENT_TIMESTAMP
          OR (estado = 'Caducado'::rec_cont AND fecha_actualizacion < CURRENT_TIMESTAMP - INTERVAL '30 days')`
    );
    return { rowCount: r.rowCount ?? 0 };
  });

  const allOk = Object.values(steps).every((s) => s.ok);
  const totalMs = Date.now() - started;

  return NextResponse.json(
    {
      ok: allOk,
      message: allOk ? "Mantenimiento completado" : "Uno o más pasos fallaron",
      totalMs,
      steps,
      at: new Date().toISOString(),
    },
    { status: allOk ? 200 : 500 }
  );
}
