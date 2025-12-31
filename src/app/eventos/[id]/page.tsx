"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, X } from "lucide-react";
import Valoraciones from "./valoraciones";

export default function EventLanding({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Helpers
  const formatDate = (d: any) => {
    if (!d) return '—';
    try {
      // Parse as UTC to avoid timezone shifts when DB returns date at midnight UTC
      const dt = new Date(d);
      const day = dt.getUTCDate();
      const month = dt.getUTCMonth() + 1;
      const year = dt.getUTCFullYear();
      return `${String(day).padStart(2,'0')}/${String(month).padStart(2,'0')}/${year}`;
    } catch {
      return String(d);
    }
  };

  const formatTime = (t: any) => {
    if (!t) return '—';
    try {
      const parts = String(t).split(':');
      return parts.slice(0,2).join(':');
    } catch {
      return String(t);
    }
  };

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/events?id=${encodeURIComponent(params.id)}`);
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
  }, [params.id]);

  if (loading) return <div className="min-h-screen">Cargando...</div>;
  if (!event) return <div className="min-h-screen">Evento no encontrado</div>;

  // Derived display values
  const organizerPhones = [event.telefono_1 ?? event.event_telefono_1, event.telefono_2 ?? event.event_telefono_2].filter(Boolean).join(' / ') || '—';
  const formattedFechaInicio = formatDate(event.fecha_inicio);
  const formattedFechaFin = event.fecha_fin ? formatDate(event.fecha_fin) : null;
  const formattedHorario = `${formatTime(event.hora_inicio)}${event.hora_final ? ' - ' + formatTime(event.hora_final) : ''}`;
  const diasArr: string[] = (() => {
    try {
      if (!event.dias_semana) return [];
      if (Array.isArray(event.dias_semana)) return event.dias_semana;
      return JSON.parse(event.dias_semana);
    } catch {
      return [];
    }
  })();
  const formattedDias = diasArr.length ? diasArr.map(d => formatDate(d)).join(', ') : null;

  const priceLabel = event.gratis_pago ? (event.valores && event.valores.length ? `$${Math.min(...event.valores.map((v:any)=>Number(v.valor||0)) )}` : "") : "Gratis";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header onAuthClick={() => {}} />

      <section className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold mt-20">{event.nombre_evento}</h1>
          <div>
            <Button variant="ghost" onClick={() => router.back()} className="mr-2">Volver</Button>
            <Button onClick={() => router.push(`/eventos`)} variant="outline">Explorar eventos</Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            {event.imagenes && event.imagenes.length ? (
              <>
                <img src={event.imagenes[0].url_imagen_evento} alt={event.nombre_evento} className="w-full h-96 object-cover rounded-2xl mb-4" />
                <div className="grid grid-cols-4 gap-2">
                  {event.imagenes.map((img:any, i:number) => (
                    <img key={i} src={img.url_imagen_evento} className="w-full h-24 object-cover rounded-md" alt={`${event.nombre_evento} ${i+1}`} />
                  ))}
                </div>
              </>
            ) : (
              <img src="/placeholder.svg" alt="placeholder" className="w-full h-96 object-cover rounded-2xl" />
            )}

            {event.documentos && event.documentos.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold">Documentos</h3>
                <ul className="list-disc pl-6">
                  {event.documentos.map((d:any) => (
                    <li key={d.id_documento_evento}><a href={d.url_documento_evento} target="_blank" rel="noreferrer" className="text-blue-600 underline">Ver documento</a></li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline">{event.categoria_nombre ?? event.categoria ?? "Evento"}</Badge> 
                <div className="text-xl font-semibold">{priceLabel}</div>
              </div>
            </div>

            <p className="mt-4 text-gray-700 whitespace-pre-line">{event.descripcion}</p>

            <div className="mt-6 space-y-3">

              {event.valores && event.valores.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold">Valores</h4>
                  <table className="w-full mt-2 text-sm">
                    <thead>
                      <tr className="text-left">
                        <th>Tipo</th>
                        <th>Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {event.valores.map((v:any) => (
                        <tr key={v.id_valor} className="border-t">
                          <td className="py-2">{v.nombre_categoria_boleto}</td>
                          <td className="py-2">${v.valor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Links */}
              {event.links && event.links.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold">Links de boletería</h4>
                  <ul className="list-disc pl-6 mt-2">
                    {event.links.map((l:any) => (
                      <li key={l.id_link}><a href={l.link} target="_blank" rel="noreferrer" className="text-blue-600 underline">{l.link}</a></li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Creator & Site info */}
              <div className="mt-6 border-t pt-4">
                <h4 className="font-semibold">Información del evento</h4>
                <div className="mt-2 text-sm text-gray-700 space-y-1">
                  <div><strong>Creado por:</strong> {event.creador ? `${event.creador.nombres} ${event.creador.apellidos}` : '—'}</div>
                  <div><strong>Categoría:</strong> {event.categoria_nombre ?? event.nombre_categoria_boleto ?? '—'}</div>
                  <div><strong>Tipo:</strong> {event.tipo_nombre ?? '—'}</div>
                  <div><strong>Sitio:</strong> {event.sitio ? `${event.sitio.nombre_sitio}` : '—'}</div>
                  <div><strong>Dirección:</strong> {event.sitio?.direccion ?? '—'}</div>
                  <div><strong>Municipio:</strong> {event.municipio?.nombre_municipio ?? '—'}</div>
                  <div><strong>Teléfonos:</strong> {organizerPhones}</div>
                  <div><strong>Fechas:</strong> {formattedFechaInicio}{formattedFechaFin ? ` - ${formattedFechaFin}` : ''}</div>
                  {formattedDias && <div><strong>Días:</strong> {formattedDias}</div>}
                  <div><strong>Horario:</strong> {formattedHorario}</div>
                  <div><strong>Pago:</strong> {event.gratis_pago ? 'PAGO' : 'GRATIS'}</div>
                  <div><strong>Cupo:</strong> {Number(event.cupo ?? 0).toLocaleString()}</div>
                  <div><strong>Creado el:</strong> {event.fecha_creacion ? new Date(event.fecha_creacion).toLocaleString() : '—'}</div>
                </div>
              </div>

              {/* Valoraciones */}
              <div className="mt-6 border-t pt-4">
                <h4 className="font-semibold">Valoraciones</h4>
                <Valoraciones eventId={event.id_evento} />
              </div>

              {event.links && event.links.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold">Links de boletería</h4>
                  <ul className="list-disc pl-6 mt-2">
                    {event.links.map((l:any) => (
                      <li key={l.id_link}><a href={l.link} target="_blank" rel="noreferrer" className="text-blue-600 underline">{l.link}</a></li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

            <div className="mt-6">
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">Reservar / Comprar</Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
