"use client"

import React, { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type TableKey =
  | "paises"
  | "tipo_sitios"
  | "sitios"
  | "tipo_infraest_disc"
  | "sitios_disc"
  | "categoria_eventos"
  | "tipo_eventos"
  | "categoria_boletos"

export function ViewDataTab() {
  const [table, setTable] = useState<TableKey>("sitios")
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      <Card>
        <CardHeader>
          <CardTitle>Ver Datos</CardTitle>
          <CardDescription>Visualiza registros existentes en las tablas del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select value={table} onValueChange={(v) => setTable(v as TableKey)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una tabla" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paises">Países</SelectItem>
                <SelectItem value="tipo_sitios">Tipo Sitios</SelectItem>
                <SelectItem value="sitios">Sitios</SelectItem>
                <SelectItem value="tipo_infraest_disc">Infraestructura</SelectItem>
                <SelectItem value="sitios_disc">Sitios Disc</SelectItem>
                <SelectItem value="categoria_eventos">Categorías</SelectItem>
                <SelectItem value="tipo_eventos">Tipos de Eventos</SelectItem>
                <SelectItem value="categoria_boletos">Categoría Boletos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading && <div>Cargando registros...</div>}
          {error && <div className="text-red-600">{error}</div>}

          {!loading && !error && (
            <div className="overflow-auto">
              {rows.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No hay registros</div>
              ) : (
                <table className="w-full text-sm table-auto">
                  <thead>
                    <tr>
                      {Object.keys(rows[0]).map((col) => (
                        <th key={col} className="px-3 py-2 text-left font-medium text-gray-700 border-b">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className="even:bg-gray-50">
                        {Object.keys(rows[0]).map((col) => (
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
