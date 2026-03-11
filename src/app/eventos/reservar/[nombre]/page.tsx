"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

const onlyNumbers = (value: string) => value.replace(/\D+/g, "");
const onlyLetters = (value: string) => value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");

export default function ReservarEventoPorNombrePage() {
  const router = useRouter();
  const searchParams = useSearchParams() ?? new URLSearchParams();
  const idPublicoEvento = (searchParams.get("e") || "").trim();

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
          router.replace("/eventos");
          return;
        }

        setUser(meJson?.user || null);

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

      const asistentesLimpios = asistentes
        .map((item) => ({
          tipo_documento: String(item?.tipo_documento || "").trim(),
          numero_documento: onlyNumbers(String(item?.numero_documento || "").trim()),
          nombre_asistente: onlyLetters(String(item?.nombre_asistente || "").trim()),
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
          id_evento: event.id_evento,
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
    } catch {
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

  const categoriaEvento =
    event?.categoria?.nombre || event?.categoria_nombre || "No registrado";
  const tipoEvento =
    event?.tipo_evento?.nombre || event?.tipo_nombre || "No registrado";
  const pulepEvento = event?.pulep_evento || "No registrado";
  const nombreSitio = event?.sitio?.nombre_sitio || event?.nombre_sitio || "No registrado";
  const direccionSitio = event?.sitio?.direccion || event?.sitio_direccion || "No registrada";
  const ciudadSitio =
    event?.municipio?.nombre_municipio || event?.nombre_municipio || "No registrada";
  const aforo = Number(event?.cupo ?? 0);
  const aforoTexto = aforo > 0 ? aforo.toLocaleString("es-CO") : "No registrado";
  const organizadores = [
    String(event?.responsable_evento || "").trim(),
    `${String(event?.creador?.nombres || "").trim()} ${String(event?.creador?.apellidos || "").trim()}`.trim(),
  ]
    .filter((value, index, arr) => value.length > 0 && arr.indexOf(value) === index)
    .join(" / ") || "No registrado";
  const telefonosOrganizador = [
    event?.telefono_1,
    event?.telefono_2,
    event?.event_telefono_1,
    event?.event_telefono_2,
  ]
    .map((value) => String(value || "").trim())
    .filter((value, index, arr) => value.length > 0 && arr.indexOf(value) === index)
    .join(" / ") || "No registrado";
  const esPago =
    event?.gratis_pago === true ||
    event?.gratis_pago === 1 ||
    String(event?.gratis_pago || "").toLowerCase() === "true";
  const fechaEvento = event?.fecha_inicio
    ? new Date(event.fecha_inicio).toLocaleDateString("es-ES")
    : "No registrada";
  const horaEvento = event?.hora_inicio
    ? String(event.hora_inicio).slice(0, 5)
    : "No registrada";

  return (
    <main className="min-h-screen bg-background">
      <Header onAuthClick={() => {}} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="bg-card rounded-2xl shadow-md p-6 space-y-5">
          <h1 className="text-2xl font-bold text-foreground">Reservar evento</h1>

          {event && (
            <div className="rounded-lg bg-muted/50 p-4 text-sm">
              <p className="font-semibold text-foreground">{event.nombre_evento}</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Fecha</p>
                  <p className="font-medium text-foreground">{fechaEvento}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Hora</p>
                  <p className="font-medium text-foreground">{horaEvento}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Categoría</p>
                  <p className="font-medium text-foreground">{categoriaEvento}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Tipo de evento</p>
                  <p className="font-medium text-foreground">{tipoEvento}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">PULEP</p>
                  <p className="font-medium text-foreground">{pulepEvento}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Modalidad</p>
                  <p className="font-medium text-foreground">{esPago ? "Pago" : "Gratis"}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Aforo</p>
                  <p className="font-medium text-foreground">{aforoTexto}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Lugar</p>
                  <p className="font-medium text-foreground">{nombreSitio}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Dirección</p>
                  <p className="font-medium text-foreground">{direccionSitio}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Ciudad</p>
                  <p className="font-medium text-foreground">{ciudadSitio}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Organizadores</p>
                  <p className="font-medium text-foreground">{organizadores}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Teléfonos organizador</p>
                  <p className="font-medium text-foreground">{telefonosOrganizador}</p>
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          {loading && <p className="text-sm text-muted-foreground">Cargando datos del evento...</p>}

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
                onChange={(e) => setForm((p) => ({ ...p, numero_documento: onlyNumbers(e.target.value) }))}
                placeholder="Ingresa tu número de documento"
                inputMode="numeric"
              />
            </div>

            <div className="space-y-2">
              <Label>Nombre del titular</Label>
              <Input
                value={`${String(user?.nombres || "").trim()} ${String(user?.apellidos || "").trim()}`.trim() || "No disponible"}
                readOnly
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Teléfono del titular</Label>
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

                  <div className="sm:col-span-3 space-y-2 pt-1 sm:pt2">
                    <Label>Número</Label>
                    <Input
                      value={asistente.numero_documento}
                      onChange={(e) => updateAsistente(index, "numero_documento", onlyNumbers(e.target.value))}
                      placeholder="Documento"
                      inputMode="numeric"
                    />
                  </div>

                  <div className="sm:col-span-4 space-y-2 pt-1 sm:pt2">
                    <Label>Nombre completo</Label>
                    <Input
                      value={asistente.nombre_asistente}
                      onChange={(e) =>
                        updateAsistente(index, "nombre_asistente", onlyLetters(e.target.value))
                      }
                      placeholder="Nombre del invitado"
                    />
                  </div>

                  <div className="sm:col-span-12 flex justify-end">
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

          <div className="flex items-center gap-3 pt-2 bg-gradient-tr to-green-700 from-lime-500">
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
