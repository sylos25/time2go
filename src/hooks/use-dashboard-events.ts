import { useCallback, useEffect, useMemo, useState } from "react"

import {
  DEFAULT_REJECT_FORM,
  type DashboardEvent,
  type EventCategory,
  type EventCategoryTab,
  type RejectForm,
  approveEventById,
  buildEventCategoryTabs,
  checkEventsPermission,
  deleteEventById,
  fetchCurrentUser,
  fetchEventCategories,
  fetchEvents,
  rejectEventById,
  toggleDestacadoById,
} from "@/lib/dashboard-events"

type CurrentUser = {
  id_usuario?: number
  id_rol?: number
  [key: string]: unknown
}

function getLocalToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null
}

function toMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function useDashboardEvents() {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [meUser, setMeUser] = useState<CurrentUser | null>(null)

  const [events, setEvents] = useState<DashboardEvent[]>([])
  const [eventCategories, setEventCategories] = useState<EventCategory[]>([])

  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")

  const [editingEvent, setEditingEvent] = useState<DashboardEvent | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)

  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectSubmitting, setRejectSubmitting] = useState(false)
  const [rejectForm, setRejectForm] = useState<RejectForm>(DEFAULT_REJECT_FORM)

  const [togglingDestacado, setTogglingDestacado] = useState<number | null>(null)

  const refreshEvents = useCallback(async (token?: string | null) => {
    try {
      const nextEvents = await fetchEvents(token)
      setEvents(nextEvents)
    } catch (error) {
      console.error("Failed to refresh events", error)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      setLoading(true)
      try {
        const token = getLocalToken()
        const user = await fetchCurrentUser(token)

        if (!user) {
          if (!cancelled) setAuthorized(false)
          return
        }

        if (!cancelled) setMeUser(user)

        const roleNum = user?.id_rol !== undefined ? Number(user.id_rol) : undefined
        if (roleNum === undefined || Number.isNaN(roleNum)) {
          if (!cancelled) setAuthorized(false)
          return
        }

        const hasAccess = await checkEventsPermission(roleNum, token)
        if (!cancelled) setAuthorized(hasAccess)

        if (!hasAccess) return

        const [categories, eventsData] = await Promise.all([
          fetchEventCategories(token),
          fetchEvents(token),
        ])

        if (!cancelled) {
          setEventCategories(categories)
          setEvents(eventsData)
        }
      } catch (error) {
        console.error("Error cargando eventos", error)
        if (!cancelled) setAuthorized(false)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadData()

    return () => {
      cancelled = true
    }
  }, [])

  const eventCategoryTabs = useMemo<EventCategoryTab[]>(
    () => buildEventCategoryTabs(eventCategories),
    [eventCategories]
  )

  const activeEventCategoryIndex = useMemo(
    () => Math.max(0, eventCategoryTabs.findIndex((item) => item.value === filterCategory)),
    [eventCategoryTabs, filterCategory]
  )

  const filteredEvents = useMemo(
    () =>
      events.filter((eventItem) => {
        const matchesSearch = eventItem.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = filterCategory === "all" || eventItem.category === filterCategory
        return matchesSearch && matchesCategory
      }),
    [events, filterCategory, searchTerm]
  )

  const goToPreviousEventCategory = useCallback(() => {
    if (activeEventCategoryIndex <= 0) return
    setFilterCategory(eventCategoryTabs[activeEventCategoryIndex - 1].value)
  }, [activeEventCategoryIndex, eventCategoryTabs])

  const goToNextEventCategory = useCallback(() => {
    if (activeEventCategoryIndex >= eventCategoryTabs.length - 1) return
    setFilterCategory(eventCategoryTabs[activeEventCategoryIndex + 1].value)
  }, [activeEventCategoryIndex, eventCategoryTabs])

  const openRejectModal = useCallback(
    (eventId: number) => {
      setRejectForm({
        id_evento: eventId,
        motivo_rechazo: "",
        rechazado_por: String(meUser?.id_usuario || ""),
      })
      setRejectModalOpen(true)
    },
    [meUser?.id_usuario]
  )

  const submitReject = useCallback(async () => {
    if (!rejectForm.motivo_rechazo || rejectForm.motivo_rechazo.trim().length < 10) {
      window.alert("El motivo debe tener minimo 10 caracteres")
      return
    }

    setRejectSubmitting(true)
    try {
      await rejectEventById(rejectForm.id_evento, {
        motivo_rechazo: rejectForm.motivo_rechazo.trim(),
        rechazado_por: Number(rejectForm.rechazado_por),
      }, getLocalToken())

      setRejectModalOpen(false)
      await refreshEvents()
    } catch (error) {
      console.error("Error rechazando evento", error)
      window.alert(toMessage(error, "No se pudo rechazar el evento"))
    } finally {
      setRejectSubmitting(false)
    }
  }, [refreshEvents, rejectForm])

  const deleteEvent = useCallback(
    async (eventId: number) => {
      const confirmed = window.confirm("Estas seguro de desactivar este evento?")
      if (!confirmed) return

      try {
        await deleteEventById(eventId, getLocalToken())
        await refreshEvents()
      } catch (error) {
        console.error("Error eliminando evento", error)
          window.alert(toMessage(error, "Error desactivando evento"))
      }
    },
    [refreshEvents]
  )

  const approveEvent = useCallback(
    async (eventId: number) => {
      try {
        await approveEventById(eventId, getLocalToken())
        await refreshEvents()
      } catch (error) {
        console.error("Error validando evento", error)
        window.alert(toMessage(error, "Error validando evento"))
      }
    },
    [refreshEvents]
  )

  const toggleDestacado = useCallback(async (eventId: number, currentValue: boolean) => {
    setTogglingDestacado(eventId)
    try {
      await toggleDestacadoById(eventId, !currentValue, getLocalToken())
      setEvents((prev) => prev.map((eventItem) => (eventItem.id === eventId ? { ...eventItem, destacado: !currentValue } : eventItem)))
    } catch (error) {
      console.error("Error toggling destacado", error)
      window.alert(toMessage(error, "Error al cambiar el estado destacado"))
    } finally {
      setTogglingDestacado(null)
    }
  }, [])

  const openDocumentInNewTab = useCallback((documentEventId: number) => {
    const proxied = `/api/events/document?id=${encodeURIComponent(String(documentEventId))}`
    window.open(proxied, "_blank", "noopener,noreferrer")
  }, [])

  const openEditModal = useCallback((eventItem: DashboardEvent) => {
    setEditingEvent(eventItem)
    setEditModalOpen(true)
  }, [])

  const closeEditModal = useCallback(() => {
    setEditModalOpen(false)
    setEditingEvent(null)
  }, [])

  return {
    loading,
    authorized,
    events,
    searchTerm,
    filterCategory,
    editingEvent,
    editModalOpen,
    rejectModalOpen,
    rejectSubmitting,
    rejectForm,
    togglingDestacado,
    eventCategoryTabs,
    activeEventCategoryIndex,
    filteredEvents,
    setSearchTerm,
    setFilterCategory,
    setEditModalOpen,
    setRejectModalOpen,
    setRejectForm,
    refreshEvents,
    goToPreviousEventCategory,
    goToNextEventCategory,
    openRejectModal,
    submitReject,
    deleteEvent,
    approveEvent,
    toggleDestacado,
    openDocumentInNewTab,
    openEditModal,
    closeEditModal,
  }
}
