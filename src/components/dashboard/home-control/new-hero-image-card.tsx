import { Trash2 } from "lucide-react"

import { MoveButtons } from "./move-buttons"
import type { MoveDirection } from "./types"

type NewHeroImageCardProps = {
  file: File
  previewUrl: string
  displayOrder: number
  index: number
  isFirst: boolean
  isLast: boolean
  onMove: (index: number, direction: MoveDirection) => void
  onRemove: (index: number) => void
}

export function NewHeroImageCard({
  file,
  previewUrl,
  displayOrder,
  index,
  isFirst,
  isLast,
  onMove,
  onRemove,
}: NewHeroImageCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-dashed border-lime-400/80 bg-lime-50/60 dark:bg-emerald-950/30">
      <img src={previewUrl} alt={file.name} className="h-44 w-full object-cover" />
      <div className="flex items-center justify-between p-3">
        <div className="flex min-w-0 items-center gap-1">
          <span className="min-w-[1.5rem] text-center text-xs font-semibold text-lime-700 dark:text-lime-400">
            #{displayOrder}
          </span>
          <MoveButtons onMove={(direction) => onMove(index, direction)} canMoveUp={!isFirst} canMoveDown={!isLast} />
          <span className="max-w-[8rem] truncate text-xs text-muted-foreground">{file.name}</span>
        </div>
        <button
          type="button"
          title="Quitar imagen"
          onClick={() => onRemove(index)}
          className="rounded-md p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/30"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
