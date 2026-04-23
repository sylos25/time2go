import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildEventSummary,
  createEmptyAsistente,
  sanitizeCorreo,
  sanitizeDocumento,
  sanitizeNombre,
  sanitizeAsistentes,
  sanitizeTelefono,
  TIPOS_DOCUMENTO,
  type AsistenteForm,
  type ReservaTitularForm,
} from "../lib/reserva-evento";
import { validateReserva } from "../lib/reserva-evento";

type UserData = {
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  correo?: string;
  tipo_documento?: string;
  numero_documento?: string;
  id_rol?: number;
};

type TitularLockedFields = {
  tipo_documento: boolean;
  numero_documento: boolean;
  nombres: boolean;
  apellidos: boolean;
  telefono: boolean;
};

type UseReservaEventoConfig = {
  identifier: string | number;
  invalidIdentifierMessage: string;
  getEventRequestUrl: (identifier: string | number) => string;
  getUnauthorizedRedirect: (identifier: string | number) => string;
  getCancelRedirect: (identifier: string | number) => string;
  getReservaEventId: (event: Record<string, any> | null, identifier: string | number) => number | null;
  successRedirect?: string;
};

const hasIdentifier = (identifier: string | number) => {
  if (typeof identifier === "number") {
    return Number.isFinite(identifier) && identifier > 0;
  }

  return String(identifier).trim().length > 0;
};

