"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { buildEventUrl } from "@/lib/event-url";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Phone,
  Calendar,
  MapPin,
  Clock,
  Loader2,
  User,
  CalendarDays,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────── */
interface Organizador {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  telefono_1?: string | null;
  telefono_2?: string | null;
}

interface EventoOrganizador {
  id_evento: number;
  id_publico_evento?: string;
  nombre_evento: string;
  fecha_inicio: string;
  fecha_fin?: string | null;
  hora_inicio?: string | null;
  gratis_pago?: boolean;
  descripcion?: string;
  municipio?: { nombre_municipio: string };
  sitio?: { nombre_sitio: string };
  categoria?: { nombre: string };
  imagenes?: { url_imagen_evento: string }[];
  cupo?: number;
}

/* ─── Helpers ────────────────────────────────────────────────────── */
function formatDate(d: unknown) {
  if (!d) return "—";
  try {
    return new Date(String(d)).toLocaleDateString("es-ES", {
      weekday: "short", year: "numeric", month: "short", day: "numeric",
    });
  } catch { return String(d); }
}

function formatTime(t: unknown) {
  if (!t) return null;
  try { return String(t).trim().split(":").slice(0, 2).join(":"); }
  catch { return null; }
}

function slugify(value: string) {
  return String(value || "evento")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "evento";
}

/* ─── EventCard ──────────────────────────────────────────────────── */
function EventCard({ ev, href }: { ev: EventoOrganizador; href: string }) {
  const thumb = ev.imagenes?.[0]?.url_imagen_evento;
  const hora = formatTime(ev.hora_inicio);
  const isPast = ev.fecha_inicio && new Date(ev.fecha_inicio) < new Date();

  return (
    <Link
      href={href}
      className={`group flex gap-4 rounded-2xl border bg-card p-4 shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-green-300 ${isPast ? "opacity-60" : ""}`}
    >
      {/* Thumbnail */}
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
        {thumb ? (
          <img src={thumb} alt={ev.nombre_evento} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-100 to-lime-100">
            <CalendarDays className="h-8 w-8 text-green-400" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-green-700 transition-colors">
            {ev.nombre_evento}
          </h3>
          {isPast && (
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              Pasado
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-green-500" />
            {formatDate(ev.fecha_inicio)}
          </span>
          {hora && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-green-500" />
              {hora}
            </span>
          )}
        </div>

        {(ev.sitio?.nombre_sitio || ev.municipio?.nombre_municipio) && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-green-500" />
            <span className="truncate">
              {[ev.sitio?.nombre_sitio, ev.municipio?.nombre_municipio].filter(Boolean).join(" — ")}
            </span>
          </p>
        )}

        <div className="flex items-center justify-between">
          {ev.categoria?.nombre && (
            <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
              {ev.categoria.nombre}
            </span>
          )}
          <span className={`ml-auto text-xs font-bold ${ev.gratis_pago ? "text-green-600" : "text-fuchsia-600"}`}>
            {ev.gratis_pago ? "De pago" : "Gratis"}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function OrganizadorPage() {
  const params = useParams();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [organizador, setOrganizador] = useState<Organizador | null>(null);
  const [eventos, setEventos] = useState<EventoOrganizador[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/organizador/${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.ok) { setNotFound(true); return; }
        setOrganizador(json.organizador ?? null);
        setEventos(Array.isArray(json.eventos) ? json.eventos : []);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  /* Guards */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header onAuthClick={() => {}} />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <p className="text-sm text-muted-foreground">Cargando perfil del organizador…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !organizador) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header onAuthClick={() => {}} />
        <main className="flex-grow flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6 text-center">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Organizador no encontrado</h2>
              <p className="text-muted-foreground mb-4">El perfil que buscas no existe.</p>
              <Button asChild variant="outline">
                <Link href="/eventos">Volver</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  /* Derived */
  const phones = [organizador.telefono_1, organizador.telefono_2].filter(Boolean) as string[];
  const iniciales = `${organizador.nombres?.[0] || ""}${organizador.apellidos?.[0] || ""}`.toUpperCase();
  const eventosActivos = eventos.filter((e) => !e.fecha_inicio || new Date(e.fecha_inicio) >= new Date());
  const eventosPasados = eventos.filter((e) => e.fecha_inicio && new Date(e.fecha_inicio) < new Date());

  const getEventHref = (ev: EventoOrganizador) => {
    return buildEventUrl(ev.id_publico_evento, ev.nombre_evento, ev.id_evento);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onAuthClick={() => {}} />

      <main className="flex-grow bg-background">
        <div className="mx-auto max-w-3xl px-4 pb-16 pt-24 sm:px-6">

          {/* Volver */}
          <div className="mb-6">
            <Button asChild variant="secondary" size="sm" className="bg-card/80 backdrop-blur-sm hover:bg-card shadow-md">
              <Link href="/eventos">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
          </div>

          {/* ── Header del organizador ── */}
          <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-green-600 to-lime-500 px-6 py-8 shadow-lg sm:px-10">
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-lime-300/20 blur-2xl" />
            <div className="relative flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/25 text-2xl font-bold text-white shadow-inner backdrop-blur-sm sm:h-20 sm:w-20 sm:text-3xl">
                {iniciales || <User className="h-8 w-8" />}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white sm:text-3xl" style={{ fontFamily: "'Futura', 'Trebuchet MS', sans-serif" }}>
                  {organizador.nombres} {organizador.apellidos}
                </h1>
                <p className="mt-1 text-sm text-green-100">Organizador de eventos</p>
                {phones.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {phones.map((p, i) => (
                      <a key={i} href={`tel:${p}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm text-white backdrop-blur-sm transition hover:bg-white/30">
                        <Phone className="h-3.5 w-3.5" />
                        {p}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-3 gap-3">
            {[
              { label: "Total eventos", value: eventos.length },
              { label: "Próximos",      value: eventosActivos.length },
              { label: "Realizados",    value: eventosPasados.length },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl border border-green-100 bg-white p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-green-700">{value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          {/* Lista de eventos */}
          {eventos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-green-200 bg-green-50/50 p-10 text-center">
              <CalendarDays className="mx-auto mb-3 h-10 w-10 text-green-300" />
              <p className="font-medium text-green-700">Sin eventos publicados aún</p>
              <p className="mt-1 text-sm text-muted-foreground">Este organizador no tiene eventos registrados.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {eventosActivos.length > 0 && (
                <section>
                  <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-green-700">
                    <Calendar className="h-4 w-4" />
                    Próximos eventos
                  </h2>
                  <div className="space-y-3">
                    {eventosActivos.map((ev) => (
                      <EventCard key={ev.id_evento} ev={ev} href={getEventHref(ev)} />
                    ))}
                  </div>
                </section>
              )}

              {eventosPasados.length > 0 && (
                <section>
                  <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Eventos realizados
                  </h2>
                  <div className="space-y-3">
                    {eventosPasados.map((ev) => (
                      <EventCard key={ev.id_evento} ev={ev} href={getEventHref(ev)} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}