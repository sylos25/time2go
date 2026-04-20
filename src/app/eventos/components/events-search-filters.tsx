import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type {
  CategoriaEvento,
  EventCardItem,
  EventFilterType,
} from "@/app/eventos/lib/events-page-types"
import { SearchFeaturedEvents } from "@/app/eventos/components/search-featured-events"

type EventsSearchFiltersProps = {
  searchTerm: string
  selectedFilterType: EventFilterType
  selectedFilterValue: string
  isSearchFocused: boolean
  topRatedEvents: EventCardItem[]
  categories: CategoriaEvento[]
  onSearchChange: (value: string) => void
  onFilterTypeChange: (value: EventFilterType) => void
  onFilterValueChange: (value: string) => void
  onSearchFocus: () => void
  onSearchBlur: () => void
}

export function EventsSearchFilters({
  searchTerm,
  selectedFilterType,
  selectedFilterValue,
  isSearchFocused,
  topRatedEvents,
  categories,
  onSearchChange,
  onFilterTypeChange,
  onFilterValueChange,
  onSearchFocus,
  onSearchBlur,
}: EventsSearchFiltersProps) {
  const parameterPlaceholder =
    selectedFilterType === "category"
      ? "Categoría"
      : selectedFilterType === "time"
        ? "Franja horaria"
        : selectedFilterType === "price"
          ? "Orden de precio"
          : "Tipo de acceso"

  return (
    <div className="mt-20 bg-card/90 dark:bg-card/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-border/70 dark:border-border/50 mb-12 relative">
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-6 w-6" />
          <Input
            placeholder="¿Qué evento buscas hoy?"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            className="pl-12 h-14 text-lg rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80 text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:focus-visible:ring-blue-400/40 transition-all duration-300"
          />

          {isSearchFocused && <SearchFeaturedEvents topRatedEvents={topRatedEvents} />}
        </div>

        <Select
          value={selectedFilterType}
          onValueChange={(value) => onFilterTypeChange(value as EventFilterType)}
        >
          <SelectTrigger className="w-full lg:w-56 h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80 text-foreground">
            <SelectValue placeholder="Filtrar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="category">Por categoría</SelectItem>
            <SelectItem value="time">Por tiempo</SelectItem>
            <SelectItem value="price">Por dinero</SelectItem>
            <SelectItem value="access">Por acceso</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedFilterValue} onValueChange={onFilterValueChange}>
          <SelectTrigger className="w-full lg:w-72 h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80 text-foreground">
            <SelectValue placeholder={parameterPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {selectedFilterType === "category" && (
              <>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem
                    key={category.id_categoria_evento}
                    value={String(category.id_categoria_evento)}
                  >
                    {category.nombre}
                  </SelectItem>
                ))}
              </>
            )}

            {selectedFilterType === "time" && (
              <>
                <SelectItem value="diurno">Diurno (6:00 a.m. - 5:00 p.m.)</SelectItem>
                <SelectItem value="nocturno">Nocturno (5:00 p.m. - 6:00 a.m.)</SelectItem>
              </>
            )}

            {selectedFilterType === "price" && (
              <>
                <SelectItem value="asc">Menor precio (ascendente)</SelectItem>
                <SelectItem value="desc">Mayor precio (descendente)</SelectItem>
              </>
            )}

            {selectedFilterType === "access" && (
              <>
                <SelectItem value="gratis">Entrada gratis</SelectItem>
                <SelectItem value="pago">Entrada de costo ($)</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
