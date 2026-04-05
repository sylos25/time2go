"use client"

import { Button } from "@/components/ui/button"

interface CreateEventAccessStateProps {
  authorized: boolean | null
  onGoHome: () => void
}

export function CreateEventAccessState({
  authorized,
  onGoHome,
}: CreateEventAccessStateProps) {
  if (authorized === false) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-card rounded-3xl shadow-xl p-8 text-center">
          <h2 className="text-2xl font-semibold text-red-600">Acceso denegado</h2>
          <p className="mt-4 text-muted-foreground">
            La cuenta actual no tiene permisos para crear eventos. Se requiere una cuenta autorizada para continuar.
          </p>
          <div className="mt-6">
            <Button onClick={onGoHome} className="bg-lime-600 text-white">
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (authorized === null) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="text-muted-foreground">Comprobando permisos...</div>
      </div>
    )
  }

  return null
}
