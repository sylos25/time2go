import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { canCancelReservation, normalizeReservaItems, type ReservaItem } from "../_lib/mis-reservas";
import type { ReservaListadoApiResponse } from "@/types/reservas";

export function useMisReservas() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservas, setReservas] = useState<ReservaItem[]>([]);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [reservaToCancel, setReservaToCancel] = useState<ReservaItem | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

        const meRes = await fetch("/api/me", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        });

        const meJson = await meRes.json().catch(() => ({}));
        const role = Number(meJson?.user?.id_rol || 0);
        if (!meRes.ok || role !== 1) {
          router.replace("/eventos");
          return;
        }

        const res = await fetch("/api/reservas", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        });

        const payload = await res
          .json()
          .catch((): ReservaListadoApiResponse => ({ ok: false, message: "Respuesta invalida del servidor" }));

        if (!res.ok || payload.ok !== true) {
          const message = payload.ok === false ? payload.message : "No se pudieron cargar tus reservas";
          setError(message);
          return;
        }

        setReservas(normalizeReservaItems(payload.reservas));
      } catch {
        setError("Error al cargar tus reservas");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  const openCancelDialog = (reserva: ReservaItem) => {
    if (!canCancelReservation(reserva)) {
      setError("Solo puedes cancelar la reserva hasta 12 horas antes del inicio del evento");
      return;
    }

    setReservaToCancel(reserva);
  };

  const closeCancelDialog = () => {
    if (cancellingId !== null) {
      return;
    }

    setReservaToCancel(null);
  };

  const confirmCancelReservation = async () => {
    const reservaId = Number(reservaToCancel?.id_reserva_evento || 0);
    if (!reservaId) {
      setReservaToCancel(null);
      return;
    }

    try {
      setCancellingId(reservaId);
      setError(null);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const res = await fetch(`/api/reservas/${encodeURIComponent(String(reservaId))}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setError(String(json?.message || "No se pudo cancelar la reserva"));
        return;
      }

      setReservas((prev) => prev.filter((item) => Number(item.id_reserva_evento) !== reservaId));
      setReservaToCancel(null);
    } catch {
      setError("Error al cancelar la reserva");
    } finally {
      setCancellingId(null);
    }
  };

  return {
    loading,
    error,
    reservas,
    cancellingId,
    reservaToCancel,
    actions: {
      goToHome: () => router.push("/"),
      goToEventos: () => router.push("/eventos"),
      goToReservaDetail: (reservaId: number) => router.push(`/mis-reservas/${reservaId}`),
      openCancelDialog,
      closeCancelDialog,
      confirmCancelReservation,
      canCancelReservation,
    },
  };
}
