import Link from "next/link"
import { ExternalLink, Loader2 } from "lucide-react"

import type { DenunciaRow } from "@/lib/dashboard-event-reports"
import { badgeVariant } from "@/lib/dashboard-event-reports"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type ReportsTableProps = {
  loading: boolean
  denuncias: DenunciaRow[]
  page: number
  totalPages: number
  updatingId: number | null
  onPatchEstado: (id: number, estado: string) => void
  onPageChange: (page: number) => void
}

export function ReportsTable({
  loading,
  denuncias,
  page,
  totalPages,
  updatingId,
  onPatchEstado,
  onPageChange,
}: ReportsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-lime-200/70 bg-white/90 shadow-sm dark:border-emerald-800/60 dark:bg-emerald-950/30">
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          Cargando...
        </div>
      ) : denuncias.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No hay reportes con este filtro.</p>
      ) : (
        <table className="w-full min-w-[880px] border-collapse text-sm">
          <thead className="bg-green-600 text-left text-xs font-semibold uppercase tracking-wide text-white dark:bg-emerald-800">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Evento</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Motivo</th>
              <th className="px-4 py-3">Reportante</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lime-200/60 dark:divide-emerald-800/50">
            {denuncias.map((denuncia) => (
              <tr key={denuncia.id_denuncia_evento} className="bg-white/95 dark:bg-emerald-950/20">
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {denuncia.fecha_creacion ? new Date(denuncia.fecha_creacion).toLocaleString("es-CO") : "-"}
                </td>
                <td className="px-4 py-3">
                  <p className="line-clamp-2 font-medium text-foreground">{denuncia.nombre_evento}</p>
                  <Link
                    href={`/eventos/${denuncia.id_evento}`}
                    className="mt-1 inline-flex items-center gap-1 text-xs text-green-700 hover:underline dark:text-emerald-300"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver ficha <ExternalLink className="h-3 w-3" />
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{denuncia.nombre_categoria_denuncia}</td>
                <td className="px-4 py-3">
                  <span className="font-medium text-foreground">{denuncia.nombre_motivo}</span>
                  {denuncia.descripcion_adicional ? (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{denuncia.descripcion_adicional}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <span className="text-foreground">
                    {denuncia.report_nombres} {denuncia.report_apellidos}
                  </span>
                  <span className="mt-0.5 block font-mono text-xs">ID {denuncia.id_usuario}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={badgeVariant(denuncia.estado)} className="capitalize">
                    {denuncia.estado}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-wrap justify-end gap-1">
                    {denuncia.estado === "pendiente" && (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={updatingId === denuncia.id_denuncia_evento}
                        onClick={() => onPatchEstado(denuncia.id_denuncia_evento, "revisando")}
                      >
                        Revisar
                      </Button>
                    )}
                    {(denuncia.estado === "pendiente" || denuncia.estado === "revisando") && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="border-green-600 text-green-800 dark:text-emerald-200"
                          disabled={updatingId === denuncia.id_denuncia_evento}
                          onClick={() => onPatchEstado(denuncia.id_denuncia_evento, "resuelta")}
                        >
                          Resolver
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          disabled={updatingId === denuncia.id_denuncia_evento}
                          onClick={() => onPatchEstado(denuncia.id_denuncia_evento, "desestimada")}
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
          <Button type="button" variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => onPageChange(page - 1)}>
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Pagina {page} de {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => onPageChange(page + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  )
}
