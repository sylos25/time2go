"use client"

import { Button } from "@/components/ui/button"

type MisEventosErrorStateProps = {
  onRetry: () => void
}

export function MisEventosErrorState({ onRetry }: MisEventosErrorStateProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-md">
        <h2 className="text-2xl font-semibold text-foreground">No se pudieron cargar tus eventos</h2>
        <p className="text-muted-foreground">Intentalo nuevamente para seguir gestionandolos.</p>
        <Button onClick={onRetry}>Reintentar</Button>
      </div>
    </div>
  )
}