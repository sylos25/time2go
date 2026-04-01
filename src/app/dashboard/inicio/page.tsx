"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronDown, ChevronUp, ImagePlus, Loader2, Save, Trash2 } from "lucide-react"

type HeroImage = {
  id: number
  url: string
  order: number
}

type CategoryOption = {
  id: number
  nombre: string
}

type HomeControlResponse = {
  ok: boolean
  selectedCategoryIds: number[]
  categories: CategoryOption[]
  heroImages: HeroImage[]
  maxHeroImages: number
  message?: string
}

const CATEGORIES_PER_PAGE = 10

export default function DashboardHomeControlPage() {
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

  const remainingSlots = useMemo(() => {
    const current = heroImages.length
    return Math.max(0, maxHeroImages - current)
  }, [heroImages.length, maxHeroImages])

  const filteredCategories = useMemo(() => {
    if (!categorySearchQuery.trim()) return categories
    return categories.filter((category) =>
      category.nombre.toLowerCase().includes(categorySearchQuery.toLowerCase())
    )
  }, [categories, categorySearchQuery])

  const totalCategoryPages = useMemo(
    () => Math.max(1, Math.ceil(filteredCategories.length / CATEGORIES_PER_PAGE)),
    [filteredCategories.length]
  )

  const paginatedCategories = useMemo(() => {
    const start = (categoryPage - 1) * CATEGORIES_PER_PAGE
    return filteredCategories.slice(start, start + CATEGORIES_PER_PAGE)
  }, [filteredCategories, categoryPage])

  const visibleCategoryPages = useMemo(() => {
    const windowSize = 5
    let start = Math.max(1, categoryPage - 2)
    let end = Math.min(totalCategoryPages, start + windowSize - 1)
    start = Math.max(1, end - windowSize + 1)
    return Array.from({ length: end - start + 1 }, (_, index) => start + index)
  }, [categoryPage, totalCategoryPages])

  const categoryRangeStart = filteredCategories.length === 0 ? 0 : (categoryPage - 1) * CATEGORIES_PER_PAGE + 1
  const categoryRangeEnd = Math.min(categoryPage * CATEGORIES_PER_PAGE, filteredCategories.length)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const headers: HeadersInit = {}
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch("/api/admin/home-control", {
        headers,
        credentials: "include",
      })

      const data: HomeControlResponse = await res.json().catch(() => ({
        ok: false,
        selectedCategoryIds: [],
        categories: [],
        heroImages: [],
        maxHeroImages: 7,
      }))

      if (!res.ok || !data.ok) {
        throw new Error(data?.message || "No se pudo cargar la configuración de inicio")
      }

      setCategories(Array.isArray(data.categories) ? data.categories : [])
      setSelectedCategoryIds(Array.isArray(data.selectedCategoryIds) ? data.selectedCategoryIds : [])
      setHeroImages(Array.isArray(data.heroImages) ? data.heroImages : [])
      setMaxHeroImages(Number(data.maxHeroImages || 7))
      setCategoryPage(1)
      setRemovedHeroImageIds([])
      setNewHeroImages([])
      setNewHeroImagePreviews([])
    } catch (err: any) {
      setError(err?.message || "No se pudo cargar la sección")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    return () => {
      newHeroImagePreviews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [newHeroImagePreviews])

  useEffect(() => {
    setCategoryPage((prev) => Math.min(Math.max(prev, 1), totalCategoryPages))
  }, [totalCategoryPages])

  useEffect(() => {
    setCategoryPage(1)
  }, [categorySearchQuery])

  const toggleCategory = (categoryId: number) => {
    setSuccess(null)
    setSelectedCategoryIds((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId)
      }
      return [...prev, categoryId]
    })
  }

  const moveImage = (id: number, direction: "up" | "down") => {
    setSuccess(null)
    setHeroImages((prev) => {
      const idx = prev.findIndex((img) => img.id === id)
      if (direction === "up" && idx > 0) {
        const copy = [...prev]
        ;[copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]]
        return copy.map((img, i) => ({ ...img, order: i + 1 }))
      }
      if (direction === "down" && idx < prev.length - 1) {
        const copy = [...prev]
        ;[copy[idx], copy[idx + 1]] = [copy[idx + 1], copy[idx]]
        return copy.map((img, i) => ({ ...img, order: i + 1 }))
      }
      return prev
    })
  }

  const moveNewImage = (index: number, direction: "up" | "down") => {
    setSuccess(null)
    const swap = <T,>(arr: T[], i: number, j: number): T[] => {
      const copy = [...arr]
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
      return copy
    }
    if (direction === "up" && index > 0) {
      setNewHeroImages((prev) => swap(prev, index - 1, index))
      setNewHeroImagePreviews((prev) => swap(prev, index - 1, index))
    } else if (direction === "down") {
      setNewHeroImages((prev) => {
        if (index < prev.length - 1) return swap(prev, index, index + 1)
        return prev
      })
      setNewHeroImagePreviews((prev) => {
        if (index < prev.length - 1) return swap(prev, index, index + 1)
        return prev
      })
    }
  }

  const removeExistingImage = (id: number) => {
    setSuccess(null)
    setHeroImages((prev) => prev.filter((image) => image.id !== id))
    setRemovedHeroImageIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  const removeNewImage = (index: number) => {
    setSuccess(null)
    setNewHeroImages((prev) => prev.filter((_, idx) => idx !== index))
    setNewHeroImagePreviews((prev) => {
      const target = prev[index]
      if (target) URL.revokeObjectURL(target)
      return prev.filter((_, idx) => idx !== index)
    })
  }

  const onSelectNewImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setSuccess(null)
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    const allowed = files.filter((file) => String(file.type || "").startsWith("image/"))
    if (allowed.length !== files.length) {
      setError("Solo se permiten archivos de imagen")
    }

    const currentTotal = heroImages.length + newHeroImages.length
    const available = Math.max(0, maxHeroImages - currentTotal)
    if (available <= 0) {
      setError(`Ya alcanzaste el máximo de ${maxHeroImages} imágenes`)
      event.currentTarget.value = ""
      return
    }

    const toAdd = allowed.slice(0, available)
    if (toAdd.length < allowed.length) {
      setError(`Solo puedes agregar ${available} imagen(es) más`)
    }

    const previews = toAdd.map((file) => URL.createObjectURL(file))
    setNewHeroImages((prev) => [...prev, ...toAdd])
    setNewHeroImagePreviews((prev) => [...prev, ...previews])
    event.currentTarget.value = ""
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const headers: HeadersInit = {}
      if (token) headers.Authorization = `Bearer ${token}`

      const formData = new FormData()
      formData.append("categoryIds", JSON.stringify(selectedCategoryIds))
      formData.append("removeImageIds", JSON.stringify(removedHeroImageIds))
      formData.append("retainedOrderIds", JSON.stringify(heroImages.map((img) => img.id)))
      newHeroImages.forEach((file) => {
        formData.append("newHeroImages", file)
      })

      const res = await fetch("/api/admin/home-control", {
        method: "POST",
        headers,
        credentials: "include",
        body: formData,
      })

      const data: HomeControlResponse = await res.json().catch(() => ({
        ok: false,
        selectedCategoryIds: [],
        categories: [],
        heroImages: [],
        maxHeroImages: 7,
      }))

      if (!res.ok || !data.ok) {
        throw new Error(data?.message || "No se pudo guardar la configuración")
      }

      setCategories(Array.isArray(data.categories) ? data.categories : [])
      setSelectedCategoryIds(Array.isArray(data.selectedCategoryIds) ? data.selectedCategoryIds : [])
      setHeroImages(Array.isArray(data.heroImages) ? data.heroImages : [])
      setMaxHeroImages(Number(data.maxHeroImages || 7))

      setRemovedHeroImageIds([])
      newHeroImagePreviews.forEach((url) => URL.revokeObjectURL(url))
      setNewHeroImages([])
      setNewHeroImagePreviews([])

      setSuccess("Configuración de inicio guardada correctamente")
    } catch (err: any) {
      setError(err?.message || "No fue posible guardar la configuración")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-green-700" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-green-700/30 bg-green-600 px-4 py-6 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-900 sm:px-6 sm:py-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-lime-300/30 blur-2xl dark:bg-lime-500/20" />
        <div className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-teal-300/25 blur-2xl dark:bg-emerald-500/20" />
        <div className="relative">
          <h3 className="text-center text-3xl font-semibold tracking-tight text-white dark:text-lime-200 sm:text-5xl">
            <span style={{ fontFamily: "Futura, Trebuchet MS, Helvetica, Arial, sans-serif" }}>
              Personalizar el Inicio
            </span>
          </h3>
          <p className="mt-2 text-center text-lime-100 dark:text-emerald-300">
            Administra el carrusel de imágenes y las categorías de la página de inicio
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/40 bg-red-50/90 px-4 py-3 text-red-700 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-400/50 bg-emerald-100/80 px-4 py-3 text-emerald-900 dark:bg-emerald-900/35 dark:text-emerald-200">
          {success}
        </div>
      )}

      <section className="space-y-4 rounded-2xl border border-lime-200/70 bg-white/90 p-4 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-950/35">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-start">
          <div className="space-y-3">
            <div className="space-y-2">
              <h4 className="text-2xl font-bold text-green-900 dark:text-emerald-100 sm:text-3xl">Carrusel de Imágenes</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Configura las imágenes principales que se muestran en la portada del sitio.
              </p>
            </div>

            <p className="text-xs text-muted-foreground sm:text-sm">
              Medidas recomendadas: 1920x900 px, 2100x1000 px o 2520x1200 px.
            </p>

            <label className="inline-flex w-fit items-center gap-2 rounded-lg bg-green-700 px-3 py-2 text-sm font-medium text-white hover:bg-green-800 cursor-pointer">
              <ImagePlus className="h-4 w-4" />
              Agregar imágenes
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={onSelectNewImages}
                className="hidden"
                disabled={remainingSlots <= 0}
              />
            </label>
          </div>

          <div className="text-left md:text-right">
            <p className="text-sm text-muted-foreground">
              Máximo {maxHeroImages}. Actualmente: {heroImages.length + newHeroImages.length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {heroImages.map((image) => (
            <div key={image.id} className="overflow-hidden rounded-xl border border-lime-200/70 bg-white dark:bg-emerald-950/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt={`Carrusel de imágenes ${image.order}`} className="h-44 w-full object-cover" />
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-1">
                  <span className="min-w-[1.5rem] text-center text-xs font-semibold text-green-700 dark:text-emerald-400">
                    #{image.order}
                  </span>
                  <button
                    type="button"
                    title="Subir"
                    onClick={() => moveImage(image.id, "up")}
                    disabled={heroImages.indexOf(image) === 0}
                    className="rounded p-0.5 text-muted-foreground hover:text-green-700 disabled:opacity-30 dark:hover:text-emerald-300"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Bajar"
                    onClick={() => moveImage(image.id, "down")}
                    disabled={heroImages.indexOf(image) === heroImages.length - 1}
                    className="rounded p-0.5 text-muted-foreground hover:text-green-700 disabled:opacity-30 dark:hover:text-emerald-300"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  title="Quitar imagen"
                  onClick={() => removeExistingImage(image.id)}
                  className="rounded-md p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/30 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {newHeroImages.map((file, index) => (
            <div key={`${file.name}-${index}`} className="overflow-hidden rounded-xl border border-dashed border-lime-400/80 bg-lime-50/60 dark:bg-emerald-950/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={newHeroImagePreviews[index]} alt={file.name} className="h-44 w-full object-cover" />
              <div className="flex items-center justify-between p-3">
                <div className="flex min-w-0 items-center gap-1">
                  <span className="min-w-[1.5rem] text-center text-xs font-semibold text-lime-700 dark:text-lime-400">
                    #{heroImages.length + index + 1}
                  </span>
                  <button
                    type="button"
                    title="Subir"
                    onClick={() => moveNewImage(index, "up")}
                    disabled={index === 0}
                    className="rounded p-0.5 text-muted-foreground hover:text-green-700 disabled:opacity-30 dark:hover:text-emerald-300"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Bajar"
                    onClick={() => moveNewImage(index, "down")}
                    disabled={index === newHeroImages.length - 1}
                    className="rounded p-0.5 text-muted-foreground hover:text-green-700 disabled:opacity-30 dark:hover:text-emerald-300"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <span className="max-w-[8rem] truncate text-xs text-muted-foreground">{file.name}</span>
                </div>
                <button
                  type="button"
                  title="Quitar imagen"
                  onClick={() => removeNewImage(index)}
                  className="rounded-md p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {heroImages.length + newHeroImages.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-border bg-card/60 px-4 py-10 text-center text-muted-foreground">
              No hay imágenes configuradas para el carrusel de imágenes.
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-lime-200/70 bg-white/90 p-4 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-950/35">
        <div className="space-y-2">
          <h4 className="text-2xl font-bold text-green-900 dark:text-emerald-100 sm:text-3xl">Administración de Categoría en la Página de Inicio</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Selecciona las categorías que se mostrarán con sus eventos promocionados.
          </p>
        </div>

        <div>
          <input
            type="text"
            placeholder="Buscar categorías..."
            value={categorySearchQuery}
            onChange={(e) => {
              const value = e.target.value.replace(/[^a-záéíóúñA-ZÁÉÍÓÚÑ\s]/g, "").slice(0, 50)
              setCategorySearchQuery(value)
            }}
            maxLength={50}
            className="w-1/2 rounded-lg border border-lime-300/80 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-emerald-600/70 dark:bg-emerald-950/40 dark:text-emerald-100 dark:placeholder-emerald-400/60"
          />
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
          {paginatedCategories.map((category) => {
            const checked = selectedCategoryIds.includes(category.id)
            return (
              <label
                key={category.id}
                className="flex items-center gap-3 rounded-lg border border-lime-200/80 bg-white/80 px-3 py-2 text-green-900 dark:border-emerald-700/60 dark:bg-emerald-950/30 dark:text-emerald-100"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCategory(category.id)}
                  className="h-4 w-4 rounded border-green-500 text-green-700 focus:ring-lime-400"
                />
                <span>{category.nombre}</span>
              </label>
            )
          })}
        </div>

        {filteredCategories.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-lime-200/80 pt-3 dark:border-emerald-700/50 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground sm:text-sm">
              Mostrando {categoryRangeStart}-{categoryRangeEnd} de {filteredCategories.length} categorías
              {categorySearchQuery && ` (filtradas de ${categories.length})`}
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCategoryPage((prev) => Math.max(1, prev - 1))}
                disabled={categoryPage === 1}
                className="rounded-md border border-lime-300/80 px-2 py-1 text-xs text-green-800 hover:bg-lime-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-emerald-600/70 dark:text-emerald-200 dark:hover:bg-emerald-900/30"
              >
                Anterior
              </button>

              {visibleCategoryPages.map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCategoryPage(page)}
                  aria-label={`Ir a la página ${page}`}
                  aria-current={categoryPage === page ? "page" : undefined}
                  className={`min-w-8 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                    categoryPage === page
                      ? "bg-green-700 text-white"
                      : "border border-lime-300/80 text-green-800 hover:bg-lime-50 dark:border-emerald-600/70 dark:text-emerald-200 dark:hover:bg-emerald-900/30"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCategoryPage((prev) => Math.min(totalCategoryPages, prev + 1))}
                disabled={categoryPage === totalCategoryPages}
                className="rounded-md border border-lime-300/80 px-2 py-1 text-xs text-green-800 hover:bg-lime-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-emerald-600/70 dark:text-emerald-200 dark:hover:bg-emerald-900/30"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </section>

      <div className="flex justify-start">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  )
}
