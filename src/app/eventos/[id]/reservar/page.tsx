"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TIPOS_DOCUMENTO = [
  "Cédula de Ciudadanía",
  "Cédula de Extranjería",
  "Pasaporte",
];

export default function ReservarEventoPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = Number(Array.isArray(params?.id) ? params.id[0] : params?.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    tipo_documento: "Cédula de Ciudadanía",
    numero_documento: "",
  });

  const [asistentes, setAsistentes] = useState<any[]>([
    {
      tipo_documento: "Cédula de Ciudadanía",
      numero_documento: "",
      nombre_asistente: "",
    },
  ]);

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
          router.replace(eventId ? `/eventos/${eventId}` : "/eventos");
          return;
        }

        setUser(meJson?.user || null);

        if (!eventId) {
          setError("Evento inválido.");
          return;
        }

        const eventRes = await fetch(`/api/events?id=${eventId}`);
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
  }, [eventId]);

  const submit = async () => {
    try {
      setError(null);

      if (!form.numero_documento.trim()) {
        setError("Debes ingresar el número de documento.");
        return;
      }

      const asistentesLimpios = asistentes
        .map((item) => ({
          tipo_documento: String(item?.tipo_documento || "").trim(),
          numero_documento: String(item?.numero_documento || "").trim(),
          nombre_asistente: String(item?.nombre_asistente || "").trim(),
        }))
        .filter((item) => item.tipo_documento || item.numero_documento || item.nombre_asistente);

      if (asistentesLimpios.length < 1 || asistentesLimpios.length > 3) {
        setError("Debes registrar entre 1 y 3 invitados.");
        return;
      }

      for (let i = 0; i < asistentesLimpios.length; i += 1) {
        const item = asistentesLimpios[i];
        if (!TIPOS_DOCUMENTO.includes(item.tipo_documento as any)) {
          setError(`Selecciona un tipo de documento válido para el invitado ${i + 1}.`);
          return;
        }
        if (!item.numero_documento) {
          setError(`Ingresa el número de documento del invitado ${i + 1}.`);
          return;
        }
        if (!item.nombre_asistente || item.nombre_asistente.length < 3) {
          setError(`Ingresa el nombre completo del invitado ${i + 1} (mínimo 3 caracteres).`);
          return;
        }
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
          id_evento: eventId,
          tipo_documento: form.tipo_documento,
          numero_documento: form.numero_documento.trim(),
          asistentes: asistentesLimpios,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setError(String(json?.message || "No se pudo crear la reserva"));
        return;
      }

      router.push("/mis-reservas");
    } catch (e) {
      setError("Error creando la reserva.");
    } finally {
      setSaving(false);
    }
  };

  const updateAsistente = (index: number, key: string, value: string) => {
    setAsistentes((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const addAsistente = () => {
    setAsistentes((prev) => {
      if (prev.length >= 3) return prev;
      return [
        ...prev,
        {
          tipo_documento: "Cédula de Ciudadanía",
          numero_documento: "",
          nombre_asistente: "",
        },
      ];
    });
  };

  const removeAsistente = (index: number) => {
    setAsistentes((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <main className="min-h-screen bg-background">
      <Header onAuthClick={() => {}} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="bg-card rounded-2xl shadow-md p-6 space-y-5">
          <h1 className="text-2xl font-bold text-foreground">Reservar evento</h1>

          {event && (
            <div className="rounded-lg bg-muted/50 p-4 text-sm">
              <p className="font-semibold text-foreground">{event.nombre_evento}</p>
              <p className="text-muted-foreground">
                {event.fecha_inicio ? new Date(event.fecha_inicio).toLocaleDateString("es-ES") : ""}
                {event.hora_inicio ? ` · ${String(event.hora_inicio).slice(0, 5)}` : ""}
              </p>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="space-y-2">
            <Label>Documento del titular</Label>
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

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Número de documento del titular</Label>
              <Input
                value={form.numero_documento}
                onChange={(e) => setForm((p) => ({ ...p, numero_documento: e.target.value }))}
                placeholder="Ingresa tu número de documento"
              />
            </div>

            <div className="space-y-2">
              <Label>Nombre del titular (usuario logueado)</Label>
              <Input
                value={`${String(user?.nombres || "").trim()} ${String(user?.apellidos || "").trim()}`.trim() || "No disponible"}
                readOnly
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Teléfono del titular (usuario logueado)</Label>
            <Input value={String(user?.telefono || "No disponible")} readOnly />
          </div>

          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">Invitados</p>
                <p className="text-xs text-muted-foreground">Máximo 3 invitados por reserva.</p>
              </div>
              <Button type="button" variant="outline" onClick={addAsistente} disabled={asistentes.length >= 3}>
                Agregar invitado
              </Button>
            </div>

            <div className="space-y-3">
              {asistentes.map((asistente, index) => (
                <div key={`asistente-${index}`} className="grid gap-3 sm:grid-cols-12 rounded-md border p-3">
                  <div className="sm:col-span-4 space-y-2">
                    <Label>Tipo documento</Label>
                    <Select
                      value={asistente.tipo_documento}
                      onValueChange={(v) => updateAsistente(index, "tipo_documento", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS_DOCUMENTO.map((tipo) => (
                          <SelectItem key={`${tipo}-${index}`} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="sm:col-span-3 space-y-2">
                    <Label>Número</Label>
                    <Input
                      value={asistente.numero_documento}
                      onChange={(e) => updateAsistente(index, "numero_documento", e.target.value)}
                      placeholder="Documento"
                    />
                  </div>

                  <div className="sm:col-span-4 space-y-2">
                    <Label>Nombre completo</Label>
                    <Input
                      value={asistente.nombre_asistente}
                      onChange={(e) => updateAsistente(index, "nombre_asistente", e.target.value)}
                      placeholder="Nombre del invitado"
                    />
                  </div>

                  <div className="sm:col-span-1 flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeAsistente(index)}
                      disabled={asistentes.length <= 1}
                    >
                      Quitar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={submit} disabled={saving || loading}>
              {saving ? "Reservando..." : "Confirmar reserva"}
            </Button>
            <Button variant="outline" onClick={() => router.push(`/eventos/${eventId}`)}>
              Cancelar
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
