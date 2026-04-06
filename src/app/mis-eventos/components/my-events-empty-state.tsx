import { Card, CardContent } from "@/components/ui/card"

export function MyEventsEmptyState() {
  return (
    <Card className="bg-card/90">
      <CardContent className="pt-6 text-center text-muted-foreground">
        Aun no has creado eventos.
      </CardContent>
    </Card>
  )
}