import { useCallback, useState, type ChangeEvent } from "react"

import type { FormErrors, ImagenEvento } from "@/types/event-edit"

type UseEditEventImagesArgs = {
  clearFieldError: (field: keyof FormErrors) => void
  setFieldError: (field: keyof FormErrors, message: string) => void
}

export function useEditEventImages({ clearFieldError, setFieldError }: UseEditEventImagesArgs) {
  const [images, setImages] = useState<File[]>([])
  const [documento, setDocumento] = useState<File | null>(null)
  const [existingImages, setExistingImages] = useState<ImagenEvento[]>([])
  const [newPrincipalImageIndex, setNewPrincipalImageIndex] = useState<number | null>(null)
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([])

  const resetImageDrafts = useCallback(() => {
    setImages([])
    setDocumento(null)
    setNewPrincipalImageIndex(null)
    setImagesToDelete([])
  }, [])

  const applyExistingImages = useCallback((items: ImagenEvento[]) => {
    setExistingImages(items)
  }, [])

  const handleImageUpload = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (!files) return

      const selected = Array.from(files)
      const totalCount = existingImages.length + images.length + selected.length
      if (totalCount > 8) {
        setFieldError("imagenes", "Puedes tener maximo 8 imagenes en total por evento.")
        event.target.value = ""
        return
      }

      clearFieldError("imagenes")
      setImages((prev) => [...prev, ...selected])
      setNewPrincipalImageIndex((prev) => (prev === null ? 0 : prev))
    },
    [clearFieldError, existingImages.length, images.length, setFieldError]
  )

  const removeNewImage = useCallback(
    (index: number) => {
      clearFieldError("imagenes")
      setImages((prev) => {
        const next = prev.filter((_, currentIndex) => currentIndex !== index)
        setNewPrincipalImageIndex((current) => {
          if (current === null) return next.length ? 0 : null
          if (next.length === 0) return null
          if (current === index) return 0
          if (current > index) return current - 1
          return Math.min(current, next.length - 1)
        })
        return next
      })
    },
    [clearFieldError]
  )

  const removeExistingImage = useCallback(
    (imageId: number) => {
      clearFieldError("imagenes")
      setImagesToDelete((prev) => [...prev, imageId])
      setExistingImages((prev) => {
        const filtered = prev.filter((image) => image.id_imagen_evento !== imageId)
        if (filtered.length > 0 && !filtered.some((image) => image.principal)) {
          filtered[0] = { ...filtered[0], principal: true }
        }
        return filtered
      })
    },
    [clearFieldError]
  )

  const setExistingPrincipalImage = useCallback((imageId: number) => {
    setNewPrincipalImageIndex(null)
    setExistingImages((prev) =>
      prev.map((image) => ({
        ...image,
        principal: image.id_imagen_evento === imageId,
      }))
    )
  }, [])

  const setNewPrincipalImage = useCallback(
    (index: number) => {
      setNewPrincipalImageIndex(index)
      if (existingImages.length > 0) {
        setExistingImages((prev) => prev.map((image) => ({ ...image, principal: false })))
      }
    },
    [existingImages.length]
  )

  return {
    images,
    documento,
    existingImages,
    newPrincipalImageIndex,
    imagesToDelete,
    setDocumento,
    setImages,
    resetImageDrafts,
    applyExistingImages,
    handleImageUpload,
    removeNewImage,
    removeExistingImage,
    setExistingPrincipalImage,
    setNewPrincipalImage,
  }
}
