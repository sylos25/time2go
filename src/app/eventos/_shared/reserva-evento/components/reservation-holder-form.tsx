import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DOCUMENT_MAX_LENGTH,
  MAX_NAME_LENGTH,
  PHONE_LENGTH,
  TIPOS_DOCUMENTO,
  type ReservaTitularForm,
} from "../lib/reserva-evento";

type ReservationHolderFormProps = {
  titularForm: ReservaTitularForm;
  titularLockedFields: {
    tipo_documento: boolean;
    numero_documento: boolean;
    nombres: boolean;
    apellidos: boolean;
    telefono: boolean;
  };
  onTipoDocumentoChange: (value: string) => void;
  onNumeroDocumentoChange: (value: string) => void;
  onNombresChange: (value: string) => void;
  onApellidosChange: (value: string) => void;
  onTelefonoChange: (value: string) => void;
};

export function ReservationHolderForm({
  titularForm,
  titularLockedFields,
  onTipoDocumentoChange,
  onNumeroDocumentoChange,
  onNombresChange,
  onApellidosChange,
  onTelefonoChange,
}: ReservationHolderFormProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label className="font-semibold text-green-700">Documento del titular</Label>
        <Select
          value={titularForm.tipo_documento}
          onValueChange={onTipoDocumentoChange}
          disabled={titularLockedFields.tipo_documento}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona un tipo de documento" />
          </SelectTrigger>
          <SelectContent>
            {TIPOS_DOCUMENTO.map((tipo) => (
              <SelectItem key={tipo} value={tipo}>
                {tipo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="font-semibold text-green-700">Número de documento del titular</Label>
        <Input
          value={titularForm.numero_documento}
          onChange={(event) => onNumeroDocumentoChange(event.target.value)}
          placeholder="Ingresa tu número de documento"
          inputMode="numeric"
          maxLength={DOCUMENT_MAX_LENGTH}
          disabled={titularLockedFields.numero_documento}
        />
      </div>

      <div className="space-y-2">
        <Label className="font-semibold text-green-700">Nombres del titular</Label>
        <Input
          value={titularForm.nombres}
          onChange={(event) => onNombresChange(event.target.value)}
          placeholder="Ingresa tus nombres"
          maxLength={MAX_NAME_LENGTH}
          disabled={titularLockedFields.nombres}
        />
      </div>

      <div className="space-y-2">
        <Label className="font-semibold text-green-700">Apellidos del titular</Label>
        <Input
          value={titularForm.apellidos}
          onChange={(event) => onApellidosChange(event.target.value)}
          placeholder="Ingresa tus apellidos"
          maxLength={MAX_NAME_LENGTH}
          disabled={titularLockedFields.apellidos}
        />
      </div>

      <div className="space-y-2">
        <Label className="font-semibold text-green-700">Número de teléfono del titular</Label>
        <Input
          value={titularForm.telefono}
          onChange={(event) => onTelefonoChange(event.target.value)}
          placeholder="Ingresa tu teléfono"
          inputMode="numeric"
          maxLength={PHONE_LENGTH}
          disabled={titularLockedFields.telefono}
        />
      </div>
    </div>
  );
}
