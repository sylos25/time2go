import { useEffect, useMemo } from "react"
import { X, Upload } from "lucide-react"
import { Label } from "@/components/ui/label"
import type { ImagenEvento } from "@/types/event-edit"

interface ImagesSectionProps {
  existingImages: ImagenEvento[]
  newImages: File[]
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveExisting: (imageId: number) => void
  onRemoveNew: (index: number) => void
}

export function ImagesSection({
  existingImages,
  newImages,
  onUpload,
  onRemoveExisting,
  onRemoveNew,
}: ImagesSectionProps) {
  const previews = useMemo(
    () => newImages.map((img) => ({ file: img, url: URL.createObjectURL(img) })),
    [newImages],
  )

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url))
    }
  }, [previews])

  return (
    <>
      {existingImages.length > 0 && (
        <div>
          <Label>Imagenes actuales</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {existingImages.map((img) => (
              <div key={img.id_imagen_evento} className="relative group">
                <img src={img.url_imagen_evento} alt="Evento" className="w-full h-24 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => onRemoveExisting(img.id_imagen_evento)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="images">Agregar nuevas imagenes</Label>
        <div className="mt-2 flex items-center justify-center border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors">
          <input
            id="images"
            type="file"
            multiple
            accept="image/*"
            onChange={onUpload}
            className="hidden"
          />
          <label htmlFor="images" className="flex flex-col items-center cursor-pointer">
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="text-sm font-medium text-muted-foreground">Haz clic para seleccionar imagenes</span>
          </label>
        </div>

        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            {previews.map((preview, index) => (
              <div key={`${preview.file.name}-${index}`} className="relative group">
                <img src={preview.url} alt={`Nueva ${index}`} className="w-full h-24 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => onRemoveNew(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
