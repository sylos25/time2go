import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import {
  DOCUMENT_MAX_LENGTH,
  MAX_NAME_LENGTH,
  PHONE_LENGTH,
  RESERVA_EMAIL_MAX_LENGTH,
  TIPOS_DOCUMENTO,
  type AsistenteForm,
} from "../lib/reserva-evento";

type ReservationGuestsFormProps = {
  asistentes: AsistenteForm[];
  onAddAsistente: () => void;
  onUpdateAsistente: (index: number, key: keyof AsistenteForm, value: string) => void;
  onRemoveAsistente: (index: number) => void;
  removeButtonLayout?: "end" | "bottom";
};

export function ReservationGuestsForm({
  asistentes,
  onAddAsistente,
  onUpdateAsistente,
  onRemoveAsistente,
  removeButtonLayout = "bottom",
}: ReservationGuestsFormProps) {
  const removeButtonClassName =
    removeButtonLayout === "end" ? "flex items-end sm:col-span-1" : "flex justify-end sm:col-span-12";

  const canAddCompanion = asistentes.length < 3;

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-bold text-teal-700">Acompañante</p>
          <p className="text-xs text-muted-foreground">Opcional. Puedes registrar máximo 3 acompañantes.</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onAddAsistente}
          disabled={!canAddCompanion}
          className="border-green-600 bg-transparent text-green-700 transition-transform duration-200 hover:scale-103 hover:bg-transparent hover:text-green-700"
        >
          Agregar acompañante
        </Button>
      </div>

      {asistentes.length === 0 && (
        <p className="text-sm text-muted-foreground">Puedes continuar con la reserva sin acompañante.</p>
      )}

      {asistentes.map((asistente, index) => (
        <div key={`asistente-${index}`} className="grid gap-3 rounded-md border p-3 sm:grid-cols-12">
          <div className="space-y-2 sm:col-span-4">
            <Label className="font-semibold text-teal-700">Tipo de documento</Label>
            <Select
              value={asistente.tipo_documento}
              onValueChange={(value) => onUpdateAsistente(index, "tipo_documento", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_DOCUMENTO.map((tipo) => (
                  <SelectItem key={`${tipo}-${index}`} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-4">
            <Label className="font-semibold text-teal-700">Número de documento</Label>
            <Input
              value={asistente.numero_documento}
              onChange={(event) => onUpdateAsistente(index, "numero_documento", event.target.value)}
              placeholder="Documento"
              inputMode="numeric"
              maxLength={DOCUMENT_MAX_LENGTH}
            />
          </div>

          <div className="space-y-2 sm:col-span-4">
            <Label className="font-semibold text-teal-700">Nombres</Label>
            <Input
              value={asistente.nombres}
              onChange={(event) => onUpdateAsistente(index, "nombres", event.target.value)}
              placeholder="Nombres del acompañante"
              maxLength={MAX_NAME_LENGTH}
            />
          </div>

          <div className="space-y-2 sm:col-span-4">
            <Label className="font-semibold text-teal-700">Apellidos</Label>
            <Input
              value={asistente.apellidos}
              onChange={(event) => onUpdateAsistente(index, "apellidos", event.target.value)}
              placeholder="Apellidos del acompañante"
              maxLength={MAX_NAME_LENGTH}
            />
          </div>

          <div className="space-y-2 sm:col-span-4">
            <Label className="font-semibold text-teal-700">Teléfono</Label>
            <Input
              value={asistente.telefono}
              onChange={(event) => onUpdateAsistente(index, "telefono", event.target.value)}
              placeholder="Teléfono del acompañante"
              inputMode="numeric"
              maxLength={PHONE_LENGTH}
            />
          </div>

          <div className="space-y-2 sm:col-span-4">
            <Label className="font-semibold text-teal-700">Correo</Label>
            <Input
              value={asistente.correo}
              onChange={(event) => onUpdateAsistente(index, "correo", event.target.value)}
              placeholder="Correo del acompañante"
              type="email"
              maxLength={RESERVA_EMAIL_MAX_LENGTH}
            />
          </div>

          <div className={removeButtonClassName}>
            <Button
              type="button"
              size="icon"
              onClick={() => onRemoveAsistente(index)}
              title="Quitar acompañante"
              aria-label="Quitar acompañante"
              className="bg-gradient-to-tr from-fuchsia-700 to-red-500 text-white transition-transform duration-200 hover:from-fuchsia-600 hover:to-red-500 hover:scale-103"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
