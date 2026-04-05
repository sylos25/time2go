"use client"

import type { RefObject } from "react"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TicketSection } from "@/components/events/create-event/ticket-section"
import { MediaSection } from "@/components/events/create-event/media-section"
import { CreateSiteModal } from "@/components/events/create-event/create-site-modal"
import { CreateEventAccessState } from "@/components/events/create-event/create-event-access-state"
import { CreateEventBasicDetailsSection } from "@/components/events/create-event/create-event-basic-details-section"
import { CreateEventContactScheduleSection } from "./create-event-contact-schedule-section"
import { CreateEventSuccessDialog } from "@/components/events/create-event/create-event-success-dialog"
import type { UseCreateEventFormReturn } from "@/hooks/use-create-event-form"
import { useCreateEventMediaHandlers } from "@/hooks/use-create-event-media-handlers"

type CreateEventPageContentProps = {
  form: UseCreateEventFormReturn
  imageInputRef: RefObject<HTMLInputElement | null>
  createSiteModalOpen: boolean
  setCreateSiteModalOpen: (value: boolean) => void
  onBack: () => void
  onGoHome: () => void
  onGoEvents: () => void
}

export function CreateEventPageContent({
  form,
  imageInputRef,
  createSiteModalOpen,
  setCreateSiteModalOpen,
  onBack,
  onGoHome,
  onGoEvents,
}: CreateEventPageContentProps) {
  const {
    authorized,
    successDialogOpen,
    isLoading,
    formErrors,
    newEvent,
    setNewEvent,
    setSuccessDialogOpen,
    clearFieldError,
    sanitizeAlphanumSpace,
    addBoletaField,
    updateBoleta,
    removeBoletaField,
    removeAllBoletas,
    refreshSitios,
    handleAddEvent,
  } = form

  const mediaHandlers = useCreateEventMediaHandlers({ form, imageInputRef })

  return (
    <>
      <main className="flex-grow bg-background">
        <div className="pt-24 pb-16">
          {authorized !== true ? (
            <CreateEventAccessState authorized={authorized} onGoHome={onGoHome} />
          ) : (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 mt-8">
              <div className="flex items-center gap-4 mb-10">
                <Button
                  onClick={onBack}
                  variant="ghost"
                  className="rounded-full h-10 w-10 p-0 hover:bg-gray-200"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="ml-29 text-center">
                  <h1 className="text-5xl font-bold bg-gradient-to-tr from-fuchsia-700 to-red-600 bg-clip-text text-transparent">
                    Crear Nuevo Evento
                  </h1>
                  <p className="text-muted-foreground mt-2">Formulario para registrar un evento</p>
                </div>
              </div>

              <div className="bg-card rounded-3xl shadow-xl p-8 space-y-6">
                <CreateEventBasicDetailsSection
                  form={form}
                  onOpenCreateSiteModal={() => setCreateSiteModalOpen(true)}
                />

                <CreateEventContactScheduleSection form={form} />

                <TicketSection
                  pago={newEvent.pago}
                  reservarAnticipado={newEvent.reservar_anticipado}
                  boletas={newEvent.boletas}
                  error={formErrors.boletas}
                  onTogglePago={(pago) =>
                    setNewEvent((prev) => ({
                      ...prev,
                      pago,
                      reservar_anticipado: false,
                      boletas: pago ? prev.boletas : [{ nombre_boleto: "", precio_boleto: "", servicio: "" }],
                    }))
                  }
                  onToggleReserva={(value) => setNewEvent((prev) => ({ ...prev, reservar_anticipado: value }))}
                  onAddBoleta={addBoletaField}
                  onUpdateBoleta={updateBoleta}
                  onRemoveBoleta={removeBoletaField}
                  onRemoveAllBoletas={removeAllBoletas}
                  onClearError={() => clearFieldError("boletas")}
                  sanitizeAlphanum={sanitizeAlphanumSpace}
                />

                <MediaSection
                  imageInputRef={imageInputRef}
                  imagenes={newEvent.imagenes || []}
                  imagenPrincipalIndex={newEvent.imagenPrincipalIndex || 0}
                  documento={newEvent.documento}
                  imagenesError={formErrors.imagenes}
                  documentoError={formErrors.documento}
                  onUpdateImages={mediaHandlers.onUpdateImages}
                  onMoveImage={mediaHandlers.onMoveImage}
                  onSetPrincipalImage={mediaHandlers.onSetPrincipalImage}
                  onRemoveImage={mediaHandlers.onRemoveImage}
                  onUpdateDocument={mediaHandlers.onUpdateDocument}
                  onSetImagesError={mediaHandlers.onSetImagesError}
                  onClearImagesError={mediaHandlers.onClearImagesError}
                  onSetDocumentError={mediaHandlers.onSetDocumentError}
                  onClearDocumentError={mediaHandlers.onClearDocumentError}
                />

                <div className="flex gap-50 pt-6 border-t">
                  <Button
                    onClick={handleAddEvent}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-tr from-green-700 to-lime-500 hover:scale-103 hover:from-green-600 hover:to-lime-500 rounded-xl py-5 text-lg font-semibold"
                  >
                    {isLoading ? "Creando..." : "Crear Evento"}
                  </Button>
                  <Button
                    onClick={onBack}
                    variant="outline"
                    disabled={isLoading}
                    className="flex-1 rounded-xl py-5 text-lg hover:scale-103"
                  >
                    Cancelar
                  </Button>
                </div>
                {formErrors.general && <p className="text-sm text-red-600">{formErrors.general}</p>}
              </div>
            </div>
          )}
        </div>
      </main>

      <CreateEventSuccessDialog
        open={successDialogOpen}
        onOpenChange={setSuccessDialogOpen}
        onGoEvents={onGoEvents}
      />

      <CreateSiteModal
        open={createSiteModalOpen}
        onOpenChange={setCreateSiteModalOpen}
        onCreated={() => {
          void refreshSitios()
        }}
      />
    </>
  )
}
