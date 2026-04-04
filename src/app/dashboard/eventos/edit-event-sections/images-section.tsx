import { useEffect, useMemo } from "react"
import { X, Upload, Star } from "lucide-react"
import { Label } from "@/components/ui/label"
import type { ImagenEvento } from "@/types/event-edit"

interface ImagesSectionProps {
  existingImages: ImagenEvento[]
  newImages: File[]
  newPrincipalImageIndex: number | null
  documento: File | null
  imagenesError?: string
  documentoError?: string
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSetDocumento: (file: File | null) => void
  onSetExistingPrincipal: (imageId: number) => void
  onSetNewPrincipal: (index: number) => void
  onRemoveExisting: (imageId: number) => void
  onRemoveNew: (index: number) => void
}

export function ImagesSection({
  existingImages,
  newImages,
  newPrincipalImageIndex,
  documento,
  imagenesError,
  documentoError,
  onUpload,
  onSetDocumento,
  onSetExistingPrincipal,
  onSetNewPrincipal,
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
            {existingImages.map((img, index) => (
              <div key={img.id_imagen_evento} className="relative group">
                <img src={img.url_imagen_evento} alt="Evento" className="w-full h-24 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => onSetExistingPrincipal(img.id_imagen_evento)}
                  className={`absolute top-1 left-1 inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] ${
                    img.principal
                      ? "border-amber-400 bg-amber-50 text-amber-800"
                      : "border-border bg-background/90 text-muted-foreground"
                  }`}
                >
                  <Star className="w-3 h-3" />
                  Principal
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveExisting(img.id_imagen_evento)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="mt-1 text-[11px] text-muted-foreground text-center">
                  Orden: {Number(img.orden || index + 1)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="images">Agregar nuevas imagenes</Label>
        <p className="mt-1 text-xs text-muted-foreground">
          Puedes tener hasta 8 imagenes en total entre actuales y nuevas.
        </p>
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
        {imagenesError && <p className="text-xs text-red-600 mt-2">{imagenesError}</p>}
        <p className="mt-1 text-xs text-muted-foreground">
          Total: {existingImages.length + newImages.length}/8 imagenes
        </p>

        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            {previews.map((preview, index) => (
              <div key={`${preview.file.name}-${index}`} className="relative group">
                <img src={preview.url} alt={`Nueva ${index}`} className="w-full h-24 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => onSetNewPrincipal(index)}
                  className={`absolute top-1 left-1 inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] ${
                    newPrincipalImageIndex === index
                      ? "border-amber-400 bg-amber-50 text-amber-800"
                      : "border-border bg-background/90 text-muted-foreground"
                  }`}
                >
                  <Star className="w-3 h-3" />
                  {newPrincipalImageIndex === index ? "Principal" : "Marcar"}
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveNew(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="mt-1 text-[11px] text-muted-foreground text-center">Orden nuevo: {index + 1}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2 mt-4">
        <Label htmlFor="documento_evento_edit">Documento del evento (opcional)</Label>
        <input
          id="documento_evento_edit"
          type="file"
          accept="application/pdf,.pdf"
          onChange={(e) => {
            const file = e.target.files && e.target.files[0] ? e.target.files[0] : null
            if (!file) {
              onSetDocumento(null)
              return
            }

            const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
            if (!isPdf || file.size > 5 * 1024 * 1024) {
              e.currentTarget.value = ""
              onSetDocumento(null)
              return
            }

            onSetDocumento(file)
          }}
          className="rounded-xl border px-3 py-2 w-full"
        />
        {documentoError && <p className="text-xs text-red-600">{documentoError}</p>}
        {documento && (
          <div className="mt-2 rounded-xl border border-border bg-muted/40 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">{documento.name}</p>
                <p className="text-xs text-muted-foreground">{(documento.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                type="button"
                onClick={() => onSetDocumento(null)}
                className="rounded-md border px-2 py-1 text-xs text-red-600 hover:bg-red-50"
              >
                Quitar
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
