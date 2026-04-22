import { Loader2, Star } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

type RatingsErrorStateProps = {
  error: string
}

type RatingsEmptyStateProps = {
  onExploreEvents: () => void
}

export function RatingsLoadingState() {
  return (
    <div className="flex justify-center items-center py-24">
      <Loader2 className="h-8 w-8 animate-spin text-green-600" />
    </div>
  )
}

export function RatingsErrorState({ error }: RatingsErrorStateProps) {
  return (
    <Card className="bg-card/90 backdrop-blur-sm border border-red-200 rounded-sm">
      <CardContent className="p-6 text-center">
        <p className="text-red-600 text-sm">{error}</p>
      </CardContent>
    </Card>
  )
}

export function RatingsEmptyState({ onExploreEvents }: RatingsEmptyStateProps) {
  return (
    <Card className="bg-card/90 backdrop-blur-sm border border-border rounded-sm">
      <CardContent className="p-12 flex flex-col items-center text-center gap-4">
        <Star className="h-12 w-12 text-muted-foreground/30" />
        <div>
          <h3 className="font-semibold text-foreground mb-1">Sin valoraciones todavia</h3>
          <p className="text-muted-foreground text-sm">
            Asiste a un evento y cuentanos tu experiencia calificandolo.
          </p>
        </div>
        <button
          onClick={onExploreEvents}
          className="px-5 py-2 rounded-sm text-white text-sm font-medium bg-rose-600 hover:bg-rose-500 hover:scale-103 transition-colors cursor-pointer"
        >
          Explorar eventos
        </button>
      </CardContent>
    </Card>
  )
}
