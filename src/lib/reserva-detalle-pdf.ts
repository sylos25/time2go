import type { ReservaDetalle } from "@/lib/reserva-detalle-types"
import {
  dn,
  formatHora12,
  formatReservaFecha,
  reservaDerivedLabels,
} from "@/lib/reserva-detalle-display"

/** Alineado con `from-green-700` / `to-lime-500` del header web. */
const COL = {
  brandGreen: [21, 128, 61] as const,
  brandLime: [132, 204, 22] as const,
  heading: [21, 128, 61] as const,
  muted: [100, 116, 139] as const,
  softGreen: [236, 253, 245] as const,
  ink: [15, 23, 42] as const,
}

const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 14
const HEADER_H = 22
const FOOTER_RESERVE = 9
const CONTENT_BOTTOM = PAGE_H - FOOTER_RESERVE

export type BuildReservaDetallePdfOptions = {
  /** Origen público (p. ej. `NEXT_PUBLIC_SITE_URL` o `window.location.origin`) para el QR → `/eventos/...`. */
  baseUrl?: string
}

function normalizeBaseUrl(u: string): string {
  return u.trim().replace(/\/+$/, "")
}

function eventUrlForReserva(baseUrl: string, reserva: ReservaDetalle): string {
  const slug =
    String(reserva.id_publico_evento ?? "").trim() || String(reserva.id_evento)
  return `${normalizeBaseUrl(baseUrl)}/eventos/${encodeURIComponent(slug)}`
}

function drawMainHeader(doc: import("jspdf").jsPDF): void {
  const [g, gc] = [COL.brandGreen, COL.brandLime]
  doc.setFillColor(g[0], g[1], g[2])
  doc.rect(0, 0, PAGE_W, HEADER_H, "F")
  doc.setFillColor(gc[0], gc[1], gc[2])
  doc.rect(0, HEADER_H - 1.2, PAGE_W, 1.2, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(17)
  doc.text("Time2Go", MARGIN, 12)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8.5)
  doc.text("Comprobante de reserva · Documento informativo", MARGIN, 18)
  doc.setTextColor(COL.ink[0], COL.ink[1], COL.ink[2])
}

function drawContinuationHeader(doc: import("jspdf").jsPDF): void {
  const [g, gc] = [COL.brandGreen, COL.brandLime]
  doc.setFillColor(g[0], g[1], g[2])
  doc.rect(0, 0, PAGE_W, 4.8, "F")
  doc.setFillColor(gc[0], gc[1], gc[2])
  doc.rect(0, 4.8, PAGE_W, 0.7, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.text("Time2Go", MARGIN, 3.4)
  doc.setTextColor(COL.ink[0], COL.ink[1], COL.ink[2])
}

function drawFooters(doc: import("jspdf").jsPDF): void {
  const total = doc.getNumberOfPages()
  const fecha = new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Bogota",
  }).format(new Date())
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7)
    doc.setTextColor(COL.muted[0], COL.muted[1], COL.muted[2])
    doc.text(`Generado el ${fecha}`, MARGIN, PAGE_H - 5)
    doc.text(`Página ${i} de ${total}`, PAGE_W - MARGIN, PAGE_H - 5, { align: "right" })
  }
}

function drawSectionBar(doc: import("jspdf").jsPDF, y: number, title: string): number {
  const w = PAGE_W - 2 * MARGIN
  doc.setFillColor(COL.softGreen[0], COL.softGreen[1], COL.softGreen[2])
  doc.rect(MARGIN, y, w, 7.5, "F")
  doc.setFillColor(COL.brandLime[0], COL.brandLime[1], COL.brandLime[2])
  doc.rect(MARGIN, y, 1.4, 7.5, "F")
  doc.setTextColor(COL.heading[0], COL.heading[1], COL.heading[2])
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9.5)
  doc.text(title, MARGIN + 4, y + 5)
  doc.setTextColor(COL.ink[0], COL.ink[1], COL.ink[2])
  return y + 7.5 + 2.5
}

function drawKeyValue(
  doc: import("jspdf").jsPDF,
  y: number,
  label: string,
  value: string,
  textW: number,
): number {
  const labelX = MARGIN + 2
  const valueX = MARGIN + 52
  const valueBlockW = textW - (valueX - MARGIN)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(COL.muted[0], COL.muted[1], COL.muted[2])
  doc.text(label, labelX, y)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(COL.ink[0], COL.ink[1], COL.ink[2])
  const lines = doc.splitTextToSize(value, valueBlockW)
  doc.text(lines, valueX, y)
  const h = Math.max(4.8, lines.length * 4.3)
  return y + h
}

/**
 * PDF de detalle de reserva con estética Time2Go y QR al evento (si hay `baseUrl`).
 */
