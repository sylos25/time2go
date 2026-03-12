"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Loader } from "lucide-react"

type DataTable =
  | "paises"
  | "tipo_sitios"
  | "sitios"
  | "tipo_infraestructura_discapacitados"
  | "sitios_discapacitados"
  | "tipo_eventos"

const DEFAULT_TABLE: DataTable = "paises"

interface FormState {
  [key: string]: string | number | boolean
}

interface FieldConfig {
  name: string
  type: string
  required: boolean
  label: string
  minLength?: number
  maxLength?: number
  minValue?: number
  maxValue?: number
  pattern?: string
  validationMessage?: string
}

const tableConfigs: Record<DataTable, { fields: FieldConfig[] }> = {
  paises: {
    fields: [
      { name: "id_pais", type: "number", required: true, label: "ID País", minValue: 1 },
      { name: "nombre_pais", type: "text", required: true, label: "Nombre del País", minLength: 3 },
    ],
  },
  tipo_sitios: {
    fields: [
      { name: "id_tipo_sitio", type: "number", required: true, label: "ID Tipo de Sitio", minValue: 1 },
      { name: "nombre_tipo_sitio", type: "text", required: true, label: "Nombre del Tipo de Sitio", minLength: 4 },
    ],
  },
  sitios: {
    fields: [
      { name: "id_sitio", type: "number", required: true, label: "ID Sitio", minValue: 1 },
      { name: "nombre_sitio", type: "text", required: true, label: "Nombre del Sitio", minLength: 3 },
      { name: "id_tipo_sitio", type: "number", required: true, label: "ID Tipo de Sitio", minValue: 1 },
      { name: "id_municipio", type: "number", required: true, label: "ID Municipio", minValue: 1 },
      { name: "direccion", type: "text", required: true, label: "Dirección", minLength: 6 },
      { name: "latitud", type: "text", required: true, label: "Latitud" },
      { name: "longitud", type: "text", required: true, label: "Longitud" },
      {
        name: "telefono_1",
        type: "number",
        required: true,
        label: "Teléfono 1",
        minLength: 10,
        maxLength: 10,
        pattern: "^[3-9][0-9]{9}$",
        validationMessage: "Debe ser un teléfono de 10 dígitos y comenzar en 3 o superior",
      },
      {
        name: "telefono_2",
        type: "number",
        required: false,
        label: "Teléfono 2",
        minLength: 10,
        maxLength: 10,
        pattern: "^[3-9][0-9]{9}$",
        validationMessage: "Debe ser un teléfono de 10 dígitos y comenzar en 3 o superior",
      },
      { name: "sitio_web", type: "text", required: false, label: "Sitio Web" },
    ],
  },
  tipo_infraestructura_discapacitados: {
    fields: [
      { name: "id_infraestructura_discapacitados", type: "number", required: true, label: "ID Infraestructura", minValue: 1 },
      {
        name: "nombre_infraestructura_discapacitados",
        type: "text",
        required: true,
        label: "Nombre de Infraestructura",
        minLength: 4,
      },
    ],
  },
  sitios_discapacitados: {
    fields: [
      { name: "id_sitios_discapacitados", type: "number", required: true, label: "ID Sitio Discapacidad", minValue: 1 },
      { name: "id_sitio", type: "number", required: true, label: "ID Sitio", minValue: 1 },
      { name: "id_infraestructura_discapacitados", type: "number", required: true, label: "ID Infraestructura", minValue: 1 },
      { name: "descripcion", type: "textarea", required: true, label: "Descripción", minLength: 10 },
    ],
  },
  tipo_eventos: {
    fields: [
      { name: "id_tipo_evento", type: "number", required: true, label: "ID Tipo de Evento", minValue: 1 },
      { name: "id_categoria_evento", type: "number", required: true, label: "ID Categoría del Evento", minValue: 1 },
      { name: "nombre", type: "text", required: true, label: "Nombre del Tipo de Evento", minLength: 3 },
    ],
  },
}

const TABLE_NAV_ITEMS: Array<{ key: DataTable; label: string }> = [
  { key: "paises", label: "Paises" },
  { key: "tipo_sitios", label: "Tipo de sitios" },
  { key: "sitios", label: "Sitios" },
  { key: "tipo_infraestructura_discapacitados", label: "Infraestructura para discapacitados" },
  { key: "sitios_discapacitados", label: "Sitios con acceso inclusivo" },
  { key: "tipo_eventos", label: "Tipo de eventos" },
]

