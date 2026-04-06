import { Button } from "@/components/ui/button";

type ReservationActionsProps = {
  saving: boolean;
  loading: boolean;
  onSubmit: () => void;
  onCancel: () => void;
};

export function ReservationActions({
  saving,
  loading,
  onSubmit,
  onCancel,
}: ReservationActionsProps) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <Button
        onClick={onSubmit}
        disabled={saving || loading}
        className="bg-gradient-to-tr from-green-600 to-lime-500 text-white transition-transform duration-200 hover:from-green-500 hover:to-lime-500 hover:scale-103"
      >
        {saving ? "Reservando..." : "Confirmar reserva"}
      </Button>
      <Button variant="outline" onClick={onCancel} className="transition-transform duration-200 hover:scale-103">
        Cancelar
      </Button>
    </div>
  );
}
