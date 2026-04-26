"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import { SearchFeaturedEvents } from "@/app/eventos/components/search-featured-events"
import type {
  AvailabilityFilter,
  CategoriaEvento,
  DepartmentOption,
  EventCardItem,
  EventFilters,
  EventTypeOption,
  MunicipalityOption,
  PriceMode,
} from "@/app/eventos/lib/events-page-types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type EventsSearchFiltersProps = {
  searchTerm: string
  filters: EventFilters
  isSearchFocused: boolean
  topRatedEvents: EventCardItem[]
  categories: CategoriaEvento[]
  eventTypes: EventTypeOption[]
  departments: DepartmentOption[]
  municipalities: MunicipalityOption[]
  onSearchChange: (value: string) => void
  onCategoryChange: (categoryId: number | null) => void
  onEventTypeChange: (eventTypeId: number | null) => void
  onDepartmentChange: (departmentId: number | null) => void
  onMunicipalityChange: (municipalityId: number | null) => void
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
  onPriceModeChange: (value: PriceMode) => void
  onMinPriceChange: (value: number | null) => void
  onMaxPriceChange: (value: number | null) => void
  onAvailabilityChange: (value: AvailabilityFilter) => void
  onClearFilters: () => void
  onSearchFocus: () => void
  onSearchBlur: () => void
}

