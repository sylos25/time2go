import { ChevronLeft, ChevronRight } from "lucide-react"

import { DashboardSectionHero } from "@/components/dashboard/shared/dashboard-section-hero"
import { TABLE_NAV_ITEMS, type DataTable } from "@/lib/insert-data-config"

type InsertDataHeroProps = {
  selectedTable: DataTable
  activeTableIndex: number
  activeTableLabel: string
  onSelectTable: (table: DataTable) => void
  onPrevious: () => void
  onNext: () => void
}

export function InsertDataHero({
  selectedTable,
  activeTableIndex,
  activeTableLabel,
  onSelectTable,
  onPrevious,
  onNext,
}: InsertDataHeroProps) {
  return (
    <DashboardSectionHero
      title={`Insertar en ${activeTableLabel}`}
    >
      <div className="flex items-center justify-center gap-1.5 sm:gap-2" role="tablist" aria-label="Navegacion de tablas para insertar">
        <button
          type="button"
          onClick={onPrevious}
          disabled={activeTableIndex <= 0}
          aria-label="Ir a la tabla anterior"
          title="Tabla anterior"
          className="cursor-pointer inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-lime-200 bg-white/95 text-green-700 transition-colors hover:border-lime-500 hover:bg-lime-100 disabled:cursor-not-allowed disabled:opacity-45 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-200 dark:hover:border-teal-400 dark:hover:bg-teal-800/40"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="w-full max-w-[calc(100vw-10rem)] overflow-x-auto sm:max-w-[72vw]">
          <div className="flex w-max items-center gap-2 px-1 py-1">
            {TABLE_NAV_ITEMS.map((item) => {
              const isActive = item.key === selectedTable
              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Insertar en tabla: ${item.label}`}
                  title={`Insertar en tabla: ${item.label}`}
                  onClick={() => onSelectTable(item.key)}
                  className={`cursor-pointer whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
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
          disabled={activeTableIndex >= TABLE_NAV_ITEMS.length - 1}
          aria-label="Ir a la tabla siguiente"
          title="Tabla siguiente"
          className="cursor-pointer inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-lime-200 bg-white/95 text-green-700 transition-colors hover:border-lime-500 hover:bg-lime-100 disabled:cursor-not-allowed disabled:opacity-45 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-200 dark:hover:border-teal-400 dark:hover:bg-teal-800/40"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </DashboardSectionHero>
  )
}
