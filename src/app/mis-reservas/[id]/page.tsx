"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useReservaDetalle } from "./_hooks/use-reserva-detalle";
import { ReservaDetalleActions } from "./_components/reserva-detalle-actions";
import { ReservaDetalleEvento } from "./_components/reserva-detalle-evento";
import { ReservaDetalleTitular } from "./_components/reserva-detalle-titular";
import { ReservaDetalleAcompanantes } from "./_components/reserva-detalle-acompanantes";

export default function ReservaDetallePage() {
  const params = useParams<{ id: string }>();
  const { loading, error, reserva, derived, downloadingPdf, handleDownloadPdf, handleBack } = useReservaDetalle({
    reservaIdParam: params?.id,
  });

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header onAuthClick={() => {}} />
      <div className="flex-1 w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
          <ReservaDetalleActions
            downloadingPdf={downloadingPdf}
            disabledDownload={!reserva}
            onDownloadPdf={handleDownloadPdf}
            onBack={handleBack}
          />

          {loading && (
            <Card className="bg-card/90">
              <CardContent className="pt-6 flex items-center gap-2 text-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Cargando reserva...
              </CardContent>
            </Card>
          )}

          {!loading && error && (
            <Card className="bg-card/90">
              <CardContent className="pt-6 text-red-600">{error}</CardContent>
            </Card>
          )}

          {!loading && !error && reserva && (
            <Card className="bg-card/90">
              <CardHeader>
                <CardTitle className="text-3xl font-semibold text-green-700">
                  {reserva.nombre_evento || "Reserva"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reserva.url_imagen_evento && (
                  <img
                    src={reserva.url_imagen_evento}
                    alt={reserva.nombre_evento || "Evento"}
                    className="w-full max-h-72 object-cover rounded-lg"
                  />
                )}

                <ReservaDetalleEvento reserva={reserva} derived={derived} />
                <ReservaDetalleTitular reserva={reserva} />
                <ReservaDetalleAcompanantes reserva={reserva} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
