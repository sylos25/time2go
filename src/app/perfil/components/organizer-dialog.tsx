import type { ChangeEvent } from "react"

import { AlertCircle, CheckCircle, CreditCard, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

type OrganizerDialogProps = {
  open: boolean
  isProcessingPayment: boolean
  selectedPdf: File | null
  organizerError: string | null
  organizerPriceText: string
  onOpenChange: (open: boolean) => void
  onClose: () => void
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void
  onPay: () => void
}

export function OrganizerDialog({
  open,
  isProcessingPayment,
  selectedPdf,
  organizerError,
  organizerPriceText,
  onOpenChange,
  onClose,
  onFileChange,
  onPay,
}: OrganizerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Organiza tus eventos</DialogTitle>
          <DialogDescription>
            Conviertete en organizador y empieza a publicar eventos en Time2Go
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-1">
          {[
            "Crea y gestiona tus propios eventos",
            "Accede al panel exclusivo de organizador",
            "Gestiona reservas y boletaria",
            "Publica tus eventos para toda la comunidad",
          ].map((benefit) => (
            <div key={benefit} className="flex items-center gap-2 text-sm text-foreground">
              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-green-200 dark:border-green-900/60 bg-green-50 dark:bg-green-950/30 p-4">
          <p className="text-3xl font-bold text-green-700 dark:text-green-400">{organizerPriceText}</p>
          <p className="text-xs text-green-600 dark:text-green-500 mt-1">
            Pago unico de activacion · Sin cuotas ni suscripciones
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Documento de soporte <span className="text-muted-foreground font-normal">(opcional, max. 5 MB)</span>
          </p>
          <Input
            type="file"
            accept="application/pdf,.pdf"
            onChange={onFileChange}
            disabled={isProcessingPayment}
          />
          {selectedPdf && (
            <p className="text-xs text-muted-foreground">
              Archivo: <span className="font-medium text-foreground">{selectedPdf.name}</span>
            </p>
          )}
        </div>

        {organizerError && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-md border border-red-200 dark:border-red-900">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{organizerError}</span>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessingPayment}>
            Cancelar
          </Button>
          <Button
            onClick={onPay}
            disabled={isProcessingPayment}
            className="bg-gradient-to-tr from-green-600 to-lime-500 text-white"
          >
            {isProcessingPayment ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                Redirigiendo...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-1" />
                Pagar con ePayco
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}