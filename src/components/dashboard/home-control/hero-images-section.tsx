import type { ChangeEvent } from "react"

import { ImagePlus } from "lucide-react"

import { ExistingHeroImageCard } from "./existing-hero-image-card"
import { NewHeroImageCard } from "./new-hero-image-card"
import type { HeroImage, MoveDirection } from "./types"

type HeroImagesSectionProps = {
  heroImages: HeroImage[]
  maxHeroImages: number
  newHeroImages: File[]
  newHeroImagePreviews: string[]
  remainingSlots: number
  onSelectNewImages: (event: ChangeEvent<HTMLInputElement>) => void
  onMoveImage: (id: number, direction: MoveDirection) => void
  onMoveNewImage: (index: number, direction: MoveDirection) => void
  onRemoveExistingImage: (id: number) => void
  onRemoveNewImage: (index: number) => void
}

export function HeroImagesSection({
  heroImages,
  maxHeroImages,
  newHeroImages,
  newHeroImagePreviews,
  remainingSlots,
  onSelectNewImages,
  onMoveImage,
  onMoveNewImage,
  onRemoveExistingImage,
  onRemoveNewImage,
}: HeroImagesSectionProps) {
  return (
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
            Medidas recomendadas: 1920x1080 px.
          </p>

          <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg bg-green-700 px-3 py-2 text-sm font-medium text-white hover:bg-green-800">
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
        {heroImages.map((image, index) => (
          <ExistingHeroImageCard
            key={image.id}
            image={image}
            isFirst={index === 0}
            isLast={index === heroImages.length - 1}
            onMove={onMoveImage}
            onRemove={onRemoveExistingImage}
          />
        ))}

        {newHeroImages.map((file, index) => (
          <NewHeroImageCard
            key={`${file.name}-${index}`}
            file={file}
            previewUrl={newHeroImagePreviews[index]}
            displayOrder={heroImages.length + index + 1}
            index={index}
            isFirst={index === 0}
            isLast={index === newHeroImages.length - 1}
            onMove={onMoveNewImage}
            onRemove={onRemoveNewImage}
          />
        ))}

        {heroImages.length + newHeroImages.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border bg-card/60 px-4 py-10 text-center text-muted-foreground">
            No hay imágenes configuradas para el carrusel de imágenes.
          </div>
        )}
      </div>
    </section>
  )
}