const isDataTable = (value: string): value is DataTable => {
  return value in tableConfigs
}

const LETTERS_ONLY_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/

const isStrictTable = (table: DataTable) =>
  table === "paises"

const isStrictIdField = (fieldName: string) =>
  fieldName === "id_pais"

const isStrictNameField = (fieldName: string) =>
  fieldName === "nombre_pais"

const isNumericField = (table: DataTable, fieldName: string): boolean => {
  const field = tableConfigs[table]?.fields.find((item) => item.name === fieldName)
  return field?.type === "number"
}

export function InsertDataTab({ initialTable }: { initialTable?: DataTable } = {}) {
  const [selectedTable, setSelectedTable] = useState<DataTable>(
    initialTable && isDataTable(initialTable) ? initialTable : DEFAULT_TABLE
  )
  const [formData, setFormData] = useState<FormState>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const currentConfig = tableConfigs[selectedTable] ?? tableConfigs[DEFAULT_TABLE]
  const activeTableIndex = TABLE_NAV_ITEMS.findIndex((item) => item.key === selectedTable)
  const activeTableLabel = TABLE_NAV_ITEMS[activeTableIndex]?.label ?? ""
  const splitIndex = Math.ceil(currentConfig.fields.length / 2)
  const primaryFields = currentConfig.fields.slice(0, splitIndex)
  const secondaryFields = currentConfig.fields.slice(splitIndex)

  useEffect(() => {
    // Reset form when table changes
    setFormData({})
    setMessage(null)
  }, [selectedTable])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | { target: { name: string; value: any; type: string } }
  ) => {
    const { name, type } = e.target as any
    const rawValue = (e.target as any).value
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
      const isIdField = isStrictIdField(name)
      const isNameField = isStrictNameField(name)

      if (isIdField) return

      if (isNameField && !LETTERS_ONLY_REGEX.test(String(rawValue))) {
        return
      }
    }

    if (type === "checkbox") {
      value = (e.target as HTMLInputElement).checked
    } else if (type === "number") {
      value = value === "" ? "" : Number(value)
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateField = (field: FieldConfig, fieldValue: string | number | boolean | undefined): string | null => {
    const isEmpty = fieldValue === undefined || fieldValue === null || String(fieldValue).trim() === ""

    if (field.required && field.type !== "checkbox" && isEmpty) {
      return `El campo ${field.label} es obligatorio`
    }

    if (!field.required && isEmpty) {
      return null
    }

    const valueAsString = String(fieldValue ?? "").trim()

    if (field.type === "number") {
      if (!/^\d+$/.test(valueAsString)) {
        return `${field.label} solo permite números`
      }

      if (field.minLength && valueAsString.length < field.minLength) {
        return `${field.label} debe tener mínimo ${field.minLength} caracteres`
      }

      if (field.maxLength && valueAsString.length > field.maxLength) {
        return `${field.label} debe tener máximo ${field.maxLength} caracteres`
      }

      const numericValue = Number(valueAsString)
      if (field.minValue !== undefined && numericValue < field.minValue) {
        return `${field.label} debe ser mayor o igual a ${field.minValue}`
      }

      if (field.maxValue !== undefined && numericValue > field.maxValue) {
        return `${field.label} debe ser menor o igual a ${field.maxValue}`
      }

      if (field.pattern && !new RegExp(field.pattern).test(valueAsString)) {
        return field.validationMessage || `${field.label} tiene un formato inválido`
      }

      return null
    }

    if (field.type === "text" || field.type === "textarea") {
      if (field.minLength && valueAsString.length < field.minLength) {
        return `${field.label} debe tener mínimo ${field.minLength} caracteres`
      }

      if (field.maxLength && valueAsString.length > field.maxLength) {
        return `${field.label} debe tener máximo ${field.maxLength} caracteres`
      }

      if (field.pattern && !new RegExp(field.pattern).test(valueAsString)) {
        return field.validationMessage || `${field.label} tiene un formato inválido`
      }
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
      const response = await fetch("/api/admin/insert-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: selectedTable,
          data: formData,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: `✓ Datos insertados exitosamente en ${selectedTable}` })
        setFormData({})
      } else {
        setMessage({ type: "error", text: result.error || "Error al insertar los datos" })
      }
    } catch (error) {
      setMessage({ type: "error", text: `Error: ${error instanceof Error ? error.message : "Error desconocido"}` })
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

  return (
    <div className="space-y-5 pt-6 sm:space-y-6 sm:pt-8">
      <div className="relative overflow-hidden rounded-2xl border border-green-700/30 bg-green-600 px-3 py-5 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-900 sm:px-6 sm:py-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-lime-300/30 blur-2xl dark:bg-lime-500/20" />
        <div className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-teal-300/25 blur-2xl dark:bg-emerald-500/20" />

        <div className="relative space-y-4">
          <h3 className="mb-4 text-center text-3xl font-semibold tracking-tight text-white dark:text-lime-200 sm:mb-6 sm:text-5xl">
            <span style={{ fontFamily: "Futura, Trebuchet MS, Helvetica, Arial, sans-serif" }}>Insertar en {activeTableLabel}</span>
          </h3>

          <div className="flex items-center justify-center gap-1.5 sm:gap-2" role="tablist" aria-label="Navegacion de tablas para insertar">
            <button
              type="button"
              onClick={goToPreviousTable}
              disabled={activeTableIndex <= 0}
              aria-label="Ir a la tabla anterior"
              title="Tabla anterior"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-lime-200 bg-white/95 text-green-700 transition-colors hover:border-lime-500 hover:bg-lime-100 disabled:cursor-not-allowed disabled:opacity-45 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-200 dark:hover:border-teal-400 dark:hover:bg-teal-800/40 cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="w-full max-w-[calc(100vw-10rem)] overflow-x-auto sm:max-w-[72vw]">
              <div className="flex w-max items-center gap-2 px-1 py-1">
                {TABLE_NAV_ITEMS.map((item) => {
                  const isActive = item.key === selectedTable
                  return (
                    <button
                      key={item.key}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`Insertar en tabla: ${item.label}`}
                      title={`Insertar en tabla: ${item.label}`}
                      onClick={() => setSelectedTable(item.key)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors sm:text-sm cursor-pointer ${
                        isActive
                          ? "bg-green-700 text-white shadow-sm hover:bg-emerald-400 hover:text-green-900 dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-lime-400"
                          : "bg-white/90 text-green-700 hover:bg-lime-200 hover:text-green-800 dark:bg-emerald-950/55 dark:text-emerald-200 dark:hover:bg-teal-800/45"
                      }`}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={goToNextTable}
              disabled={activeTableIndex >= TABLE_NAV_ITEMS.length - 1}
              aria-label="Ir a la tabla siguiente"
              title="Tabla siguiente"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-lime-200 bg-white/95 text-green-700 transition-colors hover:border-lime-500 hover:bg-lime-100 disabled:cursor-not-allowed disabled:opacity-45 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-200 dark:hover:border-teal-400 dark:hover:bg-teal-800/40 cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {message && (
          <div className={`rounded-lg border p-4 ${
            message.type === "success"
              ? "border-lime-200 bg-lime-50/80 text-green-800 dark:border-emerald-600 dark:bg-emerald-950/35 dark:text-emerald-200"
              : "border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
          }`}>
            <div className="flex items-center gap-3">
              {message.type === "success" ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-xl border border-lime-200/70 bg-white/90 p-4 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-950/35 sm:p-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-lime-200/60 bg-lime-50/45 p-4 dark:border-emerald-700/60 dark:bg-emerald-900/25">
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-green-700 dark:text-lime-300">Informacion principal</h4>
              <div className="space-y-3">
                {primaryFields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>{field.label}</Label>

                    {field.type === "select" ? (
                      <Select value={formData[field.name]?.toString() || ""} onValueChange={(value) => {
                        setFormData((prev) => ({
                          ...prev,
                          [field.name]: value,
                        }))
                      }}>
                        <SelectTrigger id={field.name} className="border-green-600 focus:ring-lime-400">
                          <SelectValue placeholder={`Selecciona ${field.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.name === "tipo_documento" && (
                            <>
                              <SelectItem value="Cedula de Ciudadania">Cedula de Ciudadania</SelectItem>
                              <SelectItem value="Cedula de Extranjeria">Cedula de Extranjeria</SelectItem>
                              <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    ) : field.type === "checkbox" ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={field.name}
                          name={field.name}
                          checked={(formData[field.name] as boolean) || false}
                          onChange={handleInputChange}
                          className="h-4 w-4 rounded border-border"
                        />
                        <Label htmlFor={field.name} className="cursor-pointer font-normal">
                          {field.label}
                        </Label>
                      </div>
                    ) : field.type === "textarea" ? (
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={(formData[field.name] as string) || ""}
                        onChange={handleInputChange}
                        placeholder={`Ingresa ${field.label.toLowerCase()}`}
                        required={field.required}
                        rows={3}
                        minLength={field.minLength}
                        maxLength={field.maxLength}
                        className="border-green-600 bg-white/90 focus-visible:ring-lime-400 dark:bg-emerald-950/60"
                      />
                    ) : (
                      <Input
                        id={field.name}
                        name={field.name}
                        type={isNumericField(selectedTable, field.name) ? "text" : field.type}
                        value={(formData[field.name] as string | number) || ""}
                        onChange={handleInputChange}
                        placeholder={`Ingresa ${field.label.toLowerCase()}`}
                        required={field.required}
                        minLength={field.minLength}
                        maxLength={field.maxLength}
                        inputMode={isNumericField(selectedTable, field.name) ? "numeric" : undefined}
                        autoComplete="off"
                        pattern={
                          isNumericField(selectedTable, field.name)
                            ? field.pattern || "[0-9]*"
                            : isStrictTable(selectedTable) && isStrictNameField(field.name)
                            ? "[A-Za-zÁÉÍÓÚáéíóúÑñ\\s]+"
                            : field.pattern
                        }
                        title={field.validationMessage}
                        className="border-green-600 bg-white/90 focus-visible:ring-lime-400 dark:bg-emerald-950/60"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-teal-200/60 bg-teal-50/45 p-4 dark:border-teal-700/60 dark:bg-teal-900/20">
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-green-700 dark:text-lime-300">Informacion complementaria</h4>
              <div className="space-y-3">
                {secondaryFields.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay campos complementarios para esta tabla.</p>
                ) : (
                  secondaryFields.map((field) => (
                    <div key={field.name} className="space-y-2">
                      <Label htmlFor={field.name}>{field.label}</Label>

                      {field.type === "select" ? (
                        <Select value={formData[field.name]?.toString() || ""} onValueChange={(value) => {
                          setFormData((prev) => ({
                            ...prev,
                            [field.name]: value,
                          }))
                        }}>
                          <SelectTrigger id={field.name} className="border-green-600 focus:ring-lime-400">
                            <SelectValue placeholder={`Selecciona ${field.label.toLowerCase()}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.name === "tipo_documento" && (
                              <>
                                <SelectItem value="Cedula de Ciudadania">Cedula de Ciudadania</SelectItem>
                                <SelectItem value="Cedula de Extranjeria">Cedula de Extranjeria</SelectItem>
                                <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      ) : field.type === "checkbox" ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={field.name}
                            name={field.name}
                            checked={(formData[field.name] as boolean) || false}
                            onChange={handleInputChange}
                            className="h-4 w-4 rounded border-border"
                          />
                          <Label htmlFor={field.name} className="cursor-pointer font-normal">
                            {field.label}
                          </Label>
                        </div>
                      ) : field.type === "textarea" ? (
                        <Textarea
                          id={field.name}
                          name={field.name}
                          value={(formData[field.name] as string) || ""}
                          onChange={handleInputChange}
                          placeholder={`Ingresa ${field.label.toLowerCase()}`}
                          required={field.required}
                          rows={3}
                          minLength={field.minLength}
                          maxLength={field.maxLength}
                          className="border-green-600 bg-white/90 focus-visible:ring-lime-400 dark:bg-emerald-950/60"
                        />
                      ) : (
                        <Input
                          id={field.name}
                          name={field.name}
                          type={isNumericField(selectedTable, field.name) ? "text" : field.type}
                          value={(formData[field.name] as string | number) || ""}
                          onChange={handleInputChange}
                          placeholder={`Ingresa ${field.label.toLowerCase()}`}
                          required={field.required}
                          minLength={field.minLength}
                          maxLength={field.maxLength}
                          inputMode={isNumericField(selectedTable, field.name) ? "numeric" : undefined}
                          autoComplete="off"
                          pattern={
                            isNumericField(selectedTable, field.name)
                              ? field.pattern || "[0-9]*"
                              : isStrictTable(selectedTable) && isStrictNameField(field.name)
                              ? "[A-Za-zÁÉÍÓÚáéíóúÑñ\\s]+"
                              : field.pattern
                          }
                          title={field.validationMessage}
                          className="border-green-600 bg-white/90 focus-visible:ring-lime-400 dark:bg-emerald-950/60"
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end">
            <Button type="submit" disabled={loading} className="w-auto bg-green-700 px-4 py-2 text-white hover:bg-lime-500">
              {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Insertando..." : "Insertar datos"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
