import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  type DataTable,
  type FieldConfig,
  type FormState,
  isNumericField,
  isStrictNameField,
  isStrictTable,
} from "@/lib/insert-data-config"

type InsertDataFieldProps = {
  field: FieldConfig
  selectedTable: DataTable
  formData: FormState
  onInputChange: (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      | { target: { name: string; value: string | number | boolean; type: string } }
  ) => void
  onSetFormData: (updater: (prev: FormState) => FormState) => void
}

export function InsertDataField({
  field,
  selectedTable,
  formData,
  onInputChange,
  onSetFormData,
}: InsertDataFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>{field.label}</Label>

      {field.type === "select" ? (
        <Select
          value={formData[field.name]?.toString() || ""}
          onValueChange={(value) => {
            onSetFormData((prev) => ({
              ...prev,
              [field.name]: value,
            }))
          }}
        >
          <SelectTrigger id={field.name} className="border-green-600 focus:ring-lime-400">
            <SelectValue placeholder={`Selecciona ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {field.name === "tipo_documento" && (
              <>
                <SelectItem value="Cedula de Ciudadania">Cedula de Ciudadania</SelectItem>
                <SelectItem value="Cedula de Extranjeria">Cedula de Extranjeria</SelectItem>
                <SelectItem value="Pasaporte">Pasaporte</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      ) : field.type === "checkbox" ? (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={field.name}
            name={field.name}
            checked={(formData[field.name] as boolean) || false}
            onChange={onInputChange}
            className="h-4 w-4 rounded border-border"
          />
          <Label htmlFor={field.name} className="cursor-pointer font-normal">
            {field.label}
          </Label>
        </div>
      ) : field.type === "textarea" ? (
        <Textarea
          id={field.name}
          name={field.name}
          value={(formData[field.name] as string) || ""}
          onChange={onInputChange}
          placeholder={`Ingresa ${field.label.toLowerCase()}`}
          required={field.required}
          rows={3}
          minLength={field.minLength}
          maxLength={field.maxLength}
          className="border-green-600 bg-white/90 focus-visible:ring-lime-400 dark:bg-emerald-950/60"
        />
      ) : (
        <Input
          id={field.name}
          name={field.name}
          type={isNumericField(selectedTable, field.name) ? "text" : field.type}
          value={(formData[field.name] as string | number) || ""}
          onChange={onInputChange}
          placeholder={`Ingresa ${field.label.toLowerCase()}`}
          required={field.required}
          minLength={field.minLength}
          maxLength={field.maxLength}
          inputMode={isNumericField(selectedTable, field.name) ? "numeric" : undefined}
          autoComplete="off"
          pattern={
            isNumericField(selectedTable, field.name)
              ? field.pattern || "[0-9]*"
              : isStrictTable(selectedTable) && isStrictNameField(field.name)
                ? "[A-Za-zÁÉÍÓÚáéíóúÑñ\\s]+"
                : field.pattern
          }
          title={field.validationMessage}
          className="border-green-600 bg-white/90 focus-visible:ring-lime-400 dark:bg-emerald-950/60"
        />
      )}
    </div>
  )
}
