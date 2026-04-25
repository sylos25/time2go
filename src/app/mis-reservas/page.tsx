"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ChevronRight, ChartNoAxesColumn } from "lucide-react";
import Link from "next/link";
import { ReservationCancelDialog } from "./_components/reservation-cancel-dialog";
import { ReservationCard } from "./_components/reservation-card";
import { useMisReservas } from "./_hooks/use-mis-reservas";

export default function MisReservasPage() {
  const { loading, error, reservas, cancellingId, reservaToCancel, actions } = useMisReservas();
  const summaryText =
    reservas.length === 0
      ? "Aun no has realizado ninguna reserva."
      : `Tienes ${reservas.length} reserva${reservas.length !== 1 ? "s" : ""} activa${reservas.length !== 1 ? "s" : ""}.`;

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />
      <ReservationCancelDialog
        open={reservaToCancel !== null}
        isCancelling={cancellingId !== null}
        onClose={actions.closeCancelDialog}
        onConfirm={actions.confirmCancelReservation}
      />
      <section className="flex-grow pt-28 lg:pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Link href="/" className="hover:text-green-600 transition-colors">Inicio</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium text-green-700">Mis Reservas</span>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground text-green-700 flex items-center gap-3">
                  <ChartNoAxesColumn className="h-7 w-7 text-orange-500" />
                  Mis Reservas
                </h1>
                <p className="text-muted-foreground mt-1">{summaryText}</p>
              </div>

              {!loading && reservas.length > 0 && (
                <div className="flex items-center gap-2 bg-card border border-border rounded-sm px-4 py-2">
                  <ChartNoAxesColumn className="h-5 w-5 text-green-600" />
                  <span className="font-bold text-foreground text-green-700 text-lg">{reservas.length}</span>
                  <span className="text-muted-foreground text-sm">
                    reserva{reservas.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {loading && (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          )}

          {error && !loading && (
            <Card className="bg-card/90 backdrop-blur-sm border border-red-200 rounded-sm mb-6">
              <CardContent className="p-4 text-sm text-red-600">{error}</CardContent>
            </Card>
          )}

          {!loading && !error && reservas.length === 0 && (
            <Card className="bg-card/90 backdrop-blur-sm border border-border rounded-sm">
              <CardContent className="p-12 flex flex-col items-center text-center gap-4">
                <ChartNoAxesColumn className="h-12 w-12 text-muted-foreground/30" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Sin reservas todavia</h3>
                  <p className="text-muted-foreground text-sm">
                    Reserva eventos para verlos listados y gestionarlos desde aqui.
                  </p>
                </div>
                <Link
                  href="/eventos"
                  className="px-5 py-2 rounded-sm text-white text-sm font-medium bg-rose-600 hover:bg-rose-500 hover:scale-103 transition-colors cursor-pointer"
                >
                  Explorar eventos
                </Link>
              </CardContent>
            </Card>
          )}

          {!loading && !error && reservas.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {reservas.map((reserva) => (
                <ReservationCard
                  key={reserva.id_reserva_evento}
                  reserva={reserva}
                  cancellingId={cancellingId}
                  getViewHref={(reservaId) => `/mis-reservas/${reservaId}`}
                  onCancel={actions.openCancelDialog}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
