"use client"

import React, { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"

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
  const [searchTerm, setSearchTerm] = useState("")

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
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Exportar
          </Button>
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
                <SelectItem value="tipo_sitios" className="cursor-pointer bg-green-50">Tipos del sitio</SelectItem>
                <SelectItem value="sitios" className="cursor-pointer bg-lime-50">Sitios para eventos</SelectItem>
                <SelectItem value="tipo_infraest_disc" className="cursor-pointer bg-green-50">Acceso para discapacitados</SelectItem>
                <SelectItem value="sitios_disc" className="cursor-pointer bg-lime-50">Sitios con acceso inclusivo</SelectItem>
                <SelectItem value="categoria_eventos" className="cursor-pointer bg-green-50">Categorías de los eventos</SelectItem>
                <SelectItem value="tipo_eventos" className="cursor-pointer bg-lime-50">Tipos de eventos</SelectItem>
                <SelectItem value="categoria_boletos" className="cursor-pointer bg-lime-50">Categorías de los boletos</SelectItem>
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
