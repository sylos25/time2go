import { ShieldAlert } from "lucide-react"

import {
  ESTADOS_FILTRO,
} from "@/lib/dashboard-event-reports"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ReportsHeaderProps = {
  estadoFiltro: string
  onEstadoFiltroChange: (value: string) => void
}

export function ReportsHeader({ estadoFiltro, onEstadoFiltroChange }: ReportsHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-green-700/30 bg-green-600 px-4 py-6 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-900 sm:px-6">
      <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <ShieldAlert className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Reportes de eventos</h1>
            <p className="text-sm text-white/85">
              Cola de denuncias: categoria y motivo (resumen). Detalle opcional del usuario al final.
            </p>
          </div>
        </div>
        <div className="w-full sm:w-56">
          <Select value={estadoFiltro} onValueChange={onEstadoFiltroChange}>
            <SelectTrigger className="h-10 border-white/30 bg-white/10 text-white [&_svg]:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ESTADOS_FILTRO.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
