import { useCallback, useState } from "react"
import { updateEventRequest } from "@/lib/edit-event-modal-api"
import {
  buildEditEventFormData,
  initialFormData,
  mapEventToFormState,
  sanitizeAlphanumSpace,
  sanitizeTextWithPunct,
  validateEditEventForm,
} from "@/lib/edit-event-modal-utils"
import { useEditEventCommercial } from "@/hooks/use-edit-event-commercial"
import { useEditEventDataLoaders } from "@/hooks/use-edit-event-data-loaders"
import { useEditEventImages } from "@/hooks/use-edit-event-images"
import type {
  Evento,
  Sitio,
  EventoInfoItem,
  FormDataState,
  FormErrors,
  UseEditEventModalArgs,
  UseEditEventModalReturn,
} from "@/types/event-edit"

export type { EventoInfoItem, FormDataState, FormErrors, UseEditEventModalArgs }

export function useEditEventModal({ isOpen, event, onClose, onSave }: UseEditEventModalArgs): UseEditEventModalReturn {
  const [formData, setFormData] = useState<FormDataState>(initialFormData)
  const [showTelefono2, setShowTelefono2] = useState(false)
  const [busquedaSitio, setBusquedaSitio] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const setFieldError = (field: keyof FormErrors, message: string) => {
    setFormErrors((prev) => ({ ...prev, [field]: message }))
  }

  const clearFieldError = (field: keyof FormErrors) => {
    setFormErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }))
  }

  const {
    images,
    documento,
    existingImages,
    newPrincipalImageIndex,
    imagesToDelete,
    setDocumento,
    resetImageDrafts,
    applyExistingImages,
    handleImageUpload,
    removeNewImage,
    removeExistingImage,
    setExistingPrincipalImage,
    setNewPrincipalImage,
  } = useEditEventImages({
    clearFieldError,
    setFieldError,
  })

  const {
    boletas,
    informacionAdicionalItems,
    applyCommercialState,
    setPagoEventType,
    setReservaAnticipada,
    updateBoleta,
    addBoletaField,
    removeBoletaField,
    removeAllBoletas,
    addInfoItem,
    updateInfoItem,
    removeInfoItem,
  } = useEditEventCommercial({
    clearFieldError,
    setFormData,
  })

  const mapEventToForm = useCallback((source: Evento) => {
    const mapped = mapEventToFormState(source)
    setFormData(mapped.formData)
    setShowTelefono2(mapped.showTelefono2)
    applyExistingImages(mapped.existingImages)
    setBusquedaSitio(mapped.busquedaSitio)
    applyCommercialState({
      boletas: mapped.boletas,
      informacionAdicionalItems: mapped.informacionAdicionalItems,
    })
  }, [applyCommercialState, applyExistingImages])

  const {
    loading,
    categories,
    eventTypes,
    sites,
    setSites,
  } = useEditEventDataLoaders({
    isOpen,
    event,
    busquedaSitio,
    selectedSitioId: formData.id_sitio,
    selectedCategoriaId: formData.id_categoria_evento,
    onMapEventToForm: mapEventToForm,
    onResetImageDrafts: resetImageDrafts,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as {
      name: string
      value: string
      type: string
    }
    let nextValue = value

    if (name === "nombre_evento" || name === "responsable_evento") {
      nextValue = sanitizeAlphanumSpace(value).slice(0, 40)
      clearFieldError(name)
    } else if (name === "pulep_evento") {
      nextValue = String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)
      clearFieldError("pulep_evento")
    } else if (name === "descripcion") {
      nextValue = sanitizeTextWithPunct(value).slice(0, 100)
      clearFieldError("descripcion")
    } else if (name === "telefono_1" || name === "telefono_2") {
      nextValue = String(value || "").replace(/[^0-9]/g, "").slice(0, 10)
      clearFieldError(name)
    } else if (name === "cupo") {
      nextValue = String(value || "").replace(/[^0-9]/g, "")
      clearFieldError("cupo")
    } else {
      clearFieldError(name as keyof FormErrors)
    }

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : nextValue,
      }

      if (name === "telefono_2" && nextValue === "" && prev.telefono_principal === "2") {
        updated.telefono_principal = "1"
      }

      return updated
    })
  }

  const handleSitioInputChange = (value: string) => {
    clearFieldError("id_sitio")
    setBusquedaSitio(value)
    setFormData((prev) => ({ ...prev, id_sitio: "" }))
  }

  const handleSelectSitio = (sitio: Sitio) => {
    setBusquedaSitio(sitio.nombre_sitio || sitio.nombre || "")
    setFormData((prev) => ({ ...prev, id_sitio: String(sitio.id_sitio || sitio.id || "") }))
    setSites([])
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      setFormErrors({})

      const validationError = validateEditEventForm({
        formData,
        boletas,
        informacionAdicionalItems,
      })

      if (validationError) {
        setFieldError(validationError.field, validationError.message)
        return
      }

      const submitFormData = buildEditEventFormData({
        formData,
        boletas,
        informacionAdicionalItems,
        images,
        documento,
        imagesToDelete,
      })

      const response = await updateEventRequest(event.id, submitFormData)

      if (!response.ok) {
        const message = String(response.payload?.message || "Error al guardar los cambios del evento")
        const lowerMessage = message.toLowerCase()
        if (lowerMessage.includes("imagen")) {
          setFormErrors((prev) => ({ ...prev, imagenes: message }))
        } else if (lowerMessage.includes("document")) {
          setFormErrors((prev) => ({ ...prev, documento: message }))
        } else {
          setFormErrors((prev) => ({ ...prev, general: message }))
        }
        return
      }

      const updatedData = response.payload
      await onSave(updatedData)
      onClose()
    } catch (err) {
      console.error("Error saving event", err)
      setFormErrors((prev) => ({ ...prev, general: "Error al guardar los cambios del evento" }))
    } finally {
      setIsSaving(false)
    }
  }

  return {
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
  }
}

