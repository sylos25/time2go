"use client"

import { Loader2 } from "lucide-react"

import { OrganizerPlansTable } from "./components/organizer-plans-table"
import { OrganizerSubscriptionsTable } from "./components/organizer-subscriptions-table"
import { PlanesOrganizadorHero } from "./components/planes-organizador-hero"
import { useDashboardPlanesOrganizador } from "./hooks/use-dashboard-planes-organizador"

export default function DashboardPlanesOrganizadorPage() {
  const {
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
  } = useDashboardPlanesOrganizador()

  if (loading) {
    return (
      <div className="min-h-[55vh] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-green-800 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PlanesOrganizadorHero summaryText={summaryText} />

      {toast && (
        <div className="rounded-xl border border-emerald-400/50 bg-emerald-100/80 px-4 py-3 text-emerald-900 dark:bg-emerald-900/35 dark:text-emerald-200">
          {toast}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-400/40 bg-red-50/80 px-4 py-3 text-red-700 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      <OrganizerPlansTable
        plans={plans}
        planDrafts={planDrafts}
        savingPlanId={savingPlanId}
        onUpdatePlanField={updatePlanField}
        onSavePlan={savePlan}
      />

      <OrganizerSubscriptionsTable
        subscriptions={subscriptions}
        pendingStatusBySubscription={pendingStatusBySubscription}
        savingSubscriptionId={savingSubscriptionId}
        onPendingStatusChange={(idSuscripcion, status) =>
          setPendingStatusBySubscription((prev) => ({
            ...prev,
            [idSuscripcion]: status,
          }))
        }
        onSaveStatus={saveSubscriptionStatus}
      />
    </div>
  )
}
