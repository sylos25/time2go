import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        <Loader2 className="h-12 w-12 text-green-800 animate-spin mx-auto mb-4" />
        <p className="text-gray-700 text-lg">Cargando tus eventos...</p>
      </div>
    </div>
  )
}
