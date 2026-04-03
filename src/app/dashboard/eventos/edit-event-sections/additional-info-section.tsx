import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { EventoInfoItem } from "@/types/event-edit"

interface AdditionalInfoSectionProps {
  items: EventoInfoItem[]
  error?: string
  onAdd: () => void
  onUpdate: (index: number, field: keyof EventoInfoItem, value: string | boolean) => void
  onRemove: (index: number) => void
}

export function AdditionalInfoSection({
  items,
  error,
  onAdd,
  onUpdate,
  onRemove,
}: AdditionalInfoSectionProps) {
  return (
    <div className="space-y-4 p-4 border border-border bg-muted/20 rounded-lg shadow-md">
      <div>
        <Label>Informacion adicional del evento</Label>
        <p className="text-xs text-muted-foreground mt-1">
          Registra los datos clave del evento por items para mantener una descripcion detallada.
        </p>
      </div>

      {items.map((item, index) => (
        <div key={index} className="space-y-3 p-3 bg-muted/40 rounded-lg border border-border">
          <div className="space-y-2">
            <Label className="text-xs">Detalle importante</Label>
            <Textarea
              value={item.detalle}
              onChange={(e) => onUpdate(index, "detalle", e.target.value)}
              placeholder="Ej: Ingreso desde las 7:00 PM, no se permite reingreso"
              className="rounded-xl min-h-[90px]"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={item.obligatorio}
                onChange={(e) => onUpdate(index, "obligatorio", e.target.checked)}
                className="w-4 h-4"
              />
              Marcado como obligatorio para asistentes
            </label>

            {items.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
              >
                Quitar
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
          className={`px-3 py-1.5 rounded-md text-white text-sm ${
            items.length >= 20 ? "bg-gray-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          + Anadir item
        </button>
        <span className="text-sm text-muted-foreground">{items.length}/20 items</span>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
