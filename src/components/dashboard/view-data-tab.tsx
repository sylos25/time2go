"use client"

import React, { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Search } from "lucide-react"

type TableKey =
  | "paises"
  | "departamentos"
  | "municipios"
  | "tipo_sitios"
  | "sitios"
  | "tipo_infraestructura_discapacitados"
  | "sitios_discapacitados"
  | "categoria_eventos"
  | "tipo_eventos"
  | "eventos"
  | "eventos_informacion_importante"
  | "boleteria"
  | "links"

const COLUMN_LABELS: Record<string, string> = {
  id_pais: "ID País",
  nombre_pais: "País",
  id_departamento: "ID Departamento",
  nombre_departamento: "Departamento",
  id_municipio: "ID Municipio",
  nombre_municipio: "Municipio",
  distrito: "Distrito",
  area_metropolitana: "Área Metropolitana",
  id_tipo_sitio: "ID Tipo de Sitio",
  nombre_tipo_sitio: "Tipo de Sitio",
  id_sitio: "ID Sitio",
  nombre_sitio: "Sitio",
  acceso_discapacidad: "Acceso para Discapacidad",
  direccion: "Dirección",
  latitud: "Latitud",
  longitud: "Longitud",
  telefono_1: "Teléfono 1",
  telefono_2: "Teléfono 2",
  sitio_web: "Sitio Web",
  id_infraestructura_discapacitados: "ID Infraestructura Discapacitados",
  nombre_infraestructura_discapacitados: "Infraestructura para Discapacitados",
  id_sitios_discapacitados: "ID Sitio Discapacitados",
  descripcion: "Descripción",
  id_categoria_evento: "ID Categoría",
  categoria_evento: "Categoría",
  nombre_categoria_evento: "Categoría de Evento",
  id_tipo_evento: "ID Tipo de Evento",
  id_evento: "ID Evento",
  id_evento_info_item: "ID Info Evento",
  id_publico_evento: "ID Público Evento",
  pulep_evento: "PULEP",
  nombre_evento: "Nombre del Evento",
  responsable_evento: "Responsable",
  usuario_creador: "Usuario Creador",
  tipo_evento: "Tipo de Evento",
  detalle: "Detalle",
  obligatorio: "Obligatorio",
  gratis_pago: "De Pago o Gratis",
  cupo: "Cupo",
  reservar_anticipado: "Requiere Reserva Anticipada",
  estado: "Estado",
  fecha_inicio: "Fecha Inicio",
  fecha_fin: "Fecha Final",
  hora_inicio: "Hora Inicio",
  hora_final: "Hora Final",
  fecha_desactivacion: "Fecha Desactivación",
  fecha_creacion: "Fecha Creación",
  fecha_actualizacion: "Fecha Actualización",
  id_boleto: "ID Boleto",
  nombre_boleto: "Boleto",
  precio_boleto: "Precio",
  servicio: "Servicio",
  id_link: "ID Link",
  link: "Link",
}

const TABLE_ID_COLUMN: Record<TableKey, string> = {
  paises: "id_pais",
  departamentos: "id_departamento",
  municipios: "id_municipio",
  tipo_sitios: "id_tipo_sitio",
  sitios: "id_sitio",
  tipo_infraestructura_discapacitados: "id_infraestructura_discapacitados",
  sitios_discapacitados: "id_sitios_discapacitados",
  categoria_eventos: "id_categoria_evento",
  tipo_eventos: "id_tipo_evento",
  eventos: "id_evento",
  eventos_informacion_importante: "id_evento_info_item",
  boleteria: "id_boleto",
  links: "id_link",
}

