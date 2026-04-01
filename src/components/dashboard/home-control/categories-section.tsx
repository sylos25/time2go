import type { ChangeEvent, Dispatch, SetStateAction } from "react"

import { CategoryPagination } from "./category-pagination"
import { CategorySearchInput } from "./category-search-input"
import type { CategoryOption } from "./types"

type CategoriesSectionProps = {
  categories: CategoryOption[]
  categoryPage: number
  categoryRangeEnd: number
  categoryRangeStart: number
  categorySearchQuery: string
  filteredCategories: CategoryOption[]
  paginatedCategories: CategoryOption[]
  selectedCategoryIds: number[]
  totalCategoryPages: number
  visibleCategoryPages: number[]
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void
  onSetCategoryPage: Dispatch<SetStateAction<number>>
  onToggleCategory: (categoryId: number) => void
}

export function CategoriesSection({
  categories,
  categoryPage,
  categoryRangeEnd,
  categoryRangeStart,
  categorySearchQuery,
  filteredCategories,
  paginatedCategories,
  selectedCategoryIds,
  totalCategoryPages,
  visibleCategoryPages,
  onSearchChange,
  onSetCategoryPage,
  onToggleCategory,
}: CategoriesSectionProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-lime-200/70 bg-white/90 p-4 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-950/35">
      <div className="space-y-2">
        <h4 className="text-2xl font-bold text-green-900 dark:text-emerald-100 sm:text-3xl">
          Administración de Categoría en la Página de Inicio
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Selecciona las categorías que se mostrarán con sus eventos promocionados.
        </p>
      </div>

      <CategorySearchInput value={categorySearchQuery} onChange={onSearchChange} />

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
        {paginatedCategories.map((category) => {
          const checked = selectedCategoryIds.includes(category.id)

          return (
            <label
              key={category.id}
              className="flex items-center gap-3 rounded-lg border border-lime-200/80 bg-white/80 px-3 py-2 text-green-900 dark:border-emerald-700/60 dark:bg-emerald-950/30 dark:text-emerald-100"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggleCategory(category.id)}
                className="h-4 w-4 rounded border-green-500 text-green-700 focus:ring-lime-400"
              />
              <span>{category.nombre}</span>
            </label>
          )
        })}
      </div>

      {filteredCategories.length > 0 && (
        <CategoryPagination
          currentPage={categoryPage}
          totalPages={totalCategoryPages}
          visiblePages={visibleCategoryPages}
          rangeStart={categoryRangeStart}
          rangeEnd={categoryRangeEnd}
          filteredCount={filteredCategories.length}
          totalCount={categories.length}
          query={categorySearchQuery}
          onPrevious={() => onSetCategoryPage((prevPage) => Math.max(1, prevPage - 1))}
          onNext={() => onSetCategoryPage((prevPage) => Math.min(totalCategoryPages, prevPage + 1))}
          onSelectPage={onSetCategoryPage}
        />
      )}
    </section>
  )
}
