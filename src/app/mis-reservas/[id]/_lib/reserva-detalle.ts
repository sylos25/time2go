import type { ReservaAsistente, ReservaDetalle } from "@/types/reservas";

export type { ReservaAsistente, ReservaDetalle } from "@/types/reservas";

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

const asistenteFromUnknown = (value: unknown): ReservaAsistente | null => {
  const record = asRecord(value);
  if (!record) return null;

  return {
    id_reserva_asistente: asNumber(record.id_reserva_asistente),
    nombre_asistente: asString(record.nombre_asistente),
    tipo_documento: asString(record.tipo_documento),
    numero_documento: asString(record.numero_documento),
    nombres: asString(record.nombres),
    apellidos: asString(record.apellidos),
    telefono: asString(record.telefono),
    correo: asString(record.correo),
  };
};

export const normalizeReservaDetalle = (value: unknown): ReservaDetalle | null => {
  const record = asRecord(value);
  if (!record) return null;

  const asistentes = Array.isArray(record.asistentes)
    ? record.asistentes.map(asistenteFromUnknown).filter((item): item is ReservaAsistente => item !== null)
    : [];

  return {
    id_reserva_evento: asNumber(record.id_reserva_evento),
    nombre_evento: asString(record.nombre_evento),
    url_imagen_evento: asString(record.url_imagen_evento),
    categoria_nombre: asString(record.categoria_nombre),
    tipo_nombre: asString(record.tipo_nombre),
    pulep_evento: asString(record.pulep_evento),
    nombre_sitio: asString(record.nombre_sitio),
    sitio_direccion: asString(record.sitio_direccion),
    nombre_municipio: asString(record.nombre_municipio),
    cupo: asNumber(record.cupo),
    responsable_evento: asString(record.responsable_evento),
    creador_nombres: asString(record.creador_nombres),
    creador_apellidos: asString(record.creador_apellidos),
    telefono_1: asString(record.telefono_1),
    telefono_2: asString(record.telefono_2),
    gratis_pago: asBoolean(record.gratis_pago),
    cuantos_asistiran: asNumber(record.cuantos_asistiran),
    fecha_inicio: asDateString(record.fecha_inicio),
    fecha_fin: asDateString(record.fecha_fin),
    hora_inicio: asString(record.hora_inicio),
    hora_final: asString(record.hora_final),
    tipo_documento: asString(record.tipo_documento),
    numero_documento: asString(record.numero_documento),
    nombres: asString(record.nombres),
    apellidos: asString(record.apellidos),
    telefono_titular: asString(record.telefono_titular),
    correo_titular: asString(record.correo_titular),
    quienes_asistiran: asString(record.quienes_asistiran),
    asistentes,
  };
};

export type ReservaDerived = {
  categoriaEvento: string;
  tipoEvento: string;
  pulepEvento: string;
  nombreSitio: string;
  direccionSitio: string;
  ciudadSitio: string;
  aforoTexto: string;
  organizadores: string;
  telefonosOrganizador: string;
  modalidad: string;
  cuposReservados: number;
};

export const formatDateEs = (value: string | null | undefined) => {
  if (!value) return "-";
  const isoDate = String(value).slice(0, 10);
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return String(value);
  return `${day}/${month}/${year}`;
};

export const formatHour12 = (value: string | null | undefined) => {
  if (!value) return "-";
  const parts = String(value).split(":");
  const rawHour = Number(parts[0]);
  const rawMinute = Number(parts[1]);
  if (!Number.isFinite(rawHour) || !Number.isFinite(rawMinute)) {
    return String(value);
  }
  const period = rawHour >= 12 ? "p.m." : "a.m.";
  const hour12 = rawHour % 12 === 0 ? 12 : rawHour % 12;
  return `${String(hour12).padStart(2, "0")}:${String(rawMinute).padStart(2, "0")} ${period}`;
};

export const getReservaDerived = (reserva: ReservaDetalle | null): ReservaDerived => {
  const categoriaEvento = reserva?.categoria_nombre ?? "No registrado";
  const tipoEvento = reserva?.tipo_nombre ?? "No registrado";
  const pulepEvento = reserva?.pulep_evento ?? "No registrado";
  const nombreSitio = reserva?.nombre_sitio ?? "No registrado";
  const direccionSitio = reserva?.sitio_direccion ?? "No registrada";
  const ciudadSitio = reserva?.nombre_municipio ?? "No registrada";
  const aforo = Number(reserva?.cupo ?? 0);
  const aforoTexto = aforo > 0 ? aforo.toLocaleString("es-CO") : "No registrado";

  const organizadores = [
    String(reserva?.responsable_evento || "").trim(),
    `${String(reserva?.creador_nombres || "").trim()} ${String(reserva?.creador_apellidos || "").trim()}`.trim(),
  ]
    .filter((value, index, arr) => value.length > 0 && arr.indexOf(value) === index)
    .join(" / ") || "No registrado";

  const telefonosOrganizador = [reserva?.telefono_1, reserva?.telefono_2]
    .map((value) => String(value || "").trim())
    .filter((value, index, arr) => value.length > 0 && arr.indexOf(value) === index)
    .join(" / ") || "No registrado";

  const modalidad = reserva?.gratis_pago ? "Pago" : "Gratis";
  const cuposReservados = 1 + Number(reserva?.cuantos_asistiran || 0);

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
    cuposReservados,
  };
};
