import { Save } from "lucide-react"

import { formatCop, formatDate } from "../lib/planes-organizador-api"
import {
  SUBSCRIPTION_STATES,
  type OrganizerSubscription,
} from "../lib/planes-organizador-types"

type OrganizerSubscriptionsTableProps = {
  subscriptions: OrganizerSubscription[]
  pendingStatusBySubscription: Record<number, string>
  savingSubscriptionId: number | null
  onPendingStatusChange: (idSuscripcion: number, status: string) => void
  onSaveStatus: (idSuscripcion: number) => void
}

export function OrganizerSubscriptionsTable({
  subscriptions,
  pendingStatusBySubscription,
  savingSubscriptionId,
  onPendingStatusChange,
  onSaveStatus,
}: OrganizerSubscriptionsTableProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-lime-200/70 bg-white/90 p-4 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-950/35">
      <h4 className="text-lg font-semibold text-green-900 dark:text-emerald-100">Suscripciones de organizador</h4>

      <div className="overflow-x-auto rounded-xl border border-lime-200/70">
        <table className="w-full min-w-[980px] table-auto border-collapse text-sm">
          <thead className="bg-teal-600 dark:bg-emerald-700">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/95">Usuario</th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/95">Plan</th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/95">Estado</th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/95">Monto pago</th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/95">Fecha inicio</th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/95">Fecha fin</th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/95">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lime-200/80 dark:divide-emerald-700/60">
            {subscriptions.map((item, index) => {
              const pendingStatus =
                pendingStatusBySubscription[item.id_suscripcion_organizador] || item.estado_suscripcion
              const isSaving = savingSubscriptionId === item.id_suscripcion_organizador

              return (
                <tr
                  key={item.id_suscripcion_organizador}
                  className={`transition-colors ${
                    index % 2 === 0
                      ? "bg-white/95 hover:bg-lime-50/90 dark:bg-emerald-950/25 dark:hover:bg-emerald-900/35"
                      : "bg-lime-50/45 hover:bg-lime-100/75 dark:bg-teal-950/25 dark:hover:bg-teal-900/35"
                  }`}
                >
                  <td className="px-3 py-3 text-green-900 dark:text-emerald-100/90">
                    {item.nombre_usuario || `Usuario ${item.id_usuario}`}
                  </td>
                  <td className="px-3 py-3 text-green-900 dark:text-emerald-100/90">{item.nombre_plan}</td>
                  <td className="px-3 py-3">
                    <select
                      value={pendingStatus}
                      onChange={(event) =>
                        onPendingStatusChange(item.id_suscripcion_organizador, event.target.value)
                      }
                      className="w-[170px] rounded-md border border-green-600 bg-white px-2 py-1.5 text-green-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
                    >
                      {SUBSCRIPTION_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3 text-green-900 dark:text-emerald-100/90">{formatCop(item.monto_pago)}</td>
                  <td className="px-3 py-3 text-green-900 dark:text-emerald-100/90">{formatDate(item.fecha_inicio)}</td>
                  <td className="px-3 py-3 text-green-900 dark:text-emerald-100/90">{formatDate(item.fecha_fin)}</td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => onSaveStatus(item.id_suscripcion_organizador)}
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

            {subscriptions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No hay suscripciones registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
