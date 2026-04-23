import { ChevronRight, CreditCard } from "lucide-react"

type TransactionsHeroProps = {
  loading: boolean
  count: number
  summaryText: string
  onGoHome: () => void
}

export function TransactionsHero({
  loading,
  count,
  summaryText,
  onGoHome,
}: TransactionsHeroProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
        <button onClick={onGoHome} className="hover:text-green-600 transition-colors">
          Inicio
        </button>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium text-green-700">Mis Transacciones</span>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground text-green-700 flex items-center gap-3">
            <CreditCard className="h-7 w-7 text-orange-500" />
            Mis Transacciones
          </h1>
          <p className="text-muted-foreground mt-1">{summaryText}</p>
        </div>

        {!loading && count > 0 && (
          <div className="flex items-center gap-2 bg-card border border-border rounded-sm px-4 py-2">
            <CreditCard className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium">
              Total de compras: <span className="text-green-700">{count}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
