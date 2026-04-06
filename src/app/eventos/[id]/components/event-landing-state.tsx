import { Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function EventLandingLoadingState() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Cargando evento...</p>
      </div>
    </main>
  )
}

type EventLandingNotFoundStateProps = {
  onExploreEvents: () => void
}

export function EventLandingNotFoundState({ onExploreEvents }: EventLandingNotFoundStateProps) {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <Card className="max-w-md w-full mx-4">
        <CardContent className="pt-6 text-center">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Evento no encontrado</h2>
          <p className="text-muted-foreground mb-4">
            El evento que buscas no existe o ha sido eliminado.
          </p>
          <Button variant="outline" onClick={onExploreEvents}>
            Explorar eventos
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
