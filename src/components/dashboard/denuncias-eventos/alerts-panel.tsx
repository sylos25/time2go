import Link from "next/link"
import { AlertTriangle, ExternalLink, Loader2 } from "lucide-react"

import type { AlertaEvento } from "@/lib/dashboard-event-reports"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type AlertsPanelProps = {
  loadingAlertas: boolean
  alertas: AlertaEvento[]
  umbralMin: number
  umbralDias: number
  minInput: string
  diasInput: string
  onMinInputChange: (value: string) => void
  onDiasInputChange: (value: string) => void
  onAplicarUmbral: () => void
}

export function AlertsPanel({
  loadingAlertas,
  alertas,
  umbralMin,
  umbralDias,
  minInput,
  diasInput,
  onMinInputChange,
  onDiasInputChange,
  onAplicarUmbral,
}: AlertsPanelProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-amber-200/80 bg-amber-50/90 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/40">
      <div className="flex flex-col gap-4 border-b border-amber-200/80 px-4 py-4 dark:border-amber-800/50 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-900 dark:text-amber-200">
            <AlertTriangle className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-amber-950 dark:text-amber-100">Eventos con muchos reportes</h2>
            <p className="text-sm text-amber-900/80 dark:text-amber-200/85">
              Prioriza revision: eventos con al menos <strong>{umbralMin}</strong> reportes en los ultimos <strong>{umbralDias}</strong> dias (ajusta abajo).
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="umbral-min" className="text-xs text-amber-900 dark:text-amber-200/90">
              Min. reportes
            </Label>
            <Input
              id="umbral-min"
              type="number"
              min={1}
              max={500}
              className="h-9 w-24 border-amber-300 bg-white dark:border-amber-800 dark:bg-amber-950/50"
              value={minInput}
              onChange={(event) => onMinInputChange(event.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="umbral-dias" className="text-xs text-amber-900 dark:text-amber-200/90">
              Ventana (dias)
            </Label>
            <Input
              id="umbral-dias"
              type="number"
              min={1}
              max={365}
              className="h-9 w-24 border-amber-300 bg-white dark:border-amber-800 dark:bg-amber-950/50"
              value={diasInput}
              onChange={(event) => onDiasInputChange(event.target.value)}
            />
          </div>
          <Button type="button" size="sm" variant="secondary" className="h-9" onClick={onAplicarUmbral}>
            Aplicar
          </Button>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-6">
        {loadingAlertas ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Calculando...
          </div>
        ) : alertas.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ningun evento supera el umbral en esta ventana. Puedes bajar el minimo de reportes o ampliar los dias.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {alertas.map((alerta) => (
              <li
                key={alerta.id_evento}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200/70 bg-white/80 px-3 py-2 dark:border-amber-900/40 dark:bg-amber-950/30"
              >
                <div>
                  <p className="font-medium text-foreground">{alerta.nombre_evento}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-amber-800 dark:text-amber-300">{alerta.reportes_count}</span> reportes - ID {alerta.id_evento}
                  </p>
                </div>
                <Link
                  href={`/eventos/${alerta.id_evento}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-amber-800 hover:underline dark:text-amber-300"
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver ficha <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
