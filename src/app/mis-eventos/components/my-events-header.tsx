import { Button } from "@/components/ui/button"

type MyEventsHeaderProps = {
  onExplore: () => void
}

export function MyEventsHeader({ onExplore }: MyEventsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold text-foreground">Mis Eventos</h1>
      <Button variant="outline" onClick={onExplore}>
        Explorar eventos
      </Button>
    </div>
  )
}