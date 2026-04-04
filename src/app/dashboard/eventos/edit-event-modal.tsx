"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader } from "lucide-react"
import { AdditionalInfoSection } from "@/components/events/create-event/additional-info-section"
import { TicketSection } from "@/components/events/create-event/ticket-section"
import { sanitizeAlphanumSpace, sanitizeTextWithPunct } from "@/hooks/use-create-event-form"
import { ImagesSection } from "./edit-event-sections/images-section"
import { CoreFieldsSection } from "./edit-event-sections/core-fields-section"
import { LogisticsSection } from "./edit-event-sections/logistics-section"
import { useEditEventModal } from "./use-edit-event-modal"
import type { EditEventModalProps } from "@/types/event-edit"

export function EditEventModal({ isOpen, onClose, event, onSave }: EditEventModalProps) {
  const {
    formData,
    formErrors,
    isSaving,
    loading,
    categories,
    eventTypes,
    sites,
    busquedaSitio,
    showTelefono2,
    boletas,
    informacionAdicionalItems,
    images,
    newPrincipalImageIndex,
    documento,
    existingImages,
    handleInputChange,
    handleSitioInputChange,
    handleSelectSitio,
    setShowTelefono2,
    setPagoEventType,
    setReservaAnticipada,
    clearFieldError,
    handleImageUpload,
    setDocumento,
    setExistingPrincipalImage,
    setNewPrincipalImage,
    removeNewImage,
    removeExistingImage,
    updateBoleta,
    addBoletaField,
    removeBoletaField,
    removeAllBoletas,
    addInfoItem,
    updateInfoItem,
    removeInfoItem,
    handleSave,
  } = useEditEventModal({
    isOpen,
    event,
    onClose,
    onSave,
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[98vw] sm:w-[96vw] !max-w-[98vw] sm:!max-w-[94vw] lg:!max-w-[1400px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Evento: {formData.nombre_evento}</DialogTitle>
        </DialogHeader>

        {loading && (
          <p className="text-sm text-muted-foreground">Cargando datos del evento...</p>
        )}

        <div className="space-y-4 py-4">
          <CoreFieldsSection
            formData={formData}
            formErrors={formErrors}
            categories={categories}
            eventTypes={eventTypes}
            sites={sites}
            busquedaSitio={busquedaSitio}
            onInputChange={handleInputChange}
            onSitioInputChange={handleSitioInputChange}
            onSelectSitio={handleSelectSitio}
          />

          <AdditionalInfoSection
            items={informacionAdicionalItems}
            error={formErrors.informacion_adicional_items}
            onAdd={addInfoItem}
            onUpdate={updateInfoItem}
            onRemove={removeInfoItem}
            onClearError={() => clearFieldError("informacion_adicional_items")}
            sanitizeText={sanitizeTextWithPunct}
          />

          <LogisticsSection
            formData={formData}
            formErrors={formErrors}
            showTelefono2={showTelefono2}
            onInputChange={handleInputChange}
            onShowTelefono2={setShowTelefono2}
          />

          <TicketSection
            pago={formData.gratis_pago}
            reservarAnticipado={formData.reservar_anticipado}
            boletas={boletas as Array<{ nombre_boleto: string; precio_boleto: string; servicio: string }>}
            error={formErrors.boletas}
            onTogglePago={setPagoEventType}
            onToggleReserva={setReservaAnticipada}
            onAddBoleta={addBoletaField}
            onUpdateBoleta={(index, field, value) => updateBoleta(index, field, value)}
            onRemoveBoleta={removeBoletaField}
            onRemoveAllBoletas={removeAllBoletas}
            onClearError={() => clearFieldError("boletas")}
            sanitizeAlphanum={sanitizeAlphanumSpace}
          />

          {formErrors.general && <p className="text-sm text-red-600">{formErrors.general}</p>}

          <ImagesSection
            existingImages={existingImages}
            newImages={images}
            newPrincipalImageIndex={newPrincipalImageIndex}
            documento={documento}
            imagenesError={formErrors.imagenes}
            documentoError={formErrors.documento}
            onUpload={handleImageUpload}
            onSetDocumento={setDocumento}
            onSetExistingPrincipal={setExistingPrincipalImage}
            onSetNewPrincipal={setNewPrincipalImage}
            onRemoveExisting={removeExistingImage}
            onRemoveNew={removeNewImage}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
