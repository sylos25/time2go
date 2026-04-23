import { Loader2 } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

type TransactionsErrorStateProps = {
  error: string
}

export function TransactionsLoadingState() {
  return (
    <Card className="bg-card/90 backdrop-blur-sm border border-border rounded-sm">
      <CardContent className="p-8 flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-green-700" />
        Cargando tus transacciones...
      </CardContent>
    </Card>
  )
}

export function TransactionsErrorState({ error }: TransactionsErrorStateProps) {
  return (
    <Card className="bg-card/90 backdrop-blur-sm border border-red-200 rounded-sm">
      <CardContent className="p-4 text-sm text-red-600">{error}</CardContent>
    </Card>
  )
}

export function TransactionsEmptyState() {
  return (
    <Card className="bg-card/90 backdrop-blur-sm border border-border rounded-sm">
      <CardContent className="p-8 text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">Sin transacciones por ahora</h2>
        <p className="text-muted-foreground">Cuando adquieras un plan de organizador, aparecera aqui.</p>
      </CardContent>
    </Card>
  )
}
