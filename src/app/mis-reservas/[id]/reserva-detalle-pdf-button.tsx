"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { ReservaDetalle } from "@/lib/reserva-detalle-types"
import { buildReservaDetallePdfBlob, downloadReservaDetallePdf } from "@/lib/reserva-detalle-pdf"

export function ReservaDetallePdfButton({ reserva }: { reserva: ReservaDetalle }) {
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  const handleDownloadPdf = async () => {
    if (downloadingPdf) return
    try {
      setDownloadingPdf(true)
      const baseUrl =
        (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL?.trim()) ||
        (typeof window !== "undefined" ? window.location.origin : "")
      const blob = await buildReservaDetallePdfBlob(reserva, { baseUrl })
      const id = reserva.id_reserva_evento
      if (id == null) return
      downloadReservaDetallePdf(blob, id)
    } catch (e) {
      console.error("PDF reserva:", e)
    } finally {
      setDownloadingPdf(false)
    }
  }

  return (
    <Button variant="outline" onClick={() => void handleDownloadPdf()} disabled={downloadingPdf}>
      {downloadingPdf ? "Generando PDF..." : "Descargar PDF"}
    </Button>
  )
}
