"use client"

import { Plus, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface EventoInfoItem {
  detalle: string
  obligatorio: boolean
}

interface AdditionalInfoSectionProps {
  items: EventoInfoItem[]
  error?: string
  onAdd: () => void
  onUpdate: (index: number, field: keyof EventoInfoItem, value: string | boolean) => void
  onRemove: (index: number) => void
  onClearError: () => void
  sanitizeText: (value: string, maxLength?: number) => string
}

export function AdditionalInfoSection({
  items,
  error,
  onAdd,
  onUpdate,
  onRemove,
  onClearError,
  sanitizeText,
}: AdditionalInfoSectionProps) {
  return (
    <div className="space-y-4 p-4 border border-border bg-muted/20 rounded-lg shadow-md">
      <div>
        <Label className="font-semibold text-green-700">Informacion adicional del evento</Label>
        <p className="text-xs text-muted-foreground mt-1">
          Registra los datos clave del evento por items para mejorar la lectura y la escalabilidad.
        </p>
      </div>

      {items.map((item, index) => (
        <div key={index} className="space-y-3 p-3 bg-muted/40 rounded-lg border border-border">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-green-700">Detalle importante</Label>
            <Textarea
              value={item.detalle}
              onChange={(e) => {
                const value = sanitizeText(e.target.value, 50)
                onClearError()
                onUpdate(index, "detalle", value)
              }}
              placeholder="Ej: Ingreso desde las 7:00 PM, no se permite reingreso"
              className="rounded-xl min-h-[90px]"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              {item.detalle.length}/50 caracteres (minimo 10)
            </p>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm cursor-pointer text-foreground">
              <input
                type="checkbox"
                checked={Boolean(item.obligatorio)}
                onChange={(e) => onUpdate(index, "obligatorio", e.target.checked)}
                className="w-4 h-4 cursor-pointer border-border"
              />
              Item obligatorio para asistentes
            </label>

            {items.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                aria-label="Quitar item"
                title="Quitar item"
                className="inline-flex items-center gap-2 cursor-pointer rounded-md border px-3 py-2 bg-gradient-to-tr from-fuchsia-700 to-red-500 text-white text-sm hover:bg-gradient-to-tr hover:from-fuchsia-600 hover:to-red-400"
              >
                <Trash2 className="h-4 w-4" />
                <span>Quitar</span>
              </button>
            )}
          </div>
        </div>
      ))}

      <div className="flex justify-between items-center gap-3">
        <button
          type="button"
          onClick={onAdd}
          disabled={items.length >= 20}
          aria-label="Agregar item"
          title="Agregar item"
          className={`px-3 py-1.5 rounded-md text-white text-sm ${
            items.length >= 20
              ? "bg-gray-300 cursor-not-allowed"
              : "inline-flex items-center gap-2 cursor-pointer rounded-md border px-3 py-2 bg-gradient-to-tr from-green-700 to-lime-500 text-white text-sm hover:bg-gradient-to-tr hover:from-green-600 hover:to-lime-400"
          }`}
        >
          <Plus className="h-4 w-4" />
          <span>Añadir</span>
        </button>
        <span className="text-sm text-muted-foreground">{items.length}/20 items</span>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
