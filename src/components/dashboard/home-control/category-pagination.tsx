import { PAGINATION_BUTTON_CLASS } from "./utils"

type CategoryPaginationProps = {
  currentPage: number
  totalPages: number
  visiblePages: number[]
  rangeStart: number
  rangeEnd: number
  filteredCount: number
  totalCount: number
  query: string
  onPrevious: () => void
  onNext: () => void
  onSelectPage: (page: number) => void
}

export function CategoryPagination({
  currentPage,
  totalPages,
  visiblePages,
  rangeStart,
  rangeEnd,
  filteredCount,
  totalCount,
  query,
  onPrevious,
  onNext,
  onSelectPage,
}: CategoryPaginationProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-lime-200/80 pt-3 dark:border-emerald-700/50 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground sm:text-sm">
        Mostrando {rangeStart}-{rangeEnd} de {filteredCount} categorías
        {query && ` (filtradas de ${totalCount})`}
      </p>

      <div className="flex items-center gap-1">
        <button type="button" onClick={onPrevious} disabled={currentPage === 1} className={PAGINATION_BUTTON_CLASS}>
          Anterior
        </button>

        {visiblePages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onSelectPage(page)}
            aria-label={`Ir a la página ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
            className={`min-w-8 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              currentPage === page
                ? "bg-green-700 text-white"
                : "border border-lime-300/80 text-green-800 hover:bg-lime-50 dark:border-emerald-600/70 dark:text-emerald-200 dark:hover:bg-emerald-900/30"
            }`}
          >
            {page}
          </button>
        ))}

        <button type="button" onClick={onNext} disabled={currentPage === totalPages} className={PAGINATION_BUTTON_CLASS}>
          Siguiente
        </button>
      </div>
    </div>
  )
}
