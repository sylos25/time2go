import { ChevronDown, ChevronUp } from "lucide-react"

import type { MoveDirection } from "./types"

type MoveButtonsProps = {
  onMove: (direction: MoveDirection) => void
  canMoveUp: boolean
  canMoveDown: boolean
}

export function MoveButtons({ onMove, canMoveUp, canMoveDown }: MoveButtonsProps) {
  return (
    <>
      <button
        type="button"
        title="Subir"
        onClick={() => onMove("up")}
        disabled={!canMoveUp}
        className="rounded p-0.5 text-muted-foreground hover:text-green-700 disabled:opacity-30 dark:hover:text-emerald-300"
      >
        <ChevronUp className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Bajar"
        onClick={() => onMove("down")}
        disabled={!canMoveDown}
        className="rounded p-0.5 text-muted-foreground hover:text-green-700 disabled:opacity-30 dark:hover:text-emerald-300"
      >
        <ChevronDown className="h-4 w-4" />
      </button>
    </>
  )
}
