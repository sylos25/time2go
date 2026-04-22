import { Loader2 } from "lucide-react"

type MisEventosLoadingStateProps = {
  message: string
}

export function MisEventosLoadingState({ message }: MisEventosLoadingStateProps) {
  return (
    <div className="flex flex-col justify-center items-center py-24">
      <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      <p className="text-muted-foreground text-lg mt-4">{message}</p>
    </div>
  )
}