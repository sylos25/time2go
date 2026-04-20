"use client"

import { Plus, TicketX, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NumericFormat } from "react-number-format"

interface BoletaItem {
  nombre_boleto: string
  precio_boleto: string
  servicio: string
}

interface TicketSectionProps {
  pago: boolean
  reservarAnticipado: boolean
  boletas: BoletaItem[]
  error?: string
  onTogglePago: (pago: boolean) => void
  onToggleReserva: (value: boolean) => void
  onAddBoleta: () => void
  onUpdateBoleta: (index: number, field: keyof BoletaItem, value: string) => void
  onRemoveBoleta: (index: number) => void
  onRemoveAllBoletas: () => void
  onClearError: () => void
  sanitizeAlphanum: (value: string, maxLength?: number) => string
}

export function TicketSection({
  pago,
  reservarAnticipado,
  boletas,
  error,
  onTogglePago,
  onToggleReserva,
  onAddBoleta,
  onUpdateBoleta,
  onRemoveBoleta,
  onRemoveAllBoletas,
  onClearError,
  sanitizeAlphanum,
}: TicketSectionProps) {
  return (
    <div className="space-y-4 p-4 border rounded-lg shadow-md">
      <div className="flex gap-6 items-center">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" name="tipoEntrada" checked={!pago} onChange={() => onTogglePago(false)} />
          Gratis
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" name="tipoEntrada" checked={pago} onChange={() => onTogglePago(true)} />
          Pago
        </label>
      </div>

      {!pago && (
        <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-lg border border-border">
          <input
            id="reservar_anticipado"
            type="checkbox"
            checked={reservarAnticipado}
            onChange={(e) => onToggleReserva(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
          />
          <label htmlFor="reservar_anticipado" className="cursor-pointer">
            <span className="font-medium text-foreground">Se requiere reserva anticipada?</span>
            <p className="text-xs text-muted-foreground">
              Marca esta opcion si los usuarios deben reservar entrada para asistir al evento
            </p>
          </label>
        </div>
      )}

      {pago && (
        <div className="space-y-4 p-4 border border-border rounded-lg shadow-md bg-muted/20">
          <h2 className="text-lg font-semibold text-green-700 cursor-default">Tipos de Boletas y Precios</h2>
          <p className="text-xs text-muted-foreground italic -translate-y-3 cursor-default">
            Define los diferentes tipos de boletas disponibles para el evento con sus precios.
          </p>
          {error && <p className="text-xs text-red-600">{error}</p>}

          {boletas.map((boleta, index) => (
            <div key={index} className="space-y-3 p-3 bg-muted/40 rounded-lg border border-border">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-green-700">Nombre de la boleta</Label>
                <p className="text-xs text-muted-foreground">Nombre visible para identificar el tipo de entrada.</p>
                <Input
                  type="text"
                  value={boleta.nombre_boleto}
                  onChange={(e) => {
                    const valor = sanitizeAlphanum(e.target.value, 30)
                    onClearError()
                    onUpdateBoleta(index, "nombre_boleto", valor)
                  }}
                  placeholder="Ej: General, VIP, Early Bird, etc."
                  className="rounded-xl text-sm focus-visible:border-green-500 focus-visible:ring-green-500"
                  maxLength={30}
                />
                <p className="text-xs text-muted-foreground">
                  {String(boleta.nombre_boleto || "").length}/30 caracteres (minimo 3)
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-green-700">Precio</Label>
                  <p className="text-xs text-muted-foreground">Valor base de la boleta en pesos colombianos.</p>
                  <NumericFormat
                    customInput={Input}
                    value={boleta.precio_boleto}
                    prefix="$"
                    thousandSeparator="."
                    decimalSeparator="," 
                    allowNegative={false}
                    decimalScale={0}
                    isAllowed={(values) => values.floatValue === undefined || values.floatValue <= 500000000}
                    onValueChange={(values) => onUpdateBoleta(index, "precio_boleto", values.value)}
                    placeholder="$0"
                    className="rounded-xl focus-visible:border-green-500 focus-visible:ring-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-green-700">
                    Cargo por servicio <span className="text-gray-400 font-normal">(opcional)</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">Cargo adicional por procesamiento/plataforma</p>
                  <NumericFormat
                    customInput={Input}
                    value={boleta.servicio}
                    prefix="$"
                    thousandSeparator="."
                    decimalSeparator="," 
                    allowNegative={false}
                    decimalScale={0}
                    isAllowed={(values) => values.floatValue === undefined || values.floatValue <= 500000000}
                    onValueChange={(values) => onUpdateBoleta(index, "servicio", values.value)}
                    placeholder="$0"
                    className="rounded-xl focus-visible:border-green-500 focus-visible:ring-green-500"
                  />
                </div>
              </div>

              {boletas.length > 1 && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => onRemoveBoleta(index)}
                    aria-label="Quitar boleta"
                    title="Quitar boleta"
                    className="inline-flex items-center gap-2 cursor-pointer rounded-md border px-3 py-2 bg-gradient-to-tr from-fuchsia-700 to-red-500 text-white text-sm hover:bg-gradient-to-tr hover:from-fuchsia-600 hover:to-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Quitar boleta</span>
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
                aria-label="Agregar tipo de boleta"
                title="Agregar tipo de boleta"
                className={`px-3 py-1.5 rounded-md text-white text-sm ${
                  boletas.length >= 12
                    ? "bg-gray-300 cursor-not-allowed"
                    : "inline-flex items-center gap-2 cursor-pointer rounded-md border px-3 py-2 bg-gradient-to-tr from-green-700 to-lime-500 text-white text-sm hover:bg-gradient-to-tr hover:from-green-600 hover:to-lime-400"
                }`}
              >
                <Plus className="h-4 w-4" />
                <span>Agregar boleta</span>
              </button>
              {boletas.length >= 2 && (
                <button
                  type="button"
                  onClick={onRemoveAllBoletas}
                  aria-label="Eliminar todas las boletas"
                  title="Eliminar todas las boletas"
                  className="inline-flex items-center gap-2 cursor-pointer rounded-md border px-3 py-2 bg-gradient-to-tr from-fuchsia-700 to-red-500 text-white text-sm hover:bg-gradient-to-tr hover:from-fuchsia-600 hover:to-red-400"
                >
                  <TicketX className="h-4 w-4" />
                  <span>Eliminar todas</span>
                </button>
              )}
            </div>
            <span className="text-sm text-muted-foreground">{boletas.length}/12 tipos de boletas</span>
          </div>
        </div>
      )}
    </div>
  )
}
