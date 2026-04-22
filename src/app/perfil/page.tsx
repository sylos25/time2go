"use client"

import { DeactivateAccountDialogs } from "@/app/perfil/components/deactivate-account-dialogs"
import { OrganizerDialog } from "@/app/perfil/components/organizer-dialog"
import { ProfileMainCard } from "@/app/perfil/components/profile-main-card"
import { ProfileShell } from "@/app/perfil/components/profile-shell"
import { ProfileErrorState, ProfileLoadingState } from "@/app/perfil/components/profile-states"
import { useProfilePage } from "@/app/perfil/hooks/use-profile-page"

export default function PerfilPage() {
  const {
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
  } = useProfilePage()

  if (loading) {
    return (
      <ProfileShell userName="Usuario">
        <ProfileLoadingState message="Cargando datos del perfil..." />
      </ProfileShell>
    )
  }

  if (error || !user) {
    return (
      <ProfileShell userName="Usuario">
        <ProfileErrorState message={error || "Error al cargar el perfil"} onGoHome={handleGoHome} />
      </ProfileShell>
    )
  }

  return (
    <ProfileShell userName={userNameForHeader}>
      <ProfileMainCard
        user={user}
        successMessage={successMessage}
        onOpenOrganizadorDialog={handleOpenOrganizadorDialog}
        onChangePassword={handleChangePassword}
        onLogoutToHome={handleLogoutToHome}
        onOpenDeactivate={openDeactivate}
      />

      <OrganizerDialog
        open={isOrganizadorDialogOpen}
        isProcessingPayment={isProcessingPayment}
        selectedPdf={selectedPdf}
        organizerError={organizadorError}
        organizerPriceText={organizerPriceText}
        onOpenChange={handleOrganizadorDialogOpenChange}
        onClose={closeOrganizadorDialog}
        onFileChange={handleFileChange}
        onPay={handlePayWithEpayco}
      />

      <DeactivateAccountDialogs
        user={user}
        deactivateOpen={deactivateOpen}
        deactivateStep={deactivateStep}
        deactivating={deactivating}
        deactivateError={deactivateError}
        onClose={closeDeactivate}
        onGoStep1={goToDeactivateStep1}
        onGoStep2={goToDeactivateStep2}
        onConfirmDeactivate={handleDeactivate}
      />
    </ProfileShell>
  )
}
