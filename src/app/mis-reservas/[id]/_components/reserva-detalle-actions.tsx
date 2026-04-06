import { Button } from "@/components/ui/button";

type ReservaDetalleActionsProps = {
  downloadingPdf: boolean;
  disabledDownload: boolean;
  onDownloadPdf: () => void;
  onBack: () => void;
};

export function ReservaDetalleActions({
  downloadingPdf,
  disabledDownload,
  onDownloadPdf,
  onBack,
}: ReservaDetalleActionsProps) {
  return (
    <div className="flex items-center justify-between mb-6 gap-3">
      <h1 className="text-3xl font-bold text-rose-700">Detalle de Reserva</h1>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="border-green-700 text-green-700 hover:bg-green-50 hover:text-green-700 hover:scale-103"
          onClick={onDownloadPdf}
          disabled={disabledDownload || downloadingPdf}
        >
          {downloadingPdf ? "Generando PDF..." : "Descargar PDF"}
        </Button>
        <Button variant="outline" className="hover:scale-103" onClick={onBack}>
          Volver
        </Button>
      </div>
    </div>
  );
}