export function EventsSearchFilters({
  searchTerm,
  filters,
  isSearchFocused,
  topRatedEvents,
  categories,
  eventTypes,
  departments,
  municipalities,
  onSearchChange,
  onCategoryChange,
  onEventTypeChange,
  onDepartmentChange,
  onMunicipalityChange,
  onDateFromChange,
  onDateToChange,
  onPriceModeChange,
  onMinPriceChange,
  onMaxPriceChange,
  onAvailabilityChange,
  onClearFilters,
  onSearchFocus,
  onSearchBlur,
}: EventsSearchFiltersProps) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  const todayDate = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }, [])

  const filteredEventTypes =
    filters.categoryId === null
      ? eventTypes
      : eventTypes.filter((eventType) => eventType.id_categoria_evento === filters.categoryId)

  const filteredMunicipalities =
    filters.departmentId === null
      ? municipalities
      : municipalities.filter(
          (municipality) => municipality.id_departamento === filters.departmentId
        )

  const activeFiltersCount = useMemo(() => {
    let count = 0

    if (filters.categoryId !== null) count += 1
    if (filters.eventTypeId !== null) count += 1
    if (filters.departmentId !== null) count += 1
    if (filters.municipalityId !== null) count += 1
    if (filters.startDate) count += 1
    if (filters.endDate) count += 1
    if (filters.priceMode !== "all") count += 1
    if (filters.minPrice !== null) count += 1
    if (filters.maxPrice !== null) count += 1
    if (filters.availability !== "all") count += 1

    return count
  }, [filters])

  const parsePriceInput = (value: string): number | null => {
    const trimmed = value.trim()
    if (!trimmed) return null

    const numeric = Number(trimmed)
    if (!Number.isFinite(numeric) || numeric < 0) return null

    return numeric
  }

  const baseFieldClass =
    "h-11 w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80"

  const minEndDate =
    filters.startDate && filters.startDate > todayDate ? filters.startDate : todayDate

  const handleStartDateChange = (value: string) => {
    if (!value) {
      onDateFromChange("")
      return
    }

    const normalizedStart = value < todayDate ? todayDate : value
    onDateFromChange(normalizedStart)

    if (filters.endDate && filters.endDate < normalizedStart) {
      onDateToChange(normalizedStart)
    }
  }

  const handleEndDateChange = (value: string) => {
    if (!value) {
      onDateToChange("")
      return
    }

    const normalizedEnd = value < minEndDate ? minEndDate : value
    onDateToChange(normalizedEnd)
  }

  return (
    <div className="relative z-20 -mb-10 mt-14 rounded-3xl border border-border/70 bg-card/90 p-6 shadow-2xl backdrop-blur-md dark:border-border/50 dark:bg-card/80 lg:p-8">
      <div className="pointer-events-none absolute -top-5 left-8 h-10 w-10 rounded-full bg-lime-300/30 blur-xl" />
      <div className="pointer-events-none absolute -bottom-4 right-10 h-12 w-12 rounded-full bg-emerald-400/20 blur-2xl" />

      <div className="relative">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
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

          <Button
            type="button"
            className="h-14 min-w-32 rounded-xl text-xl font-bold bg-green-700 text-white hover:bg-green-600 hover:scale-103 transition-transform transition-colors"
            onClick={() => setIsFilterModalOpen(true)}
          >
            Filtrar
            {activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ""}
          </Button>
        </div>
      </div>

      <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <DialogContent className="w-[96vw] sm:w-[94vw] !max-w-[96vw] sm:!max-w-[1200px] lg:!max-w-[1320px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-green-700">Filtrar eventos</DialogTitle>
            <DialogDescription>
              Ajusta los criterios para encontrar eventos.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select
                value={filters.categoryId === null ? "all" : String(filters.categoryId)}
                onValueChange={(value) => onCategoryChange(value === "all" ? null : Number(value))}
              >
                <SelectTrigger className={`${baseFieldClass} text-foreground`}>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
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

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={filters.eventTypeId === null ? "all" : String(filters.eventTypeId)}
                onValueChange={(value) => onEventTypeChange(value === "all" ? null : Number(value))}
              >
                <SelectTrigger className={`${baseFieldClass} text-foreground`}>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {filteredEventTypes.map((eventType) => (
                    <SelectItem key={eventType.id_tipo_evento} value={String(eventType.id_tipo_evento)}>
                      {eventType.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Departamento</Label>
              <Select
                value={filters.departmentId === null ? "all" : String(filters.departmentId)}
                onValueChange={(value) => onDepartmentChange(value === "all" ? null : Number(value))}
              >
                <SelectTrigger className={`${baseFieldClass} text-foreground`}>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {departments.map((department) => (
                    <SelectItem
                      key={department.id_departamento}
                      value={String(department.id_departamento)}
                    >
                      {department.nombre_departamento}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Municipio</Label>
              <Select
                value={filters.municipalityId === null ? "all" : String(filters.municipalityId)}
                onValueChange={(value) =>
                  onMunicipalityChange(value === "all" ? null : Number(value))
                }
              >
                <SelectTrigger className={`${baseFieldClass} text-foreground`}>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {filteredMunicipalities.map((municipality) => (
                    <SelectItem
                      key={municipality.id_municipio}
                      value={String(municipality.id_municipio)}
                    >
                      {municipality.nombre_municipio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fecha desde</Label>
              <Input
                type="date"
                min={todayDate}
                max={filters.endDate || undefined}
                value={filters.startDate}
                onChange={(event) => handleStartDateChange(event.target.value)}
                className={baseFieldClass}
              />
            </div>

            <div className="space-y-2">
              <Label>Fecha hasta</Label>
              <Input
                type="date"
                min={minEndDate}
                value={filters.endDate}
                onChange={(event) => handleEndDateChange(event.target.value)}
                className={baseFieldClass}
              />
            </div>

            <div className="space-y-2">
              <Label>Precio</Label>
              <Select
                value={filters.priceMode}
                onValueChange={(value) => onPriceModeChange(value as PriceMode)}
              >
                <SelectTrigger className={`${baseFieldClass} text-foreground`}>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Gratis y pago</SelectItem>
                  <SelectItem value="free">Solo gratis</SelectItem>
                  <SelectItem value="paid">Solo pago</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Disponibilidad</Label>
              <Select
                value={filters.availability}
                onValueChange={(value) => onAvailabilityChange(value as AvailabilityFilter)}
              >
                <SelectTrigger className={`${baseFieldClass} text-foreground`}>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="with-reservation">Con reserva</SelectItem>
                  <SelectItem value="without-reservation">Sin reserva</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Precio mínimo</Label>
              <Input
                type="number"
                min={0}
                inputMode="numeric"
                value={filters.minPrice ?? ""}
                onChange={(event) => onMinPriceChange(parsePriceInput(event.target.value))}
                placeholder="0"
                className={`${baseFieldClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
              />
            </div>

            <div className="space-y-2">
              <Label>Precio máximo</Label>
              <Input
                type="number"
                min={0}
                inputMode="numeric"
                value={filters.maxPrice ?? ""}
                onChange={(event) => onMaxPriceChange(parsePriceInput(event.target.value))}
                placeholder="100000"
                className={`${baseFieldClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-green-700 text-green-700 hover:bg-green-50 hover:text-green-700 hover:scale-103 transition-transform transition-colors"
              onClick={onClearFilters}
            >
              Limpiar filtros
            </Button>
            <Button
              type="button"
              className="rounded-xl bg-rose-600 hover:bg-rose-500 hover:scale-103 transition-transform transition-colors"
              onClick={() => setIsFilterModalOpen(false)}
            >
              Aplicar filtros
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
