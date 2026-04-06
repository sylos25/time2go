"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { ReservationCancelDialog } from "./_components/reservation-cancel-dialog";
import { ReservationCard } from "./_components/reservation-card";
import { useMisReservas } from "./_hooks/use-mis-reservas";

export default function MisReservasPage() {
  const { loading, error, reservas, cancellingId, reservaToCancel, actions } = useMisReservas();

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        <Header onAuthClick={() => {}} />
        <div className="flex-1 pt-32 pb-12 px-4 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-green-800 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Cargando tus reservas...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header onAuthClick={() => {}} />
      <ReservationCancelDialog
        open={reservaToCancel !== null}
        isCancelling={cancellingId !== null}
        onClose={actions.closeCancelDialog}
        onConfirm={actions.confirmCancelReservation}
      />
      <div className="flex-1 w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-rose-700">Mis Reservas</h1>
            <Button variant="outline" onClick={actions.goToEventos}>Explorar eventos</Button>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          {!loading && !error && reservas.length === 0 && (
            <Card className="bg-card/90">
              <CardContent className="pt-6 text-center text-muted-foreground">
                Aún no has realizado reservas.
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reservas.map((reserva) => (
              <ReservationCard
                key={reserva.id_reserva_evento}
                reserva={reserva}
                cancellingId={cancellingId}
                onView={actions.goToReservaDetail}
                onCancel={actions.openCancelDialog}
              />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
