import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { useFavorites } from "@/hooks/use-favorites"
import { buildEventUrl } from "@/lib/event-url"
import {
  filterAndSortEvents,
  normalizeEvent,
} from "@/app/eventos/lib/events-page-utils"
import type {
  DepartmentOption,
  EventFilters,
  EventTypeOption,
  CategoriaEvento,
  EventCardItem,
  MunicipalityOption,
  RawEvent,
} from "@/app/eventos/lib/events-page-types"

const DEFAULT_FILTERS: EventFilters = {
  categoryId: null,
  eventTypeId: null,
  departmentId: null,
  municipalityId: null,
  startDate: "",
  endDate: "",
  priceMode: "all",
  minPrice: null,
  maxPrice: null,
  availability: "all",
}

export function useEventsPage() {
  const [events, setEvents] = useState<EventCardItem[]>([])
  const [categories, setCategories] = useState<CategoriaEvento[]>([])
  const [departments, setDepartments] = useState<DepartmentOption[]>([])
  const [municipalityOptions, setMunicipalityOptions] = useState<MunicipalityOption[]>([])
  const [selectedImageByEvent, setSelectedImageByEvent] = useState<Record<number, number>>({})
  const router = useRouter()

  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [isLogin, setIsLogin] = useState(true)

  const { favoriteIds, favoritePendingIds, toggleFavorite } = useFavorites(
    useCallback(() => { router.push("/auth?redirect=/eventos") }, [router])
  )

  const openAuthModal = useCallback((loginMode = true) => {
    setIsLogin(loginMode)
    setAuthModalOpen(true)
  }, [])
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<EventFilters>(DEFAULT_FILTERS)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [expandedEventId, setExpandedEventId] = useState<number | null>(null)
  const [copiedEventId, setCopiedEventId] = useState<number | null>(null)

  const setCategoryFilter = useCallback((categoryId: number | null) => {
    setFilters((current) => ({
      ...current,
      categoryId,
      eventTypeId: null,
    }))
  }, [])

  const setDepartmentFilter = useCallback((departmentId: number | null) => {
    setFilters((current) => {
      const municipalityDepartmentId =
        current.municipalityId === null
          ? null
          : municipalityOptions.find(
              (municipality) => municipality.id_municipio === current.municipalityId
            )?.id_departamento || null

      const nextMunicipalityId =
        departmentId !== null && municipalityDepartmentId !== null && municipalityDepartmentId !== departmentId
          ? null
          : current.municipalityId

      return {
        ...current,
        departmentId,
        municipalityId: nextMunicipalityId,
      }
    })
  }, [municipalityOptions])

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  const fetchEventos = useCallback(async () => {
    try {
      const response = await fetch("/api/events")
      const data = await response.json()
      const rawEvents: RawEvent[] =
        data && data.ok && Array.isArray(data.eventos)
          ? data.eventos
          : Array.isArray(data)
            ? data
            : []

      const visibleEvents = rawEvents.filter((event) => event?.estado === true)
      setEvents(visibleEvents.map(normalizeEvent))
    } catch (error) {
      console.error("Error fetching events:", error)
      setEvents([])
    }
  }, [])

  const fetchCategorias = useCallback(async () => {
    try {
      const response = await fetch("/api/categoria_evento")
      const data = await response.json()
      const list = Array.isArray(data) ? data : []

      const normalized = list
        .map((category: Record<string, unknown>) => ({
          id_categoria_evento: Number(category?.id_categoria_evento || 0),
          nombre: String(category?.nombre || "").trim(),
        }))
        .filter(
          (category: CategoriaEvento) =>
            category.id_categoria_evento > 0 && category.nombre.length > 0
        )

      setCategories(normalized)
    } catch (error) {
      console.error("Error fetching categories:", error)
      setCategories([])
    }
  }, [])

  const fetchLocationCatalogs = useCallback(async () => {
    try {
      const [departmentsResponse, municipalitiesResponse] = await Promise.all([
        fetch("/api/departamentos"),
        fetch("/api/municipios"),
      ])

      const departmentsData = (await departmentsResponse.json()) as {
        departamentos?: Array<Record<string, unknown>>
      }
      const municipalitiesData = (await municipalitiesResponse.json()) as Array<Record<string, unknown>>

      const normalizedDepartments = Array.isArray(departmentsData?.departamentos)
        ? departmentsData.departamentos
            .map((department) => ({
              id_departamento: Number(department?.id_departamento || 0),
              nombre_departamento: String(department?.nombre_departamento || "").trim(),
            }))
            .filter(
              (department): department is DepartmentOption =>
                department.id_departamento > 0 && department.nombre_departamento.length > 0
            )
        : []

      const normalizedMunicipalities = Array.isArray(municipalitiesData)
        ? municipalitiesData
            .map((municipality) => ({
              id_municipio: Number(municipality?.id_municipio || 0),
              nombre_municipio: String(municipality?.nombre_municipio || "").trim(),
              id_departamento: Number(municipality?.id_departamento || 0),
            }))
            .filter(
              (municipality): municipality is MunicipalityOption =>
                municipality.id_municipio > 0 &&
                municipality.id_departamento > 0 &&
                municipality.nombre_municipio.length > 0
            )
        : []

      setDepartments(normalizedDepartments)
      setMunicipalityOptions(normalizedMunicipalities)
    } catch (error) {
      console.error("Error fetching location catalogs:", error)
      setDepartments([])
      setMunicipalityOptions([])
    }
  }, [])



  useEffect(() => {
    const loadPageData = async () => {
      await Promise.all([
        fetchEventos(),
        fetchCategorias(),
        fetchLocationCatalogs(),
      ])
    }

    void loadPageData()
  }, [fetchCategorias, fetchEventos, fetchLocationCatalogs])

  const handleShareEvent = useCallback(async (event: EventCardItem) => {
    const id = event.id_evento
    if (!id) return

    const detailPath = buildEventUrl(event.id_publico_evento, event.title, id)
    const relativePath = `${detailPath}?returnTo=${encodeURIComponent("/eventos#eventos-disponibles")}`
    const shareUrl = `${window.location.origin}${relativePath}`
    const eventTitle = String(event.raw?.nombre_evento ?? event.title ?? "Evento en Time2Go")

    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        try {
          await navigator.share({
            title: eventTitle,
            text: `Mira este evento: ${eventTitle}`,
            url: shareUrl,
          })
          return
        } catch (shareError: unknown) {
          if ((shareError as { name?: string })?.name === "AbortError") {
            return
          }
        }
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
      } else {
        const textarea = document.createElement("textarea")
        textarea.value = shareUrl
        textarea.setAttribute("readonly", "")
        textarea.style.position = "fixed"
        textarea.style.left = "-9999px"
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand("copy")
        document.body.removeChild(textarea)
      }

      setCopiedEventId(id)
      window.setTimeout(() => {
        setCopiedEventId((current) => (current === id ? null : current))
      }, 2000)
    } catch (error) {
      console.error("No se pudo copiar el enlace del evento", error)
      alert("No se pudo copiar el enlace del evento")
    }
  }, [])

  const filteredEvents = useMemo(
    () => filterAndSortEvents(events, searchTerm, filters, municipalityOptions),
    [events, searchTerm, filters, municipalityOptions]
  )

  const eventTypes = useMemo(() => {
    const uniqueById = new Map<number, EventTypeOption>()

    events.forEach((event) => {
      const typeId = Number(event.raw?.id_tipo_evento || event.raw?.tipo_evento?.id_tipo_evento || 0)
      const typeName = String(event.raw?.tipo_evento?.nombre || "").trim()
      if (typeId <= 0 || typeName.length === 0) return

      const categoryId = Number(event.id_categoria_evento || 0)
      uniqueById.set(typeId, {
        id_tipo_evento: typeId,
        nombre: typeName,
        id_categoria_evento: categoryId > 0 ? categoryId : null,
      })
    })

    return Array.from(uniqueById.values()).sort((left, right) =>
      left.nombre.localeCompare(right.nombre, "es")
    )
  }, [events])

  const municipalities = useMemo(() => {
    const availableIds = new Set<number>()

    events.forEach((event) => {
      const municipalityId = Number(event.raw?.municipio?.id_municipio || 0)
      if (municipalityId > 0) {
        availableIds.add(municipalityId)
      }
    })

    const fromCatalog = municipalityOptions
      .filter((municipality) => availableIds.has(municipality.id_municipio))
      .sort((left, right) => left.nombre_municipio.localeCompare(right.nombre_municipio, "es"))

    if (fromCatalog.length > 0) {
      return fromCatalog
    }

    const fallbackByName = new Map<string, MunicipalityOption>()
    events.forEach((event) => {
      const name = String(event.raw?.municipio?.nombre_municipio || "").trim()
      if (!name) return

      fallbackByName.set(name.toLowerCase(), {
        id_municipio: Number(event.raw?.municipio?.id_municipio || 0),
        nombre_municipio: name,
        id_departamento: Number(event.raw?.municipio?.id_departamento || 0),
      })
    })

    return Array.from(fallbackByName.values()).sort((left, right) =>
      left.nombre_municipio.localeCompare(right.nombre_municipio, "es")
    )
  }, [events, municipalityOptions])

  const availableDepartments = useMemo(() => {
    const availableDepartmentIds = new Set<number>(
      municipalities
        .map((municipality) => municipality.id_departamento)
        .filter((id) => id > 0)
    )

    return departments
      .filter((department) => availableDepartmentIds.has(department.id_departamento))
      .sort((left, right) =>
        left.nombre_departamento.localeCompare(right.nombre_departamento, "es")
      )
  }, [departments, municipalities])

  const topRatedEvents = useMemo(() => events.slice(0, 3), [events])

  const expandedEvent = useMemo(() => {
    if (!expandedEventId) return null
    return events.find((event) => event.id_evento === expandedEventId) || null
  }, [events, expandedEventId])

  return {
    events,
    categories,
    selectedImageByEvent,
    favoriteIds,
    favoritePendingIds,
    authModalOpen,
    isLogin,
    searchTerm,
    filters,
    isSearchFocused,
    expandedEventId,
    copiedEventId,
    filteredEvents,
    topRatedEvents,
    eventTypes,
    departments: availableDepartments,
    municipalities,
    expandedEvent,
    setSelectedImageByEvent,
    setAuthModalOpen,
    setIsLogin,
    setSearchTerm,
    setFilters,
    setCategoryFilter,
    setDepartmentFilter,
    clearFilters,
    setIsSearchFocused,
    setExpandedEventId,
    openAuthModal,
    toggleFavorite,
    handleShareEvent,
  }
}
