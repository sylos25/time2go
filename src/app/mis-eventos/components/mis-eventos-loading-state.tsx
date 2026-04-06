import { Loader2 } from "lucide-react"

type MisEventosLoadingStateProps = {
  message: string
}

export function MisEventosLoadingState({ message }: MisEventosLoadingStateProps) {
  return (
    <div className="text-center">
      <Loader2 className="h-12 w-12 text-green-800 animate-spin mx-auto mb-4" />
      <p className="text-muted-foreground text-lg">{message}</p>
    </div>
  )
}