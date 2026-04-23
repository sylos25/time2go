"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import type {
  DeactivateStep,
  MeResponse,
  MutationResponse,
  OrganizerPlan,
  OrganizerPaymentResponse,
  OrganizerPlansResponse,
  UserData,
} from "@/app/perfil/lib/profile-types"
import {
  clearSessionStorageValues,
  getDisplayUserName,
  getProfileSuccessMessageFromUrl,
} from "@/app/perfil/lib/profile-utils"
import { fetchWithSession } from "@/lib/client-auth-fetch"

export function useProfilePage() {
  const router = useRouter()

  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [isOrganizadorDialogOpen, setIsOrganizadorDialogOpen] = useState(false)
  const [isLoadingOrganizerPlans, setIsLoadingOrganizerPlans] = useState(false)
  const [organizerPlans, setOrganizerPlans] = useState<OrganizerPlan[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)
  const [organizadorError, setOrganizadorError] = useState<string | null>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [deactivateStep, setDeactivateStep] = useState<DeactivateStep>(1)
  const [deactivating, setDeactivating] = useState(false)
  const [deactivateError, setDeactivateError] = useState<string | null>(null)
  const paymentSyncRanRef = useRef(false)

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetchWithSession("/api/me")

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/auth")
          return
        }
        throw new Error("No se pudo cargar los datos del usuario")
      }

      const data: MeResponse = await response.json().catch(() => ({}))
      if (data.ok && data.user) {
        setUser(data.user)
      } else {
        setError("Error al cargar los datos")
      }
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  useEffect(() => {
    const message = getProfileSuccessMessageFromUrl()
    if (message) setSuccessMessage(message)
  }, [])

  useEffect(() => {
    if (paymentSyncRanRef.current || typeof window === "undefined") return
    paymentSyncRanRef.current = true

    const syncPaymentFromReturnUrl = async () => {
      const currentUrl = new URL(window.location.href)
      if (currentUrl.pathname !== "/perfil") return
      if (currentUrl.searchParams.get("pago") !== "resultado") return

      const hasGatewayParams = [
        "x_ref_payco",
        "ref_payco",
        "x_cod_response",
        "cod_response",
        "x_transaction_state",
        "transaction_state",
        "x_signature",
        "signature",
      ].some((key) => currentUrl.searchParams.has(key))

      if (!hasGatewayParams) return

      const reference = currentUrl.searchParams.get("ref") || currentUrl.searchParams.get("x_extra1") || ""
      const syncKey = reference ? `epayco-sync:${reference}` : ""
      if (syncKey && window.sessionStorage.getItem(syncKey) === "done") {
        return
      }

      const form = new URLSearchParams()
      currentUrl.searchParams.forEach((value, key) => {
        form.append(key, value)
      })

      if (reference) {
        if (!form.get("x_extra1")) form.set("x_extra1", reference)
        if (!form.get("x_id_invoice")) form.set("x_id_invoice", reference)
        if (!form.get("id_invoice")) form.set("id_invoice", reference)
        if (!form.get("reference")) form.set("reference", reference)
      }

      try {
        const response = await fetch("/api/epayco/webhook", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: form.toString(),
          credentials: "include",
        })

        if (!response.ok) {
          setSuccessMessage(
            "Pago recibido por ePayco, pero no se pudo sincronizar en este entorno. Si persiste, usa un tunel (ngrok/cloudflared) para confirmation_url.",
          )
          return
        }

        if (syncKey) window.sessionStorage.setItem(syncKey, "done")
        await fetchUserData()
        setSuccessMessage("Pago verificado y sincronizado. Ya puedes revisar Mis transacciones.")
      } catch {
        setSuccessMessage(
          "Pago recibido por ePayco, pero fallo la sincronizacion local. Verifica confirmation_url publico para webhook.",
        )
      }
    }

    void syncPaymentFromReturnUrl()
  }, [fetchUserData])

  const fetchOrganizerPlans = useCallback(async () => {
    setIsLoadingOrganizerPlans(true)
    try {
      const response = await fetchWithSession("/api/organizador-document")

      const data: OrganizerPlansResponse = await response.json().catch(() => ({}))
      if (!response.ok || !data?.ok || !Array.isArray(data.plans)) {
        setOrganizerPlans([])
        setSelectedPlanId(null)
        return
      }

      const plans = [...data.plans].sort((a, b) => a.id_plan - b.id_plan)
      setOrganizerPlans(plans)
      setSelectedPlanId((current) => {
        if (current && plans.some((plan) => plan.id_plan === current)) return current
        return plans.length > 0 ? plans[0].id_plan : null
      })
    } catch {
      setOrganizerPlans([])
      setSelectedPlanId(null)
    } finally {
      setIsLoadingOrganizerPlans(false)
    }
  }, [])

  const handleOpenOrganizadorDialog = useCallback(() => {
    setOrganizadorError(null)
    setIsOrganizadorDialogOpen(true)
    void fetchOrganizerPlans()
  }, [fetchOrganizerPlans])

  const handleOrganizadorDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!isProcessingPayment) setIsOrganizadorDialogOpen(open)
    },
    [isProcessingPayment]
  )

  const closeOrganizadorDialog = useCallback(() => {
    if (!isProcessingPayment) setIsOrganizadorDialogOpen(false)
  }, [isProcessingPayment])

  const handlePlanChange = useCallback((planId: number) => {
    setSelectedPlanId(planId)
    setOrganizadorError(null)
  }, [])

  const handlePayWithEpayco = useCallback(async () => {
    if (!selectedPlanId) {
      setOrganizadorError("Debes seleccionar un plan")
      return
    }

    setIsProcessingPayment(true)
    setOrganizadorError(null)

    try {
      const formData = new FormData()
      formData.append("id_plan", String(selectedPlanId))

      const response = await fetchWithSession("/api/organizador-document", {
        method: "POST",
        body: formData,
      })

      const data: OrganizerPaymentResponse = await response.json().catch(() => ({}))
      if (!response.ok || !data?.ok || !data.checkout_url) {
        setOrganizadorError(data?.message || "No se pudo iniciar el pago")
        setIsProcessingPayment(false)
        return
      }

      window.location.href = data.checkout_url
    } catch {
      setOrganizadorError("Ocurrio un error al iniciar el pago")
      setIsProcessingPayment(false)
    }
  }, [selectedPlanId])

  const openDeactivate = useCallback(() => {
    setDeactivateStep(1)
    setDeactivateError(null)
    setDeactivateOpen(true)
  }, [])

  const closeDeactivate = useCallback(() => {
    setDeactivateOpen(false)
  }, [])

  const goToDeactivateStep2 = useCallback(() => {
    setDeactivateStep(2)
    setDeactivateError(null)
  }, [])

  const goToDeactivateStep1 = useCallback(() => {
    setDeactivateStep(1)
  }, [])

  const handleDeactivate = useCallback(async () => {
    if (!user?.id_usuario) return

    setDeactivating(true)
    setDeactivateError(null)

    try {
      const response = await fetchWithSession(`/api/usuarios/${user.id_usuario}/ban`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ motivo: "Desactivacion solicitada por el usuario" }),
      })

      const data: MutationResponse = await response.json().catch(() => ({}))
      if (!response.ok || !data?.ok) {
        setDeactivateError(data?.message || "No se pudo desactivar la cuenta")
        return
      }

      clearSessionStorageValues()
      router.push("/?deactivated=true")
    } catch {
      setDeactivateError("Ocurrio un error. Intenta de nuevo.")
    } finally {
      setDeactivating(false)
    }
  }, [router, user?.id_usuario])

  const handleGoHome = useCallback(() => {
    router.push("/")
  }, [router])

  const handleChangePassword = useCallback(() => {
    router.push("/cambiar-contrasena")
  }, [router])

  const handleLogoutToHome = useCallback(() => {
    clearSessionStorageValues()
    router.push("/")
  }, [router])

  const userNameForHeader = useMemo(() => getDisplayUserName(user), [user])

  return {
    user,
    loading,
    error,
    successMessage,
    userNameForHeader,
    isOrganizadorDialogOpen,
    isLoadingOrganizerPlans,
    organizerPlans,
    selectedPlanId,
    organizadorError,
    isProcessingPayment,
    deactivateOpen,
    deactivateStep,
    deactivating,
    deactivateError,
    handleGoHome,
    handleChangePassword,
    handleLogoutToHome,
    handleOpenOrganizadorDialog,
    handleOrganizadorDialogOpenChange,
    closeOrganizadorDialog,
    handlePlanChange,
    handlePayWithEpayco,
    openDeactivate,
    closeDeactivate,
    goToDeactivateStep2,
    goToDeactivateStep1,
    handleDeactivate,
  }
}