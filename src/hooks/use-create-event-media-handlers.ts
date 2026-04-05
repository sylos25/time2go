"use client"

import { useCallback } from "react"
import type { RefObject } from "react"
import type { UseCreateEventFormReturn } from "@/hooks/use-create-event-form"

interface UseCreateEventMediaHandlersParams {
  form: UseCreateEventFormReturn
  imageInputRef: RefObject<HTMLInputElement | null>
}

export function useCreateEventMediaHandlers({
  form,
  imageInputRef,
}: UseCreateEventMediaHandlersParams) {
  const { setNewEvent, setFieldError, clearFieldError } = form

  const onUpdateImages = useCallback(
    (files: File[]) => {
      setNewEvent((prev) => ({
        ...prev,
        imagenes: files,
        imagenPrincipalIndex:
          files.length > 0
            ? Math.min(Math.max(prev.imagenPrincipalIndex || 0, 0), files.length - 1)
            : 0,
      }))
    },
    [setNewEvent],
  )

  const onMoveImage = useCallback(
    (index: number, direction: "up" | "down") => {
      setNewEvent((prev) => {
        const files = [...(prev.imagenes || [])]
        if (index < 0 || index >= files.length) return prev

        const targetIndex = direction === "up" ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= files.length) return prev

        const temp = files[index]
        files[index] = files[targetIndex]
        files[targetIndex] = temp

        let principalIndex = prev.imagenPrincipalIndex || 0
        if (principalIndex === index) principalIndex = targetIndex
        else if (principalIndex === targetIndex) principalIndex = index

        return {
          ...prev,
          imagenes: files,
          imagenPrincipalIndex: principalIndex,
        }
      })
    },
    [setNewEvent],
  )

  const onSetPrincipalImage = useCallback(
    (index: number) => {
      setNewEvent((prev) => ({
        ...prev,
        imagenPrincipalIndex: index,
      }))
    },
    [setNewEvent],
  )

  const onRemoveImage = useCallback(
    (index: number) => {
      setNewEvent((prev) => {
        const updated = (prev.imagenes || []).filter((_, i) => i !== index)
        if (updated.length === 0 && imageInputRef.current) {
          imageInputRef.current.value = ""
        }

        const currentPrincipal = prev.imagenPrincipalIndex || 0
        const nextPrincipal =
          updated.length === 0
            ? 0
            : currentPrincipal === index
              ? 0
              : currentPrincipal > index
                ? currentPrincipal - 1
                : currentPrincipal

        return {
          ...prev,
          imagenes: updated,
          imagenPrincipalIndex: Math.min(nextPrincipal, Math.max(updated.length - 1, 0)),
        }
      })
    },
    [imageInputRef, setNewEvent],
  )

  const onUpdateDocument = useCallback(
    (file: File | null) => {
      setNewEvent((prev) => ({ ...prev, documento: file }))
    },
    [setNewEvent],
  )

  const onSetImagesError = useCallback(
    (message: string) => {
      setFieldError("imagenes", message)
    },
    [setFieldError],
  )

  const onClearImagesError = useCallback(() => {
    clearFieldError("imagenes")
  }, [clearFieldError])

  const onSetDocumentError = useCallback(
    (message: string) => {
      setFieldError("documento", message)
    },
    [setFieldError],
  )

  const onClearDocumentError = useCallback(() => {
    clearFieldError("documento")
  }, [clearFieldError])

  return {
    onUpdateImages,
    onMoveImage,
    onSetPrincipalImage,
    onRemoveImage,
    onUpdateDocument,
    onSetImagesError,
    onClearImagesError,
    onSetDocumentError,
    onClearDocumentError,
  }
}
