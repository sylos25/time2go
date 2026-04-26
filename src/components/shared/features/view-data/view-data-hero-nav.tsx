import { ChevronLeft, ChevronRight } from "lucide-react"

import { DashboardSectionHero } from "@/components/dashboard/shared/dashboard-section-hero"
import type { TableKey } from "@/lib/dashboard-view-data"

type ViewDataHeroNavProps = {
  activeTableLabel: string
  activeTableIndex: number
  table: TableKey
  tableNavItems: Array<{ key: TableKey; label: string }>
  onPrev: () => void
  onNext: () => void
  onSelect: (table: TableKey) => void
}

export function ViewDataHeroNav({
  activeTableLabel,
  activeTableIndex,
  table,
  tableNavItems,
  onPrev,
  onNext,
  onSelect,
}: ViewDataHeroNavProps) {
  return (
    <DashboardSectionHero
      title={activeTableLabel}
    >
      <div className="flex items-center justify-center gap-1.5 sm:gap-2" role="tablist" aria-label="Navegacion de tablas">
        <button
          type="button"
          onClick={onPrev}
          disabled={activeTableIndex <= 0}
          aria-label="Ir a la tabla anterior"
          title="Tabla anterior"
          className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-lime-200 bg-white/95 text-green-700 transition-colors hover:border-lime-500 hover:bg-lime-100 disabled:cursor-not-allowed disabled:opacity-45 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-200 dark:hover:border-teal-400 dark:hover:bg-teal-800/40"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="w-full max-w-[calc(100vw-10rem)] overflow-x-auto sm:max-w-[72vw]">
          <div className="flex w-max items-center gap-2 px-1 py-1">
            {tableNavItems.map((item) => {
              const isActive = item.key === table
              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Mostrar tabla: ${item.label}`}
                  title={`Mostrar tabla: ${item.label}`}
                  onClick={() => onSelect(item.key)}
                  className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors sm:text-sm ${
                    isActive
                      ? "bg-green-700 text-white shadow-sm hover:bg-emerald-400 hover:text-green-900 dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-lime-400"
                      : "bg-white/90 text-green-700 hover:bg-lime-200 hover:text-green-800 dark:bg-emerald-950/55 dark:text-emerald-200 dark:hover:bg-teal-800/45"
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={activeTableIndex >= tableNavItems.length - 1}
          aria-label="Ir a la tabla siguiente"
          title="Tabla siguiente"
          className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-lime-200 bg-white/95 text-green-700 transition-colors hover:border-lime-500 hover:bg-lime-100 disabled:cursor-not-allowed disabled:opacity-45 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-200 dark:hover:border-teal-400 dark:hover:bg-teal-800/40"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </DashboardSectionHero>
  )
}