export function useReservaEvento(config: UseReservaEventoConfig) {
  const {
    identifier,
    invalidIdentifierMessage,
    getEventRequestUrl,
    getUnauthorizedRedirect,
    getCancelRedirect,
    getReservaEventId,
    successRedirect = "/mis-reservas",
  } = config;

  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState<Record<string, any> | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [titularForm, setTitularForm] = useState<ReservaTitularForm>({
    tipo_documento: TIPOS_DOCUMENTO[0],
    numero_documento: "",
    nombres: "",
    apellidos: "",
    telefono: "",
    correo: "",
  });

  const [asistentes, setAsistentes] = useState<AsistenteForm[]>([]);

  const userTitular = useMemo(() => {
    return {
      tipo_documento: TIPOS_DOCUMENTO.includes(user?.tipo_documento as any)
        ? (user?.tipo_documento as ReservaTitularForm["tipo_documento"])
        : null,
      numero_documento: sanitizeDocumento(String(user?.numero_documento || "")),
      nombres: sanitizeNombre(String(user?.nombres || "")),
      apellidos: sanitizeNombre(String(user?.apellidos || "")),
      telefono: sanitizeTelefono(String(user?.telefono || "")),
    };
  }, [user]);

  const titularLockedFields = useMemo<TitularLockedFields>(() => {
    return {
      tipo_documento: Boolean(userTitular.tipo_documento),
      numero_documento: Boolean(userTitular.numero_documento),
      nombres: Boolean(userTitular.nombres),
      apellidos: Boolean(userTitular.apellidos),
      telefono: Boolean(userTitular.telefono),
    };
  }, [userTitular]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const meRes = await fetch("/api/me", {
          credentials: "include",
        });

        const meJson = await meRes.json().catch(() => ({}));
        const role = Number(meJson?.user?.id_rol || 0);

        if (!meRes.ok || role !== 1) {
          router.replace(getUnauthorizedRedirect(identifier));
          return;
        }

        setUser(meJson?.user || null);
        setTitularForm((prev) => ({
          ...prev,
          tipo_documento: TIPOS_DOCUMENTO.includes(meJson?.user?.tipo_documento)
            ? meJson.user.tipo_documento
            : prev.tipo_documento,
          numero_documento: sanitizeDocumento(String(meJson?.user?.numero_documento || "")),
          nombres: sanitizeNombre(String(meJson?.user?.nombres || "").trim()),
          apellidos: sanitizeNombre(String(meJson?.user?.apellidos || "").trim()),
          telefono: sanitizeTelefono(String(meJson?.user?.telefono || "")),
          correo: sanitizeCorreo(String(meJson?.user?.correo || "")),
        }));

        if (!hasIdentifier(identifier)) {
          setError(invalidIdentifierMessage);
          return;
        }

        const eventRes = await fetch(getEventRequestUrl(identifier));
        const eventJson = await eventRes.json().catch(() => ({}));

        if (!eventRes.ok || !eventJson?.ok || !eventJson?.event) {
          setError("No se pudo cargar el evento.");
          return;
        }

        setEvent(eventJson.event);
      } catch {
        setError("No se pudo preparar la reserva.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [identifier, invalidIdentifierMessage, router]);

  const summary = useMemo(() => {
    if (!event) {
      return null;
    }

    return buildEventSummary(event);
  }, [event]);

  const titularNombre = useMemo(() => titularForm.nombres, [titularForm.nombres]);

  const titularTelefono = useMemo(() => titularForm.telefono, [titularForm.telefono]);

  const setTitularTipoDocumento = (tipoDocumento: string) => {
    if (titularLockedFields.tipo_documento) {
      return;
    }

    setTitularForm((prev) => ({
      ...prev,
      tipo_documento: tipoDocumento as ReservaTitularForm["tipo_documento"],
    }));
  };

  const setTitularNumeroDocumento = (value: string) => {
    if (titularLockedFields.numero_documento) {
      return;
    }

    setTitularForm((prev) => ({
      ...prev,
      numero_documento: sanitizeDocumento(value),
    }));
  };

  const setTitularNombres = (value: string) => {
    if (titularLockedFields.nombres) {
      return;
    }

    setTitularForm((prev) => ({
      ...prev,
      nombres: sanitizeNombre(value),
    }));
  };

  const setTitularApellidos = (value: string) => {
    if (titularLockedFields.apellidos) {
      return;
    }

    setTitularForm((prev) => ({
      ...prev,
      apellidos: sanitizeNombre(value),
    }));
  };

  const setTitularTelefono = (value: string) => {
    if (titularLockedFields.telefono) {
      return;
    }

    setTitularForm((prev) => ({
      ...prev,
      telefono: sanitizeTelefono(value),
    }));
  };

  const updateAsistente = (index: number, key: keyof AsistenteForm, value: string) => {
    setAsistentes((prev) => {
      const next = [...prev];
      const parsedValue =
        key === "numero_documento"
          ? sanitizeDocumento(value)
          : key === "nombres" || key === "apellidos"
            ? sanitizeNombre(value)
            : key === "telefono"
              ? sanitizeTelefono(value)
              : key === "correo"
                ? sanitizeCorreo(value)
                : value;
      next[index] = { ...next[index], [key]: parsedValue };
      return next;
    });
  };

  const addAsistente = () => {
    setAsistentes((prev) => {
      if (prev.length >= 3) {
        return prev;
      }

      return [...prev, createEmptyAsistente()];
    });
  };

  const removeAsistente = (index: number) => {
    setAsistentes((prev) => {
      if (prev.length === 0) {
        return prev;
      }

      return prev.filter((_, i) => i !== index);
    });
  };

  const goToCancel = () => {
    router.push(getCancelRedirect(identifier));
  };

  const submit = async () => {
    try {
      setError(null);

      const asistentesLimpios = sanitizeAsistentes(asistentes);
      const titularNormalizado: ReservaTitularForm = {
        tipo_documento:
          (titularLockedFields.tipo_documento && userTitular.tipo_documento) || titularForm.tipo_documento,
        numero_documento: titularLockedFields.numero_documento
          ? userTitular.numero_documento
          : sanitizeDocumento(titularForm.numero_documento.trim()),
        nombres: titularLockedFields.nombres ? userTitular.nombres : sanitizeNombre(titularForm.nombres.trim()),
        apellidos: titularLockedFields.apellidos
          ? userTitular.apellidos
          : sanitizeNombre(titularForm.apellidos.trim()),
        telefono: titularLockedFields.telefono
          ? userTitular.telefono
          : sanitizeTelefono(titularForm.telefono.trim()),
        correo: sanitizeCorreo(String(user?.correo || titularForm.correo || "")),
      };

      const resolvedEventId = getReservaEventId(event, identifier);
      const validationError = validateReserva({
        eventId: resolvedEventId,
        titular: titularNormalizado,
        asistentes: asistentesLimpios,
      });

      if (validationError) {
        setError(validationError);
        return;
      }

      setSaving(true);

      const res = await fetch("/api/reservas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id_evento: resolvedEventId,
          titular: titularNormalizado,
          asistentes: asistentesLimpios,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json?.ok) {
        setError(String(json?.message || "No se pudo crear la reserva"));
        return;
      }

      router.push(successRedirect);
    } catch {
      setError("Error creando la reserva.");
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    event,
    error,
    summary,
    titularForm,
    titulares: {
      nombre: titularNombre,
      telefono: titularTelefono,
    },
    titularLockedFields,
    asistentes,
    actions: {
      setTitularTipoDocumento,
      setTitularNumeroDocumento,
      setTitularNombres,
      setTitularApellidos,
      setTitularTelefono,
      updateAsistente,
      addAsistente,
      removeAsistente,
      submit,
      goToCancel,
    },
  };
}
