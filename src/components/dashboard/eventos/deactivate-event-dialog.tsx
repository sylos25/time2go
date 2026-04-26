import { Loader2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type DeactivateEventDialogProps = {
  open: boolean
  deleting: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function DeactivateEventDialog({
  open,
  deleting,
  onCancel,
  onConfirm,
}: DeactivateEventDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onCancel}>
      <AlertDialogContent className="rounded-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-green-700">Desactivar evento</AlertDialogTitle>
          <AlertDialogDescription className="text-green-700">
            Esta accion desactivara el evento dentro del sistema. Confirma para continuar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={deleting}
            className="rounded-sm border-green-700 text-green-700 transition-all duration-200 hover:bg-green-50 hover:scale-[1.03]"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={deleting}
            className="rounded-sm bg-rose-600 text-white transition-all duration-200 hover:bg-rose-500 hover:scale-[1.03]"
          >
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
