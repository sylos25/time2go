"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle, MapPin, Loader2, Search } from "lucide-react"

// Cargar el componente del mapa dinamicamente para evitar SSR issues
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

// Coordenadas centrales de Colombia
const COLOMBIA_CENTER: Coordenadas = { lat: 4.5709, lng: -74.2973 }
const DEFAULT_ZOOM = 6

export default function SitiosMapaPage() {
  // Estados para selects
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [tiposSitio, setTiposSitio] = useState<TipoSitio[]>([])
  const [filteredMunicipios, setFilteredMunicipios] = useState<Municipio[]>([])

  // Estados del formulario
  const [selectedDepartamento, setSelectedDepartamento] = useState<string>("")
  const [selectedMunicipio, setSelectedMunicipio] = useState<string>("")
  const [selectedTipoSitio, setSelectedTipoSitio] = useState<string>("")
  const [nombreSitio, setNombreSitio] = useState("")
  const [direccion, setDireccion] = useState("")
  const [telefono1, setTelefono1] = useState("")
  const [telefono2, setTelefono2] = useState("")
  const [sitioWeb, setSitioWeb] = useState("")

  // Estados del mapa
  const [selectedCoords, setSelectedCoords] = useState<Coordenadas | null>(null)
  const [mapCenter, setMapCenter] = useState<Coordenadas>(COLOMBIA_CENTER)
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM)
  const [isMapReady, setIsMapReady] = useState(false)

  // Estados de busqueda por direccion
  const [searchAddress, setSearchAddress] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  // Estados de UI
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
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

    fetchData()
  }, [])

  // Filtrar municipios cuando cambia el departamento
  useEffect(() => {
    if (selectedDepartamento) {
      const filtered = municipios.filter(
        (m) => m.id_departamento === parseInt(selectedDepartamento)
      )
      setFilteredMunicipios(filtered)
      setSelectedMunicipio("")
    } else {
      setFilteredMunicipios([])
    }
  }, [selectedDepartamento, municipios])

  // Centrar mapa en municipio seleccionado usando Nominatim
  useEffect(() => {
    if (selectedMunicipio && selectedDepartamento) {
      const municipio = municipios.find(
        (m) => m.id_municipio === parseInt(selectedMunicipio)
      )
      const departamento = departamentos.find(
        (d) => d.id_departamento === parseInt(selectedDepartamento)
      )

      if (municipio && departamento) {
        // Buscar coordenadas del municipio con Nominatim
        const searchQuery = `${municipio.nombre_municipio}, ${departamento.nombre_departamento}, Colombia`
        fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}&limit=1`
        )
          .then((res) => res.json())
          .then((data) => {
            if (data && data.length > 0) {
              setMapCenter({
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
              })
              setMapZoom(13)
            }
          })
          .catch(console.error)
      }
    }
  }, [selectedMunicipio, selectedDepartamento, municipios, departamentos])

  // Buscar direccion con Nominatim
  const handleSearchAddress = async () => {
    if (!searchAddress.trim()) return

    setIsSearching(true)
    try {
      const query = selectedMunicipio
        ? `${searchAddress}, ${
            municipios.find((m) => m.id_municipio === parseInt(selectedMunicipio))
              ?.nombre_municipio
          }, Colombia`
        : `${searchAddress}, Colombia`

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=1`
      )
      const data = await res.json()

      if (data && data.length > 0) {
        const coords = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        }
        setSelectedCoords(coords)
        setMapCenter(coords)
        setMapZoom(17)
        setDireccion(data[0].display_name.split(",")[0] || searchAddress)
      } else {
        setMessage({ type: "error", text: "No se encontro la direccion" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error buscando la direccion" })
    } finally {
      setIsSearching(false)
    }
  }

  // Manejar click en el mapa
  const handleMapClick = useCallback((coords: Coordenadas) => {
    setSelectedCoords(coords)
    setMessage(null)

    // Reverse geocoding para obtener la direccion
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data && data.address) {
          const addr = data.address
          const direccionFormateada =
            addr.road ||
            addr.pedestrian ||
            addr.neighbourhood ||
            addr.suburb ||
            ""
          if (direccionFormateada) {
            setDireccion(
              `${direccionFormateada}${addr.house_number ? " #" + addr.house_number : ""}`
            )
          }
        }
      })
      .catch(console.error)
  }, [])

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Validaciones
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

    // Obtener siguiente ID disponible (simplificado - en produccion seria mejor usar SERIAL)
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
            id_tipo_sitio: parseInt(selectedTipoSitio),
            id_municipio: parseInt(selectedMunicipio),
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

      if (response.ok) {
        setMessage({ type: "success", text: "Sitio agregado exitosamente" })
        // Limpiar formulario
        setNombreSitio("")
        setDireccion("")
        setTelefono1("")
        setTelefono2("")
        setSitioWeb("")
        setSelectedCoords(null)
        setSearchAddress("")
      } else {
        setMessage({ type: "error", text: result.error || "Error al agregar el sitio" })
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: `Error: ${error instanceof Error ? error.message : "Error desconocido"}`,
      })
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2 text-green-700 dark:text-green-300">Cargando datos...</span>
      </div>
    )
  }

  return (
    <div className="space-y-5 pt-6 sm:space-y-6 sm:pt-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-green-700/30 bg-green-600 px-3 py-5 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-900 sm:px-6 sm:py-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-lime-300/30 blur-2xl dark:bg-lime-500/20" />
        <div className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-teal-300/25 blur-2xl dark:bg-emerald-500/20" />
        <div className="relative">
          <h3 className="mb-2 text-center text-3xl font-semibold tracking-tight text-white dark:text-lime-200 sm:text-5xl">
            <span style={{ fontFamily: "Futura, Trebuchet MS, Helvetica, Arial, sans-serif" }}>
              Agregar Sitio con Mapa
            </span>
          </h3>
          <p className="text-center text-lime-100 dark:text-emerald-300">
            Selecciona un departamento y municipio, luego haz clic en el mapa para elegir la ubicacion
          </p>
        </div>
      </div>

      {/* Mensaje */}
      {message && (
        <div
          className={`rounded-lg border p-4 ${
            message.type === "success"
              ? "border-lime-200 bg-lime-50/80 text-green-800 dark:border-emerald-600 dark:bg-emerald-950/35 dark:text-emerald-200"
              : "border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
          }`}
        >
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Panel izquierdo - Selectores y Mapa */}
        <div className="space-y-4">
          {/* Selectores de ubicacion */}
          <div className="rounded-xl border border-lime-200/70 bg-white/90 p-4 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-950/35">
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-green-700 dark:text-lime-300">
              Ubicacion
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="departamento">Departamento</Label>
                <Select value={selectedDepartamento} onValueChange={setSelectedDepartamento}>
                  <SelectTrigger className="border-green-600 focus:ring-lime-400">
                    <SelectValue placeholder="Selecciona departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departamentos.map((dept) => (
                      <SelectItem key={dept.id_departamento} value={dept.id_departamento.toString()}>
                        {dept.nombre_departamento}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="municipio">Municipio</Label>
                <Select
                  value={selectedMunicipio}
                  onValueChange={setSelectedMunicipio}
                  disabled={!selectedDepartamento}
                >
                  <SelectTrigger className="border-green-600 focus:ring-lime-400">
                    <SelectValue placeholder="Selecciona municipio" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredMunicipios.map((mun) => (
                      <SelectItem key={mun.id_municipio} value={mun.id_municipio.toString()}>
                        {mun.nombre_municipio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Buscar por direccion */}
            <div className="mt-4 space-y-2">
              <Label htmlFor="search-address">Buscar direccion</Label>
              <div className="flex gap-2">
                <Input
                  id="search-address"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  placeholder="Ej: Carrera 7 #32-16"
                  className="border-green-600 bg-white/90 focus-visible:ring-lime-400 dark:bg-emerald-950/60"
                  onKeyDown={(e) => e.key === "Enter" && handleSearchAddress()}
                />
                <Button
                  type="button"
                  onClick={handleSearchAddress}
                  disabled={isSearching}
                  className="shrink-0 bg-green-600 hover:bg-green-700"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Mapa */}
          <div className="overflow-hidden rounded-xl border border-lime-200/70 shadow-sm dark:border-emerald-700/60">
            <div className="relative h-[400px] w-full bg-gray-100 dark:bg-gray-800">
              {isMapReady && (
                <LeafletMap
                  center={mapCenter}
                  zoom={mapZoom}
                  selectedCoords={selectedCoords}
                  onMapClick={handleMapClick}
                />
              )}
            </div>
            <div className="bg-lime-50 px-4 py-2 text-sm text-green-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              <MapPin className="mr-1 inline h-4 w-4" />
              {selectedCoords
                ? `Coordenadas: ${selectedCoords.lat.toFixed(6)}, ${selectedCoords.lng.toFixed(6)}`
                : "Haz clic en el mapa para seleccionar ubicacion"}
            </div>
          </div>
        </div>

        {/* Panel derecho - Formulario */}
        <div className="rounded-xl border border-lime-200/70 bg-white/90 p-4 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-950/35 sm:p-6">
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-green-700 dark:text-lime-300">
            Datos del Sitio
          </h4>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tipo-sitio">Tipo de Sitio *</Label>
              <Select value={selectedTipoSitio} onValueChange={setSelectedTipoSitio}>
                <SelectTrigger className="border-green-600 focus:ring-lime-400">
                  <SelectValue placeholder="Selecciona tipo de sitio" />
                </SelectTrigger>
                <SelectContent>
                  {tiposSitio.map((tipo) => (
                    <SelectItem key={tipo.id_tipo_sitio} value={tipo.id_tipo_sitio.toString()}>
                      {tipo.nombre_tipo_sitio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre-sitio">Nombre del Sitio *</Label>
              <Input
                id="nombre-sitio"
                value={nombreSitio}
                onChange={(e) => setNombreSitio(e.target.value)}
                placeholder="Ej: Restaurante El Buen Sabor"
                required
                minLength={3}
                className="border-green-600 bg-white/90 focus-visible:ring-lime-400 dark:bg-emerald-950/60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">Direccion *</Label>
              <Input
                id="direccion"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Ej: Carrera 7 #32-16"
                required
                minLength={6}
                className="border-green-600 bg-white/90 focus-visible:ring-lime-400 dark:bg-emerald-950/60"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitud">Latitud</Label>
                <Input
                  id="latitud"
                  value={selectedCoords?.lat.toFixed(8) || ""}
                  readOnly
                  placeholder="Selecciona en el mapa"
                  className="border-green-600 bg-gray-50 dark:bg-emerald-950/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitud">Longitud</Label>
                <Input
                  id="longitud"
                  value={selectedCoords?.lng.toFixed(8) || ""}
                  readOnly
                  placeholder="Selecciona en el mapa"
                  className="border-green-600 bg-gray-50 dark:bg-emerald-950/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefono1">Telefono 1</Label>
                <Input
                  id="telefono1"
                  value={telefono1}
                  onChange={(e) => setTelefono1(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="3001234567"
                  inputMode="numeric"
                  className="border-green-600 bg-white/90 focus-visible:ring-lime-400 dark:bg-emerald-950/60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono2">Telefono 2</Label>
                <Input
                  id="telefono2"
                  value={telefono2}
                  onChange={(e) => setTelefono2(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="3109876543"
                  inputMode="numeric"
                  className="border-green-600 bg-white/90 focus-visible:ring-lime-400 dark:bg-emerald-950/60"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sitio-web">Sitio Web</Label>
              <Input
                id="sitio-web"
                value={sitioWeb}
                onChange={(e) => setSitioWeb(e.target.value)}
                placeholder="https://ejemplo.com"
                type="url"
                className="border-green-600 bg-white/90 focus-visible:ring-lime-400 dark:bg-emerald-950/60"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !selectedCoords}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
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
  )
}
