import { useEffect, useMemo, useState } from "react"

import type { EventData, EventReservation, EventTicketValue } from "../lib/event-landing-types"
import {
  formatCurrency,
  formatTime,
  parseSiteCoordinate,
  slugify,
} from "../lib/event-landing-utils"

type UseEventLandingParams = {
  eventId: string
  mineView: boolean
}

export function useEventLanding({ eventId, mineView }: UseEventLandingParams) {
  const [event, setEvent] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [creatorMode, setCreatorMode] = useState(false)
  const [userRole, setUserRole] = useState<number | null>(null)
  const [meUserId, setMeUserId] = useState<number | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [checkingReservation, setCheckingReservation] = useState(false)
  const [alreadyReserved, setAlreadyReserved] = useState(false)
  const [eventReservations, setEventReservations] = useState<EventReservation[]>([])
  const [loadingEventReservations, setLoadingEventReservations] = useState(false)
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    async function fetchEvent() {
      setLoading(true)
      try {
        if (!eventId) {
          setEvent(null)
          return
        }

        const creatorFlagFromSession =
          typeof window !== "undefined" &&
          sessionStorage.getItem("creator-event-view") === String(eventId)

        const shouldUseCreatorMode = mineView || creatorFlagFromSession
        setCreatorMode(shouldUseCreatorMode)

        const query = shouldUseCreatorMode
          ? `/api/events?id=${encodeURIComponent(eventId)}&mine=true`
          : `/api/events?id=${encodeURIComponent(eventId)}`

        const response = await fetch(query, {
          credentials: "include",
        })

        const payload = await response.json().catch(() => ({}))
        if (payload.ok && payload.event) {
          setEvent(payload.event as EventData)
        } else {
          setEvent(null)
        }

        if (creatorFlagFromSession && typeof window !== "undefined") {
          sessionStorage.removeItem("creator-event-view")
        }
      } catch (error) {
        console.error("Error fetching event:", error)
        setEvent(null)
      } finally {
        setLoading(false)
      }
    }

    void fetchEvent()
  }, [eventId, mineView])

  useEffect(() => {
    async function loadEventReservations() {
      if (!creatorMode || !event?.id_evento) {
        setEventReservations([])
        return
      }

      setLoadingEventReservations(true)
      try {
        const response = await fetch(
          `/api/reservas?eventId=${encodeURIComponent(String(event.id_evento))}`,
          {
            credentials: "include",
          }
        )

        if (!response.ok) {
          setEventReservations([])
          return
        }

        const payload = await response.json().catch(() => ({}))
        setEventReservations(Array.isArray(payload?.reservas) ? (payload.reservas as EventReservation[]) : [])
      } catch {
        setEventReservations([])
      } finally {
        setLoadingEventReservations(false)
      }
    }

    void loadEventReservations()
  }, [creatorMode, event?.id_evento])

  useEffect(() => {
    async function fetchCurrentUserRole() {
      try {
        const response = await fetch("/api/me", {
          credentials: "include",
        })

        if (!response.ok) {
          setUserRole(null)
          setMeUserId(null)
          setIsAuthenticated(false)
          return
        }

        const payload = await response.json().catch(() => ({}))
        const role = Number(payload?.user?.id_rol || 0)
        const userId = Number(payload?.user?.id_usuario)

        setUserRole(Number.isFinite(role) && role > 0 ? role : null)
        setMeUserId(Number.isFinite(userId) && userId > 0 ? userId : null)
        setIsAuthenticated(true)
      } catch {
        setUserRole(null)
        setMeUserId(null)
        setIsAuthenticated(false)
      }
    }

    void fetchCurrentUserRole()
  }, [])

  useEffect(() => {
    async function checkReservation() {
      if (!event?.id_evento || Number(userRole) !== 1) {
        setAlreadyReserved(false)
        setCheckingReservation(false)
        return
      }

      setCheckingReservation(true)
      try {
        const response = await fetch("/api/reservas", {
          credentials: "include",
        })

        if (!response.ok) {
          setAlreadyReserved(false)
          return
        }

        const payload = await response.json().catch(() => ({}))
        const reservas = Array.isArray(payload?.reservas) ? payload.reservas : []
        const hasReservation = reservas.some((reservation: Record<string, unknown>) => {
          const reservationEventId = Number(reservation?.id_evento)
          return reservationEventId === Number(event.id_evento) && reservation?.estado !== false
        })

        setAlreadyReserved(hasReservation)
      } catch {
        setAlreadyReserved(false)
      } finally {
        setCheckingReservation(false)
      }
    }

    void checkReservation()
  }, [event?.id_evento, userRole])

  const organizerPhones = useMemo(() => {
    if (!event) return "—"

    const phones = [event.telefono_1 ?? event.event_telefono_1, event.telefono_2 ?? event.event_telefono_2]
      .filter(Boolean)
      .map((value) => String(value))

    return phones.join(" / ") || "—"
  }, [event])

  const formattedHorario = useMemo(() => {
    if (!event) return "—"
    return `${formatTime(event.hora_inicio ?? null)}${
      event.hora_final ? ` - ${formatTime(event.hora_final)}` : ""
    }`
  }, [event])

  const tipoEventoNombre = useMemo(() => {
    if (!event) return "—"
    return event.tipo_evento?.nombre || event.tipo_nombre || "—"
  }, [event])

  const informacionImportante = event?.informacion_importante?.detalle || null
  const diasArr = Array.isArray(event?.dias_evento)
    ? event.dias_evento
    : Array.isArray(event?.dias)
      ? event.dias
      : []

  const minPrice = useMemo(() => {
    if (!event?.valores?.length) return 0
    return Math.min(
      ...event.valores.map((value: EventTicketValue) =>
        Number(value.precio_boleto ?? value.valor ?? 0)
      )
    )
  }, [event])

  const priceLabel = event?.gratis_pago ? `Desde ${formatCurrency(minPrice)}` : "Gratis"

  const totalCupo = Number(event?.cupo ?? 0)
  const asistentesReservados = Number(event?.reservas_asistentes ?? 0)
  const cuposDisponibles = Math.max(0, totalCupo - asistentesReservados)

  const reservePath = useMemo(() => {
    if (!event) return ""
    return `/eventos/reservar/${slugify(event.nombre_evento || "evento")}?e=${encodeURIComponent(
      event.id_publico_evento || ""
    )}`
  }, [event])

  const canReserveByRole = Number(userRole) === 1 && !creatorMode
  const reserveDisabled = !canReserveByRole || checkingReservation || alreadyReserved || cuposDisponibles <= 0
  const reserveButtonText = cuposDisponibles <= 0
    ? "Sin cupos"
    : checkingReservation
      ? "Verificando..."
      : alreadyReserved
        ? "Ya reservado"
        : "Reservar"

  const sitioLat = parseSiteCoordinate(event?.sitio?.latitud)
  const sitioLng = parseSiteCoordinate(event?.sitio?.longitud)
  const hasMapCoords =
    sitioLat !== null &&
    sitioLng !== null &&
    sitioLat >= -90 &&
    sitioLat <= 90 &&
    sitioLng >= -180 &&
    sitioLng <= 180

  return {
    event,
    loading,
    creatorMode,
    userRole,
    meUserId,
    isAuthenticated,
    selectedImage,
    checkingReservation,
    alreadyReserved,
    eventReservations,
    loadingEventReservations,
    showMap,
    organizerPhones,
    formattedHorario,
    tipoEventoNombre,
    informacionImportante,
    diasArr,
    priceLabel,
    totalCupo,
    cuposDisponibles,
    reservePath,
    canReserveByRole,
    reserveDisabled,
    reserveButtonText,
    sitioLat,
    sitioLng,
    hasMapCoords,
    pulepEvento: event?.pulep_evento || "No registrado",
    setSelectedImage,
    setShowMap,
  }
}
