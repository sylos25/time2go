"use client"

import { useEffect, useMemo, useState, type ChangeEvent } from "react"

import type { CategoryOption, HeroImage, HomeControlResponse, MoveDirection } from "../components/dashboard/home-control/types"
import {
  CATEGORIES_PER_PAGE,
  buildVisiblePageWindow,
  getAuthHeaders,
  getErrorMessage,
  normalizeSearchText,
  parseHomeControlResponse,
  reorderHeroImages,
  sanitizeCategorySearchQuery,
  swapItems,
} from "../components/dashboard/home-control/utils"

function applyHomeControlResponse(
  data: HomeControlResponse,
  setters: {
    setCategories: (value: CategoryOption[]) => void
    setSelectedCategoryIds: (value: number[]) => void
    setHeroImages: (value: HeroImage[]) => void
    setMaxHeroImages: (value: number) => void
    setCategoryPage: (value: number) => void
  }
) {
  setters.setCategories(Array.isArray(data.categories) ? data.categories : [])
  setters.setSelectedCategoryIds(Array.isArray(data.selectedCategoryIds) ? data.selectedCategoryIds : [])
  setters.setHeroImages(Array.isArray(data.heroImages) ? data.heroImages : [])
  setters.setMaxHeroImages(Number(data.maxHeroImages || 7))
  setters.setCategoryPage(1)
}

