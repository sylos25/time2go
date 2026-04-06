import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { RejectForm } from "@/lib/dashboard-events"

type RejectEventDialogProps = {
  open: boolean
  rejectSubmitting: boolean
  rejectForm: RejectForm
  onOpenChange: (open: boolean) => void
  onRejectFormChange: (updater: (prev: RejectForm) => RejectForm) => void
  onSubmit: () => void
}

export function RejectEventDialog({
  open,
  rejectSubmitting,
  rejectForm,
  onOpenChange,
  onRejectFormChange,
  onSubmit,
}: RejectEventDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg">
        <DialogHeader>
          <DialogTitle>Rechazar Evento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Motivo del rechazo</label>
            <textarea
              value={rejectForm.motivo_rechazo}
              onChange={(event) =>
                onRejectFormChange((prev) => ({
                  ...prev,
                  motivo_rechazo: event.target.value,
                }))
              }
              className="min-h-28 w-full resize-none rounded-md border border-border bg-card px-3 py-2 text-foreground"
              placeholder="Describe el motivo del rechazo (minimo 10 caracteres)"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {rejectForm.motivo_rechazo.length} caracteres
              {rejectForm.motivo_rechazo.length < 10 && (
                <span className="ml-1 text-red-500">(minimo {10 - rejectForm.motivo_rechazo.length} mas)</span>
              )}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={rejectSubmitting}>
            Cancelar
          </Button>
          <Button
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={onSubmit}
            disabled={rejectSubmitting || rejectForm.motivo_rechazo.trim().length < 10}
          >
            {rejectSubmitting ? "Rechazando..." : "Confirmar Rechazo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
