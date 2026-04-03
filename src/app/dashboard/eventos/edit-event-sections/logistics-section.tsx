import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { FormDataState, FormErrors } from "@/types/event-edit"

interface LogisticsSectionProps {
  formData: Pick<FormDataState, "telefono_1" | "telefono_2" | "fecha_inicio" | "fecha_fin" | "hora_inicio" | "hora_final" | "gratis_pago" | "reservar_anticipado" | "cupo">
  formErrors: Partial<FormErrors>
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
}

export function LogisticsSection({ formData, formErrors, onInputChange }: LogisticsSectionProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="telefono_1">Telefono del organizador del evento</Label>
          <Input
            id="telefono_1"
            name="telefono_1"
            type="tel"
            value={formData.telefono_1}
            onChange={onInputChange}
            placeholder="Telefono 1"
            className="rounded-xl"
            maxLength={10}
            inputMode="numeric"
          />
          {formErrors.telefono_1 && <p className="text-xs text-red-600 mt-1">{formErrors.telefono_1}</p>}
        </div>
        <div>
          <Label htmlFor="telefono_2">Telefono 2 (opcional)</Label>
          <Input
            id="telefono_2"
            name="telefono_2"
            type="tel"
            value={formData.telefono_2}
            onChange={onInputChange}
            placeholder="Telefono 2"
            className="rounded-xl"
            maxLength={10}
            inputMode="numeric"
          />
          {formErrors.telefono_2 && <p className="text-xs text-red-600 mt-1">{formErrors.telefono_2}</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fecha_inicio">Fecha de inicio del evento</Label>
          <Input
            id="fecha_inicio"
            name="fecha_inicio"
            type="date"
            value={formData.fecha_inicio}
            onChange={onInputChange}
            className="cursor-pointer w-full rounded-xl border-border bg-card text-foreground shadow-sm p-2"
          />
          {formErrors.fecha_inicio && <p className="text-xs text-red-600 mt-1">{formErrors.fecha_inicio}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="fecha_fin">Fecha final del evento</Label>
          <Input
            id="fecha_fin"
            name="fecha_fin"
            type="date"
            value={formData.fecha_fin}
            onChange={onInputChange}
            className="cursor-pointer w-full rounded-xl border-border bg-card text-foreground shadow-sm p-2"
          />
          {formErrors.fecha_fin && <p className="text-xs text-red-600 mt-1">{formErrors.fecha_fin}</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="hora_inicio">Hora de inicio</Label>
          <Input
            id="hora_inicio"
            name="hora_inicio"
            type="time"
            value={formData.hora_inicio}
            onChange={onInputChange}
            className="w-full rounded-xl"
          />
          {formErrors.hora_inicio && <p className="text-xs text-red-600 mt-1">{formErrors.hora_inicio}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="hora_final">Hora final</Label>
          <Input
            id="hora_final"
            name="hora_final"
            type="time"
            value={formData.hora_final}
            onChange={onInputChange}
            className="w-full rounded-xl"
          />
          {formErrors.hora_final && <p className="text-xs text-red-600 mt-1">{formErrors.hora_final}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="gratis_pago"
            checked={formData.gratis_pago}
            onChange={onInputChange}
            className="rounded border-border"
          />
          <span className="text-sm font-medium">Evento de Pago</span>
        </label>
      </div>

      {!formData.gratis_pago && (
        <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-lg border border-border">
          <input
            id="reservar_anticipado"
            name="reservar_anticipado"
            type="checkbox"
            checked={formData.reservar_anticipado}
            onChange={onInputChange}
            className="w-4 h-4 cursor-pointer"
          />
          <label htmlFor="reservar_anticipado" className="cursor-pointer text-sm font-medium">
            Asistencia unicamente con reserva anticipada?
          </label>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="cupo">Aforo del evento</Label>
        <Input
          id="cupo"
          name="cupo"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={formData.cupo}
          onChange={onInputChange}
          placeholder="100"
          className="rounded-xl"
        />
        <p className="text-sm text-muted-foreground">Ingresa un numero entero entre 20 y 5000</p>
        {formErrors.cupo && <p className="text-xs text-red-600 mt-1">{formErrors.cupo}</p>}
      </div>
    </>
  )
}
