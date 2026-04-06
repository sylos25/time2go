import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getColumnLabel, type DataRow } from "@/lib/dashboard-view-data"

type EditRecordDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  editFormData: DataRow
  editingRow: DataRow | null
  saveError: string | null
  saving: boolean
  onChangeField: (field: string, value: unknown) => void
  onSave: () => void
}

export function EditRecordDialog({
  open,
  onOpenChange,
  editFormData,
  editingRow,
  saveError,
  saving,
  onChangeField,
  onSave,
}: EditRecordDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>Editar registro</DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          {Object.keys(editFormData).length === 0 && (
            <p className="text-sm text-muted-foreground">Este registro no tiene campos editables disponibles.</p>
          )}

          {Object.entries(editFormData).map(([field, value]) => {
            const original = editingRow?.[field]
            const isBoolean = typeof original === "boolean"
            const isNumber = typeof original === "number"

            return (
              <div key={field} className="space-y-2">
                <Label htmlFor={`edit-${field}`}>{getColumnLabel(field)}</Label>

                {isBoolean ? (
                  <Select value={String(value)} onValueChange={(newValue) => onChangeField(field, newValue === "true")}>
                    <SelectTrigger id={`edit-${field}`} className="border-green-600 focus:ring-lime-400">
                      <SelectValue placeholder="Selecciona un valor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Si</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={`edit-${field}`}
                    type={isNumber ? "number" : "text"}
                    value={(value as string | number | undefined) ?? ""}
                    onChange={(event) => onChangeField(field, event.target.value)}
                    className="border-green-600 focus-visible:ring-lime-400"
                  />
                )}
              </div>
            )
          })}

          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg border border-border px-4 py-2 text-foreground hover:bg-accent"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || Object.keys(editFormData).length === 0}
            className="rounded-lg bg-green-700 px-4 py-2 text-white hover:bg-lime-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
