import { AlertCircle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

type ProfileLoadingStateProps = {
  message: string
}

type ProfileErrorStateProps = {
  message: string
  onGoHome: () => void
}

export function ProfileLoadingState({ message }: ProfileLoadingStateProps) {
  return (
    <div className="pt-32 pb-12 px-4 flex items-center justify-center h-96">
      <div className="text-center">
        <Loader2 className="h-12 w-12 text-green-800 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground text-lg">{message}</p>
      </div>
    </div>
  )
}

export function ProfileErrorState({ message, onGoHome }: ProfileErrorStateProps) {
  return (
    <div className="pt-32 pb-12 px-4">
      <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <p className="text-foreground text-lg font-medium mb-4">{message}</p>
        <Button onClick={onGoHome} className="bg-purple-600 hover:bg-purple-700 text-white">
          Ir al Inicio
        </Button>
      </div>
    </div>
  )
}
