import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Boleta } from "@/types/event-edit"

type BoleteDefinition = {
  nombre_boleto: string
  precio_boleto: string | number
  servicio: string | number
}

interface BoletasSectionProps {
  boletas: BoleteDefinition[]
  error?: string
  onUpdateBoleta: (index: number, field: keyof BoleteDefinition, value: string) => void
  onAddBoleta: () => void
  onRemoveBoleta: (index: number) => void
  onRemoveAllBoletas: () => void
}

export function BoletasSection({
  boletas,
  error,
  onUpdateBoleta,
  onAddBoleta,
  onRemoveBoleta,
  onRemoveAllBoletas,
}: BoletasSectionProps) {
  return (
    <div className="space-y-4 p-4 border rounded-lg shadow-md">
      <h2 className="text-lg font-semibold">Tipos de Boletas y Precios</h2>
      <p className="text-xs text-muted-foreground italic -translate-y-2">
        Define los diferentes tipos de boletas disponibles para tu evento con sus precios.
      </p>
      {error && <p className="text-xs text-red-600">{error}</p>}

      {boletas.map((boleta, index) => (
        <div key={index} className="space-y-3 p-3 bg-muted/40 border border-border rounded-lg">
          <div className="space-y-2">
            <Label className="text-xs">Nombre de la boleta</Label>
            <Input
              type="text"
              value={boleta.nombre_boleto}
              onChange={(e) => onUpdateBoleta(index, "nombre_boleto", e.target.value)}
              placeholder="Ej: General, VIP, Early Bird, etc."
              className="rounded-xl text-sm"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Precio</Label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={boleta.precio_boleto}
                onChange={(e) => onUpdateBoleta(index, "precio_boleto", e.target.value)}
                placeholder="0"
                className="rounded-xl text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Cargo por servicio (opcional)</Label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={boleta.servicio}
                onChange={(e) => onUpdateBoleta(index, "servicio", e.target.value)}
                placeholder="0"
                className="rounded-xl text-sm"
              />
            </div>
          </div>

          {boletas.length > 1 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onRemoveBoleta(index)}
                className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
              >
                Quitar
              </button>
            </div>
          )}
        </div>
      ))}

      <div className="flex justify-between items-center gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onAddBoleta}
            disabled={boletas.length >= 12}
            className={`px-3 py-1.5 rounded-md text-white text-sm ${
              boletas.length >= 12 ? "bg-gray-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            + Anadir tipo de boleta
          </button>
          {boletas.length >= 2 && (
            <button
              type="button"
              onClick={onRemoveAllBoletas}
              className="px-3 py-1.5 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
            >
              Eliminar todas
            </button>
          )}
        </div>
        <span className="text-sm text-muted-foreground">{boletas.length}/12 tipos de boletas</span>
      </div>
    </div>
  )
}
