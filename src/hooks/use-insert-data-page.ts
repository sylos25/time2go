import { useEffect, useMemo, useState } from "react"

import {
  DEFAULT_TABLE,
  LETTERS_ONLY_REGEX,
  TABLE_NAV_ITEMS,
  type DataTable,
  type FormState,
  isNumericField,
  isStrictIdField,
  isStrictNameField,
  isStrictTable,
  tableConfigs,
  validateField,
} from "@/lib/insert-data-config"
import { insertAdminData } from "@/lib/insert-data-api"

type MessageState = {
  type: "success" | "error"
  text: string
} | null

export function useInsertDataPage() {
  const [selectedTable, setSelectedTable] = useState<DataTable>(DEFAULT_TABLE)
  const [formData, setFormData] = useState<FormState>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<MessageState>(null)

  const currentConfig = tableConfigs[selectedTable] ?? tableConfigs[DEFAULT_TABLE]
  const activeTableIndex = TABLE_NAV_ITEMS.findIndex((item) => item.key === selectedTable)
  const activeTableLabel = TABLE_NAV_ITEMS[activeTableIndex]?.label ?? ""

  const splitIndex = useMemo(() => Math.ceil(currentConfig.fields.length / 2), [currentConfig.fields.length])
  const primaryFields = useMemo(() => currentConfig.fields.slice(0, splitIndex), [currentConfig.fields, splitIndex])
  const secondaryFields = useMemo(() => currentConfig.fields.slice(splitIndex), [currentConfig.fields, splitIndex])

  useEffect(() => {
    setFormData({})
    setMessage(null)
  }, [selectedTable])

  const handleInputChange = (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      | { target: { name: string; value: string | number | boolean; type: string } }
  ) => {
    const { name, type } = event.target
    const rawValue = event.target.value
    let value = rawValue

    const fieldConfig = currentConfig.fields.find((field) => field.name === name)

    if (isNumericField(selectedTable, name)) {
      const onlyDigits = String(rawValue).replace(/\D/g, "")
      const limitedDigits = fieldConfig?.maxLength ? onlyDigits.slice(0, fieldConfig.maxLength) : onlyDigits
      setFormData((prev) => ({
        ...prev,
        [name]: limitedDigits,
      }))
      return
    }

    const needsStrictValidation = isStrictTable(selectedTable)
    if (needsStrictValidation) {
      if (isStrictIdField(name)) return
      if (isStrictNameField(name) && !LETTERS_ONLY_REGEX.test(String(rawValue))) {
        return
      }
    }

    if (type === "checkbox") {
      value = (event.target as HTMLInputElement).checked
    } else if (type === "number") {
      value = value === "" ? "" : Number(value)
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    const validationError = currentConfig.fields
      .map((field) => validateField(field, formData[field.name]))
      .find((error) => Boolean(error))

    if (validationError) {
      setLoading(false)
      setMessage({ type: "error", text: validationError })
      return
    }

    try {
      const result = await insertAdminData(selectedTable, formData)

      if (result.ok) {
        setMessage({ type: "success", text: `✓ Datos insertados exitosamente en ${selectedTable}` })
        setFormData({})
      } else {
        setMessage({ type: "error", text: result.error })
      }
    } finally {
      setLoading(false)
    }
  }

  const goToPreviousTable = () => {
    if (activeTableIndex <= 0) return
    setSelectedTable(TABLE_NAV_ITEMS[activeTableIndex - 1].key)
  }

  const goToNextTable = () => {
    if (activeTableIndex >= TABLE_NAV_ITEMS.length - 1) return
    setSelectedTable(TABLE_NAV_ITEMS[activeTableIndex + 1].key)
  }

  return {
    selectedTable,
    formData,
    loading,
    message,
    activeTableIndex,
    activeTableLabel,
    primaryFields,
    secondaryFields,
    setSelectedTable,
    setFormData,
    handleInputChange,
    handleSubmit,
    goToPreviousTable,
    goToNextTable,
  }
}
