"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Flag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Categoria = { id_categoria_denuncia: number; nombre_categoria_denuncia: string };
type Motivo = {
  id_motivo_denuncia_evento: number;
  id_categoria_denuncia: number;
  nombre_motivo: string;
  descripcion_motivo: string | null;
};

type Props = {
  eventId: number;
  /** Sesión iniciada (cualquier rol). */
  isAuthenticated: boolean;
  /** Vista del creador del evento: ocultar denuncia. */
  creatorMode: boolean;
  /** true si el usuario actual es el organizador que creó el evento */
  isOwnEvent: boolean;
};

export function EventoReportarDialog({
  eventId,
  isAuthenticated,
  creatorMode,
  isOwnEvent,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [motivos, setMotivos] = useState<Motivo[]>([]);
  const [alreadyReported, setAlreadyReported] = useState(false);
  const [denunciaEstado, setDenunciaEstado] = useState<string | null>(null);
  const [idCategoria, setIdCategoria] = useState<number | null>(null);
  const [idMotivoDenunciaEvento, setIdMotivoDenunciaEvento] = useState<number | null>(null);
  const [adicional, setAdicional] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const motivosFiltrados = useMemo(
    () => motivos.filter((m) => m.id_categoria_denuncia === idCategoria),
    [motivos, idCategoria]
  );

  const resetForm = useCallback(() => {
    setIdCategoria(null);
    setIdMotivoDenunciaEvento(null);
    setAdicional("");
    setErrorMsg(null);
    setSuccessMsg(null);
  }, []);

  const loadCatalog = useCallback(async () => {
    setLoadingCatalog(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/denuncias-eventos/catalogo");
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setErrorMsg(data?.message || "No se pudo cargar el catálogo de motivos.");
        return;
      }
      setCategorias(Array.isArray(data.categorias) ? data.categorias : []);
      setMotivos(Array.isArray(data.motivos) ? data.motivos : []);
      if (!data.categorias?.length) {
        setErrorMsg(
          "Aún no hay categorías configuradas en el sistema. Contacta al administrador."
        );
      }
    } catch {
      setErrorMsg("No se pudo cargar el catálogo de motivos.");
    } finally {
      setLoadingCatalog(false);
    }
  }, []);

  const loadMyStatus = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(String(eventId))}/denuncia`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        setAlreadyReported(Boolean(data.alreadyReported));
        setDenunciaEstado(data.denuncia?.estado ? String(data.denuncia.estado) : null);
      } else {
        setAlreadyReported(false);
        setDenunciaEstado(null);
      }
    } catch {
      setAlreadyReported(false);
      setDenunciaEstado(null);
    } finally {
      setLoadingStatus(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (isAuthenticated && eventId) void loadMyStatus();
  }, [isAuthenticated, eventId, loadMyStatus]);

  useEffect(() => {
    if (!open) return;
    resetForm();
    void loadCatalog();
    if (isAuthenticated) void loadMyStatus();
  }, [open, isAuthenticated, loadCatalog, loadMyStatus, resetForm]);

  const onLoginRedirect = () => {
    const redirect = pathname || `/eventos/${eventId}`;
    router.push(`/auth?redirect=${encodeURIComponent(redirect)}`);
  };

  const onSubmit = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!idCategoria || !idMotivoDenunciaEvento) {
      setErrorMsg("Selecciona categoría y motivo.");
      return;
    }
    setSubmitting(true);
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      const body: Record<string, unknown> = {
        id_motivo_denuncia_evento: idMotivoDenunciaEvento,
      };
      if (adicional.trim()) body.descripcion_adicional = adicional.trim();

      const res = await fetch(`/api/events/${encodeURIComponent(String(eventId))}/denuncia`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setErrorMsg(data?.message || "No se pudo enviar la denuncia.");
        return;
      }
      setSuccessMsg("Gracias. Tu reporte fue registrado y será revisado por el equipo.");
      setAlreadyReported(true);
      setDenunciaEstado("pendiente");
      setIdCategoria(null);
      setIdMotivoDenunciaEvento(null);
      setAdicional("");
    } catch {
      setErrorMsg("No se pudo enviar la denuncia.");
    } finally {
      setSubmitting(false);
    }
  };

  if (creatorMode || isOwnEvent) return null;

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-border/80 bg-muted/20 px-4 py-3 text-sm">
        <p className="text-muted-foreground mb-2">
          ¿Ves algo incorrecto en este evento? Inicia sesión para reportarlo al equipo.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={onLoginRedirect} className="gap-2">
          <Flag className="h-4 w-4" aria-hidden />
          Iniciar sesión y reportar
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-border/80 bg-muted/20 px-4 py-3 text-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground">
            Si el evento incumple las normas, puedes enviar un reporte con motivos predefinidos.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            className="shrink-0 gap-2"
            disabled={alreadyReported}
          >
            <Flag className="h-4 w-4" aria-hidden />
            {alreadyReported ? "Ya reportaste este evento" : "Reportar evento"}
          </Button>
        </div>
        {alreadyReported && denunciaEstado && (
          <p className="mt-2 text-xs text-muted-foreground">
            Estado de tu reporte: <span className="font-medium text-foreground">{denunciaEstado}</span>
          </p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[min(90vh,640px)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Reportar evento</DialogTitle>
            <DialogDescription>
              Elige el motivo que mejor describa el problema. Solo puedes enviar un reporte por evento.
            </DialogDescription>
          </DialogHeader>

          {loadingCatalog || loadingStatus ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Cargando…
            </div>
          ) : alreadyReported ? (
            <p className="text-sm text-muted-foreground py-4">
              Ya registraste una denuncia para este evento
              {denunciaEstado ? ` (estado: ${denunciaEstado}).` : "."}
            </p>
          ) : (
            <div className="space-y-4">
              {errorMsg && (
                <div
                  role="alert"
                  className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="rounded-lg border border-lime-600/30 bg-lime-50/80 px-3 py-2 text-sm text-green-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100">
                  {successMsg}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="rep-cat">Categoría</Label>
                <Select
                  value={idCategoria != null ? String(idCategoria) : undefined}
                  onValueChange={(v) => {
                    setIdCategoria(Number(v));
                    setIdMotivoDenunciaEvento(null);
                  }}
                >
                  <SelectTrigger id="rep-cat" className="h-11 w-full">
                    <SelectValue placeholder="Elige una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((c) => (
                      <SelectItem key={c.id_categoria_denuncia} value={String(c.id_categoria_denuncia)}>
                        {c.nombre_categoria_denuncia}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rep-mot">Motivo</Label>
                <Select
                  value={idMotivoDenunciaEvento != null ? String(idMotivoDenunciaEvento) : undefined}
                  onValueChange={(v) => setIdMotivoDenunciaEvento(Number(v))}
                  disabled={!idCategoria}
                >
                  <SelectTrigger id="rep-mot" className="h-11 w-full min-w-0">
                    <SelectValue
                      placeholder={
                        idCategoria ? "Selecciona un motivo concreto" : "Primero elige categoría"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {motivosFiltrados.map((m) => (
                      <SelectItem
                        key={m.id_motivo_denuncia_evento}
                        value={String(m.id_motivo_denuncia_evento)}
                        className="whitespace-normal py-2"
                        title={m.descripcion_motivo || m.nombre_motivo}
                      >
                        {m.nombre_motivo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {idMotivoDenunciaEvento != null && (
                <div className="rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2.5 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-100">
                  {(() => {
                    const m = motivos.find((x) => x.id_motivo_denuncia_evento === idMotivoDenunciaEvento);
                    if (!m) return null;
                    return (
                      <>
                        <span className="font-medium text-amber-900 dark:text-amber-200">Motivo: </span>
                        {m.nombre_motivo}
                        {m.descripcion_motivo ? (
                          <p className="mt-1 text-xs text-amber-900/90 dark:text-amber-200/90">
                            {m.descripcion_motivo}
                          </p>
                        ) : null}
                      </>
                    );
                  })()}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="rep-extra">Detalle adicional (opcional)</Label>
                <Textarea
                  id="rep-extra"
                  value={adicional}
                  onChange={(e) => setAdicional(e.target.value)}
                  placeholder="Contexto breve que ayude a revisar el caso…"
                  rows={3}
                  maxLength={2000}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">{adicional.length}/2000</p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cerrar
            </Button>
            {!alreadyReported && !loadingCatalog && !loadingStatus && (
              <Button
                type="button"
                onClick={onSubmit}
                disabled={submitting || !idCategoria || !idMotivoDenunciaEvento}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando…
                  </>
                ) : (
                  "Enviar reporte"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
