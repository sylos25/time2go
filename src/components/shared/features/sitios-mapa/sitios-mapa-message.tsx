import { AlertCircle, CheckCircle2 } from "lucide-react"

import type { SitiosMapaMessage } from "@/lib/sitios-mapa"

type SitiosMapaMessageProps = {
  message: SitiosMapaMessage
}

export function SitiosMapaMessage({ message }: SitiosMapaMessageProps) {
  if (!message) return null

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-5 py-4 text-sm font-medium shadow-sm transition-all ${
        message.type === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-700/50 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "border-red-200 bg-red-50 text-red-800 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-300"
      }`}
    >
      {message.type === "success" ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
      )}
      {message.text}
    </div>
  )
}
