import { EMAIL_MAX_LENGTH as AUTH_EMAIL_MAX_LENGTH, sanitizeEmail } from "@/lib/auth-form-validation";

export const TIPOS_DOCUMENTO = [
  "Cédula de Ciudadanía",
  "Cédula de Extranjería",
  "Pasaporte",
] as const;

export const MAX_NAME_LENGTH = 50;
export const PHONE_LENGTH = 10;
export const DOCUMENT_MAX_LENGTH = 11;
export const RESERVA_EMAIL_MAX_LENGTH = AUTH_EMAIL_MAX_LENGTH;

export type TipoDocumento = (typeof TIPOS_DOCUMENTO)[number];

export type ReservaTitularForm = {
  tipo_documento: TipoDocumento;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  correo: string;
};

export type AsistenteForm = {
  tipo_documento: TipoDocumento;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  correo: string;
};

export type EventSummaryItem = {
  label: string;
  value: string;
};

export type EventSummary = {
  nombreEvento: string;
  items: EventSummaryItem[];
};

export type EventLike = {
  categoria?: { nombre?: unknown };
  categoria_nombre?: unknown;
  tipo_evento?: { nombre?: unknown };
  tipo_nombre?: unknown;
  pulep_evento?: unknown;
  sitio?: {
    nombre_sitio?: unknown;
    direccion?: unknown;
  };
  nombre_sitio?: unknown;
  sitio_direccion?: unknown;
  municipio?: { nombre_municipio?: unknown };
  nombre_municipio?: unknown;
  cupo?: unknown;
  id_evento?: unknown;
  responsable_evento?: unknown;
  creador?: { nombres?: unknown; apellidos?: unknown };
  telefono_1?: unknown;
  telefono_2?: unknown;
  event_telefono_1?: unknown;
  event_telefono_2?: unknown;
  gratis_pago?: unknown;
  fecha_inicio?: unknown;
  hora_inicio?: unknown;
  nombre_evento?: unknown;
};

