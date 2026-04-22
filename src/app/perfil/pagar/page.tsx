"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PagarPage() {
  const searchParams = useSearchParams()
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const ref = searchParams.get("ref") ?? ""
  const amount = searchParams.get("amount") ?? "0"
  const pk = searchParams.get("pk") ?? ""
  const test = searchParams.get("test") ?? "true"
  const responseUrl = searchParams.get("response") ?? "/perfil"
  const confirmationUrl = searchParams.get("confirmation") ?? ""

  useEffect(() => {
    if (!pk || !ref) {
      setErrorMsg("Datos de pago incompletos. Por favor intenta de nuevo.")
      setStatus("error")
      return
    }

    const container = containerRef.current
    if (!container) return

    // Limpiar scripts previos
    while (container.firstChild) container.removeChild(container.firstChild)

    const script = document.createElement("script")
    script.src = "https://checkout.epayco.co/checkout.js"
    script.className = "epayco-button"

    // Datos del pago
    script.dataset["epaycoKey"] = pk
    script.dataset["epaycoAmount"] = amount
    script.dataset["epaycoName"] = "Upgrade Organizador Time2Go"
    script.dataset["epaycoDescription"] = "Pago unico para activar rol de organizador"
    script.dataset["epaycoInvoice"] = ref
    script.dataset["epaycoCurrency"] = "cop"
    script.dataset["epaycoTax"] = "0.00"
    script.dataset["epaycoTaxBase"] = "0.00"
    script.dataset["epaycoCountry"] = "co"
    script.dataset["epaycoLang"] = "es"
    script.dataset["epaycoExternal"] = "false"
    script.dataset["epaycoTest"] = test
    script.dataset["epaycoResponse"] = decodeURIComponent(responseUrl)
    script.dataset["epaycoConfirmation"] = decodeURIComponent(confirmationUrl)
    script.dataset["epaycoExtra1"] = ref

    script.onload = () => {
      setStatus("ready")
      // Dar tiempo al SDK para renderizar el botón y luego auto-click
      setTimeout(() => {
        const btn = container.querySelector("button, input[type='image'], .epayco-btn") as HTMLElement | null
        btn?.click()
      }, 600)
    }

    script.onerror = () => {
      setErrorMsg("No se pudo cargar la pasarela de ePayco. Verifica tu conexión a internet.")
      setStatus("error")
    }

    container.appendChild(script)
  }, [pk, ref, amount, test, responseUrl, confirmationUrl])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 bg-background">
      {status === "loading" && (
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg font-medium">Cargando pasarela de pago...</p>
          <p className="text-sm text-muted-foreground">Serás redirigido al pago en unos segundos.</p>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p className="text-base font-medium text-red-600">{errorMsg}</p>
          <Button variant="outline" onClick={() => window.location.href = "/perfil"}>
            Volver al perfil
          </Button>
        </div>
      )}

      {/* Contenedor del SDK de ePayco — se muestra cuando el botón esté listo */}
      <div
        ref={containerRef}
        className={status === "ready" ? "flex flex-col items-center gap-3" : "hidden"}
      />

      {status === "ready" && (
        <p className="text-sm text-muted-foreground">
          Si el pago no abre automáticamente, haz clic en el botón de arriba.
        </p>
      )}
    </div>
  )
}
