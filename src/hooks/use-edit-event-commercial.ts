import { useCallback, useState, type Dispatch, type SetStateAction } from "react"

import { sanitizeAlphanumSpace, sanitizeTextWithPunct } from "@/lib/edit-event-modal-utils"
import type { BoleteDefinition } from "@/lib/edit-event-modal-utils"
import type { EventoInfoItem, FormDataState, FormErrors } from "@/types/event-edit"

type UseEditEventCommercialArgs = {
  clearFieldError: (field: keyof FormErrors) => void
  setFormData: Dispatch<SetStateAction<FormDataState>>
}

const EMPTY_BOLETA: BoleteDefinition = {
  nombre_boleto: "",
  precio_boleto: "",
  servicio: "",
}

const EMPTY_INFO_ITEM: EventoInfoItem = {
  detalle: "",
  obligatorio: true,
}

export function useEditEventCommercial({ clearFieldError, setFormData }: UseEditEventCommercialArgs) {
  const [boletas, setBoletas] = useState<BoleteDefinition[]>([EMPTY_BOLETA])
  const [informacionAdicionalItems, setInformacionAdicionalItems] = useState<EventoInfoItem[]>([EMPTY_INFO_ITEM])

  const applyCommercialState = useCallback((params: { boletas: BoleteDefinition[]; informacionAdicionalItems: EventoInfoItem[] }) => {
    setBoletas(params.boletas)
    setInformacionAdicionalItems(params.informacionAdicionalItems)
  }, [])

  const setPagoEventType = useCallback(
    (isPaid: boolean) => {
      clearFieldError("boletas")
      setFormData((prev) => ({
        ...prev,
        gratis_pago: isPaid,
        reservar_anticipado: false,
      }))

      if (!isPaid) {
        setBoletas([EMPTY_BOLETA])
      }
    },
    [clearFieldError, setFormData]
  )

  const setReservaAnticipada = useCallback(
    (value: boolean) => {
      setFormData((prev) => ({ ...prev, reservar_anticipado: value }))
    },
    [setFormData]
  )

  const updateBoleta = useCallback(
    (index: number, field: string, value: string) => {
      setBoletas((prev) => {
        const copy = [...prev]
        let nextValue = value
        if (field === "nombre_boleto") {
          nextValue = sanitizeAlphanumSpace(value)
        } else {
          nextValue = String(value || "").replace(/[^0-9]/g, "")
        }
        clearFieldError("boletas")
        copy[index] = { ...copy[index], [field]: nextValue }
        return copy
      })
    },
    [clearFieldError]
  )

  const addBoletaField = useCallback(() => {
    setBoletas((prev) => {
      if (prev.length >= 12) return prev
      return [...prev, EMPTY_BOLETA]
    })
  }, [])

  const removeBoletaField = useCallback((index: number) => {
    setBoletas((prev) => prev.filter((_, currentIndex) => currentIndex !== index))
  }, [])

  const removeAllBoletas = useCallback(() => {
    setBoletas([EMPTY_BOLETA])
  }, [])

  const addInfoItem = useCallback(() => {
    setInformacionAdicionalItems((prev) => {
      if (prev.length >= 20) return prev
      clearFieldError("informacion_adicional_items")
      return [...prev, { detalle: "", obligatorio: false }]
    })
  }, [clearFieldError])

  const updateInfoItem = useCallback(
    (index: number, field: keyof EventoInfoItem, value: string | boolean) => {
      setInformacionAdicionalItems((prev) => {
        const updated = [...prev]
        updated[index] = {
          ...updated[index],
          [field]: field === "detalle" ? sanitizeTextWithPunct(String(value || "")) : value,
        }
        clearFieldError("informacion_adicional_items")
        return updated
      })
    },
    [clearFieldError]
  )

  const removeInfoItem = useCallback((index: number) => {
    setInformacionAdicionalItems((prev) => {
      const updated = prev.filter((_, currentIndex) => currentIndex !== index)
      return updated.length > 0 ? updated : [EMPTY_INFO_ITEM]
    })
  }, [])

  return {
    boletas,
    informacionAdicionalItems,
    setBoletas,
    setInformacionAdicionalItems,
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
  }
}
