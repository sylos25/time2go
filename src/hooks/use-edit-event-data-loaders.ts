import { useEffect, useState, type Dispatch, type SetStateAction } from "react"

import {
  fetchCategorias,
  fetchEventDetail,
  fetchSitios,
  fetchTiposEvento,
} from "@/lib/edit-event-modal-api"
import type { Categoria, Evento, Sitio, TipoEvento } from "@/types/event-edit"

type UseEditEventDataLoadersArgs = {
  isOpen: boolean
  event: Evento
  busquedaSitio: string
  selectedSitioId: string
  selectedCategoriaId: string
  onMapEventToForm: (evento: Evento) => void
  onResetImageDrafts: () => void
}

type UseEditEventDataLoadersReturn = {
  loading: boolean
  categories: Categoria[]
  eventTypes: TipoEvento[]
  sites: Sitio[]
  setSites: Dispatch<SetStateAction<Sitio[]>>
}

export function useEditEventDataLoaders({
  isOpen,
  event,
  busquedaSitio,
  selectedSitioId,
  selectedCategoriaId,
  onMapEventToForm,
  onResetImageDrafts,
}: UseEditEventDataLoadersArgs): UseEditEventDataLoadersReturn {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Categoria[]>([])
  const [eventTypes, setEventTypes] = useState<TipoEvento[]>([])
  const [sites, setSites] = useState<Sitio[]>([])

  useEffect(() => {
    if (!isOpen || !event) return

    let cancelled = false

    async function loadInitialData() {
      setLoading(true)
      try {
        const [eventDetail, nextCategories, nextSites] = await Promise.all([
          fetchEventDetail(event),
          fetchCategorias(),
          fetchSitios(""),
        ])

        if (cancelled) return

        onMapEventToForm(eventDetail)
        onResetImageDrafts()
        setCategories(nextCategories)
        setSites(nextSites)
      } catch (error) {
        console.error("Error loading edit-event initial data", error)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadInitialData()

    return () => {
      cancelled = true
    }
  }, [event, isOpen, onMapEventToForm, onResetImageDrafts])

  useEffect(() => {
    let cancelled = false

    async function loadSitesBySearch() {
      if (!busquedaSitio || busquedaSitio.length < 2 || selectedSitioId) return

      try {
        const nextSites = await fetchSitios(busquedaSitio)
        if (!cancelled) {
          setSites(nextSites)
        }
      } catch {
        if (!cancelled) {
          setSites([])
        }
      }
    }

    void loadSitesBySearch()

    return () => {
      cancelled = true
    }
  }, [busquedaSitio, selectedSitioId])

  useEffect(() => {
    let cancelled = false

    async function loadEventTypes() {
      try {
        const nextTypes = await fetchTiposEvento(selectedCategoriaId)
        if (!cancelled) {
          setEventTypes(nextTypes)
        }
      } catch {
        if (!cancelled) {
          setEventTypes([])
        }
      }
    }

    void loadEventTypes()

    return () => {
      cancelled = true
    }
  }, [selectedCategoriaId])

  return {
    loading,
    categories,
    eventTypes,
    sites,
    setSites,
  }
}
