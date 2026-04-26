"use client"

import { Loader2, Save } from "lucide-react"

import { DashboardSectionHero } from "@/components/dashboard/shared/dashboard-section-hero"
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
      <DashboardSectionHero
        title="Personalizar el Inicio"
        subtitle="Administra el carrusel de imágenes y las categorías de la página de inicio"
      />

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
