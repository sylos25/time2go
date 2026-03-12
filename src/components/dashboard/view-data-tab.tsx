"use client"

import React, { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, FilePenLine, Search } from "lucide-react"

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
  infraestructura_discapacitados: "Infraestructura de Accesibilidad",
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
}

const TABLE_EDITABLE_FIELDS: Record<TableKey, string[]> = {
  paises: ["nombre_pais"],
  departamentos: ["nombre_departamento"],
  municipios: ["nombre_municipio", "distrito", "area_metropolitana"],
  tipo_sitios: ["nombre_tipo_sitio"],
  sitios: ["nombre_sitio", "direccion", "telefono_1", "telefono_2", "sitio_web"],
  tipo_infraestructura_discapacitados: ["nombre_infraestructura_discapacitados"],
  sitios_discapacitados: ["descripcion"],
  categoria_eventos: ["nombre"],
  tipo_eventos: ["nombre"],
}

const TABLE_HIDDEN_COLUMNS: Partial<Record<TableKey, string[]>> = {
  sitios: ["infraestructura_discapacitados", "latitud", "longitud", "acceso_discapacidad", "nombre_pais", "pais"],
}

const TABLE_NAV_ITEMS: Array<{ key: TableKey; label: string }> = [
  { key: "paises", label: "Países" },
  { key: "departamentos", label: "Departamentos" },
  { key: "municipios", label: "Municipios" },
  { key: "tipo_sitios", label: "Tipos de sitio" },
  { key: "sitios", label: "Sitios para eventos" },
  { key: "tipo_infraestructura_discapacitados", label: "Infraestructura para discapacitados" },
  { key: "sitios_discapacitados", label: "Sitios con acceso inclusivo" },
  { key: "categoria_eventos", label: "Categorías de eventos" },
  { key: "tipo_eventos", label: "Tipos de eventos" },
]

const getColumnLabel = (column: string): string => {
  if (COLUMN_LABELS[column]) return COLUMN_LABELS[column]
  return column
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

const isIdColumn = (column: string): boolean => {
  const normalized = column.toLowerCase()
  return normalized.startsWith("id_") || normalized.endsWith("_id")
}

const isDateLikeColumn = (column: string): boolean => {
  const normalized = column.toLowerCase()
  return normalized.includes("fecha") || normalized.includes("date")
}

const formatDateTimeReadable = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return ""

  const raw = String(value).trim()
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return raw

  const day = String(parsed.getDate()).padStart(2, "0")
  const month = String(parsed.getMonth() + 1).padStart(2, "0")
  const year = parsed.getFullYear()
  const hours = String(parsed.getHours()).padStart(2, "0")
  const minutes = String(parsed.getMinutes()).padStart(2, "0")

  return `${day}/${month}/${year} - ${hours}:${minutes}`
}

const formatCellValue = (column: string, value: unknown): string => {
  if (typeof value === "boolean") {
    return value ? "Sí" : "No"
  }

  if (isDateLikeColumn(column)) {
    return formatDateTimeReadable(value)
  }

  const normalized = String(value ?? "").trim().toLowerCase()
  if (normalized === "true") return "Sí"
  if (normalized === "false") return "No"

  return String(value ?? "")
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
  const hiddenColumnsForTable = TABLE_HIDDEN_COLUMNS[table] || []
  const activeTableIndex = TABLE_NAV_ITEMS.findIndex((item) => item.key === table)
  const activeTableLabel = TABLE_NAV_ITEMS[activeTableIndex]?.label || ""
  const visibleColumns = filteredRows.length > 0
    ? Object.keys(filteredRows[0]).filter((col) => !isIdColumn(col) && !hiddenColumnsForTable.includes(col))
    : []

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

  const goToPreviousTable = () => {
    if (activeTableIndex <= 0) return
    setTable(TABLE_NAV_ITEMS[activeTableIndex - 1].key)
  }

  const goToNextTable = () => {
    if (activeTableIndex >= TABLE_NAV_ITEMS.length - 1) return
    setTable(TABLE_NAV_ITEMS[activeTableIndex + 1].key)
  }

  return (
    <div className="space-y-5 pt-6 sm:space-y-6 sm:pt-8">
      <div className="relative overflow-hidden rounded-2xl border border-green-700/30 bg-green-600 px-3 py-5 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-900 sm:px-6 sm:py-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-lime-300/30 blur-2xl dark:bg-lime-500/20" />
        <div className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-teal-300/25 blur-2xl dark:bg-emerald-500/20" />

        <div className="relative space-y-4">
          <h3 className="mb-4 text-center text-3xl font-semibold tracking-tight text-white dark:text-lime-200 sm:mb-6 sm:text-5xl">
            <span style={{ fontFamily: "Futura, Trebuchet MS, Helvetica, Arial, sans-serif" }}>{activeTableLabel}</span>
          </h3>

          <div className="flex items-center justify-center gap-1.5 sm:gap-2" role="tablist" aria-label="Navegación de tablas">
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
                  const isActive = item.key === table
                  return (
                    <button
                      key={item.key}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`Mostrar tabla: ${item.label}`}
                      title={`Mostrar tabla: ${item.label}`}
                      onClick={() => setTable(item.key)}
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

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-600 h-4 w-4" />
        <Input
          placeholder="Buscar registros..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-green-600 placeholder-lime-600 focus-visible:ring-lime-400"
        />
      </div>

      {loading && <div>Cargando registros...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && (
        <>
          {filteredRows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay registros</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-lime-200/70 bg-white/85 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-950/35">
                <table className="w-full min-w-max table-auto border-collapse text-sm">
                  <thead className="bg-teal-600 dark:bg-emerald-700">
                    <tr>
                      {visibleColumns.map((col) => (
                        <th
                          key={col}
                          className="border-r border-lime-200/35 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/95 dark:border-emerald-300/20 dark:text-lime-100 last:border-r-0"
                        >
                          {getColumnLabel(col)}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/95 dark:text-lime-100">
                        Editar
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-lime-200/80 dark:divide-emerald-700/60">
                    {filteredRows.map((r, i) => (
                      <tr
                        key={i}
                        className={`transition-colors ${
                          i % 2 === 0
                            ? "bg-white/95 hover:bg-lime-50/90 dark:bg-emerald-950/25 dark:hover:bg-emerald-900/35"
                            : "bg-lime-50/45 hover:bg-lime-100/75 dark:bg-teal-950/25 dark:hover:bg-teal-900/35"
                        }`}
                      >
                        {visibleColumns.map((col) => (
                          <td key={col} className="border-r border-lime-200/70 px-4 py-3 align-top text-left text-sm text-green-900 dark:border-emerald-700/45 dark:text-emerald-100/90 last:border-r-0">
                            {formatCellValue(col, (r as any)[col])}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-left">
                          <button
                            type="button"
                            onClick={() => openEditModal(r as Record<string, any>)}
                            title="Editar información"
                            aria-label="Editar información"
                            className="inline-flex items-center justify-center rounded-lg p-2 text-green-700 transition-colors hover:bg-lime-200/70 hover:text-green-800 dark:text-lime-300 dark:hover:bg-emerald-800/45 dark:hover:text-lime-200 cursor-pointer"
                          >
                            <FilePenLine className="h-4 w-4" />
                            <span className="sr-only">Editar información</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          )}
        </>
      )}

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle>Editar registro</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {Object.keys(editFormData).length === 0 && (
              <p className="text-sm text-muted-foreground">Este registro no tiene campos editables disponibles.</p>
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
              className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent"
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
