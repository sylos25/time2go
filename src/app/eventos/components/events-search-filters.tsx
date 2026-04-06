import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { CategoriaEvento, EventCardItem } from "@/app/eventos/lib/events-page-types"
import { SearchFeaturedEvents } from "@/app/eventos/components/search-featured-events"

type EventsSearchFiltersProps = {
  searchTerm: string
  selectedCategory: string
  isSearchFocused: boolean
  topRatedEvents: EventCardItem[]
  categories: CategoriaEvento[]
  onSearchChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onSearchFocus: () => void
  onSearchBlur: () => void
}

export function EventsSearchFilters({
  searchTerm,
  selectedCategory,
  isSearchFocused,
  topRatedEvents,
  categories,
  onSearchChange,
  onCategoryChange,
  onSearchFocus,
  onSearchBlur,
}: EventsSearchFiltersProps) {
  return (
    <div className="mt-20 bg-card/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-border mb-12 relative">
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-6 w-6" />
          <Input
            placeholder="¿Qué evento buscas hoy?"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            className="pl-12 h-14 text-lg rounded-2xl border-2 border-gray-200 focus:border-blue-500 transition-all duration-300"
          />

          {isSearchFocused && <SearchFeaturedEvents topRatedEvents={topRatedEvents} />}
        </div>

        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full lg:w-64 h-14 rounded-2xl border-2 border-gray-200">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem
                key={category.id_categoria_evento}
                value={String(category.id_categoria_evento)}
              >
                {category.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
