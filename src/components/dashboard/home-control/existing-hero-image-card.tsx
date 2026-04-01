import { Trash2 } from "lucide-react"

import { MoveButtons } from "./move-buttons"
import type { HeroImage, MoveDirection } from "./types"

type ExistingHeroImageCardProps = {
  image: HeroImage
  isFirst: boolean
  isLast: boolean
  onMove: (id: number, direction: MoveDirection) => void
  onRemove: (id: number) => void
}

export function ExistingHeroImageCard({ image, isFirst, isLast, onMove, onRemove }: ExistingHeroImageCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-lime-200/70 bg-white dark:bg-emerald-950/30">
      <img src={image.url} alt={`Carrusel de imágenes ${image.order}`} className="h-44 w-full object-cover" />
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-1">
          <span className="min-w-[1.5rem] text-center text-xs font-semibold text-green-700 dark:text-emerald-400">
            #{image.order}
          </span>
          <MoveButtons onMove={(direction) => onMove(image.id, direction)} canMoveUp={!isFirst} canMoveDown={!isLast} />
        </div>
        <button
          type="button"
          title="Quitar imagen"
          onClick={() => onRemove(image.id)}
          className="rounded-md cursor-pointer p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/30"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
