import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { FormDataState, FormErrors } from "@/types/event-edit"

interface LogisticsSectionProps {
  formData: Pick<FormDataState, "telefono_1" | "telefono_2" | "telefono_principal" | "fecha_inicio" | "fecha_fin" | "hora_inicio" | "hora_final" | "cupo">
  formErrors: Partial<FormErrors>
  showTelefono2: boolean
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onShowTelefono2: (value: boolean) => void
}

export function LogisticsSection({
  formData,
  formErrors,
  showTelefono2,
  onInputChange,
  onShowTelefono2,
}: LogisticsSectionProps) {
  return (
    <>
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="telefono_1">Telefono del organizador del evento</Label>
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={formData.telefono_principal === "1"}
                onChange={() =>
                  onInputChange({
                    target: { name: "telefono_principal", value: "1", type: "text" },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
                className="w-4 h-4"
              />
              Telefono principal
            </label>
          </div>
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

        {!showTelefono2 && (
          <Button
            type="button"
            onClick={() => onShowTelefono2(true)}
            className="cursor-pointer rounded-md border px-2 py-1 bg-gradient-to-tr from-green-700 to-lime-500 text-white text-sm hover:bg-gradient-to-tr hover:from-green-600 hover:to-lime-400 hover:scale-102 w-45 text-center"
          >
            + Agregar otro telefono
          </Button>
        )}

        {showTelefono2 && (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="telefono_2">Segundo telefono del organizador del evento</Label>
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.telefono_principal === "2"}
                    onChange={() =>
                      onInputChange({
                        target: { name: "telefono_principal", value: "2", type: "text" },
                      } as React.ChangeEvent<HTMLInputElement>)
                    }
                    className="w-4 h-4"
                  />
                  Telefono principal
                </label>
              </div>
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

            <Button
              type="button"
              onClick={() => {
                onShowTelefono2(false)
                onInputChange({
                  target: { name: "telefono_2", value: "", type: "text" },
                } as React.ChangeEvent<HTMLInputElement>)
              }}
              className="cursor-pointer rounded-md border px-2 py-1 bg-gradient-to-tr from-fuchsia-700 to-red-500 text-white text-sm hover:bg-gradient-to-tr hover:from-fuchsia-600 hover:to-red-400 hover:scale-102 w-45 text-center"
            >
              - Quitar telefono
            </Button>
          </div>
        )}
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
