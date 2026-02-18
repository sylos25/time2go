"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
  Ticket,
  Phone,
  User,
  FileText,
  Link as LinkIcon,
  Users,
  Grid3X3,
  TagIcon,
} from "lucide-react";
import Valoraciones from "./valoraciones";

export default function EventLanding() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id && Array.isArray(params.id) ? params.id[0] : params?.id;
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  // Helpers
  const formatDate = (d: any) => {
    if (!d) return "—";
    try {
      const dt = new Date(d);
      const day = dt.getUTCDate();
      const month = dt.getUTCMonth() + 1;
      const year = dt.getUTCFullYear();
      return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
    } catch {
      return String(d);
    }
  };

  const formatLongDate = (d: any) => {
    if (!d) return "—";
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return String(d);
    }
  };

  const formatShortDate = (d: any) => {
    if (!d) return "—";
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString("es-ES", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return String(d);
    }
  };

  const formatTime = (t: string | Date | null | undefined): string => {
    if (!t) return "—";
    try {
      if (t instanceof Date) {
        return t.toTimeString().slice(0, 5);
      }
      // Handle time string from database (HH:MM:SS format)
      const timeStr = String(t).trim();
      const parts = timeStr.split(":");
      return parts.slice(0, 2).join(":");
    } catch {
      return String(t);
    }
  };
    

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        if (!id) {
          setEvent(null);
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/events?id=${encodeURIComponent(id)}`);
        const json = await res.json();
        if (json.ok && json.event) setEvent(json.event);
        else setEvent(null);
      } catch (err) {
        console.error("Error fetching event:", err);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Cargando evento...</p>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Evento no encontrado</h2>
            <p className="text-muted-foreground mb-4">
              El evento que buscas no existe o ha sido eliminado.
            </p>
            <Button variant="outline" onClick={() => router.push("/eventos")}>
              Explorar eventos
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Derived display values
  const organizerPhones = [
    event.telefono_1 ?? event.event_telefono_1,
    event.telefono_2 ?? event.event_telefono_2,
  ]
    .filter(Boolean)
    .join(" / ") || "—";
  
  const formattedFechaInicio = formatDate(event.fecha_inicio);
  const formattedFechaFin = event.fecha_fin ? formatDate(event.fecha_fin) : null;
  const formattedHorario = `${formatTime(event.hora_inicio)}${
    event.hora_final ? " - " + formatTime(event.hora_final) : ""
  }`;
  
  const diasArr: string[] = (() => {
    try {
      if (!event.dias_semana) return [];
      if (Array.isArray(event.dias_semana)) return event.dias_semana;
      return JSON.parse(event.dias_semana);
    } catch {
      return [];
    }
  })();
  
  const formattedDias = diasArr.length
    ? diasArr.map((d) => formatDate(d)).join(", ")
    : null;

  const minPrice = event.valores?.length
    ? Math.min(...event.valores.map((v: any) => Number(v.valor || 0)))
    : 0;
  
  const priceLabel = event.gratis_pago
    ? `Desde ${formatCurrency(minPrice)}`
    : "Gratis";

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-sky-100">
      <Header onAuthClick={() => {}} />

      {/* Header Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/eventos")}
            className="bg-white/80 backdrop-blur-sm hover:bg-white shadow-md"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        {/* Event Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            {event.nombre_evento}
          </h1>
        </div>

        {/* Image Carousel */}
        {event.imagenes && event.imagenes.length > 0 && (
          <div className="mb-6">
            {/* Main Carousel Image */}
            <div className="relative w-full aspect-[4/3] max-h-[400px] rounded-2xl overflow-hidden mb-3 bg-gray-100 flex items-center justify-center">
              <img
                src={
                  event.imagenes?.[selectedImage]?.url_imagen_evento ||
                  "/placeholder.svg"
                }
                alt={event.nombre_evento}
                className="max-w-full max-h-full w-auto h-auto object-contain"
              />
              
              {/* Navigation Arrows */}
              {event.imagenes.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImage((prev) =>
                        prev === 0 ? event.imagenes.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded-full shadow-lg transition-all"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage((prev) =>
                        prev === event.imagenes.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded-full shadow-lg transition-all"
                  >
                    <ArrowLeft className="h-5 w-5 rotate-180" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {event.imagenes.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                  {selectedImage + 1} / {event.imagenes.length}
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {event.imagenes.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {event.imagenes.map((img: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === i
                        ? "border-lime-500 ring-2 ring-lime-500/20"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img.url_imagen_evento || "/placeholder.svg"}
                      alt={`${event.nombre_evento} ${i + 1}`}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 lg:pb-8">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <TagIcon className="h-5 w-5 mx-auto mb-2 text-green-500" />
                  <p className="text-xs text-muted-foreground">Categoria</p>
                  <p className="font-semibold text-sm truncate">
                    {event.categoria?.nombre || "—"}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <Calendar className="h-5 w-5 mx-auto mb-2 text-green-500" />
                  <p className="text-xs text-muted-foreground">Fecha</p>
                  <p className="font-semibold text-sm">
                    {formatShortDate(event.fecha_inicio)}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <Clock className="h-5 w-5 mx-auto mb-2 text-green-500" />
                  <p className="text-xs text-muted-foreground">Hora</p>
                  <p className="font-semibold text-sm">
                    {formattedHorario}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <Users className="h-5 w-5 mx-auto mb-2 text-green-500" />
                  <p className="text-xs text-muted-foreground">Aforo para</p>
                  <p className="font-semibold text-sm">
                    {Number(event.cupo ?? 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Location Details */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      {event.sitio?.nombre_sitio || "Lugar por confirmar"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {event.sitio?.direccion}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {event.municipio?.nombre_municipio}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Acerca del evento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {event.descripcion}
                </p>
              </CardContent>
            </Card>

            {/* Pricing */}
            {event.valores && event.valores.length > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Ticket className="h-5 w-5" />
                    Tipos de entrada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {event.valores.map((v: any) => (
                      <div
                        key={v.id_valor}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Ticket className="h-5 w-5 text-lime-600" />
                          </div>
                          <span className="font-medium">
                            {v.nombre_categoria_boleto}
                          </span>
                        </div>
                        <span className="font-bold text-lg">
                          ${Number(v.valor).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Valoraciones */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Valoraciones</CardTitle>
              </CardHeader>
              <CardContent>
                <Valoraciones eventId={event.id_evento} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* CTA Card */}
            <Card className="border-blue-200 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground mb-1">
                    {event.gratis_pago ? "Desde" : "Entrada"}
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-lime-600 bg-clip-text text-transparent">
                    {priceLabel}
                  </p>
                </div>

                <Button
                  className="w-full mb-3 bg-gradient-to-r from-red-500 to-fuchsia-500 text-white hover:from-red-600 hover:to-fuchsia-700"
                  size="lg"
                >
                  <Ticket className="h-5 w-5 mr-2" />
                  Reservar
                </Button>

                {event.links && event.links.length > 0 && (
                  <div className="space-y-2">
                    {event.links.map((l: any) => (
                      <a
                        key={l.id_link}
                        href={l.link}
                        target="_blank"
                        rel="noreferrer"
                        className="block"
                      >
                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                          size="sm"
                        >
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Ver boletería
                        </Button>
                      </a>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Date & Time Card */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha y hora
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Inicio</span>
                  <span className="font-medium">
                    {formatLongDate(event.fecha_inicio)}
                  </span>
                </div>
                {event.fecha_fin && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fin</span>
                    <span className="font-medium">
                      {formatLongDate(event.fecha_fin)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Horario</span>
                  <span className="font-medium">{formattedHorario}</span>
                </div>
                
                {/* calendario */}
                {(event.fecha_inicio || diasArr.length > 0) && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-muted-foreground mb-3 font-medium">
                      Días del evento
                    </p>
                    <div className="grid grid-cols-7 gap-1">
                      {(() => {
                        const eventDates = new Set<string>();
                        
                        // Add fecha_inicio to fecha_fin range
                        if (event.fecha_inicio) {
                          const startDate = new Date(event.fecha_inicio);
                          const endDate = event.fecha_fin ? new Date(event.fecha_fin) : startDate;
                          
                          for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                            eventDates.add(dateStr);
                          }
                        }
                        
                        // Add dias_semana dates
                        diasArr.forEach(d => {
                          try {
                            const date = new Date(d);
                            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                            eventDates.add(dateStr);
                          } catch (e) {
                            // Skip invalid dates
                          }
                        });
                        
                        // Determine calendar bounds
                        const allDates = Array.from(eventDates).map(d => new Date(d));
                        if (allDates.length === 0) return [];
                        
                        const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
                        const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
                        
                        // Display calendar starting from minDate month
                        const displayMonth = minDate.getMonth();
                        const displayYear = minDate.getFullYear();
                        const firstDay = new Date(displayYear, displayMonth, 1);
                        const startingDayOfWeek = firstDay.getDay();
                        const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
                        
                        const calendarCells = [];
                        
                        // Day headers
                        ['D', 'L', 'M', 'M', 'J', 'V', 'S'].forEach((day, i) => {
                          calendarCells.push(
                            <div key={`header-${i}`} className="text-center text-xs font-semibold text-muted-foreground py-1">
                              {day}
                            </div>
                          );
                        });
                        
                        // Empty cells before first day
                        for (let i = 0; i < startingDayOfWeek; i++) {
                          calendarCells.push(<div key={`empty-${i}`} />);
                        }
                        
                        // Day cells
                        for (let day = 1; day <= daysInMonth; day++) {
                          const dateStr = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const isEventDay = eventDates.has(dateStr);
                          
                          calendarCells.push(
                            <div
                              key={`day-${day}`}
                              className={`text-center py-1.5 text-xs rounded-md ${
                                isEventDay
                                  ? 'bg-gradient-to-r from-lime-500 to-green-500 text-white font-bold'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {day}
                            </div>
                          );
                        }
                        
                        return calendarCells;
                      })()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Organizer Card */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Organizador
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {event.creador && (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {event.creador.nombres} {event.creador.apellidos}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Organizador
                      </p>
                    </div>
                  </div>
                )}
                {organizerPhones !== "—" && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{organizerPhones}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Fixed CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t z-50">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">
              {event.gratis_pago ? "Desde" : "Entrada"}
            </p>
            <p className="text-xl font-bold bg-gradient-to-r from-lime-600 to-green-600 bg-clip-text text-transparent">
              {priceLabel}
            </p>
          </div>
          <Button
            size="lg"
            className="flex-1 bg-gradient-to-r from-lime-500 to-green-500 text-white hover:from-lime-600 hover:to-green-600"
          >
            <Ticket className="h-5 w-5 mr-2" />
            Reservar
          </Button>
        </div>
      </div>

      {/* Bottom Padding for Mobile CTA */}
      <div className="lg:hidden h-24" />

      <Footer />
    </main>
  );
}