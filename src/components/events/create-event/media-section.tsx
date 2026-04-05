"use client"

import { useEffect, useMemo, useRef } from "react"
import { ChevronDown, ChevronUp, FileUp, Images, Star, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface MediaSectionProps {
  imageInputRef: React.RefObject<HTMLInputElement | null>
  imagenes: File[]
  imagenPrincipalIndex: number
  documento: File | null
  imagenesError?: string
  documentoError?: string
  onUpdateImages: (files: File[]) => void
  onMoveImage: (index: number, direction: "up" | "down") => void
  onSetPrincipalImage: (index: number) => void
  onRemoveImage: (index: number) => void
  onUpdateDocument: (file: File | null) => void
  onSetImagesError: (message: string) => void
  onClearImagesError: () => void
  onSetDocumentError: (message: string) => void
  onClearDocumentError: () => void
}

export function MediaSection({
  imageInputRef,
  imagenes,
  imagenPrincipalIndex,
  documento,
  imagenesError,
  documentoError,
  onUpdateImages,
  onMoveImage,
  onSetPrincipalImage,
  onRemoveImage,
  onUpdateDocument,
  onSetImagesError,
  onClearImagesError,
  onSetDocumentError,
  onClearDocumentError,
}: MediaSectionProps) {
  const documentInputRef = useRef<HTMLInputElement | null>(null)

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
        <Label htmlFor="imagenes_evento" className="font-semibold text-green-700">Fotos del evento</Label>
        <p className="text-xs text-muted-foreground">
          Cargar entre 1 y 8 imágenes en formato JPG, PNG o WEBP. Deben corresponder al mismo evento.
        </p>
        <Input
          ref={imageInputRef}
          id="imagenes_evento"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files || [])
            const existing = imagenes || []

            if (existing.length >= 8) {
              onSetImagesError("Ya se alcanzó el máximo de 8 imágenes.")
              e.currentTarget.value = ""
              return
            }

            const availableSlots = 8 - existing.length
            const nextFiles = [...existing, ...files.slice(0, availableSlots)]

            if (files.length > availableSlots) {
              onSetImagesError("Solo se agregaron imágenes hasta completar el máximo de 8.")
            } else {
              onClearImagesError()
            }

            onUpdateImages(nextFiles)
            e.currentTarget.value = ""
          }}
          className="hidden"
        />
        {imagenesError && <p className="text-xs text-red-600">{imagenesError}</p>}
        {(imagenes || []).length > 1 && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
            Advertencia: estas cargando mas de una imagen. Verifica que todas correspondan al mismo evento.
          </p>
        )}
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 bg-gradient-to-tr from-green-700 to-lime-500 text-white text-sm hover:from-green-600 hover:to-lime-400 cursor-pointer"
        >
          <Images className="h-4 w-4" />
          <span>Agregar fotos</span>
        </button>

        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {imagePreviews.map((preview, index) => (
              <div key={`${preview.file.name}-${index}`} className="rounded-xl border bg-card p-2 shadow-sm">
                <img src={preview.url} alt={preview.file.name} className="h-24 w-full rounded-lg object-cover" />
                <p className="mt-2 text-xs text-muted-foreground truncate">{preview.file.name}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSetPrincipalImage(index)}
                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs cursor-pointer ${
                      imagenPrincipalIndex === index
                        ? "border-amber-400 bg-amber-50 text-amber-800"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Star className="h-3.5 w-3.5" />
                    {imagenPrincipalIndex === index ? "Principal" : "Marcar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveImage(index)}
                    aria-label="Quitar imagen"
                    title="Quitar imagen"
                    className="inline-flex items-center justify-center rounded-md p-1.5 text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-1 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
                  <span>Orden: {index + 1}</span>
                  <button
                    type="button"
                    title="Subir"
                    onClick={() => onMoveImage(index, "up")}
                    disabled={index === 0}
                    className="rounded p-0.5 text-muted-foreground hover:bg-muted disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Bajar"
                    onClick={() => onMoveImage(index, "down")}
                    disabled={index === imagePreviews.length - 1}
                    className="rounded p-0.5 text-muted-foreground hover:bg-muted disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">{(imagenes || []).length}/8 imagenes</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="documento_evento" className="font-semibold text-green-700">
          Documento del evento <span className="text-gray-400 font-normal">(opcional)</span>
        </Label>
        <p className="text-xs text-muted-foreground">
          Cargar un único archivo PDF de máximo 5 MB para soporte o validación del evento.
        </p>
        <button
          type="button"
          onClick={() => documentInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 bg-gradient-to-tr from-green-700 to-lime-500 text-white text-sm hover:from-green-600 hover:to-lime-400 cursor-pointer"
        >
          <FileUp className="h-4 w-4" />
          <span>Agregar documento</span>
        </button>
        <Input
          ref={documentInputRef}
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
          className="hidden"
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
                aria-label="Quitar documento"
                title="Quitar documento"
                className="inline-flex items-center justify-center rounded-md border p-1.5 text-red-600 hover:bg-red-50 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
