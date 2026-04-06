import type { DataTable, FormState } from "@/lib/insert-data-config"

type InsertDataSuccess = {
  ok: true
}

type InsertDataFailure = {
  ok: false
  error: string
}

export type InsertDataResult = InsertDataSuccess | InsertDataFailure

export async function insertAdminData(table: DataTable, data: FormState): Promise<InsertDataResult> {
  try {
    const response = await fetch("/api/admin/insert-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table, data }),
    })

    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      return {
        ok: false,
        error: String(payload?.error || "Error al insertar los datos"),
      }
    }

    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: `Error: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }
  }
}
