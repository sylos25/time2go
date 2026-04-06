"use client"

import { AlertsPanel } from "@/components/dashboard/denuncias-eventos/alerts-panel"
import { ReportsHeader } from "@/components/dashboard/denuncias-eventos/reports-header"
import { ReportsTable } from "@/components/dashboard/denuncias-eventos/reports-table"
import { useDashboardEventReports } from "@/hooks/use-dashboard-event-reports"

export default function DashboardDenunciasEventosPage() {
  const {
    loading,
    loadingAlertas,
    updatingId,
    estadoFiltro,
    page,
    denuncias,
    totalPages,
    total,
    alertas,
    umbralMin,
    umbralDias,
    minInput,
    diasInput,
    setPage,
    setMinInput,
    setDiasInput,
    handleEstadoFiltroChange,
    aplicarUmbral,
    patchEstado,
  } = useDashboardEventReports()

  return (
    <div className="space-y-6">
      <ReportsHeader estadoFiltro={estadoFiltro} onEstadoFiltroChange={handleEstadoFiltroChange} />

      <AlertsPanel
        loadingAlertas={loadingAlertas}
        alertas={alertas}
        umbralMin={umbralMin}
        umbralDias={umbralDias}
        minInput={minInput}
        diasInput={diasInput}
        onMinInputChange={setMinInput}
        onDiasInputChange={setDiasInput}
        onAplicarUmbral={aplicarUmbral}
      />

      <p className="text-sm text-muted-foreground">
        Total: <span className="font-medium text-foreground">{total}</span> reportes
        {estadoFiltro !== "todas" ? ` - filtro: ${estadoFiltro}` : ""}.
      </p>

      <ReportsTable
        loading={loading}
        denuncias={denuncias}
        page={page}
        totalPages={totalPages}
        updatingId={updatingId}
        onPatchEstado={patchEstado}
        onPageChange={setPage}
      />
    </div>
  )
}
