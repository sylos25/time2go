import type { ReservaListadoItem } from "@/types/reservas";

export type ReservaItem = ReservaListadoItem;

type JsonRecord = Record<string, unknown>;

const asRecord = (value: unknown): JsonRecord | null => {
  return typeof value === "object" && value !== null ? (value as JsonRecord) : null;
};

const asString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const asDateString = (value: unknown): string | null => {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value.toISOString();
  }
  return asString(value);
};

const asNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const asBoolean = (value: unknown): boolean | null => {
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "1") return true;
  if (value === 0 || value === "0") return false;
  return null;
};

export const normalizeReservaItem = (value: unknown): ReservaItem | null => {
  const record = asRecord(value);
  if (!record) return null;

  return {
    id_reserva_evento: asNumber(record.id_reserva_evento),
    id_usuario: asNumber(record.id_usuario),
    id_evento: asNumber(record.id_evento),
    tipo_documento: asString(record.tipo_documento),
    numero_documento: asString(record.numero_documento),
    cuantos_asistiran: asNumber(record.cuantos_asistiran),
    quienes_asistiran: asString(record.quienes_asistiran),
    fecha_reserva: asDateString(record.fecha_reserva),
    estado: asBoolean(record.estado),
    nombre_evento: asString(record.nombre_evento),
    fecha_inicio: asDateString(record.fecha_inicio),
    fecha_fin: asDateString(record.fecha_fin),
    hora_inicio: asString(record.hora_inicio),
    hora_final: asString(record.hora_final),
    gratis_pago: asBoolean(record.gratis_pago),
    id_publico_evento: asString(record.id_publico_evento),
    nombre_sitio: asString(record.nombre_sitio),
    sitio_direccion: asString(record.sitio_direccion),
    nombre_municipio: asString(record.nombre_municipio),
    url_imagen_evento: asString(record.url_imagen_evento),
    nombres: asString(record.nombres),
    apellidos: asString(record.apellidos),
    correo: asString(record.correo),
  };
};

export const normalizeReservaItems = (value: unknown): ReservaItem[] => {
  if (!Array.isArray(value)) return [];
  return value.map(normalizeReservaItem).filter((item): item is ReservaItem => item !== null);
};

export const getEventStartDate = (reserva: ReservaItem) => {
  if (!reserva?.fecha_inicio || !reserva?.hora_inicio) return null;
  const datePart = String(reserva.fecha_inicio).slice(0, 10);
  const timePart = String(reserva.hora_inicio).slice(0, 8);
  const dt = new Date(`${datePart}T${timePart}`);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

export const canCancelReservation = (reserva: ReservaItem) => {
  const start = getEventStartDate(reserva);
  if (!start) return false;
  const diffMs = start.getTime() - Date.now();
  return diffMs >= 12 * 60 * 60 * 1000;
};

export const getReservationDateLabel = (reserva: ReservaItem) => {
  const date = reserva.fecha_inicio
    ? new Date(reserva.fecha_inicio).toLocaleDateString("es-ES")
    : "—";
  const time = reserva.hora_inicio ? String(reserva.hora_inicio).slice(0, 5) : "";
  return `${date}${time ? ` · ${time}` : ""}`;
};

export const getTotalAsistentes = (reserva: ReservaItem) => {
  return 1 + Number(reserva?.cuantos_asistiran || 0);
};
