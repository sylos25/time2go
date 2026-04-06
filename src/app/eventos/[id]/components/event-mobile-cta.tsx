import { Ticket } from "lucide-react"

import { Button } from "@/components/ui/button"

type EventMobileCtaProps = {
  visible: boolean
  gratisPago: boolean
  priceLabel: string
  canReserveByRole: boolean
  reserveDisabled: boolean
  reserveButtonText: string
  onReserve: () => void
}

export function EventMobileCta({
  visible,
  gratisPago,
  priceLabel,
  canReserveByRole,
  reserveDisabled,
  reserveButtonText,
  onReserve,
}: EventMobileCtaProps) {
  if (!visible) return null

  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t z-50">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{gratisPago ? "Desde" : "Entrada"}</p>
            <p className="text-xl font-bold bg-gradient-to-r from-lime-600 to-green-600 bg-clip-text text-transparent">
              {priceLabel}
            </p>
          </div>
          {canReserveByRole && (
            <Button
              onClick={onReserve}
              size="lg"
              className="flex-1 bg-gradient-to-r from-lime-500 to-green-500 text-white hover:from-lime-600 hover:to-green-600"
              disabled={reserveDisabled}
            >
              <Ticket className="h-5 w-5 mr-2" />
              {reserveButtonText}
            </Button>
          )}
        </div>
      </div>

      <div className="lg:hidden h-24" />
    </>
  )
}
