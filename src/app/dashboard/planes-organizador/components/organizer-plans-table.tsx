import { Save } from "lucide-react"

import type { OrganizerPlan } from "../lib/planes-organizador-types"

type OrganizerPlansTableProps = {
  plans: OrganizerPlan[]
  planDrafts: Record<number, OrganizerPlan>
  savingPlanId: number | null
  onUpdatePlanField: <K extends keyof OrganizerPlan>(
    idPlan: number,
    key: K,
    value: OrganizerPlan[K]
  ) => void
  onSavePlan: (idPlan: number) => void
}

export function OrganizerPlansTable({
  plans,
  planDrafts,
  savingPlanId,
  onUpdatePlanField,
  onSavePlan,
}: OrganizerPlansTableProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-lime-200/70 bg-white/90 p-4 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-950/35">
      <h4 className="text-lg font-semibold text-green-900 dark:text-emerald-100">Planes de organizador</h4>

      <div className="overflow-x-auto rounded-xl border border-lime-200/70">
        <table className="w-full min-w-[1200px] table-auto border-collapse text-sm">
          <thead className="bg-teal-600 dark:bg-emerald-700">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/95">Nombre</th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/95">Precio COP</th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/95">Max eventos</th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/95">Max imagenes</th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/95">Aforo min</th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/95">Aforo max</th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/95">Destacado</th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/95">Activo</th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/95">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lime-200/80 dark:divide-emerald-700/60">
            {plans.map((plan, index) => {
              const draft = planDrafts[plan.id_plan] || plan
              const isSaving = savingPlanId === plan.id_plan

              return (
                <tr
                  key={plan.id_plan}
                  className={`transition-colors ${
                    index % 2 === 0
                      ? "bg-white/95 hover:bg-lime-50/90 dark:bg-emerald-950/25 dark:hover:bg-emerald-900/35"
                      : "bg-lime-50/45 hover:bg-lime-100/75 dark:bg-teal-950/25 dark:hover:bg-teal-900/35"
                  }`}
                >
                  <td className="px-3 py-3">
                    <input
                      value={draft.nombre_plan}
                      onChange={(event) => onUpdatePlanField(plan.id_plan, "nombre_plan", event.target.value)}
                      className="w-[180px] rounded-md border border-green-600 bg-white px-2 py-1.5 text-green-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      min={1}
                      value={draft.precio_cop}
                      onChange={(event) =>
                        onUpdatePlanField(plan.id_plan, "precio_cop", Number(event.target.value) || 0)
                      }
                      className="w-[120px] rounded-md border border-green-600 bg-white px-2 py-1.5 text-green-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-2 focus:ring-lime-400"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      min={1}
                      value={draft.max_eventos_mensuales}
                      onChange={(event) =>
                        onUpdatePlanField(plan.id_plan, "max_eventos_mensuales", Number(event.target.value) || 0)
                      }
                      className="w-[110px] rounded-md border border-green-600 bg-white px-2 py-1.5 text-green-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-2 focus:ring-lime-400"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      min={1}
                      value={draft.max_imagenes_por_evento}
                      onChange={(event) =>
                        onUpdatePlanField(plan.id_plan, "max_imagenes_por_evento", Number(event.target.value) || 0)
                      }
                      className="w-[110px] rounded-md border border-green-600 bg-white px-2 py-1.5 text-green-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-2 focus:ring-lime-400"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      min={1}
                      value={draft.aforo_minimo}
                      onChange={(event) =>
                        onUpdatePlanField(plan.id_plan, "aforo_minimo", Number(event.target.value) || 0)
                      }
                      className="w-[100px] rounded-md border border-green-600 bg-white px-2 py-1.5 text-green-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-2 focus:ring-lime-400"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      min={1}
                      value={draft.aforo_maximo}
                      onChange={(event) =>
                        onUpdatePlanField(plan.id_plan, "aforo_maximo", Number(event.target.value) || 0)
                      }
                      className="w-[100px] rounded-md border border-green-600 bg-white px-2 py-1.5 text-green-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-2 focus:ring-lime-400"
                    />
                  </td>
                  <td className="px-3 py-3 text-green-900 dark:text-emerald-100/90">
                    <input
                      type="checkbox"
                      checked={draft.permite_destacado}
                      onChange={(event) =>
                        onUpdatePlanField(plan.id_plan, "permite_destacado", event.target.checked)
                      }
                      className="h-4 w-4 rounded border-green-500 text-green-700 focus:ring-lime-400"
                    />
                  </td>
                  <td className="px-3 py-3 text-green-900 dark:text-emerald-100/90">
                    <input
                      type="checkbox"
                      checked={draft.activo}
                      onChange={(event) => onUpdatePlanField(plan.id_plan, "activo", event.target.checked)}
                      className="h-4 w-4 rounded border-green-500 text-green-700 focus:ring-lime-400"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => onSavePlan(plan.id_plan)}
                      disabled={isSaving}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-green-700 px-3 py-1.5 text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {isSaving ? "Guardando..." : "Guardar"}
                    </button>
                  </td>
                </tr>
              )
            })}

            {plans.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                  No hay planes para editar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
