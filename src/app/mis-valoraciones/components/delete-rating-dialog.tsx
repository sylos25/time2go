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

type DeleteRatingDialogProps = {
  open: boolean
  deleting: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteRatingDialog({
  open,
  deleting,
  onCancel,
  onConfirm,
}: DeleteRatingDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onCancel}>
      <AlertDialogContent className="rounded-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar valoracion?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta accion no se puede deshacer. Tu calificacion y comentario seran eliminados
            permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting} className="rounded-sm">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={deleting}
            className="rounded-sm bg-red-500 hover:bg-red-600"
          >
            {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Si, eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
