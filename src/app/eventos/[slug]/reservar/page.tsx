"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useReservaEvento } from "../../_shared/reserva-evento/hooks/use-reserva-evento";
import { ReservationEventSummary } from "../../_shared/reserva-evento/components/reservation-event-summary";
import { ReservationHolderForm } from "../../_shared/reserva-evento/components/reservation-holder-form";
import { ReservationGuestsForm } from "../../_shared/reserva-evento/components/reservation-guests-form";
import { ReservationActions } from "../../_shared/reserva-evento/components/reservation-actions";

export default function ReservarEventoPage() {
  const params = useParams();
  const rawSlug = params?.slug;
  const slug = (Array.isArray(rawSlug) ? rawSlug[0] : rawSlug) ?? "";

  // Parse slug: idPublico (12-char hex) or numeric ID (backward compat)
  const candidate = slug.substring(0, 12);
  const isPublicId =
    /^[0-9a-f]{12}$/i.test(candidate) &&
    (slug.length === 12 || slug[12] === "-");

  const identifier: string | number = isPublicId ? candidate : Number(slug);

  const { loading, saving, event, error, titularForm, titularLockedFields, asistentes, actions } =
    useReservaEvento({
      identifier,
      invalidIdentifierMessage: "Evento inválido.",
      getEventRequestUrl: (id) =>
        typeof id === "string"
          ? `/api/events?idPublico=${encodeURIComponent(id)}`
          : `/api/events?id=${Number(id)}`,
      getUnauthorizedRedirect: () => "/eventos",
      getCancelRedirect: () => "/eventos",
      getReservaEventId: (ev) => {
        const numId = Number(ev?.id_evento ?? 0);
        return Number.isFinite(numId) && numId > 0 ? numId : null;
      },
    });

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="bg-card rounded-2xl shadow-md p-6 space-y-5">
          <h1 className="text-2xl font-bold text-foreground">Reservar evento</h1>

          <ReservationEventSummary event={event} variant="compact" />

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
            removeButtonLayout="end"
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
