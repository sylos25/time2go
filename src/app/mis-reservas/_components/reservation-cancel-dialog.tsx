import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ReservationCancelDialogProps = {
  open: boolean;
  isCancelling: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ReservationCancelDialog({
  open,
  isCancelling,
  onClose,
  onConfirm,
}: ReservationCancelDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar cancelación de reserva</DialogTitle>
          <DialogDescription>
            ¿Estás seguro que deseas cancelar esta reserva? Esta acción cambiará su estado y podrás volver a reservar el evento después.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            className="border-border text-foreground hover:border-green-500 hover:text-green-700"
            onClick={onClose}
            disabled={isCancelling}
          >
            No, conservar reserva
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isCancelling}
          >
            {isCancelling ? "Cancelando..." : "Sí, cancelar reserva"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
