"use client"

import { Button } from "@/components/ui/button"

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-md">
        <h2 className="text-2xl font-semibold text-foreground">No se pudieron cargar tus eventos</h2>
        <p className="text-muted-foreground">Inténtalo nuevamente para seguir gestionándolos.</p>
        <Button onClick={reset}>Reintentar</Button>
      </div>
    </div>
  )
}