export function useHomeControl() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])
  const [categoryPage, setCategoryPage] = useState(1)
  const [categorySearchQuery, setCategorySearchQuery] = useState("")

  const [heroImages, setHeroImages] = useState<HeroImage[]>([])
  const [removedHeroImageIds, setRemovedHeroImageIds] = useState<number[]>([])
  const [newHeroImages, setNewHeroImages] = useState<File[]>([])
  const [newHeroImagePreviews, setNewHeroImagePreviews] = useState<string[]>([])
  const [maxHeroImages, setMaxHeroImages] = useState(7)

  const remainingSlots = useMemo(
    () => Math.max(0, maxHeroImages - heroImages.length),
    [heroImages.length, maxHeroImages]
  )

  const normalizedCategorySearchQuery = useMemo(
    () => normalizeSearchText(categorySearchQuery.trim()),
    [categorySearchQuery]
  )

  const filteredCategories = useMemo(() => {
    if (!normalizedCategorySearchQuery) return categories

    return categories.filter((category) =>
      normalizeSearchText(category.nombre).includes(normalizedCategorySearchQuery)
    )
  }, [categories, normalizedCategorySearchQuery])

  const totalCategoryPages = useMemo(
    () => Math.max(1, Math.ceil(filteredCategories.length / CATEGORIES_PER_PAGE)),
    [filteredCategories.length]
  )

  const paginatedCategories = useMemo(() => {
    const start = (categoryPage - 1) * CATEGORIES_PER_PAGE
    return filteredCategories.slice(start, start + CATEGORIES_PER_PAGE)
  }, [filteredCategories, categoryPage])

  const visibleCategoryPages = useMemo(
    () => buildVisiblePageWindow(categoryPage, totalCategoryPages),
    [categoryPage, totalCategoryPages]
  )

  const categoryRangeStart = filteredCategories.length === 0 ? 0 : (categoryPage - 1) * CATEGORIES_PER_PAGE + 1
  const categoryRangeEnd = Math.min(categoryPage * CATEGORIES_PER_PAGE, filteredCategories.length)

  async function loadData() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/home-control", {
        headers: getAuthHeaders(),
        credentials: "include",
      })

      const data = await parseHomeControlResponse(response)
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "No se pudo cargar la configuración de inicio")
      }

      applyHomeControlResponse(data, {
        setCategories,
        setSelectedCategoryIds,
        setHeroImages,
        setMaxHeroImages,
        setCategoryPage,
      })
      setRemovedHeroImageIds([])
      setNewHeroImages([])
      setNewHeroImagePreviews([])
    } catch (caughtError: unknown) {
      setError(getErrorMessage(caughtError, "No se pudo cargar la sección"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  useEffect(() => {
    return () => {
      newHeroImagePreviews.forEach((previewUrl) => URL.revokeObjectURL(previewUrl))
    }
  }, [newHeroImagePreviews])

  useEffect(() => {
    setCategoryPage((prevPage) => Math.min(Math.max(prevPage, 1), totalCategoryPages))
  }, [totalCategoryPages])

  useEffect(() => {
    setCategoryPage(1)
  }, [categorySearchQuery])

  function handleCategorySearchChange(event: ChangeEvent<HTMLInputElement>) {
    setCategorySearchQuery(sanitizeCategorySearchQuery(event.target.value))
  }

  function toggleCategory(categoryId: number) {
    setSuccess(null)
    setSelectedCategoryIds((prevIds) =>
      prevIds.includes(categoryId) ? prevIds.filter((id) => id !== categoryId) : [...prevIds, categoryId]
    )
  }

  function moveImage(id: number, direction: MoveDirection) {
    setSuccess(null)
    setHeroImages((prevImages) => reorderHeroImages(prevImages, id, direction))
  }

  function moveNewImage(index: number, direction: MoveDirection) {
    setSuccess(null)

    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newHeroImages.length) return

    setNewHeroImages((prevImages) => swapItems(prevImages, index, targetIndex))
    setNewHeroImagePreviews((prevPreviews) => swapItems(prevPreviews, index, targetIndex))
  }

  function removeExistingImage(id: number) {
    setSuccess(null)
    setHeroImages((prevImages) => prevImages.filter((image) => image.id !== id))
    setRemovedHeroImageIds((prevIds) => (prevIds.includes(id) ? prevIds : [...prevIds, id]))
  }

  function removeNewImage(index: number) {
    setSuccess(null)
    setNewHeroImages((prevImages) => prevImages.filter((_, currentIndex) => currentIndex !== index))
    setNewHeroImagePreviews((prevPreviews) => {
      const previewToRemove = prevPreviews[index]
      if (previewToRemove) URL.revokeObjectURL(previewToRemove)
      return prevPreviews.filter((_, currentIndex) => currentIndex !== index)
    })
  }

  function onSelectNewImages(event: ChangeEvent<HTMLInputElement>) {
    setError(null)
    setSuccess(null)

    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    const allowedFiles = files.filter((file) => String(file.type || "").startsWith("image/"))
    if (allowedFiles.length !== files.length) {
      setError("Solo se permiten archivos de imagen")
    }

    const currentTotalImages = heroImages.length + newHeroImages.length
    const availableSlots = Math.max(0, maxHeroImages - currentTotalImages)
    if (availableSlots <= 0) {
      setError(`Ya alcanzaste el máximo de ${maxHeroImages} imágenes`)
      event.currentTarget.value = ""
      return
    }

    const filesToAdd = allowedFiles.slice(0, availableSlots)
    if (filesToAdd.length < allowedFiles.length) {
      setError(`Solo puedes agregar ${availableSlots} imagen(es) más`)
    }

    const previewUrls = filesToAdd.map((file) => URL.createObjectURL(file))
    setNewHeroImages((prevImages) => [...prevImages, ...filesToAdd])
    setNewHeroImagePreviews((prevPreviews) => [...prevPreviews, ...previewUrls])
    event.currentTarget.value = ""
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()
      formData.append("categoryIds", JSON.stringify(selectedCategoryIds))
      formData.append("removeImageIds", JSON.stringify(removedHeroImageIds))
      formData.append("retainedOrderIds", JSON.stringify(heroImages.map((image) => image.id)))

      newHeroImages.forEach((file) => {
        formData.append("newHeroImages", file)
      })

      const response = await fetch("/api/admin/home-control", {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: formData,
      })

      const data = await parseHomeControlResponse(response)
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "No se pudo guardar la configuración")
      }

      applyHomeControlResponse(data, {
        setCategories,
        setSelectedCategoryIds,
        setHeroImages,
        setMaxHeroImages,
        setCategoryPage,
      })
      setRemovedHeroImageIds([])
      newHeroImagePreviews.forEach((previewUrl) => URL.revokeObjectURL(previewUrl))
      setNewHeroImages([])
      setNewHeroImagePreviews([])
      setSuccess("Configuración de inicio guardada correctamente")
    } catch (caughtError: unknown) {
      setError(getErrorMessage(caughtError, "No fue posible guardar la configuración"))
    } finally {
      setSaving(false)
    }
  }

  return {
    loading,
    saving,
    error,
    success,
    categories,
    categoryPage,
    categoryRangeEnd,
    categoryRangeStart,
    categorySearchQuery,
    filteredCategories,
    heroImages,
    maxHeroImages,
    newHeroImagePreviews,
    newHeroImages,
    paginatedCategories,
    remainingSlots,
    selectedCategoryIds,
    totalCategoryPages,
    visibleCategoryPages,
    handleCategorySearchChange,
    handleSave,
    moveImage,
    moveNewImage,
    onSelectNewImages,
    removeExistingImage,
    removeNewImage,
    setCategoryPage,
    toggleCategory,
  }
}
