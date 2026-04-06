import { ChevronLeft, ChevronRight } from "lucide-react"

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
    <div className="relative overflow-hidden rounded-2xl border border-green-700/30 bg-green-600 px-3 py-5 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-900 sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-lime-300/30 blur-2xl dark:bg-lime-500/20" />
      <div className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-teal-300/25 blur-2xl dark:bg-emerald-500/20" />

      <div className="relative space-y-4">
        <h3 className="mb-4 text-center text-3xl font-semibold tracking-tight text-white dark:text-lime-200 sm:mb-6 sm:text-5xl">
          <span style={{ fontFamily: "Futura, Trebuchet MS, Helvetica, Arial, sans-serif" }}>Insertar en {activeTableLabel}</span>
        </h3>

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
      </div>
    </div>
  )
}
