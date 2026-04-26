import { CheckCircle2, X, XCircle } from "lucide-react"

import type { DashboardEventsNotice } from "@/hooks/use-dashboard-events"

type EventsActionNoticeProps = {
  notice: DashboardEventsNotice | null
  onClose: () => void
}

export function EventsActionNotice({ notice, onClose }: EventsActionNoticeProps) {
  if (!notice) return null

  const isSuccess = notice.tone === "success"

  return (
    <div className="pointer-events-none fixed right-5 top-5 z-50">
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-auto min-w-[280px] max-w-sm rounded-md border px-4 py-3 shadow-lg transition-all duration-300 ${
          isSuccess
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-rose-200 bg-rose-50 text-rose-700"
        }`}
      >
        <div className="flex items-start gap-3">
          {isSuccess ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <XCircle className="mt-0.5 h-4 w-4" />}
          <div className="flex-1">
            <p className="text-sm font-semibold">Aviso del sistema</p>
            <p className="mt-1 text-sm">{notice.message}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm p-1 opacity-80 transition hover:opacity-100"
            aria-label="Cerrar aviso"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
