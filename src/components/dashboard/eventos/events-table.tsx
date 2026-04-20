import { Calendar, CheckCircle, Download, Edit, Trash2, X } from "lucide-react"

import type { DashboardEvent } from "@/lib/dashboard-events"
import { formatEventDate, formatEventTime, getStatusColor, getStatusText } from "@/lib/dashboard-events"

type EventsTableProps = {
  events: DashboardEvent[]
  togglingDestacado: number | null
  onToggleDestacado: (id: number, currentValue: boolean) => void
  onApproveEvent: (id: number) => void
  onRejectEvent: (id: number) => void
  onDownloadDocument: (eventItem: DashboardEvent) => void
  onEditEvent: (eventItem: DashboardEvent) => void
  onDeleteEvent: (id: number) => void
}

export function EventsTable({
  events,
  togglingDestacado,
  onToggleDestacado,
  onApproveEvent,
  onRejectEvent,
  onDownloadDocument,
  onEditEvent,
  onDeleteEvent,
}: EventsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-lime-200/70 bg-white/85 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-950/35">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-green-500 dark:bg-emerald-700">
            <tr>
              <th className="border-r border-lime-200/35 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/95 dark:border-emerald-300/20">Evento</th>
              <th className="border-r border-lime-200/35 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/95 dark:border-emerald-300/20">Fecha y Hora</th>
              <th className="border-r border-lime-200/35 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/95 dark:border-emerald-300/20">Ubicacion</th>
              <th className="border-r border-lime-200/35 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/95 dark:border-emerald-300/20">Tickets</th>
              <th className="border-r border-lime-200/35 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/95 dark:border-emerald-300/20">Estado</th>
              <th className="border-r border-lime-200/35 px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-white/95 dark:border-emerald-300/20">Destacado</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/95">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lime-200/80 dark:divide-emerald-700/60">
            {events.map((eventItem) => (
              <tr key={eventItem.id} className="bg-white/95 transition-colors hover:bg-lime-50/90 dark:bg-emerald-950/25 dark:hover:bg-emerald-900/35">
                <td className="border-r border-lime-200/70 px-6 py-4 dark:border-emerald-700/45">
                  <p className="font-semibold text-green-900 dark:text-emerald-100/90">{eventItem.name}</p>
                  <p className="text-sm text-green-700/80 dark:text-emerald-200/80">{eventItem.category}</p>
                </td>
                <td className="border-r border-lime-200/70 px-6 py-4 dark:border-emerald-700/45">
                  <div className="flex flex-col gap-1">
                    <div className="text-sm text-green-900 dark:text-emerald-100/90">{formatEventDate(eventItem.date)}</div>
                    <div className="text-sm text-green-700/80 dark:text-emerald-200/80">{formatEventTime(eventItem.time)}</div>
                  </div>
                </td>
                <td className="border-r border-lime-200/70 px-6 py-4 text-sm text-green-900 dark:border-emerald-700/45 dark:text-emerald-100/90">
                  {eventItem.location}
                </td>
                <td className="border-r border-lime-200/70 px-6 py-4 dark:border-emerald-700/45">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-green-900 dark:text-emerald-100/90">
                      {eventItem.ticketsSold} / {eventItem.capacity}
                    </span>
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${eventItem.capacity > 0 ? Math.min(100, (eventItem.ticketsSold / eventItem.capacity) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="border-r border-lime-200/70 px-6 py-4 dark:border-emerald-700/45">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(eventItem.status)}`}>
                    {getStatusText(eventItem.status)}
                  </span>
                </td>
                <td className="border-r border-lime-200/70 px-6 py-4 text-center dark:border-emerald-700/45">
                  <button
                    role="switch"
                    aria-checked={eventItem.destacado}
                    onClick={() => onToggleDestacado(eventItem.id, eventItem.destacado)}
                    disabled={togglingDestacado === eventItem.id}
                    title={eventItem.destacado ? "Quitar de destacados" : "Marcar como destacado"}
                    className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${eventItem.destacado ? "bg-yellow-400" : "bg-muted"}`}
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${eventItem.destacado ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onApproveEvent(eventItem.id)}
                      className="rounded-lg p-2 text-green-600 transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                      title={eventItem.visibility ? "Evento validado" : "Validar evento"}
                      disabled={eventItem.visibility}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onRejectEvent(eventItem.id)}
                      className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"
                      title="Rechazar evento"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDownloadDocument(eventItem)}
                      className="rounded-lg p-2 text-purple-600 transition-colors hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-40"
                      title={eventItem.documentos.length > 0 ? "Ver documento PDF" : "Sin documento"}
                      disabled={eventItem.documentos.length === 0}
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEditEvent(eventItem)}
                      className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                      title="Editar evento"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteEvent(eventItem.id)}
                      className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                        title="Desactivar evento"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {events.length === 0 && (
        <div className="py-12 text-center">
          <Calendar className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <p className="font-medium text-muted-foreground">No se encontraron eventos</p>
          <p className="mt-1 text-sm text-muted-foreground">Intenta con otros filtros de busqueda</p>
        </div>
      )}
    </div>
  )
}
