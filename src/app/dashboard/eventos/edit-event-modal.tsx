"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader } from "lucide-react"
import { AdditionalInfoSection } from "./edit-event-sections/additional-info-section"
import { BoletasSection } from "./edit-event-sections/boletas-section"
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
    busquedaMunicipio,
    boletas,
    informacionAdicionalItems,
    images,
    existingImages,
    handleInputChange,
    handleSitioInputChange,
    handleSelectSitio,
    setBusquedaMunicipio,
    handleImageUpload,
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
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
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
            busquedaMunicipio={busquedaMunicipio}
            onInputChange={handleInputChange}
            onSitioInputChange={handleSitioInputChange}
            onSelectSitio={handleSelectSitio}
            onMunicipioChange={setBusquedaMunicipio}
          />

          <AdditionalInfoSection
            items={informacionAdicionalItems}
            error={formErrors.informacion_adicional_items}
            onAdd={addInfoItem}
            onUpdate={updateInfoItem}
            onRemove={removeInfoItem}
          />

          <LogisticsSection
            formData={formData}
            formErrors={formErrors}
            onInputChange={handleInputChange}
          />

          {formData.gratis_pago && (
            <BoletasSection
              boletas={boletas}
              error={formErrors.boletas}
              onUpdateBoleta={updateBoleta}
              onAddBoleta={addBoletaField}
              onRemoveBoleta={removeBoletaField}
              onRemoveAllBoletas={removeAllBoletas}
            />
          )}

          {formErrors.general && <p className="text-sm text-red-600">{formErrors.general}</p>}

          <ImagesSection
            existingImages={existingImages}
            newImages={images}
            onUpload={handleImageUpload}
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