const TABLE_EDITABLE_FIELDS: Record<TableKey, string[]> = {
  paises: ["nombre_pais"],
  departamentos: ["nombre_departamento"],
  municipios: ["nombre_municipio", "distrito", "area_metropolitana"],
  tipo_sitios: ["nombre_tipo_sitio"],
  sitios: ["nombre_sitio", "acceso_discapacidad", "direccion", "latitud", "longitud", "telefono_1", "telefono_2", "sitio_web"],
  tipo_infraestructura_discapacitados: ["nombre_infraestructura_discapacitados"],
  sitios_discapacitados: ["descripcion"],
  categoria_eventos: ["nombre"],
  tipo_eventos: ["nombre"],
  eventos: [
    "id_publico_evento",
    "pulep_evento",
    "nombre_evento",
    "responsable_evento",
    "descripcion",
    "telefono_1",
    "telefono_2",
    "fecha_inicio",
    "fecha_fin",
    "hora_inicio",
    "hora_final",
    "gratis_pago",
    "cupo",
    "reservar_anticipado",
    "estado",
  ],
  eventos_informacion_importante: ["detalle", "obligatorio"],
  boleteria: ["nombre_boleto", "precio_boleto", "servicio"],
  links: ["link"],
}

const getColumnLabel = (column: string): string => {
  if (COLUMN_LABELS[column]) return COLUMN_LABELS[column]
  return column
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function ViewDataTab() {
  const [table, setTable] = useState<TableKey>("sitios")
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [reloadKey, setReloadKey] = useState(0)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<Record<string, any> | null>(null)
  const [editFormData, setEditFormData] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const normalizedSearchTerm = searchTerm.trim().toLowerCase()
  const filteredRows = normalizedSearchTerm
    ? rows.filter((row) =>
        Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(normalizedSearchTerm))
      )
    : rows

  const editableFieldsForTable = TABLE_EDITABLE_FIELDS[table] || []

  const openEditModal = (row: Record<string, any>) => {
    const initialData: Record<string, any> = {}
    editableFieldsForTable.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(row, field)) {
        initialData[field] = row[field] ?? ""
      }
    })
    setEditingRow(row)
    setEditFormData(initialData)
    setSaveError(null)
    setEditModalOpen(true)
  }

  const handleEditFieldChange = (field: string, value: any) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const saveEditedRow = async () => {
    if (!editingRow) return
    const idColumn = TABLE_ID_COLUMN[table]
    const idValue = editingRow[idColumn]
    if (idValue === undefined || idValue === null) {
      setSaveError("No se pudo identificar el registro a editar")
      return
    }

    const payloadData: Record<string, any> = {}
    Object.keys(editFormData).forEach((field) => {
      const originalValue = editingRow[field]
      const incomingValue = editFormData[field]

      if (typeof originalValue === "boolean") {
        payloadData[field] = incomingValue === true || incomingValue === "true"
        return
      }

      if (typeof originalValue === "number") {
        payloadData[field] = incomingValue === "" || incomingValue === null ? null : Number(incomingValue)
        return
      }

      payloadData[field] = incomingValue === null || incomingValue === undefined ? "" : String(incomingValue)
    })

    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch("/api/admin/update-data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table,
          id: idValue,
          data: payloadData,
        }),
      })

      const result = await res.json()
      if (!res.ok) {
        throw new Error(result?.error || "No fue posible actualizar el registro")
      }

      setEditModalOpen(false)
      setEditingRow(null)
      setEditFormData({})
      setReloadKey((prev) => prev + 1)
    } catch (err: any) {
      setSaveError(err?.message || "Error al actualizar")
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/admin/get-data?table=${encodeURIComponent(table)}`)
        if (!res.ok) throw new Error(`Error ${res.status}`)
        const data = await res.json()
        if (!cancelled) setRows(data.rows || [])
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Error al cargar datos")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [table, reloadKey])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold">Ver Datos</h3>
      </div>

      <Card className="border-lime-100 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">Ver Datos</CardTitle>
          <CardDescription className="text-sm italic text-gray-500">Visualiza registros existentes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col lg:flex-row lg:items-center gap-3">
            <Select value={table} onValueChange={(v) => setTable(v as TableKey)}>
              <SelectTrigger className="w-fit bg-green-800 px-3 py-1 text-white cursor-pointer border-green-700 hover:bg-lime-600 focus:ring-lime-400">
                <SelectValue placeholder="Selecciona una tabla" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paises" className="cursor-pointer bg-lime-50">Países</SelectItem>
                <SelectItem value="departamentos" className="cursor-pointer bg-green-50">Departamentos</SelectItem>
                <SelectItem value="municipios" className="cursor-pointer bg-lime-50">Municipios</SelectItem>
                <SelectItem value="tipo_sitios" className="cursor-pointer bg-green-50">Tipos del sitio</SelectItem>
                <SelectItem value="sitios" className="cursor-pointer bg-lime-50">Sitios para eventos</SelectItem>
                <SelectItem value="tipo_infraestructura_discapacitados" className="cursor-pointer bg-green-50">Tipos de infraestructura para discapacitados</SelectItem>
                <SelectItem value="sitios_discapacitados" className="cursor-pointer bg-lime-50">Sitios con acceso inclusivo</SelectItem>
                <SelectItem value="categoria_eventos" className="cursor-pointer bg-green-50">Categorías de los eventos</SelectItem>
                <SelectItem value="tipo_eventos" className="cursor-pointer bg-lime-50">Tipos de eventos</SelectItem>
                <SelectItem value="eventos" className="cursor-pointer bg-green-50">Eventos</SelectItem>
                <SelectItem value="eventos_informacion_importante" className="cursor-pointer bg-lime-50">Eventos - Información importante</SelectItem>
                <SelectItem value="boleteria" className="cursor-pointer bg-green-50">Boletería</SelectItem>
                <SelectItem value="links" className="cursor-pointer bg-lime-50">Links</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lime-600 h-4 w-4" />
              <Input
                placeholder="Buscar registros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-green-600 placeholder-lime-600 focus-visible:ring-lime-400"
              />
            </div>

            <button
              type="button"
              onClick={() => setReloadKey((prev) => prev + 1)}
              disabled={loading}
              className="px-4 py-2 bg-green-800 border rounded-lg shadow-sm hover:bg-lime-600 text-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>

          {loading && <div>Cargando registros...</div>}
          {error && <div className="text-red-600">{error}</div>}

          {!loading && !error && (
            <div className="bg-white rounded-sm shadow-sm border border-green-600 overflow-hidden">
              {filteredRows.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No hay registros</div>
              ) : (
                <div className="overflow-x-auto">
                <table className="w-full min-w-max text-sm table-auto border-collapse border border-green-600">
                  <thead className="bg-lime-100 border-b border-green-600">
                    <tr>
                      {Object.keys(filteredRows[0]).map((col) => (
                        <th
                          key={col}
                          className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-green-600 last:border-r-0"
                        >
                          {getColumnLabel(col)}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Editar
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredRows.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        {Object.keys(filteredRows[0]).map((col) => (
                          <td key={col} className="px-4 py-3 align-top text-center text-sm text-gray-800">
                            {String((r as any)[col] ?? "")}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => openEditModal(r as Record<string, any>)}
                            className="px-3 py-1 rounded-lg text-white bg-green-700 hover:bg-lime-600 transition-colors"
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle>Editar registro</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {Object.keys(editFormData).length === 0 && (
              <p className="text-sm text-gray-500">Este registro no tiene campos editables disponibles.</p>
            )}

            {Object.entries(editFormData).map(([field, value]) => {
              const original = editingRow?.[field]
              const isBoolean = typeof original === "boolean"
              const isNumber = typeof original === "number"

              return (
                <div key={field} className="space-y-2">
                  <Label htmlFor={`edit-${field}`}>{getColumnLabel(field)}</Label>

                  {isBoolean ? (
                    <Select
                      value={String(value)}
                      onValueChange={(newValue) => handleEditFieldChange(field, newValue === "true")}
                    >
                      <SelectTrigger id={`edit-${field}`} className="border-green-600 focus:ring-lime-400">
                        <SelectValue placeholder="Selecciona un valor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Sí</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={`edit-${field}`}
                      type={isNumber ? "number" : "text"}
                      value={value ?? ""}
                      onChange={(e) => handleEditFieldChange(field, e.target.value)}
                      className="border-green-600 focus-visible:ring-lime-400"
                    />
                  )}
                </div>
              )
            })}

            {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={saveEditedRow}
              disabled={saving || Object.keys(editFormData).length === 0}
              className="px-4 py-2 rounded-lg text-white bg-green-700 hover:bg-lime-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ViewDataTab
