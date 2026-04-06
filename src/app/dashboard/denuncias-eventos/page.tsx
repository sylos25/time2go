"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2, ShieldAlert, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AlertaEvento = {
  id_evento: number;
  nombre_evento: string;
  id_publico_evento: string;
  reportes_count: number;
};

type DenunciaRow = {
  id_denuncia_evento: number;
  id_usuario: number;
  id_evento: number;
  estado: string;
  descripcion_adicional: string | null;
  fecha_creacion: string;
  fecha_resolucion: string | null;
  revisada_por: number | null;
  nombre_evento: string;
  id_publico_evento: string;
  nombre_motivo: string;
  nombre_categoria_denuncia: string;
  report_nombres: string;
  report_apellidos: string;
};

const ESTADOS_FILTRO = [
  { value: "todas", label: "Todos los estados" },
  { value: "pendiente", label: "Pendiente" },
  { value: "revisando", label: "Revisando" },
  { value: "resuelta", label: "Resuelta" },
  { value: "desestimada", label: "Desestimada" },
];

function badgeVariant(estado: string) {
  switch (estado) {
    case "pendiente":
      return "outline" as const;
    case "revisando":
      return "secondary" as const;
    case "resuelta":
      return "default" as const;
    case "desestimada":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

export default function DashboardDenunciasEventosPage() {
  const [loading, setLoading] = useState(true);
  const [loadingAlertas, setLoadingAlertas] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [estadoFiltro, setEstadoFiltro] = useState("todas");
  const [page, setPage] = useState(1);
  const [denuncias, setDenuncias] = useState<DenunciaRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [alertas, setAlertas] = useState<AlertaEvento[]>([]);
  const [umbralMin, setUmbralMin] = useState(3);
  const [umbralDias, setUmbralDias] = useState(30);
  const [minInput, setMinInput] = useState("3");
  const [diasInput, setDiasInput] = useState("30");
  const pageSize = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: HeadersInit = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const q = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (estadoFiltro !== "todas") q.set("estado", estadoFiltro);
      const res = await fetch(`/api/dashboard/denuncias-eventos?${q}`, { headers, credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setDenuncias([]);
        return;
      }
      setDenuncias(Array.isArray(data.denuncias) ? data.denuncias : []);
      setTotalPages(Number(data?.pagination?.totalPages || 1));
      setTotal(Number(data?.pagination?.total || 0));
    } catch {
      setDenuncias([]);
    } finally {
      setLoading(false);
    }
  }, [estadoFiltro, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const loadAlertas = useCallback(async () => {
    setLoadingAlertas(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: HeadersInit = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const q = new URLSearchParams({
        minCount: String(umbralMin),
        days: String(umbralDias),
      });
      const res = await fetch(`/api/dashboard/denuncias-eventos/alertas?${q}`, { headers, credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setAlertas([]);
        return;
      }
      setAlertas(Array.isArray(data.eventos) ? data.eventos : []);
    } catch {
      setAlertas([]);
    } finally {
      setLoadingAlertas(false);
    }
  }, [umbralMin, umbralDias]);

  useEffect(() => {
    void loadAlertas();
  }, [loadAlertas]);

  const aplicarUmbral = () => {
    const m = Math.max(1, Math.min(500, Math.floor(Number(minInput)) || 3));
    const d = Math.max(1, Math.min(365, Math.floor(Number(diasInput)) || 30));
    setMinInput(String(m));
    setDiasInput(String(d));
    setUmbralMin(m);
    setUmbralDias(d);
  };

  const patchEstado = async (id: number, estado: string) => {
    setUpdatingId(id);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`/api/dashboard/denuncias-eventos/${encodeURIComponent(String(id))}`, {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({ estado }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) return;
      setDenuncias((prev) =>
        prev.map((d) =>
          d.id_denuncia_evento === id ? { ...d, estado, fecha_resolucion: data.denuncia?.fecha_resolucion ?? d.fecha_resolucion } : d
        )
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-green-700/30 bg-green-600 px-4 py-6 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-900 sm:px-6">
        <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <ShieldAlert className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Reportes de eventos</h1>
              <p className="text-sm text-white/85">
                Cola de denuncias: categoría y motivo (resumen). Detalle opcional del usuario al final.
              </p>
            </div>
          </div>
          <div className="w-full sm:w-56">
            <Select
              value={estadoFiltro}
              onValueChange={(v) => {
                setEstadoFiltro(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 border-white/30 bg-white/10 text-white [&_svg]:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS_FILTRO.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-amber-200/80 bg-amber-50/90 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/40">
        <div className="flex flex-col gap-4 border-b border-amber-200/80 px-4 py-4 dark:border-amber-800/50 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-900 dark:text-amber-200">
              <AlertTriangle className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-amber-950 dark:text-amber-100">Eventos con muchos reportes</h2>
              <p className="text-sm text-amber-900/80 dark:text-amber-200/85">
                Prioriza revisión: eventos con al menos <strong>{umbralMin}</strong> reportes en los últimos{" "}
                <strong>{umbralDias}</strong> días (ajusta abajo).
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="umbral-min" className="text-xs text-amber-900 dark:text-amber-200/90">
                Mín. reportes
              </Label>
              <Input
                id="umbral-min"
                type="number"
                min={1}
                max={500}
                className="h-9 w-24 border-amber-300 bg-white dark:border-amber-800 dark:bg-amber-950/50"
                value={minInput}
                onChange={(e) => setMinInput(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="umbral-dias" className="text-xs text-amber-900 dark:text-amber-200/90">
                Ventana (días)
              </Label>
              <Input
                id="umbral-dias"
                type="number"
                min={1}
                max={365}
                className="h-9 w-24 border-amber-300 bg-white dark:border-amber-800 dark:bg-amber-950/50"
                value={diasInput}
                onChange={(e) => setDiasInput(e.target.value)}
              />
            </div>
            <Button type="button" size="sm" variant="secondary" className="h-9" onClick={() => aplicarUmbral()}>
              Aplicar
            </Button>
          </div>
        </div>
        <div className="px-4 py-4 sm:px-6">
          {loadingAlertas ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Calculando…
            </div>
          ) : alertas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ningún evento supera el umbral en esta ventana. Puedes bajar el mínimo de reportes o ampliar los días.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {alertas.map((a) => (
                <li
                  key={a.id_evento}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200/70 bg-white/80 px-3 py-2 dark:border-amber-900/40 dark:bg-amber-950/30"
                >
                  <div>
                    <p className="font-medium text-foreground">{a.nombre_evento}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-amber-800 dark:text-amber-300">{a.reportes_count}</span> reportes · ID{" "}
                      {a.id_evento}
                    </p>
                  </div>
                  <Link
                    href={`/eventos/${a.id_evento}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-amber-800 hover:underline dark:text-amber-300"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver ficha <ExternalLink className="h-3 w-3" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Total: <span className="font-medium text-foreground">{total}</span> reportes
        {estadoFiltro !== "todas" ? ` · filtro: ${estadoFiltro}` : ""}.
      </p>

      <div className="overflow-x-auto rounded-xl border border-lime-200/70 bg-white/90 shadow-sm dark:border-emerald-800/60 dark:bg-emerald-950/30">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            Cargando…
          </div>
        ) : denuncias.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">No hay reportes con este filtro.</p>
        ) : (
          <table className="w-full min-w-[880px] border-collapse text-sm">
            <thead className="bg-green-600 text-left text-xs font-semibold uppercase tracking-wide text-white dark:bg-emerald-800">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Evento</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Motivo</th>
                <th className="px-4 py-3">Reportante</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lime-200/60 dark:divide-emerald-800/50">
              {denuncias.map((d) => (
                <tr key={d.id_denuncia_evento} className="bg-white/95 dark:bg-emerald-950/20">
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {d.fecha_creacion ? new Date(d.fecha_creacion).toLocaleString("es-CO") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground line-clamp-2">{d.nombre_evento}</p>
                    <Link
                      href={`/eventos/${d.id_evento}`}
                      className="mt-1 inline-flex items-center gap-1 text-xs text-green-700 hover:underline dark:text-emerald-300"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver ficha <ExternalLink className="h-3 w-3" />
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{d.nombre_categoria_denuncia}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">{d.nombre_motivo}</span>
                    {d.descripcion_adicional ? (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{d.descripcion_adicional}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="text-foreground">
                      {d.report_nombres} {d.report_apellidos}
                    </span>
                    <span className="mt-0.5 block font-mono text-xs">ID {d.id_usuario}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={badgeVariant(d.estado)} className="capitalize">
                      {d.estado}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      {d.estado === "pendiente" && (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          disabled={updatingId === d.id_denuncia_evento}
                          onClick={() => patchEstado(d.id_denuncia_evento, "revisando")}
                        >
                          Revisar
                        </Button>
                      )}
                      {(d.estado === "pendiente" || d.estado === "revisando") && (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="border-green-600 text-green-800 dark:text-emerald-200"
                            disabled={updatingId === d.id_denuncia_evento}
                            onClick={() => patchEstado(d.id_denuncia_evento, "resuelta")}
                          >
                            Resolver
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            disabled={updatingId === d.id_denuncia_evento}
                            onClick={() => patchEstado(d.id_denuncia_evento, "desestimada")}
                          >
                            Desestimar
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-lime-200/80 px-4 py-3 dark:border-emerald-800/50">
            <Button type="button" variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {page} de {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
