"use client"

import { useEffect, useMemo, useState } from "react"
import { ImagePlus, Loader2, Save, Trash2 } from "lucide-react"

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

export default function DashboardHomeControlPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])

  const [heroImages, setHeroImages] = useState<HeroImage[]>([])
  const [removedHeroImageIds, setRemovedHeroImageIds] = useState<number[]>([])

  const [newHeroImages, setNewHeroImages] = useState<File[]>([])
  const [newHeroImagePreviews, setNewHeroImagePreviews] = useState<string[]>([])

  const [maxHeroImages, setMaxHeroImages] = useState(7)

  const remainingSlots = useMemo(() => {
    const current = heroImages.length
    return Math.max(0, maxHeroImages - current)
  }, [heroImages.length, maxHeroImages])

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

  const toggleCategory = (categoryId: number) => {
    setSuccess(null)
    setSelectedCategoryIds((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId)
      }
      return [...prev, categoryId]
    })
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
              Panel de Control del Inicio
            </span>
          </h3>
          <p className="mt-2 text-center text-lime-100 dark:text-emerald-300">
            Administra imágenes del hero y categorías destacadas de la landing
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
        <div className="flex items-center justify-between gap-4">
          <div>
            <h4 className="text-lg font-semibold text-green-900 dark:text-emerald-100">Imágenes Hero</h4>
            <p className="text-sm text-muted-foreground">
              Máximo {maxHeroImages}. Actualmente: {heroImages.length + newHeroImages.length}
            </p>
          </div>

          <label className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-3 py-2 text-sm font-medium text-white hover:bg-green-800 cursor-pointer">
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {heroImages.map((image) => (
            <div key={image.id} className="overflow-hidden rounded-xl border border-lime-200/70 bg-white dark:bg-emerald-950/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt={`Hero ${image.order}`} className="h-44 w-full object-cover" />
              <div className="flex items-center justify-between p-3">
                <span className="text-xs text-muted-foreground">Imagen guardada</span>
                <button
                  type="button"
                  onClick={() => removeExistingImage(image.id)}
                  className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                  Quitar
                </button>
              </div>
            </div>
          ))}

          {newHeroImages.map((file, index) => (
            <div key={`${file.name}-${index}`} className="overflow-hidden rounded-xl border border-dashed border-lime-400/80 bg-lime-50/60 dark:bg-emerald-950/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={newHeroImagePreviews[index]} alt={file.name} className="h-44 w-full object-cover" />
              <div className="flex items-center justify-between p-3">
                <span className="max-w-[65%] truncate text-xs text-muted-foreground">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeNewImage(index)}
                  className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                  Quitar
                </button>
              </div>
            </div>
          ))}

          {heroImages.length + newHeroImages.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-border bg-card/60 px-4 py-10 text-center text-muted-foreground">
              No hay imágenes configuradas para el hero.
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-lime-200/70 bg-white/90 p-4 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-950/35">
        <div>
          <h4 className="text-lg font-semibold text-green-900 dark:text-emerald-100">Categorías en la Landing</h4>
          <p className="text-sm text-muted-foreground">
            Selecciona las categorías que se mostrarán con sus eventos promocionados.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => {
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
      </section>

      <div className="flex justify-end">
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
