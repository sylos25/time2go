import { ChevronLeft, ChevronRight } from "lucide-react"

import { DashboardSectionHero } from "@/components/dashboard/shared/dashboard-section-hero"
import type { EventCategoryTab } from "@/lib/dashboard-events"

type EventsHeroProps = {
  eventCategoryTabs: EventCategoryTab[]
  activeEventCategoryIndex: number
  filterCategory: string
  onPreviousCategory: () => void
  onNextCategory: () => void
  onSelectCategory: (value: string) => void
}

export function EventsHero({
  eventCategoryTabs,
  activeEventCategoryIndex,
  filterCategory,
  onPreviousCategory,
  onNextCategory,
  onSelectCategory,
}: EventsHeroProps) {
  return (
    <DashboardSectionHero
      title="Gestión de Eventos"
      subtitle={eventCategoryTabs[activeEventCategoryIndex]?.label || "Todas las categorías"}
    >
      <div className="flex items-center justify-center gap-1.5 sm:gap-2" role="tablist" aria-label="Navegacion de categorias de eventos">
        <button
          type="button"
          onClick={onPreviousCategory}
          disabled={activeEventCategoryIndex <= 0}
          aria-label="Categoria anterior"
          title="Categoria anterior"
          className="cursor-pointer inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-lime-200 bg-white/95 text-green-700 transition-colors hover:border-lime-500 hover:bg-lime-100 disabled:cursor-not-allowed disabled:opacity-45 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-200 dark:hover:border-teal-400 dark:hover:bg-teal-800/40"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="w-full max-w-[calc(100vw-10rem)] overflow-x-auto sm:max-w-[72vw]">
          <div className="flex w-max items-center gap-2 px-1 py-1">
            {eventCategoryTabs.map((item) => {
              const isActive = item.value === filterCategory
              return (
                <button
                  key={item.value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Mostrar categoria: ${item.label}`}
                  title={`Mostrar categoria: ${item.label}`}
                  onClick={() => onSelectCategory(item.value)}
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
          onClick={onNextCategory}
          disabled={activeEventCategoryIndex >= eventCategoryTabs.length - 1}
          aria-label="Categoria siguiente"
          title="Categoria siguiente"
          className="cursor-pointer inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-lime-200 bg-white/95 text-green-700 transition-colors hover:border-lime-500 hover:bg-lime-100 disabled:cursor-not-allowed disabled:opacity-45 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-200 dark:hover:border-teal-400 dark:hover:bg-teal-800/40"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </DashboardSectionHero>
  )
}
