import { MisEventosLoadingState } from "@/app/mis-eventos/components/mis-eventos-loading-state"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <MisEventosLoadingState message="Cargando tus eventos..." />
    </div>
  )
}
