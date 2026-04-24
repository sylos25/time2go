import { useEffect, useMemo, useState } from "react";
import { generateReservaPdf } from "../_lib/reserva-detalle-pdf";
import { getReservaDerived, normalizeReservaDetalle, type ReservaDetalle } from "../_lib/reserva-detalle";
import type { ReservaDetalleApiResponse } from "@/types/reservas";

type JsonRecord = Record<string, unknown>;

const asRecord = (value: unknown): JsonRecord => {
  return typeof value === "object" && value !== null ? (value as JsonRecord) : {};
};

type UseReservaDetalleParams = {
  reservaIdParam: string | undefined;
};

export function useReservaDetalle({ reservaIdParam }: UseReservaDetalleParams) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reserva, setReserva] = useState<ReservaDetalle | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const reservaId = Number(reservaIdParam || 0);
        if (!reservaId) {
          setError("Reserva invalida");
          return;
        }

        const res = await fetch(`/api/reservas/${encodeURIComponent(String(reservaId))}`, {
          credentials: "include",
        });

        const payload = await res.json().catch(() => ({ ok: false, message: "Respuesta invalida del servidor" }));
        const json = asRecord(payload);
        const apiOk = json.ok === true;
        if (!res.ok || !apiOk) {
          const apiError = payload as ReservaDetalleApiResponse;
          const message = typeof apiError === "object" && apiError && "message" in apiError && typeof apiError.message === "string"
            ? apiError.message
            : "No se pudo cargar la reserva";
          setError(message);
          return;
        }

        const reservaNormalizada = normalizeReservaDetalle(json.reserva);
        if (!reservaNormalizada) {
          setError("La respuesta de la reserva es invalida");
          return;
        }

        setReserva(reservaNormalizada);
      } catch {
        setError("Error al cargar el detalle de la reserva");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [reservaIdParam]);

  const derived = useMemo(() => getReservaDerived(reserva), [reserva]);

  const handleBack = () => {
    window.location.assign("/mis-reservas");
  };

  const handleDownloadPdf = async () => {
    if (!reserva || downloadingPdf) return;
    try {
      setDownloadingPdf(true);
      await generateReservaPdf(reserva, derived);
    } finally {
      setDownloadingPdf(false);
    }
  };

  return {
    loading,
    error,
    reserva,
    derived,
    downloadingPdf,
    handleDownloadPdf,
    handleBack,
  };
}
