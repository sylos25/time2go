"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle, Loader } from "lucide-react"

type DataTable =
  | "paises"
  | "departamentos"
  | "municipios"
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
  departamentos: {
    fields: [
      { name: "id_departamento", type: "number", required: true, label: "ID Departamento", minValue: 1 },
      { name: "nombre_departamento", type: "text", required: true, label: "Nombre del Departamento", minLength: 4 },
      { name: "id_pais", type: "number", required: true, label: "ID País", minValue: 1 },
    ],
  },
  municipios: {
    fields: [
      { name: "id_municipio", type: "number", required: true, label: "ID Municipio", minValue: 1 },
      { name: "nombre_municipio", type: "text", required: true, label: "Nombre del Municipio", minLength: 3 },
      { name: "id_departamento", type: "number", required: true, label: "ID Departamento", minValue: 1 },
      { name: "distrito", type: "checkbox", required: false, label: "¿Es Distrito?" },
      { name: "area_metropolitana", type: "checkbox", required: false, label: "¿Área Metropolitana?" },
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
      { name: "acceso_discapacidad", type: "checkbox", required: false, label: "¿Acceso para Discapacitados?" },
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

const isDataTable = (value: string): value is DataTable => {
  return value in tableConfigs
}

const LETTERS_ONLY_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/

const isStrictTable = (table: DataTable) =>
  table === "paises" || table === "departamentos" || table === "municipios"

const isStrictIdField = (fieldName: string) =>
  fieldName === "id_pais" || fieldName === "id_departamento" || fieldName === "id_municipio"

const isStrictNameField = (fieldName: string) =>
  fieldName === "nombre_pais" || fieldName === "nombre_departamento" || fieldName === "nombre_municipio"

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold">Insertar Datos</h3>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Insertar Datos en Base de Datos</CardTitle>
          <CardDescription className="text-sm italic text-muted-foreground">Selecciona la tabla y completa los campos requeridos para insertar nuevos datos.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select
              value={selectedTable}
              onValueChange={(value) => {
                if (isDataTable(value)) {
                  setSelectedTable(value)
                }
              }}
            >
              <SelectTrigger className="w-fit bg-green-800 px-3 py-1 text-white cursor-pointer border-green-700 hover:bg-lime-600 focus:ring-lime-400">
                <SelectValue placeholder="Selecciona una tabla" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paises" className="cursor-pointer">Países</SelectItem>
                <SelectItem value="departamentos" className="cursor-pointer">Departamentos</SelectItem>
                <SelectItem value="municipios" className="cursor-pointer">Municipios</SelectItem>
                <SelectItem value="tipo_sitios" className="cursor-pointer">Tipo de sitios</SelectItem>
                <SelectItem value="sitios" className="cursor-pointer">Sitios</SelectItem>
                <SelectItem value="tipo_infraestructura_discapacitados" className="cursor-pointer">Infraestructura discapacitados</SelectItem>
                <SelectItem value="sitios_discapacitados" className="cursor-pointer">Sitio con condiciones para discapacitados</SelectItem>
                <SelectItem value="tipo_eventos" className="cursor-pointer">Tipo de eventos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {message && (
              <div className={`p-4 rounded-lg flex items-center gap-3 ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}>
                {message.type === "success" ? (
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl w-full mx-auto bg-card rounded-sm shadow-sm border border-border p-4">
              <div className="grid grid-cols-1 gap-4">
                {currentConfig.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>
                      {field.label}
                    </Label>

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
                              <SelectItem value="Cédula de Ciudadanía">Cédula de Ciudadanía</SelectItem>
                              <SelectItem value="Cédula de Extranjería">Cédula de Extranjería</SelectItem>
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
                        <Label htmlFor={field.name} className="font-normal cursor-pointer">
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
                        className="border-green-600 focus-visible:ring-lime-400"
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
                        inputMode={
                          isNumericField(selectedTable, field.name)
                            ? "numeric"
                            : undefined
                        }
                        autoComplete="off"
                        pattern={
                          isNumericField(selectedTable, field.name)
                            ? field.pattern || "[0-9]*"
                            : isStrictTable(selectedTable) && isStrictNameField(field.name)
                            ? "[A-Za-zÁÉÍÓÚáéíóúÑñ\\s]+"
                            : field.pattern
                        }
                        title={field.validationMessage}
                        className="border-green-600 focus-visible:ring-lime-400"
                      />
                    )}
                  </div>
                ))}
              </div>

              <Button type="submit" disabled={loading} className="w-auto px-3 py-1 bg-green-700 hover:bg-lime-500">
                {loading && <Loader className="h-2 w-2 mr-2 animate-spin" />}
                {loading ? "Insertando..." : "Insertar Datos"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
