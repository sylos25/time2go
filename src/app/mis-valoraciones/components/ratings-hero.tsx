import { ChevronRight, Star } from "lucide-react"

type RatingsHeroProps = {
  loading: boolean
  count: number
  summaryText: string
  averageText: string
  onGoHome: () => void
}

export function RatingsHero({
  loading,
  count,
  summaryText,
  averageText,
  onGoHome,
}: RatingsHeroProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
        <button onClick={onGoHome} className="hover:text-green-600 transition-colors">
          Inicio
        </button>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">Mis Valoraciones</span>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Star className="h-7 w-7 text-green-600" />
            Mis Valoraciones
          </h1>
          <p className="text-muted-foreground mt-1">{summaryText}</p>
        </div>

        {!loading && count > 0 && (
          <div className="flex items-center gap-2 bg-card border border-border rounded-sm px-4 py-2">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span className="font-bold text-foreground text-lg">{averageText}</span>
            <span className="text-muted-foreground text-sm">promedio</span>
          </div>
        )}
      </div>
    </div>
  )
}
