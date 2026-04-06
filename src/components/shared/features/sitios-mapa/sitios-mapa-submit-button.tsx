import { Loader2, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"

type SitiosMapaSubmitButtonProps = {
  loading: boolean
  disabled: boolean
  onClick?: () => void
  loadingText?: string
  idleText?: string
}

export function SitiosMapaSubmitButton({
  loading,
  disabled,
  onClick,
  loadingText = "Guardando sitio...",
  idleText = "Guardar sitio",
}: SitiosMapaSubmitButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold tracking-wide hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingText}
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <MapPin className="h-4 w-4" />
          {idleText}
        </span>
      )}
    </Button>
  )
}
