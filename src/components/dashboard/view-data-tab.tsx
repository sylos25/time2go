"use client"

import React, { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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

  const normalizedSearchTerm = searchTerm.trim().toLowerCase()
  const filteredRows = normalizedSearchTerm
    ? rows.filter((row) =>
        Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(normalizedSearchTerm))
      )
    : rows

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
  }, [table])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold">Ver Datos</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Buscar registros..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">Ver Datos</CardTitle>
          <CardDescription className="text-sm italic text-gray-500">Visualiza registros existentes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select value={table} onValueChange={(v) => setTable(v as TableKey)}>
              <SelectTrigger className="bg-green-700 px-3 py-1 text-white cursor-pointer ">
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
          </div>

          {loading && <div>Cargando registros...</div>}
          {error && <div className="text-red-600">{error}</div>}

          {!loading && !error && (
            <div className="overflow-auto">
              {filteredRows.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No hay registros</div>
              ) : (
                <table className="w-full text-sm table-auto">
                  <thead>
                    <tr>
                      {Object.keys(filteredRows[0]).map((col) => (
                        <th key={col} className="px-3 py-2 text-left font-medium text-gray-700 border-b">
                          {getColumnLabel(col)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((r, i) => (
                      <tr key={i} className="even:bg-gray-50">
                        {Object.keys(filteredRows[0]).map((col) => (
                          <td key={col} className="px-3 py-2 align-top text-gray-800">
                            {String((r as any)[col] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ViewDataTab
