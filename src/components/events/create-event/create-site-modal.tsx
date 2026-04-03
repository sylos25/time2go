"use client"

import { useCallback, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle, Loader2, MapPin, Search } from "lucide-react"

const LeafletMap = dynamic(() => import("@/components/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
      <Loader2 className="h-8 w-8 animate-spin text-green-600" />
    </div>
  ),
})

interface Departamento {
  id_departamento: number
  nombre_departamento: string
}

interface Municipio {
  id_municipio: number
  nombre_municipio: string
  id_departamento: number
}

interface TipoSitio {
  id_tipo_sitio: number
  nombre_tipo_sitio: string
}

interface Coordenadas {
  lat: number
  lng: number
}

interface CreateSiteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}

const COLOMBIA_CENTER: Coordenadas = { lat: 4.5709, lng: -74.2973 }
const DEFAULT_ZOOM = 6

export function CreateSiteModal({ open, onOpenChange, onCreated }: CreateSiteModalProps) {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [tiposSitio, setTiposSitio] = useState<TipoSitio[]>([])
  const [filteredMunicipios, setFilteredMunicipios] = useState<Municipio[]>([])

  const [selectedDepartamento, setSelectedDepartamento] = useState("")
  const [selectedMunicipio, setSelectedMunicipio] = useState("")
  const [selectedTipoSitio, setSelectedTipoSitio] = useState("")
  const [nombreSitio, setNombreSitio] = useState("")
  const [direccion, setDireccion] = useState("")
  const [telefono1, setTelefono1] = useState("")
  const [telefono2, setTelefono2] = useState("")
  const [sitioWeb, setSitioWeb] = useState("")

  const [selectedCoords, setSelectedCoords] = useState<Coordenadas | null>(null)
  const [mapCenter, setMapCenter] = useState<Coordenadas>(COLOMBIA_CENTER)
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM)
  const [isMapReady, setIsMapReady] = useState(false)

  const [searchAddress, setSearchAddress] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (!open) return

    const fetchData = async () => {
      setLoadingData(true)
      try {
        const [deptRes, munRes, tipoRes] = await Promise.all([
          fetch("/api/departamentos"),
          fetch("/api/municipios"),
          fetch("/api/tipo-sitios"),
        ])

        if (deptRes.ok) {
          const deptData = await deptRes.json()
          setDepartamentos(deptData.departamentos || deptData || [])
        }
        if (munRes.ok) {
          const munData = await munRes.json()
          setMunicipios(munData.municipios || munData || [])
        }
        if (tipoRes.ok) {
          const tipoData = await tipoRes.json()
          setTiposSitio(tipoData.tipos || tipoData || [])
        }
      } catch (error) {
        console.error("Error cargando datos:", error)
      } finally {
        setLoadingData(false)
        setIsMapReady(true)
      }
    }

    void fetchData()
  }, [open])

  const handleDepartamentoChange = (value: string) => {
    setSelectedDepartamento(value)
    setSelectedMunicipio("")

    if (!value) {
      setFilteredMunicipios([])
      return
    }

    const filtered = municipios.filter(
      (municipio) => String(municipio.id_departamento) === value,
    )
    setFilteredMunicipios(filtered)
  }

  useEffect(() => {
    if (!selectedMunicipio || !selectedDepartamento) return

    const municipio = municipios.find((m) => m.id_municipio === Number(selectedMunicipio))
    const departamento = departamentos.find((d) => d.id_departamento === Number(selectedDepartamento))

    if (!municipio || !departamento) return

    const searchQuery = `${municipio.nombre_municipio}, ${departamento.nombre_departamento}, Colombia`
    void fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setMapCenter({ lat: Number(data[0].lat), lng: Number(data[0].lon) })
          setMapZoom(13)
        }
      })
      .catch(console.error)
  }, [selectedMunicipio, selectedDepartamento, municipios, departamentos])

  const handleSearchAddress = async () => {
    if (!searchAddress.trim()) return

    setIsSearching(true)
    try {
      const query = selectedMunicipio
        ? `${searchAddress}, ${municipios.find((m) => m.id_municipio === Number(selectedMunicipio))?.nombre_municipio}, Colombia`
        : `${searchAddress}, Colombia`

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      )
      const data = await res.json()

      if (data && data.length > 0) {
        const coords = { lat: Number(data[0].lat), lng: Number(data[0].lon) }
        setSelectedCoords(coords)
        setMapCenter(coords)
        setMapZoom(17)
        setDireccion(data[0].display_name.split(",")[0] || searchAddress)
      } else {
        setMessage({ type: "error", text: "No se encontro la direccion" })
      }
    } catch {
      setMessage({ type: "error", text: "Error buscando la direccion" })
    } finally {
      setIsSearching(false)
    }
  }

  const handleMapClick = useCallback((coords: Coordenadas) => {
    setSelectedCoords(coords)
    setMessage(null)

    void fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (!data?.address) return
        const addr = data.address
        const base = addr.road || addr.pedestrian || addr.neighbourhood || addr.suburb || ""
        if (!base) return
        setDireccion(`${base}${addr.house_number ? " #" + addr.house_number : ""}`)
      })
      .catch(console.error)
  }, [])

  const resetForm = () => {
    setSelectedDepartamento("")
    setSelectedMunicipio("")
    setSelectedTipoSitio("")
    setNombreSitio("")
    setDireccion("")
    setTelefono1("")
    setTelefono2("")
    setSitioWeb("")
    setSelectedCoords(null)
    setMapCenter(COLOMBIA_CENTER)
    setMapZoom(DEFAULT_ZOOM)
    setSearchAddress("")
    setMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (!selectedCoords) {
      setMessage({ type: "error", text: "Debes seleccionar un punto en el mapa" })
      setLoading(false)
      return
    }

    if (!selectedMunicipio) {
      setMessage({ type: "error", text: "Debes seleccionar un municipio" })
      setLoading(false)
      return
    }

    if (!selectedTipoSitio) {
      setMessage({ type: "error", text: "Debes seleccionar un tipo de sitio" })
      setLoading(false)
      return
    }

    if (!nombreSitio.trim() || nombreSitio.length < 3) {
      setMessage({ type: "error", text: "El nombre del sitio debe tener al menos 3 caracteres" })
      setLoading(false)
      return
    }

    if (!direccion.trim() || direccion.length < 6) {
      setMessage({ type: "error", text: "La direccion debe tener al menos 6 caracteres" })
      setLoading(false)
      return
    }

    try {
      const idRes = await fetch("/api/sitios/next-id")
      let nextId = 1
      if (idRes.ok) {
        const idData = await idRes.json()
        nextId = idData.nextId || 1
      }

      const response = await fetch("/api/admin/insert-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: "sitios",
          data: {
            id_sitio: nextId,
            nombre_sitio: nombreSitio.trim(),
            id_tipo_sitio: Number(selectedTipoSitio),
            id_municipio: Number(selectedMunicipio),
            direccion: direccion.trim(),
            latitud: selectedCoords.lat.toFixed(8),
            longitud: selectedCoords.lng.toFixed(8),
            telefono_1: telefono1 || null,
            telefono_2: telefono2 || null,
            sitio_web: sitioWeb || null,
          },
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setMessage({ type: "error", text: result.error || "Error al agregar el sitio" })
        return
      }

      setMessage({ type: "success", text: "Sitio agregado exitosamente" })
      if (onCreated) onCreated()
      resetForm()
      onOpenChange(false)
    } catch (error) {
      setMessage({
        type: "error",
        text: `Error: ${error instanceof Error ? error.message : "Error desconocido"}`,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[120] w-[96vw] sm:w-[94vw] max-w-[1400px] sm:max-w-[1400px] h-[88vh] overflow-hidden overflow-x-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Agregar sitio del evento</DialogTitle>
        </DialogHeader>

        {loadingData ? (
          <div className="flex h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-2 text-green-700">Cargando datos...</span>
          </div>
        ) : (
          <div className="h-[calc(88vh-73px)] overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-6">
            {message && (
              <div
                className={`rounded-lg border p-3 ${
                  message.type === "success"
                    ? "border-lime-200 bg-lime-50/80 text-green-800"
                    : "border-red-300 bg-red-50 text-red-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  {message.type === "success" ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <span className="text-sm font-medium">{message.text}</span>
                </div>
              </div>
            )}

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.25fr_1fr] lg:items-start">
              <div className="min-w-0 rounded-xl border p-4">
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-green-700">Mapa</h4>
                <div className="overflow-hidden rounded-xl border shadow-sm">
                  <div className="relative h-[300px] md:h-[420px] lg:h-[560px] w-full bg-gray-100">
                    {isMapReady && (
                      <LeafletMap
                        center={mapCenter}
                        zoom={mapZoom}
                        selectedCoords={selectedCoords}
                        onMapClick={handleMapClick}
                      />
                    )}
                  </div>
                  <div className="bg-lime-50 px-4 py-2 text-sm text-green-700">
                    <MapPin className="mr-1 inline h-4 w-4" />
                    {selectedCoords
                      ? `Coordenadas: ${selectedCoords.lat.toFixed(6)}, ${selectedCoords.lng.toFixed(6)}`
                      : "Haz clic en el mapa para seleccionar ubicacion"}
                  </div>
                </div>
              </div>

              <div className="min-w-0 space-y-4">
                <div className="rounded-xl border p-4">
                  <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-green-700">Ubicacion</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Departamento</Label>
                      <Select value={selectedDepartamento} onValueChange={handleDepartamentoChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona departamento" />
                        </SelectTrigger>
                        <SelectContent className="z-[140]">
                          {departamentos.map((dept) => (
                            <SelectItem key={dept.id_departamento} value={dept.id_departamento.toString()}>
                              {dept.nombre_departamento}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Municipio</Label>
                      <Select
                        value={selectedMunicipio}
                        onValueChange={setSelectedMunicipio}
                        disabled={!selectedDepartamento}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona municipio" />
                        </SelectTrigger>
                        <SelectContent className="z-[140]">
                          {filteredMunicipios.map((mun) => (
                            <SelectItem key={mun.id_municipio} value={mun.id_municipio.toString()}>
                              {mun.nombre_municipio}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Label>Buscar direccion</Label>
                    <div className="flex gap-2">
                      <Input
                        value={searchAddress}
                        onChange={(e) => setSearchAddress(e.target.value)}
                        placeholder="Ej: Carrera 7 #32-16"
                        onKeyDown={(e) => e.key === "Enter" && handleSearchAddress()}
                      />
                      <Button type="button" onClick={handleSearchAddress} disabled={isSearching}>
                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border p-4">
                  <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-green-700">Datos del Sitio</h4>
                  <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de Sitio *</Label>
                    <Select value={selectedTipoSitio} onValueChange={setSelectedTipoSitio}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tipo de sitio" />
                      </SelectTrigger>
                      <SelectContent className="z-[140]">
                        {tiposSitio.map((tipo) => (
                          <SelectItem key={tipo.id_tipo_sitio} value={tipo.id_tipo_sitio.toString()}>
                            {tipo.nombre_tipo_sitio}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Nombre del Sitio *</Label>
                    <Input
                      value={nombreSitio}
                      onChange={(e) => setNombreSitio(e.target.value)}
                      placeholder="Ej: Restaurante El Buen Sabor"
                      required
                      minLength={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Direccion *</Label>
                    <Input
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      placeholder="Ej: Carrera 7 #32-16"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Latitud</Label>
                      <Input value={selectedCoords?.lat.toFixed(8) || ""} readOnly placeholder="Selecciona en el mapa" />
                    </div>
                    <div className="space-y-2">
                      <Label>Longitud</Label>
                      <Input value={selectedCoords?.lng.toFixed(8) || ""} readOnly placeholder="Selecciona en el mapa" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Telefono 1</Label>
                      <Input
                        value={telefono1}
                        onChange={(e) => setTelefono1(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="3001234567"
                        inputMode="numeric"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefono 2</Label>
                      <Input
                        value={telefono2}
                        onChange={(e) => setTelefono2(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="3109876543"
                        inputMode="numeric"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Sitio Web</Label>
                    <Input
                      value={sitioWeb}
                      onChange={(e) => setSitioWeb(e.target.value)}
                      placeholder="https://ejemplo.com"
                      type="url"
                    />
                  </div>

                    <Button type="submit" disabled={loading || !selectedCoords} className="w-full bg-green-600 hover:bg-green-700">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <MapPin className="mr-2 h-4 w-4" />
                          Agregar Sitio
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
