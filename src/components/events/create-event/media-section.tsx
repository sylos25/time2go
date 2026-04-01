"use client"

import { useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface MediaSectionProps {
  imageInputRef: React.RefObject<HTMLInputElement | null>
  imagenes: File[]
  documento: File | null
  imagenesError?: string
  documentoError?: string
  onUpdateImages: (files: File[]) => void
  onUpdateDocument: (file: File | null) => void
  onSetImagesError: (message: string) => void
  onClearImagesError: () => void
  onSetDocumentError: (message: string) => void
  onClearDocumentError: () => void
}

export function MediaSection({
  imageInputRef,
  imagenes,
  documento,
  imagenesError,
  documentoError,
  onUpdateImages,
  onUpdateDocument,
  onSetImagesError,
  onClearImagesError,
  onSetDocumentError,
  onClearDocumentError,
}: MediaSectionProps) {
  const imagePreviews = useMemo(
    () =>
      (imagenes || []).map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    [imagenes],
  )

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url))
    }
  }, [imagePreviews])

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="imagenes_evento">Fotos del evento</Label>
        <Input
          ref={imageInputRef}
          id="imagenes_evento"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files || [])
            if (files.length > 8) {
              onSetImagesError("Puedes cargar maximo 8 imagenes.")
              e.currentTarget.value = ""
              onUpdateImages([])
              return
            }
            onClearImagesError()
            onUpdateImages(files.slice(0, 8))
          }}
          className="rounded-xl"
        />
        {imagenesError && <p className="text-xs text-red-600">{imagenesError}</p>}
        {(imagenes || []).length > 1 && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
            Advertencia: estas cargando mas de una imagen. Verifica que todas correspondan al mismo evento.
          </p>
        )}

        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {imagePreviews.map((preview, index) => (
              <div key={`${preview.file.name}-${index}`} className="rounded-xl border bg-card p-2 shadow-sm">
                <img src={preview.url} alt={preview.file.name} className="h-24 w-full rounded-lg object-cover" />
                <p className="mt-2 text-xs text-muted-foreground truncate">{preview.file.name}</p>
                <button
                  type="button"
                  onClick={() => {
                    const updated = (imagenes || []).filter((_, i) => i !== index)
                    if (updated.length === 0 && imageInputRef.current) {
                      imageInputRef.current.value = ""
                    }
                    onUpdateImages(updated)
                  }}
                  className="mt-2 w-full rounded-md border px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">{(imagenes || []).length}/8 imagenes</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="documento_evento">Documento del evento (opcional)</Label>
        <Input
          id="documento_evento"
          type="file"
          accept="application/pdf,.pdf"
          onChange={(e) => {
            const file = e.target.files && e.target.files[0] ? e.target.files[0] : null
            if (!file) {
              onClearDocumentError()
              onUpdateDocument(null)
              return
            }

            const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
            if (!isPdf) {
              onSetDocumentError("Solo se permite cargar un documento PDF.")
              e.currentTarget.value = ""
              onUpdateDocument(null)
              return
            }

            if (file.size > 5 * 1024 * 1024) {
              onSetDocumentError("El documento no puede superar 5 MB.")
              e.currentTarget.value = ""
              onUpdateDocument(null)
              return
            }

            onClearDocumentError()
            onUpdateDocument(file)
          }}
          className="rounded-xl"
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
                onClick={() => onUpdateDocument(null)}
                className="rounded-md border px-2 py-1 text-xs text-red-600 hover:bg-red-50"
              >
                Quitar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
