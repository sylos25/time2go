import { ChevronRight, ChartNoAxesColumn } from "lucide-react"

type MyEventsHeaderProps = {
  loading: boolean
  count: number
  summaryText: string
  onGoHome: () => void
}

export function MyEventsHeader({ loading, count, summaryText, onGoHome }: MyEventsHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
        <button onClick={onGoHome} className="hover:text-green-600 transition-colors">
          Inicio
        </button>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium text-green-700">Mis Eventos</span>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground text-green-700 flex items-center gap-3">
            <ChartNoAxesColumn className="h-7 w-7 text-sky-600" />
            Mis Eventos
          </h1>
          <p className="text-muted-foreground mt-1">{summaryText}</p>
        </div>

        {!loading && count > 0 && (
          <div className="flex items-center gap-2 bg-card border border-border rounded-sm px-4 py-2">
            <ChartNoAxesColumn className="h-5 w-5 text-green-600" />
            <span className="font-bold text-foreground text-green-700 text-lg">{count}</span>
            <span className="text-muted-foreground text-sm">evento{count !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>
    </div>
  )
}