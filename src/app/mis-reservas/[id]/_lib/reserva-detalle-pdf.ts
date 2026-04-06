import { formatDateEs, formatHour12, type ReservaDerived, type ReservaDetalle } from "./reserva-detalle";

export async function generateReservaPdf(reserva: ReservaDetalle, derived: ReservaDerived) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 12;
  const contentWidth = pageWidth - marginX * 2;
  const columnGap = 4;
  const colWidth = (contentWidth - columnGap) / 2;
  let y = 14;

  const loadImageAsDataUrl = (src: string): Promise<string | null> => {
    return new Promise((resolve) => {
      try {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              resolve(null);
              return;
            }
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
          } catch {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = src;
      } catch {
        resolve(null);
      }
    });
  };

  const ensureSpace = (needed = 10) => {
    if (y + needed > pageHeight - 14) {
      doc.addPage();
      y = 14;
    }
  };

  const sectionTitle = (title: string) => {
    ensureSpace(12);
    doc.setFillColor(34, 139, 34);
    doc.roundedRect(marginX, y, contentWidth, 8, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(title, marginX + 3, y + 5.5);
    doc.setTextColor(20, 20, 20);
    y += 11;
  };

  const drawKeyValueRow = (leftLabel: string, leftValue: string, rightLabel: string, rightValue: string) => {
    const hasRight = Boolean(rightLabel.trim() || String(rightValue || "").trim());

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const leftLines = doc.splitTextToSize(String(leftValue || "-"), colWidth - 6);
    const rightLines = hasRight ? doc.splitTextToSize(String(rightValue || "-"), colWidth - 6) : [""];
    const lineCount = Math.max(leftLines.length, rightLines.length);
    const rowHeight = 9 + lineCount * 3.8;

    ensureSpace(rowHeight + 2);

    doc.setDrawColor(230, 230, 230);
    doc.roundedRect(marginX, y, contentWidth, rowHeight, 1, 1);
    if (hasRight) {
      doc.line(marginX + colWidth + columnGap / 2, y, marginX + colWidth + columnGap / 2, y + rowHeight);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(13, 148, 136);
    doc.text(`${leftLabel}:`, marginX + 2, y + 3.8);
    if (hasRight) {
      doc.text(`${rightLabel}:`, marginX + colWidth + columnGap + 2, y + 3.8);
    }

    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 20, 20);
    doc.text(leftLines, marginX + 2, y + 7.4);
    if (hasRight) {
      doc.text(rightLines, marginX + colWidth + columnGap + 2, y + 7.4);
    }

    y += rowHeight + 1.2;
  };

  const drawSingleRow = (label: string, value: string) => {
    drawKeyValueRow(label, value, "", "");
  };

  const logoCandidates = ["/images/logo_color.png", "/logo_color.png", "/images/logo_header.png"];
  let logoDataUrl: string | null = null;
  for (const logoPath of logoCandidates) {
    logoDataUrl = await loadImageAsDataUrl(logoPath);
    if (logoDataUrl) break;
  }

  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  if (logoDataUrl) {
    const logoW = 34;
    const logoH = 13;
    const headerGap = 4;
    const logoX = marginX + contentWidth - logoW;
    const titleMaxWidth = contentWidth - logoW - headerGap;
    const titleLines = doc.splitTextToSize(`${reserva?.nombre_evento || "No registrado"}`, titleMaxWidth);
    const titleLineHeight = 6;
    const headerHeight = Math.max(logoH, titleLines.length * titleLineHeight);

    doc.text(titleLines, marginX, y + 5.2);
    doc.addImage(logoDataUrl, "PNG", logoX, y, logoW, logoH);
    y += headerHeight + 4;
  } else {
    const titleLines = doc.splitTextToSize(`${reserva?.nombre_evento || "No registrado"}`, contentWidth);
    doc.text(titleLines, marginX, y + 5.2);
    y += titleLines.length * 6 + 4;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  drawSingleRow("ID reserva", String(reserva?.id_reserva_evento || "-"));

  sectionTitle("Datos del evento");
  drawKeyValueRow("Categoria", derived.categoriaEvento, "Tipo de evento", derived.tipoEvento);
  drawKeyValueRow("Organizadores", derived.organizadores, "PULEP", derived.pulepEvento);
  drawKeyValueRow("Aforo", derived.aforoTexto, "Lugar", derived.nombreSitio);
  drawKeyValueRow("Direccion", derived.direccionSitio, "Municipio", derived.ciudadSitio);
  drawKeyValueRow(
    "Fecha",
    formatDateEs(reserva?.fecha_inicio),
    "Hora",
    `${formatHour12(reserva?.hora_inicio)} - ${formatHour12(reserva?.hora_final)}`
  );
  drawKeyValueRow("Modalidad", derived.modalidad, "Cupos reservados", String(derived.cuposReservados));
  drawKeyValueRow("Telefonos organizador", derived.telefonosOrganizador, "", "");

  sectionTitle("Datos del titular");
  drawKeyValueRow("Tipo documento", reserva?.tipo_documento || "-", "Numero documento", reserva?.numero_documento || "-");
  drawKeyValueRow("Nombres", reserva?.nombres || "-", "Apellidos", reserva?.apellidos || "-");
  drawKeyValueRow("Telefono", String(reserva?.telefono_titular || "-"), "Correo", reserva?.correo_titular || "-");

  sectionTitle("Listado de acompanantes");
  if (Array.isArray(reserva?.asistentes) && reserva.asistentes.length > 0) {
    reserva.asistentes.forEach((asistente, index) => {
      ensureSpace(10);
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(marginX, y, contentWidth, 7, 1.2, 1.2, "F");
      doc.setTextColor(21, 128, 61);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`Acompanante ${index + 1}`, marginX + 2, y + 4.8);
      doc.setTextColor(20, 20, 20);
      y += 9;

      drawKeyValueRow("Tipo documento", asistente?.tipo_documento || "-", "Numero documento", asistente?.numero_documento || "-");
      drawKeyValueRow("Nombres", asistente?.nombres || "-", "Apellidos", asistente?.apellidos || "-");
      drawKeyValueRow("Telefono", String(asistente?.telefono || "-"), "Correo", asistente?.correo || "-");
    });
  } else {
    drawSingleRow("Acompanantes", "No hay acompanantes registrados.");
  }

  ensureSpace(10);
  const now = new Date();
  const generatedAt = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(90, 90, 90);
  doc.text(`Generado por Time2Go: ${generatedAt}`, marginX, pageHeight - 8);

  const fileName = `reserva-${String(reserva?.id_reserva_evento || "detalle")}.pdf`;
  doc.save(fileName);
}
