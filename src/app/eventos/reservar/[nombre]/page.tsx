"use client";

import { useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useReservaEvento } from "../../_shared/reserva-evento/hooks/use-reserva-evento";
import { ReservationEventSummary } from "../../_shared/reserva-evento/components/reservation-event-summary";
import { ReservationHolderForm } from "../../_shared/reserva-evento/components/reservation-holder-form";
import { ReservationGuestsForm } from "../../_shared/reserva-evento/components/reservation-guests-form";
import { ReservationActions } from "../../_shared/reserva-evento/components/reservation-actions";

export default function ReservarEventoPorNombrePage() {
  const searchParams = useSearchParams() ?? new URLSearchParams();
  const idPublicoEvento = (searchParams.get("e") || "").trim();
  const { loading, saving, error, summary, titularForm, titularLockedFields, asistentes, actions } =
    useReservaEvento({
      identifier: idPublicoEvento,
      invalidIdentifierMessage: "No se recibió el identificador público del evento.",
      getEventRequestUrl: (identifier) =>
        `/api/events?idPublico=${encodeURIComponent(String(identifier).trim())}`,
      getUnauthorizedRedirect: () => "/eventos",
      getCancelRedirect: () => "/mis-reservas",
      getReservaEventId: (event) => Number(event?.id_evento || 0) || null,
    });

  return (
    <main className="min-h-screen bg-background">
      <Header onAuthClick={() => {}} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="bg-card rounded-2xl shadow-md p-6 space-y-5">
          <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
            <h1 className="text-2xl font-bold text-green-700">Reservar evento</h1>
            <p className="text-2xl font-bold text-rose-600">{summary?.nombreEvento || "Evento"}</p>
          </div>

          <ReservationEventSummary summary={summary} />

          {error && <p className="text-sm text-red-600">{error}</p>}
          {loading && <p className="text-sm text-muted-foreground">Cargando datos del evento...</p>}

          <ReservationHolderForm
            titularForm={titularForm}
            titularLockedFields={titularLockedFields}
            onTipoDocumentoChange={actions.setTitularTipoDocumento}
            onNumeroDocumentoChange={actions.setTitularNumeroDocumento}
            onNombresChange={actions.setTitularNombres}
            onApellidosChange={actions.setTitularApellidos}
            onTelefonoChange={actions.setTitularTelefono}
          />

          <ReservationGuestsForm
            asistentes={asistentes}
            onAddAsistente={actions.addAsistente}
            onUpdateAsistente={actions.updateAsistente}
            onRemoveAsistente={actions.removeAsistente}
          />

          <ReservationActions
            saving={saving}
            loading={loading}
            onSubmit={actions.submit}
            onCancel={actions.goToCancel}
          />
        </div>
      </div>
      <Footer />
    </main>
  );
}
