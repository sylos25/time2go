import { ChartNoAxesColumn } from "lucide-react"
import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"

type MyEventsEmptyStateProps = {
  exploreEventsHref: string
}

export function MyEventsEmptyState({ exploreEventsHref }: MyEventsEmptyStateProps) {
  return (
    <Card className="bg-card/90 backdrop-blur-sm border border-border rounded-sm">
      <CardContent className="p-12 flex flex-col items-center text-center gap-4">
        <ChartNoAxesColumn className="h-12 w-12 text-muted-foreground/30" />
        <div>
          <h3 className="font-semibold text-foreground mb-1">Sin eventos todavia</h3>
          <p className="text-muted-foreground text-sm">
            Crea o publica eventos para verlos listados en esta seccion.
          </p>
        </div>
        <Link
          href={exploreEventsHref}
          className="px-5 py-2 rounded-sm text-white text-sm font-medium bg-rose-600 hover:bg-rose-500 hover:scale-103 transition-colors cursor-pointer"
        >
          Explorar eventos
        </Link>
      </CardContent>
    </Card>
  )
}