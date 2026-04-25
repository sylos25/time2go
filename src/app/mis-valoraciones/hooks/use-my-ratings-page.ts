"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import type {
  MisValoracionesMutationResponse,
  MisValoracionesResponse,
  Valoracion,
} from "@/app/mis-valoraciones/lib/mis-valoraciones-types"
import {
  getAverageRating,
  getEventHref as getEventHrefFromRating,
  getSummaryText,
  normalizeValoraciones,
} from "@/app/mis-valoraciones/lib/mis-valoraciones-utils"

export function useMyRatingsPage() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [isLogin, setIsLogin] = useState(true)

  const [valoraciones, setValoraciones] = useState<Valoracion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editRating, setEditRating] = useState(5)
  const [editComment, setEditComment] = useState("")
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [editSuccess, setEditSuccess] = useState<string | null>(null)

  const openAuthModal = useCallback((loginMode = true) => {
    setIsLogin(loginMode)
    setAuthModalOpen(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false)
  }, [])

  const toggleAuthMode = useCallback(() => {
    setIsLogin((prev) => !prev)
  }, [])

  useEffect(() => {
    async function fetchValoraciones() {
      try {
        const response = await fetch("/api/mis-valoraciones", {
          credentials: "include",
        })

        if (response.status === 401) {
          openAuthModal(true)
          setValoraciones([])
          return
        }

        const contentType = response.headers.get("content-type")
        if (!contentType?.includes("application/json")) {
          throw new Error("No se pudo conectar con el servidor")
        }

        const data: MisValoracionesResponse = await response.json().catch(() => ({}))
        if (!response.ok || !data.ok) {
          throw new Error(data.message || "No se pudieron cargar las valoraciones")
        }

        setValoraciones(normalizeValoraciones(data.valoraciones))
      } catch (fetchError) {
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "No se pudieron cargar las valoraciones"
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchValoraciones()
  }, [openAuthModal])

  const startEdit = useCallback((item: Valoracion) => {
    setEditingId(item.id_valoracion)
    setEditRating(item.valoracion)
    setEditComment(item.comentario ?? "")
    setEditError(null)
    setEditSuccess(null)
    setConfirmId(null)
  }, [])

  const cancelEdit = useCallback(() => {
    setEditingId(null)
    setEditError(null)
    setEditSuccess(null)
  }, [])

  const updateEditComment = useCallback((value: string) => {
    setEditComment(value)
  }, [])

  const saveEdit = useCallback(
    async (id: number) => {
      if (editRating < 1 || editRating > 5) {
        setEditError("Selecciona una calificacion valida.")
        return
      }

      setSavingEdit(true)
      setEditError(null)
      setEditSuccess(null)

      try {
        const response = await fetch(`/api/mis-valoraciones/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            valoracion: editRating,
            comentario: editComment.trim() || null,
          }),
        })

        if (response.status === 401) {
          openAuthModal(true)
          return
        }

        const data: MisValoracionesMutationResponse = await response
          .json()
          .catch(() => ({}))

        if (!response.ok || !data.ok) {
          throw new Error(data.message || "Error al guardar los cambios")
        }

        setValoraciones((prev) =>
          prev.map((item) =>
            item.id_valoracion === id
              ? { ...item, valoracion: editRating, comentario: editComment.trim() || null }
              : item
          )
        )

        setEditSuccess("Valoracion actualizada")
        window.setTimeout(() => {
          setEditingId(null)
          setEditSuccess(null)
        }, 1200)
      } catch (saveError) {
        const message = saveError instanceof Error ? saveError.message : "Error al guardar los cambios"
        setEditError(message)
      } finally {
        setSavingEdit(false)
      }
    },
    [editComment, editRating, openAuthModal]
  )

  const requestDelete = useCallback((id: number) => {
    setConfirmId(id)
  }, [])

  const cancelDelete = useCallback(() => {
    setConfirmId(null)
  }, [])

  const handleDelete = useCallback(async () => {
    if (confirmId === null) return

    setDeleting(true)

    try {
      const response = await fetch(`/api/mis-valoraciones/${confirmId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.status === 401) {
        openAuthModal(true)
        return
      }

      const data: MisValoracionesMutationResponse = await response
        .json()
        .catch(() => ({}))

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Error al eliminar la valoracion")
      }

      setValoraciones((prev) => prev.filter((item) => item.id_valoracion !== confirmId))
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Error al eliminar la valoracion"
      setError(message)
    } finally {
      setDeleting(false)
      setConfirmId(null)
    }
  }, [confirmId, openAuthModal])

  const getEventHref = useCallback((item: Valoracion) => {
    return getEventHrefFromRating(item)
  }, [])

  const summaryText = useMemo(() => getSummaryText(loading, valoraciones.length), [loading, valoraciones.length])
  const averageText = useMemo(() => getAverageRating(valoraciones), [valoraciones])

  return {
    authModalOpen,
    isLogin,
    valoraciones,
    loading,
    error,
    confirmId,
    deleting,
    editingId,
    editRating,
    editComment,
    savingEdit,
    editError,
    editSuccess,
    summaryText,
    averageText,
    openAuthModal,
    closeAuthModal,
    toggleAuthMode,
    getEventHref,
    startEdit,
    cancelEdit,
    setEditRating,
    updateEditComment,
    saveEdit,
    requestDelete,
    cancelDelete,
    handleDelete,
  }
}
