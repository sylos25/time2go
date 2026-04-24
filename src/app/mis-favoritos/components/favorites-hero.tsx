import { ChevronRight, Heart } from "lucide-react"
import Link from "next/link"

type FavoritesHeroProps = {
  summaryText: string
  favoritesCount: number
  loading: boolean
  homeHref: string
}

export function FavoritesHero({
  summaryText,
  favoritesCount,
  loading,
  homeHref,
}: FavoritesHeroProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
        <Link href={homeHref} className="hover:text-green-600 transition-colors">
          Inicio
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium text-green-700">Mis Favoritos</span>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground text-green-700 flex items-center gap-3">
            <Heart className="h-7 w-7 text-red-500 fill-red-500" />
            Mis Favoritos
          </h1>
          <p className="text-muted-foreground mt-1">{summaryText}</p>
        </div>

        {!loading && favoritesCount > 0 && (
          <div className="flex items-center gap-2 bg-card border border-border rounded-sm px-4 py-2">
            <Heart className="h-5 w-5 fill-red-500 text-red-500" />
            <span className="font-bold text-foreground text-green-700 text-lg">{favoritesCount}</span>
            <span className="text-muted-foreground text-sm">
              favorito{favoritesCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}