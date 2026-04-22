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
import type { OrganizerPlan } from "@/app/perfil/lib/profile-types"

type OrganizerDialogProps = {
  open: boolean
  isProcessingPayment: boolean
  isLoadingPlans: boolean
  organizerPlans: OrganizerPlan[]
  selectedPlanId: number | null
  organizerError: string | null
  onOpenChange: (open: boolean) => void
  onClose: () => void
  onPlanChange: (planId: number) => void
  onPay: () => void
}

export function OrganizerDialog({
  open,
  isProcessingPayment,
  isLoadingPlans,
  organizerPlans,
  selectedPlanId,
  organizerError,
  onOpenChange,
  onClose,
  onPlanChange,
  onPay,
}: OrganizerDialogProps) {
  const selectedPlan = organizerPlans.find((plan) => plan.id_plan === selectedPlanId) || null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Organiza tus eventos</DialogTitle>
          <DialogDescription>
            Elige un plan mensual para publicar eventos en Time2Go
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

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Selecciona un plan mensual</p>
          {isLoadingPlans ? (
            <div className="rounded-md border p-3 text-sm text-muted-foreground">Cargando planes...</div>
          ) : organizerPlans.length === 0 ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
              No hay planes disponibles en este momento.
            </div>
          ) : (
            <div className="space-y-2">
              {organizerPlans.map((plan) => {
                const isSelected = selectedPlanId === plan.id_plan
                return (
                  <button
                    key={plan.id_plan}
                    type="button"
                    onClick={() => onPlanChange(plan.id_plan)}
                    disabled={isProcessingPayment}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      isSelected
                        ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                        : "border-border hover:border-green-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{plan.nombre_plan}</p>
                      <p className="text-sm font-bold text-green-700 dark:text-green-400">
                        {new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: "COP",
                          minimumFractionDigits: 0,
                        }).format(plan.precio_cop)}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Hasta {plan.max_eventos_mensuales} eventos/mes · {plan.max_imagenes_por_evento} imagenes por evento · aforo {plan.aforo_minimo}-{plan.aforo_maximo}
                    </p>
                    {plan.permite_destacado && (
                      <p className="mt-1 text-xs font-medium text-amber-600 dark:text-amber-400">Incluye eventos destacados</p>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {selectedPlan && (
          <div className="rounded-xl border border-green-200 dark:border-green-900/60 bg-green-50 dark:bg-green-950/30 p-4">
            <p className="text-base font-semibold text-green-700 dark:text-green-400">{selectedPlan.nombre_plan}</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">
              {new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                minimumFractionDigits: 0,
              }).format(selectedPlan.precio_cop)}
            </p>
            <p className="text-xs text-green-600 dark:text-green-500 mt-1">Suscripcion mensual</p>
          </div>
        )}

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
            disabled={isProcessingPayment || !selectedPlanId || isLoadingPlans || organizerPlans.length === 0}
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