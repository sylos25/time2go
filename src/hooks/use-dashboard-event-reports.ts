import { useCallback, useEffect, useState } from "react"

import {
  type AlertaEvento,
  type DenunciaRow,
  REPORTS_PAGE_SIZE,
  fetchAlertas,
  fetchDenuncias,
  normalizeThreshold,
  patchDenunciaEstado,
} from "@/lib/dashboard-event-reports"

const DEFAULT_MIN_THRESHOLD = 3
const DEFAULT_DAYS_THRESHOLD = 30

export function useDashboardEventReports() {
  const [loading, setLoading] = useState(true)
  const [loadingAlertas, setLoadingAlertas] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const [estadoFiltro, setEstadoFiltro] = useState("todas")
  const [page, setPage] = useState(1)

  const [denuncias, setDenuncias] = useState<DenunciaRow[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [alertas, setAlertas] = useState<AlertaEvento[]>([])
  const [umbralMin, setUmbralMin] = useState(DEFAULT_MIN_THRESHOLD)
  const [umbralDias, setUmbralDias] = useState(DEFAULT_DAYS_THRESHOLD)
  const [minInput, setMinInput] = useState(String(DEFAULT_MIN_THRESHOLD))
  const [diasInput, setDiasInput] = useState(String(DEFAULT_DAYS_THRESHOLD))

  const loadDenuncias = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchDenuncias({
        page,
        pageSize: REPORTS_PAGE_SIZE,
        estado: estadoFiltro,
      })

      setDenuncias(data.denuncias)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } finally {
      setLoading(false)
    }
  }, [estadoFiltro, page])

  const loadAlertas = useCallback(async () => {
    setLoadingAlertas(true)
    try {
      const data = await fetchAlertas({ minCount: umbralMin, days: umbralDias })
      setAlertas(data)
    } finally {
      setLoadingAlertas(false)
    }
  }, [umbralDias, umbralMin])

  useEffect(() => {
    void loadDenuncias()
  }, [loadDenuncias])

  useEffect(() => {
    void loadAlertas()
  }, [loadAlertas])

  const handleEstadoFiltroChange = useCallback((value: string) => {
    setEstadoFiltro(value)
    setPage(1)
  }, [])

  const aplicarUmbral = useCallback(() => {
    const min = normalizeThreshold(minInput, {
      min: 1,
      max: 500,
      fallback: DEFAULT_MIN_THRESHOLD,
    })

    const days = normalizeThreshold(diasInput, {
      min: 1,
      max: 365,
      fallback: DEFAULT_DAYS_THRESHOLD,
    })

    setMinInput(String(min))
    setDiasInput(String(days))
    setUmbralMin(min)
    setUmbralDias(days)
  }, [diasInput, minInput])

  const patchEstado = useCallback(async (id: number, estado: string) => {
    setUpdatingId(id)
    try {
      const updated = await patchDenunciaEstado(id, estado)
      if (!updated) return

      setDenuncias((prev) =>
        prev.map((item) =>
          item.id_denuncia_evento === id
            ? {
                ...item,
                estado,
                fecha_resolucion: updated.fecha_resolucion ?? item.fecha_resolucion,
              }
            : item
        )
      )
    } finally {
      setUpdatingId(null)
    }
  }, [])

  return {
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
    pageSize: REPORTS_PAGE_SIZE,
    setPage,
    setMinInput,
    setDiasInput,
    handleEstadoFiltroChange,
    aplicarUmbral,
    patchEstado,
  }
}
