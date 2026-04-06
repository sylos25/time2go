import type { ReservaDetalle } from "@/lib/reserva-detalle-types"

const DEFAULT_LABEL = "No registrado"
const DEFAULT_FEM = "No registrada"

/** Texto seguro para campos opcionales (evita repetir || "No registrado" en JSX). */
export function dn(value: unknown, fallback: string = DEFAULT_LABEL): string {
  if (value === null || value === undefined) return fallback
  const s = String(value).trim()
  return s.length > 0 ? s : fallback
}

export function dnFem(value: unknown): string {
  return dn(value, DEFAULT_FEM)
}

const BOGOTA_TZ = "America/Bogota"

/** Fecha de evento en zona Colombia (evita desfases por TZ del navegador en SSR/cliente). */
export function formatReservaFecha(value: string | Date | null | undefined): string {
  if (value == null) return "—"
  const d = value instanceof Date ? value : new Date(String(value))
  if (Number.isNaN(d.getTime())) return "—"
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "long",
    timeZone: BOGOTA_TZ,
  }).format(d)
}

/**
 * Hora tipo TIME de PostgreSQL ("HH:mm:ss" o string corto) → formato 12 h localizado.
 */
export function formatHora12(value: string | null | undefined): string {
  if (value == null || String(value).trim() === "") return "—"
  const raw = String(value).trim()
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(raw)
  if (!match) return raw
  const hh = Number(match[1])
  const mm = Number(match[2])
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return raw
  const d = new Date(Date.UTC(1970, 0, 1, hh, mm, 0))
  return new Intl.DateTimeFormat("es-CO", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(d)
}

export function reservaDerivedLabels(reserva: ReservaDetalle) {
  const categoriaEvento = dn(reserva.categoria_nombre)
  const tipoEvento = dn(reserva.tipo_nombre)
  const pulepEvento = dn(reserva.pulep_evento)
  const nombreSitio = dn(reserva.nombre_sitio)
  const direccionSitio = dnFem(reserva.sitio_direccion)
  const ciudadSitio = dnFem(reserva.nombre_municipio)
  const aforo = Number(reserva.cupo ?? 0)
  const aforoTexto = aforo > 0 ? aforo.toLocaleString("es-CO") : DEFAULT_LABEL
  const organizadores = [
    String(reserva.responsable_evento || "").trim(),
    `${String(reserva.creador_nombres || "").trim()} ${String(reserva.creador_apellidos || "").trim()}`.trim(),
  ]
    .filter((value, index, arr) => value.length > 0 && arr.indexOf(value) === index)
    .join(" / ") || DEFAULT_LABEL
  const telefonosOrganizador = [reserva.telefono_1, reserva.telefono_2]
    .map((value) => String(value || "").trim())
    .filter((value, index, arr) => value.length > 0 && arr.indexOf(value) === index)
    .join(" / ") || DEFAULT_LABEL
  const modalidad = reserva.gratis_pago ? "Pago" : "Gratis"

  return {
    categoriaEvento,
    tipoEvento,
    pulepEvento,
    nombreSitio,
    direccionSitio,
    ciudadSitio,
    aforoTexto,
    organizadores,
    telefonosOrganizador,
    modalidad,
  }
}
