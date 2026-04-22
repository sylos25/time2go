"use client"

import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"

import type {
  DeactivateStep,
  MeResponse,
  MutationResponse,
  OrganizerPaymentResponse,
  UserData,
} from "@/app/perfil/lib/profile-types"
import {
  clearSessionStorageValues,
  formatOrganizerPrice,
  getAuthToken,
  getDisplayUserName,
  getOrganizerPriceCOP,
  getProfileSuccessMessageFromUrl,
  validatePdfFile,
} from "@/app/perfil/lib/profile-utils"

export function useProfilePage() {
  const router = useRouter()

  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [isOrganizadorDialogOpen, setIsOrganizadorDialogOpen] = useState(false)
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null)
  const [organizadorError, setOrganizadorError] = useState<string | null>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [deactivateStep, setDeactivateStep] = useState<DeactivateStep>(1)
  const [deactivating, setDeactivating] = useState(false)
  const [deactivateError, setDeactivateError] = useState<string | null>(null)

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const token = getAuthToken()
      const response = await fetch("/api/me", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

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

  const handleOpenOrganizadorDialog = useCallback(() => {
    setOrganizadorError(null)
    setSelectedPdf(null)
    setIsOrganizadorDialogOpen(true)
  }, [])

  const handleOrganizadorDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!isProcessingPayment) setIsOrganizadorDialogOpen(open)
    },
    [isProcessingPayment]
  )

  const closeOrganizadorDialog = useCallback(() => {
    if (!isProcessingPayment) setIsOrganizadorDialogOpen(false)
  }, [isProcessingPayment])

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setOrganizadorError(null)

    const validationError = validatePdfFile(file)
    if (validationError) {
      setOrganizadorError(validationError)
      setSelectedPdf(null)
      event.target.value = ""
      return
    }

    setSelectedPdf(file)
  }, [])

  const handlePayWithEpayco = useCallback(async () => {
    setIsProcessingPayment(true)
    setOrganizadorError(null)

    try {
      const token = getAuthToken()
      const formData = new FormData()
      if (selectedPdf) formData.append("document", selectedPdf)

      const response = await fetch("/api/organizador-document", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
        credentials: "include",
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
  }, [selectedPdf])

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
      const token = getAuthToken()
      const response = await fetch(`/api/usuarios/${user.id_usuario}/ban`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
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

  const organizerPriceText = useMemo(
    () => formatOrganizerPrice(getOrganizerPriceCOP()),
    []
  )

  const userNameForHeader = useMemo(() => getDisplayUserName(user), [user])

  return {
    user,
    loading,
    error,
    successMessage,
    userNameForHeader,
    organizerPriceText,
    isOrganizadorDialogOpen,
    selectedPdf,
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
    handleFileChange,
    handlePayWithEpayco,
    openDeactivate,
    closeDeactivate,
    goToDeactivateStep2,
    goToDeactivateStep1,
    handleDeactivate,
  }
}