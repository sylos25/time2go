"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Loader } from "lucide-react"

type DataTable = "paises" | "tipo_sitios" | "sitios" | "tipo_infraest_disc" | "sitios_disc" | "categoria_eventos" | "tipo_eventos" | "categoria_boletos"

interface FormState {
  [key: string]: string | number | boolean
}

const tableConfigs: Record<DataTable, { fields: Array<{ name: string; type: string; required: boolean; label: string }> }> = {
  paises: {
    fields: [
      { name: "id_pais", type: "number", required: true, label: "ID País" },
      { name: "nombre_pais", type: "text", required: true, label: "Nombre del País" },
    ],
  },
  tipo_sitios: {
    fields: [
      { name: "id_tipo_sitio", type: "number", required: true, label: "ID Tipo de Sitio" },
      { name: "nombre_tipo_sitio", type: "text", required: true, label: "Nombre del Tipo de Sitio" },
    ],
  },
  sitios: {
    fields: [
      { name: "id_sitio", type: "number", required: true, label: "ID Sitio" },
      { name: "nombre_sitio", type: "text", required: true, label: "Nombre del Sitio" },
      { name: "id_tipo_sitio", type: "number", required: true, label: "ID Tipo de Sitio" },
      { name: "descripcion", type: "textarea", required: true, label: "Descripción" },
      { name: "acceso_discapacidad", type: "checkbox", required: false, label: "¿Acceso para Discapacitados?" },
      { name: "id_municipio", type: "number", required: true, label: "ID Municipio" },
      { name: "direccion", type: "text", required: true, label: "Dirección" },
      { name: "latitud", type: "text", required: true, label: "Latitud" },
      { name: "longitud", type: "text", required: true, label: "Longitud" },
      { name: "telefono_1", type: "number", required: true, label: "Teléfono 1" },
      { name: "telefono_2", type: "number", required: false, label: "Teléfono 2" },
      { name: "sitio_web", type: "text", required: false, label: "Sitio Web" },
    ],
  },
  tipo_infraest_disc: {
    fields: [
      { name: "id_infraest_disc", type: "number", required: true, label: "ID Infraestructura" },
      { name: "nombre_infraest_disc", type: "text", required: true, label: "Nombre de Infraestructura" },
    ],
  },
  sitios_disc: {
    fields: [
      { name: "id_sitios_disc", type: "number", required: true, label: "ID Sitio Discapacidad" },
      { name: "id_sitio", type: "number", required: true, label: "ID Sitio" },
      { name: "id_infraest_disc", type: "number", required: true, label: "ID Infraestructura" },
      { name: "descripcion", type: "textarea", required: true, label: "Descripción" },
    ],
  },
  categoria_eventos: {
    fields: [
      { name: "id_categoria_evento", type: "number", required: true, label: "ID Categoría" },
      { name: "nombre", type: "text", required: true, label: "Nombre de la Categoría" },
    ],
  },
  tipo_eventos: {
    fields: [
      { name: "id_tipo_evento", type: "number", required: true, label: "ID Tipo de Evento" },
      { name: "id_categoria_evento", type: "number", required: true, label: "ID Categoría del Evento" },
      { name: "nombre", type: "text", required: true, label: "Nombre del Tipo de Evento" },
    ],
  },
  categoria_boletos: {
    fields: [
      { name: "id_categoria_boleto", type: "number", required: true, label: "ID Categoría de Boleto" },
      { name: "nombre_categoria_boleto", type: "text", required: true, label: "Nombre de la Categoría de Boleto" },
    ],
  },
}

export function InsertDataTab({ initialTable }: { initialTable?: DataTable } = {}) {
  const [selectedTable, setSelectedTable] = useState<DataTable>(initialTable || "paises")
  const [formData, setFormData] = useState<FormState>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const currentConfig = tableConfigs[selectedTable]

  useEffect(() => {
    // Reset form when table changes
    setFormData({})
    setMessage(null)
  }, [selectedTable])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | { target: { name: string; value: any; type: string } }
  ) => {
    const { name, type } = e.target as any
    let value = (e.target as any).value

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

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
      <Card>
        <CardHeader>
          <CardTitle>Insertar Datos en Base de Datos</CardTitle>
          <CardDescription>Selecciona la tabla y completa los campos requeridos para insertar nuevos datos</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTable} onValueChange={(value) => setSelectedTable(value as DataTable)}>
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-8">
              <TabsTrigger value="paises">Países</TabsTrigger>
              <TabsTrigger value="tipo_sitios">Tipo Sitios</TabsTrigger>
              <TabsTrigger value="sitios">Sitios</TabsTrigger>
              <TabsTrigger value="tipo_infraest_disc">Infraestructura</TabsTrigger>
              <TabsTrigger value="sitios_disc">Sitios Disc</TabsTrigger>
              <TabsTrigger value="categoria_eventos">Categorías</TabsTrigger>
              <TabsTrigger value="tipo_eventos">Tipos de Eventos</TabsTrigger>
              <TabsTrigger value="categoria_boletos">Categoría Boletos</TabsTrigger>
            </TabsList>

            {["paises", "tipo_sitios", "sitios", "tipo_infraest_disc", "sitios_disc", "categoria_eventos", "tipo_eventos", "categoria_boletos"].map((tableKey) => (
              <TabsContent key={tableKey} value={tableKey} className="space-y-4">
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

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tableConfigs[tableKey as DataTable].fields.map((field) => (
                      <div key={field.name} className="space-y-2">
                        <Label htmlFor={field.name}>
                          {field.label}
                          {field.required && <span className="text-red-500">*</span>}
                        </Label>

                        {field.type === "select" ? (
                          <Select value={formData[field.name]?.toString() || ""} onValueChange={(value) => {
                            setFormData((prev) => ({
                              ...prev,
                              [field.name]: value,
                            }))
                          }}>
                            <SelectTrigger id={field.name}>
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
                              className="h-4 w-4 rounded border-gray-300"
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
                          />
                        ) : (
                          <Input
                            id={field.name}
                            name={field.name}
                            type={field.type}
                            value={(formData[field.name] as string | number) || ""}
                            onChange={handleInputChange}
                            placeholder={`Ingresa ${field.label.toLowerCase()}`}
                            required={field.required}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                    {loading ? "Insertando..." : "Insertar Datos"}
                  </Button>
                </form>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