export async function buildReservaDetallePdfBlob(
  reserva: ReservaDetalle,
  options?: BuildReservaDetallePdfOptions,
): Promise<Blob> {
  const { jsPDF } = await import("jspdf")
  const doc = new jsPDF({ unit: "mm", format: "a4" })

  drawMainHeader(doc)

  const base = options?.baseUrl?.trim()
  let qrDataUrl: string | null = null
  if (base) {
    try {
      const QRCode = (await import("qrcode")).default
      const url = eventUrlForReserva(base, reserva)
      qrDataUrl = await QRCode.toDataURL(url, {
        width: 220,
        margin: 1,
        color: { dark: "#15803dff", light: "#ffffffff" },
        errorCorrectionLevel: "M",
      })
    } catch {
      qrDataUrl = null
    }
  }

  const derived = reservaDerivedLabels(reserva)
  const textFullW = PAGE_W - 2 * MARGIN
  const qrSize = 28
  const qrX = PAGE_W - MARGIN - qrSize
  const contentTop = HEADER_H + 4

  if (qrDataUrl) {
    doc.addImage(qrDataUrl, "PNG", qrX, contentTop, qrSize, qrSize)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(6.5)
    doc.setTextColor(COL.muted[0], COL.muted[1], COL.muted[2])
    doc.text("Ver evento", qrX + qrSize / 2, contentTop + qrSize + 3.2, { align: "center" })
    doc.setTextColor(COL.ink[0], COL.ink[1], COL.ink[2])
  }

  const titleMaxW = qrDataUrl ? qrX - MARGIN - 6 : textFullW
  doc.setFont("helvetica", "bold")
  doc.setFontSize(15)
  doc.setTextColor(COL.heading[0], COL.heading[1], COL.heading[2])
  const titleLines = doc.splitTextToSize(dn(reserva.nombre_evento), titleMaxW)
  doc.text(titleLines, MARGIN, contentTop + 5)
  let y = contentTop + 5 + titleLines.length * 6.2
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9.5)
  doc.setTextColor(COL.muted[0], COL.muted[1], COL.muted[2])
  doc.text(`Reserva Nº ${reserva.id_reserva_evento}`, MARGIN, y + 1)
  y += 8
  y = Math.max(y, contentTop + (qrDataUrl ? qrSize + 6 : 0))

  const ensureSpace = (need: number) => {
    if (y + need <= CONTENT_BOTTOM) return
    doc.addPage()
    drawContinuationHeader(doc)
    y = 12
  }

  const section = (title: string) => {
    ensureSpace(16)
    y = drawSectionBar(doc, y, title)
  }

  const kv = (label: string, value: string) => {
    ensureSpace(14)
    const next = drawKeyValue(doc, y, label, value, textFullW)
    y = next + 0.5
  }

  /** Marco ligero alrededor de un bloque (el relleno iría encima del texto si se pinta después). */
  const softFrame = (inner: () => void) => {
    ensureSpace(12)
    const y0 = y
    y += 2
    inner()
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.35)
    doc.rect(MARGIN, y0 - 0.5, textFullW, y - y0 + 2.5, "S")
    y += 4
  }

  section("Datos del evento")
  softFrame(() => {
    kv("Fecha", formatReservaFecha(reserva.fecha_inicio))
    const horaFin = reserva.hora_final ? ` · Fin: ${formatHora12(reserva.hora_final)}` : ""
    kv("Horario", `${formatHora12(reserva.hora_inicio)}${horaFin}`)
    kv("Categoría", derived.categoriaEvento)
    kv("Tipo", derived.tipoEvento)
    kv("PULEP", derived.pulepEvento)
    kv("Modalidad", derived.modalidad)
    kv("Aforo", derived.aforoTexto)
    kv("Lugar", derived.nombreSitio)
    kv("Dirección", derived.direccionSitio)
    kv("Ciudad", derived.ciudadSitio)
    kv("Organizadores", derived.organizadores)
    kv("Teléfonos", derived.telefonosOrganizador)
  })

  section("Titular de la reserva")
  softFrame(() => {
    kv("Tipo documento", reserva.tipo_documento || "—")
    kv("Número documento", reserva.numero_documento || "—")
  })

  section("Asistentes")
  if (reserva.asistentes.length > 0) {
    reserva.asistentes.forEach((a, index) => {
      ensureSpace(22)
      const boxY = y
      y += 4
      doc.setFont("helvetica", "bold")
      doc.setFontSize(9)
      doc.setTextColor(COL.heading[0], COL.heading[1], COL.heading[2])
      doc.text(`Invitado ${index + 1}`, MARGIN + 3, y)
      y += 5
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.setTextColor(COL.ink[0], COL.ink[1], COL.ink[2])
      doc.text(dn(a.nombre_asistente, "Sin nombre"), MARGIN + 3, y)
      y += 5
      y = drawKeyValue(doc, y, "Documento", `${a.tipo_documento || "—"} ${a.numero_documento || "—"}`, textFullW - 6)
      y += 4
      doc.rect(MARGIN, boxY, textFullW, y - boxY, "S")
      y += 3
    })
  } else {
    ensureSpace(10)
    doc.setFont("helvetica", "italic")
    doc.setFontSize(9)
    doc.setTextColor(COL.muted[0], COL.muted[1], COL.muted[2])
    doc.text("No hay asistentes adicionales registrados.", MARGIN + 2, y + 4)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(COL.ink[0], COL.ink[1], COL.ink[2])
    y += 12
  }

  drawFooters(doc)
  return doc.output("blob")
}

export function downloadReservaDetallePdf(blob: Blob, reservaId: number): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `time2go-reserva-${reservaId}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
