"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CreateEventSuccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGoEvents: () => void
}

export function CreateEventSuccessDialog({
  open,
  onOpenChange,
  onGoEvents,
}: CreateEventSuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-600">
            Evento creado exitosamente
          </DialogTitle>
          <DialogDescription>
            El evento se registró correctamente. Se puede ir al listado de eventos o permanecer en este formulario.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Permanecer en el formulario
          </Button>
          <Button
            className="bg-gradient-to-tr from-green-700 to-lime-500 text-white"
            onClick={() => {
              onOpenChange(false)
              onGoEvents()
            }}
          >
            Ir a eventos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