export const ONLY_LETTERS_REGEX = /[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g;

export const onlyNumbers = (value: string) => value.replace(/\D+/g, "");

export const onlyLetters = (value: string) => value.replace(ONLY_LETTERS_REGEX, "");

export const sanitizeDocumento = (value: string) => onlyNumbers(String(value || "")).slice(0, DOCUMENT_MAX_LENGTH);

export const sanitizeNombre = (value: string) => onlyLetters(String(value || "")).slice(0, MAX_NAME_LENGTH);

export const sanitizeTelefono = (value: string) => onlyNumbers(String(value || "")).slice(0, PHONE_LENGTH);

export const sanitizeCorreo = (value: string) => sanitizeEmail(String(value || ""), RESERVA_EMAIL_MAX_LENGTH);

export const createEmptyAsistente = (): AsistenteForm => ({
  tipo_documento: TIPOS_DOCUMENTO[0],
  numero_documento: "",
  nombres: "",
  apellidos: "",
  telefono: "",
  correo: "",
});

export const sanitizeAsistentes = (asistentes: AsistenteForm[]): AsistenteForm[] => {
  return asistentes
    .map((item) => ({
      tipo_documento: String(item?.tipo_documento || "").trim() as TipoDocumento,
      numero_documento: sanitizeDocumento(String(item?.numero_documento || "").trim()),
      nombres: sanitizeNombre(String(item?.nombres || "").trim()),
      apellidos: sanitizeNombre(String(item?.apellidos || "").trim()),
      telefono: sanitizeTelefono(String(item?.telefono || "").trim()),
      correo: sanitizeCorreo(String(item?.correo || "").trim()),
    }))
    .filter(
      (item) =>
        item.tipo_documento ||
        item.numero_documento ||
        item.nombres ||
        item.apellidos ||
        item.telefono ||
        item.correo
    );
};

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

export const validateReserva = (input: {
  eventId: number | null;
  titular: ReservaTitularForm;
  asistentes: AsistenteForm[];
}): string | null => {
  if (!input.eventId) {
    return "Evento inválido.";
  }

  if (!TIPOS_DOCUMENTO.includes(input.titular.tipo_documento)) {
    return "Selecciona un tipo de documento válido para el titular.";
  }

  if (!input.titular.numero_documento.trim()) {
    return "Debes ingresar el número de documento.";
  }

  if (!onlyLetters(input.titular.nombres).trim() || onlyLetters(input.titular.nombres).trim().length < 3) {
    return "Debes ingresar el nombre del titular (mínimo 3 caracteres).";
  }

  if (!onlyLetters(input.titular.apellidos).trim() || onlyLetters(input.titular.apellidos).trim().length < 3) {
    return "Debes ingresar el apellido del titular (mínimo 3 caracteres).";
  }

  if (!sanitizeTelefono(input.titular.telefono).trim() || sanitizeTelefono(input.titular.telefono).trim().length < PHONE_LENGTH) {
    return `Debes ingresar el teléfono del titular (${PHONE_LENGTH} dígitos).`;
  }

  if (input.asistentes.length > 3) {
    return "Solo puedes registrar hasta 3 acompañantes por reserva.";
  }

  for (let i = 0; i < input.asistentes.length; i += 1) {
    const asistente = input.asistentes[i];

    if (!TIPOS_DOCUMENTO.includes(asistente.tipo_documento)) {
      return `Selecciona un tipo de documento válido para el invitado ${i + 1}.`;
    }

    if (!asistente.numero_documento) {
      return `Ingresa el número de documento del acompañante ${i + 1}.`;
    }

    if (!asistente.nombres || asistente.nombres.length < 3) {
      return `Ingresa el nombre del acompañante ${i + 1} (mínimo 3 caracteres).`;
    }

    if (!asistente.apellidos || asistente.apellidos.length < 3) {
      return `Ingresa el apellido del acompañante ${i + 1} (mínimo 3 caracteres).`;
    }

    if (!asistente.telefono || asistente.telefono.length < PHONE_LENGTH) {
      return `Ingresa el teléfono del acompañante ${i + 1} (${PHONE_LENGTH} dígitos).`;
    }

    if (!asistente.correo || !isValidEmail(asistente.correo)) {
      return `Ingresa un correo válido del acompañante ${i + 1}.`;
    }
  }

  return null;
};

const formatUniqueJoined = (values: unknown[]): string => {
  return values
    .map((value) => String(value || "").trim())
    .filter((value, index, array) => value.length > 0 && array.indexOf(value) === index)
    .join(" / ");
};

export const buildEventSummary = (event: EventLike): EventSummary => {
  const categoriaEvento = String(event?.categoria?.nombre || event?.categoria_nombre || "No registrado");
  const tipoEvento = String(event?.tipo_evento?.nombre || event?.tipo_nombre || "No registrado");
  const pulepEvento = String(event?.pulep_evento || "No registrado");
  const nombreSitio = String(event?.sitio?.nombre_sitio || event?.nombre_sitio || "No registrado");
  const direccionSitio = String(event?.sitio?.direccion || event?.sitio_direccion || "No registrada");
  const ciudadSitio = String(event?.municipio?.nombre_municipio || event?.nombre_municipio || "No registrada");

  const aforo = Number(event?.cupo ?? 0);
  const aforoTexto = aforo > 0 ? aforo.toLocaleString("es-CO") : "No registrado";

  const organizadores = formatUniqueJoined([
    event?.responsable_evento,
    `${String(event?.creador?.nombres || "").trim()} ${String(event?.creador?.apellidos || "").trim()}`,
  ]);

  const telefonosOrganizador = formatUniqueJoined([
    event?.telefono_1,
    event?.telefono_2,
    event?.event_telefono_1,
    event?.event_telefono_2,
  ]);

  const esPago =
    event?.gratis_pago === true ||
    event?.gratis_pago === 1 ||
    String(event?.gratis_pago || "").toLowerCase() === "true";

  const fechaEvento = event?.fecha_inicio
    ? new Date(String(event.fecha_inicio)).toLocaleDateString("es-ES")
    : "No registrada";

  const horaEvento = event?.hora_inicio ? String(event.hora_inicio).slice(0, 5) : "No registrada";

  return {
    nombreEvento: String(event?.nombre_evento || "Evento"),
    items: [
      { label: "Fecha", value: fechaEvento },
      { label: "Hora", value: horaEvento },
      { label: "Categoría", value: categoriaEvento },
      { label: "Tipo de evento", value: tipoEvento },
      { label: "PULEP", value: String(pulepEvento) },
      { label: "Modalidad", value: esPago ? "Pago" : "Gratis" },
      { label: "Aforo", value: aforoTexto },
      { label: "Lugar", value: String(nombreSitio) },
      { label: "Dirección", value: String(direccionSitio) },
      { label: "Ciudad", value: String(ciudadSitio) },
      { label: "Organizadores", value: organizadores || "No registrado" },
      { label: "Teléfonos organizador", value: telefonosOrganizador || "No registrado" },
    ],
  };
};
