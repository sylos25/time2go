"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TIPOS_DOCUMENTO = [
  "Cédula de Ciudadanía",
  "Cédula de Extranjería",
  "Pasaporte",
];

export default function ReservarEventoPorNombrePage() {
  const router = useRouter();
  const searchParams = useSearchParams() ?? new URLSearchParams();
  const idPublicoEvento = (searchParams.get("e") || "").trim();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    tipo_documento: "Cédula de Ciudadanía",
    numero_documento: "",
    cuantos_asistiran: "1",
    quienes_asistiran: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
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

        if (!idPublicoEvento) {
          setError("No se recibió el identificador público del evento.");
          return;
        }

        const eventRes = await fetch(`/api/events?idPublico=${encodeURIComponent(idPublicoEvento)}`);
        const eventJson = await eventRes.json().catch(() => ({}));
        if (!eventRes.ok || !eventJson?.ok || !eventJson?.event) {
          setError("No se pudo cargar el evento.");
          return;
        }

        setEvent(eventJson.event);
      } catch (e) {
        setError("No se pudo preparar la reserva.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [idPublicoEvento]);

  const submit = async () => {
    try {
      setError(null);

      if (!event?.id_evento) {
        setError("Evento inválido.");
        return;
      }

      if (!form.numero_documento.trim()) {
        setError("Debes ingresar el número de documento.");
        return;
      }

      const cuantos = Number(form.cuantos_asistiran);
      if (!Number.isFinite(cuantos) || cuantos < 1 || cuantos > 4) {
        setError("La cantidad de asistentes debe estar entre 1 y 4.");
        return;
      }

      if (!form.quienes_asistiran.trim() || form.quienes_asistiran.trim().length < 3) {
        setError("Debes indicar quiénes asistirán (mínimo 3 caracteres).");
        return;
      }

      setSaving(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const res = await fetch("/api/reservas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          id_evento: event.id_evento,
          tipo_documento: form.tipo_documento,
          numero_documento: form.numero_documento.trim(),
          cuantos_asistiran: Number(form.cuantos_asistiran),
          quienes_asistiran: form.quienes_asistiran.trim(),
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setError(String(json?.message || "No se pudo crear la reserva"));
        return;
      }

      router.push("/mis-reservas");
    } catch {
      setError("Error creando la reserva.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-sky-100">
      <Header onAuthClick={() => {}} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-5">
          <h1 className="text-2xl font-bold text-gray-900">Reservar evento</h1>

          {event && (
            <div className="rounded-lg bg-muted/50 p-4 text-sm">
              <p className="font-semibold text-gray-900">{event.nombre_evento}</p>
              <p className="text-muted-foreground">
                {event.fecha_inicio ? new Date(event.fecha_inicio).toLocaleDateString("es-ES") : ""}
                {event.hora_inicio ? ` · ${String(event.hora_inicio).slice(0, 5)}` : ""}
              </p>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          {loading && <p className="text-sm text-muted-foreground">Cargando datos del evento...</p>}

          <div className="space-y-2">
            <Label>Tipo de documento</Label>
            <Select
              value={form.tipo_documento}
              onValueChange={(v) => setForm((p) => ({ ...p, tipo_documento: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo de documento" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_DOCUMENTO.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Número de documento</Label>
            <Input
              value={form.numero_documento}
              onChange={(e) => setForm((p) => ({ ...p, numero_documento: e.target.value }))}
              placeholder="Ingresa tu número de documento"
            />
          </div>

          <div className="space-y-2">
            <Label>¿Cuántos asistirán?</Label>
            <Input
              type="number"
              min={1}
              max={4}
              value={form.cuantos_asistiran}
              onChange={(e) => setForm((p) => ({ ...p, cuantos_asistiran: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>¿Quiénes asistirán?</Label>
            <Textarea
              value={form.quienes_asistiran}
              onChange={(e) => setForm((p) => ({ ...p, quienes_asistiran: e.target.value }))}
              placeholder="Ej: Juan Pérez, Ana Gómez"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={submit} disabled={saving || loading}>
              {saving ? "Reservando..." : "Confirmar reserva"}
            </Button>
            <Button variant="outline" onClick={() => router.push("/mis-reservas")}>
              Cancelar
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
