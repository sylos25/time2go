import { Heart, Loader2 } from "lucide-react"
import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"

type FavoritesErrorStateProps = {
  error: string
}

type FavoritesEmptyStateProps = {
  exploreEventsHref: string
}

export function FavoritesLoadingState() {
  return (
    <div className="flex justify-center items-center py-24">
      <Loader2 className="h-8 w-8 animate-spin text-green-600" />
    </div>
  )
}

export function FavoritesErrorState({ error }: FavoritesErrorStateProps) {
  return (
    <Card className="bg-card/90 backdrop-blur-sm border-border rounded-sm">
      <CardContent className="p-6 text-center">
        <p className="text-red-600 text-sm">{error}</p>
      </CardContent>
    </Card>
  )
}

export function FavoritesEmptyState({ exploreEventsHref }: FavoritesEmptyStateProps) {
  return (
    <Card className="bg-card/90 backdrop-blur-sm border-border rounded-sm">
      <CardContent className="p-12 flex flex-col items-center text-center gap-4">
        <Heart className="h-12 w-12 text-muted-foreground/30" />
        <div>
          <h3 className="font-semibold text-foreground mb-1">Sin favoritos todavia</h3>
          <p className="text-muted-foreground text-sm">
            Marca con el corazon los eventos que quieres revisar o reservar despues.
          </p>
        </div>
        <Link
          href={exploreEventsHref}
          className="px-5 py-2 rounded-sm text-white text-sm font-medium bg-rose-600 hover:scale-103 hover:bg-rose-500 transition-all cursor-pointer"
        >
          Explorar eventos
        </Link>
      </CardContent>
    </Card>
  )
}