"use client"

import { Loader2, Save } from "lucide-react"

import { CategoriesSection } from "../../../components/dashboard/home-control/categories-section"
import { HeroImagesSection } from "../../../components/dashboard/home-control/hero-images-section"
import { StatusMessage } from "../../../components/dashboard/home-control/status-message"
import { useHomeControl } from "../../../hooks/use-home-control"

export default function DashboardHomeControlPage() {
  const {
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
  } = useHomeControl()

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
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

      {error && <StatusMessage message={error} tone="error" />}
      {success && <StatusMessage message={success} tone="success" />}

      <HeroImagesSection
        heroImages={heroImages}
        maxHeroImages={maxHeroImages}
        newHeroImages={newHeroImages}
        newHeroImagePreviews={newHeroImagePreviews}
        remainingSlots={remainingSlots}
        onSelectNewImages={onSelectNewImages}
        onMoveImage={moveImage}
        onMoveNewImage={moveNewImage}
        onRemoveExistingImage={removeExistingImage}
        onRemoveNewImage={removeNewImage}
      />

      <CategoriesSection
        categories={categories}
        categoryPage={categoryPage}
        categoryRangeEnd={categoryRangeEnd}
        categoryRangeStart={categoryRangeStart}
        categorySearchQuery={categorySearchQuery}
        filteredCategories={filteredCategories}
        paginatedCategories={paginatedCategories}
        selectedCategoryIds={selectedCategoryIds}
        totalCategoryPages={totalCategoryPages}
        visibleCategoryPages={visibleCategoryPages}
        onSearchChange={handleCategorySearchChange}
        onSetCategoryPage={setCategoryPage}
        onToggleCategory={toggleCategory}
      />

      <div className="flex justify-start">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  )
}
