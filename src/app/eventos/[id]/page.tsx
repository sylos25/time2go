"use client";

import { useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

import { EventHeaderSection } from "./components/event-header-section";
import {
  EventLandingLoadingState,
  EventLandingNotFoundState,
} from "./components/event-landing-state";
import { EventMainContent } from "./components/event-main-content";
import { EventMobileCta } from "./components/event-mobile-cta";
import { EventSidebar } from "./components/event-sidebar";
import { useEventLanding } from "./hooks/use-event-landing";
import { buildCalendarDayCells } from "./lib/event-landing-utils";

export default function EventLandingPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const rawId = params?.id;
  const eventId = Array.isArray(rawId) ? rawId[0] : rawId || "";

  const mineView = (searchParams?.get("mine") || "").toLowerCase() === "true";
  const returnToParam = searchParams?.get("returnTo") || "";
  const backPath = returnToParam.startsWith("/eventos")
    ? returnToParam
    : "/eventos#eventos-disponibles";

  const {
    event,
    loading,
    creatorMode,
    isAuthenticated,
    meUserId,
    selectedImage,
    eventReservations,
    loadingEventReservations,
    showMap,
    organizerPhones,
    formattedHorario,
    tipoEventoNombre,
    informacionImportante,
    priceLabel,
    totalCupo,
    cuposDisponibles,
    reservePath,
    canReserveByRole,
    reserveDisabled,
    reserveButtonText,
    sitioLat,
    sitioLng,
    hasMapCoords,
    pulepEvento,
    setSelectedImage,
    setShowMap,
  } = useEventLanding({ eventId, mineView });

  const calendarCells = useMemo(() => {
    if (!event) return [];
    return buildCalendarDayCells(event);
  }, [event]);

  if (loading) {
    return <EventLandingLoadingState />;
  }

  if (!event) {
    return <EventLandingNotFoundState exploreHref="/eventos" />;
  }

  const images = Array.isArray(event.imagenes) ? event.imagenes : [];
  const links = Array.isArray(event.links) ? event.links : [];

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <EventHeaderSection
        eventName={event.nombre_evento || "Evento"}
        images={images}
        selectedImage={selectedImage}
        backHref={backPath}
        onSelectImage={(index) => setSelectedImage(index)}
        onNextImage={() =>
          setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))
        }
        onPrevImage={() =>
          setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))
        }
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 lg:pb-8">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <EventMainContent
            event={event}
            tipoEventoNombre={tipoEventoNombre}
            formattedHorario={formattedHorario}
            totalCupo={totalCupo}
            informacionImportante={informacionImportante}
            creatorMode={creatorMode}
            eventReservations={eventReservations}
            loadingEventReservations={loadingEventReservations}
            isAuthenticated={isAuthenticated}
            meUserId={meUserId}
            hasMapCoords={hasMapCoords}
            showMap={showMap}
            sitioLat={sitioLat}
            sitioLng={sitioLng}
            pulepEvento={pulepEvento}
            onToggleMap={() => setShowMap((prev) => !prev)}
          />

          <EventSidebar
            gratisPago={Boolean(event.gratis_pago)}
            priceLabel={priceLabel}
            reserveButtonText={reserveButtonText}
            reserveDisabled={reserveDisabled}
            canReserveByRole={canReserveByRole}
            cuposDisponibles={cuposDisponibles}
            links={links}
            fechaInicio={event.fecha_inicio}
            fechaFin={event.fecha_fin}
            formattedHorario={formattedHorario}
            calendarCells={calendarCells}
            organizerPhones={organizerPhones}
            creator={event.creador}
            reserveHref={reservePath}
          />
        </div>
      </div>

      <EventMobileCta
        visible={true}
        gratisPago={Boolean(event.gratis_pago)}
        priceLabel={priceLabel}
        canReserveByRole={canReserveByRole}
        reserveDisabled={reserveDisabled}
        reserveButtonText={reserveButtonText}
        reserveHref={reservePath}
      />

      <Footer />
    </main>
  );
}
