import { useEffect, useMemo, useState } from "react"

import {
  fetchPlansDashboardData,
  updateOrganizerPlan,
  updateOrganizerSubscriptionStatus,
} from "../lib/planes-organizador-api"
import type { OrganizerPlan, OrganizerSubscription } from "../lib/planes-organizador-types"

export function useDashboardPlanesOrganizador() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const [plans, setPlans] = useState<OrganizerPlan[]>([])
  const [subscriptions, setSubscriptions] = useState<OrganizerSubscription[]>([])

  const [planDrafts, setPlanDrafts] = useState<Record<number, OrganizerPlan>>({})
  const [savingPlanId, setSavingPlanId] = useState<number | null>(null)

  const [pendingStatusBySubscription, setPendingStatusBySubscription] = useState<Record<number, string>>({})
  const [savingSubscriptionId, setSavingSubscriptionId] = useState<number | null>(null)

  const summaryText = useMemo(() => {
    if (plans.length === 0) return "No hay planes configurados."
    return `${plans.length} plan${plans.length !== 1 ? "es" : ""} y ${subscriptions.length} suscripci${subscriptions.length !== 1 ? "ones" : "on"} registradas.`
  }, [plans.length, subscriptions.length])

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      setLoading(true)
      setError(null)

      try {
        const data = await fetchPlansDashboardData()
        if (cancelled) return

        setPlans(data.plans)
        setSubscriptions(data.subscriptions)

        setPlanDrafts(
          data.plans.reduce<Record<number, OrganizerPlan>>((acc, item) => {
            acc[item.id_plan] = { ...item }
            return acc
          }, {})
        )

        setPendingStatusBySubscription(
          data.subscriptions.reduce<Record<number, string>>((acc, item) => {
            acc[item.id_suscripcion_organizador] = item.estado_suscripcion
            return acc
          }, {})
        )
      } catch (caughtError) {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : "Error al cargar la configuración")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const updatePlanField = <K extends keyof OrganizerPlan>(idPlan: number, key: K, value: OrganizerPlan[K]) => {
    setPlanDrafts((prev) => ({
      ...prev,
      [idPlan]: {
        ...prev[idPlan],
        [key]: value,
      },
    }))
  }

  const savePlan = async (idPlan: number) => {
    const draft = planDrafts[idPlan]
    if (!draft) return

    setSavingPlanId(idPlan)
    setError(null)

    try {
      const updatedPlan = await updateOrganizerPlan({ idPlan, plan: draft })

      setPlans((prev) => prev.map((item) => (item.id_plan === idPlan ? updatedPlan : item)))
      setPlanDrafts((prev) => ({
        ...prev,
        [idPlan]: { ...updatedPlan },
      }))
      setToast(`Plan ${updatedPlan.nombre_plan} actualizado correctamente`)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Error al actualizar el plan")
    } finally {
      setSavingPlanId(null)
    }
  }

  const saveSubscriptionStatus = async (idSuscripcion: number) => {
    const pendingStatus = pendingStatusBySubscription[idSuscripcion]
    if (!pendingStatus) return

    setSavingSubscriptionId(idSuscripcion)
    setError(null)

    try {
      const updated = await updateOrganizerSubscriptionStatus({
        idSuscripcion,
        estadoSuscripcion: pendingStatus,
      })

      setSubscriptions((prev) =>
        prev.map((item) =>
          item.id_suscripcion_organizador === idSuscripcion
            ? {
                ...item,
                estado_suscripcion: updated.estado_suscripcion,
                fecha_inicio: updated.fecha_inicio,
                fecha_fin: updated.fecha_fin,
              }
            : item
        )
      )

      setToast("Estado de suscripción actualizado")
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Error al actualizar la suscripción")
    } finally {
      setSavingSubscriptionId(null)
    }
  }

  return {
    loading,
    error,
    toast,
    plans,
    subscriptions,
    summaryText,
    planDrafts,
    savingPlanId,
    pendingStatusBySubscription,
    savingSubscriptionId,
    setPendingStatusBySubscription,
    updatePlanField,
    savePlan,
    saveSubscriptionStatus,
  }
}
