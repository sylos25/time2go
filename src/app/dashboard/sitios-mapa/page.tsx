"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertCircle,
  CheckCircle2,
  MapPin,
  Loader2,
  Search,
  Globe,
  Phone,
  Building2,
  Navigation,
} from "lucide-react"

// Cargar el componente del mapa dinámicamente para evitar SSR issues
const LeafletMap = dynamic(() => import("@/components/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-emerald-50 dark:bg-emerald-950/40">
      <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
    </div>
  ),
})

/* ─── Types ─────────────────────────────────────────────────────── */
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

/* ─── Constants ─────────────────────────────────────────────────── */
const COLOMBIA_CENTER: Coordenadas = { lat: 4.5709, lng: -74.2973 }
const DEFAULT_ZOOM = 6

/* ─── Helpers ───────────────────────────────────────────────────── */
function FieldGroup({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={htmlFor}
        className="text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400"
      >
        {label}
      </Label>
      {children}
    </div>
  )
}

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm dark:border-emerald-800/40 dark:bg-emerald-950/30">
      <div className="flex items-center gap-2.5 border-b border-emerald-100 px-5 py-3.5 dark:border-emerald-800/40">
        <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
          {title}
        </span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

/* ─── Page ──────────────────────────────────────────────────────── */
export default function SitiosMapaPage() {
  /* selects */
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [tiposSitio, setTiposSitio] = useState<TipoSitio[]>([])
  const [filteredMunicipios, setFilteredMunicipios] = useState<Municipio[]>([])

  /* form */
  const [selectedDepartamento, setSelectedDepartamento] = useState("")
  const [selectedMunicipio, setSelectedMunicipio] = useState("")
  const [selectedTipoSitio, setSelectedTipoSitio] = useState("")
  const [nombreSitio, setNombreSitio] = useState("")
  const [direccion, setDireccion] = useState("")
  const [telefono1, setTelefono1] = useState("")
  const [telefono2, setTelefono2] = useState("")
  const [sitioWeb, setSitioWeb] = useState("")

  /* map */
  const [selectedCoords, setSelectedCoords] = useState<Coordenadas | null>(null)
  const [mapCenter, setMapCenter] = useState<Coordenadas>(COLOMBIA_CENTER)
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM)
  const [isMapReady, setIsMapReady] = useState(false)

  /* search */
  const [searchAddress, setSearchAddress] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  /* ui */
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  /* ── Fetch inicial ── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, munRes, tipoRes] = await Promise.all([
          fetch("/api/departamentos"),
          fetch("/api/municipios"),
          fetch("/api/tipo-sitios"),
        ])
        if (deptRes.ok) {
          const d = await deptRes.json()
          setDepartamentos(d.departamentos || d || [])
        }
        if (munRes.ok) {
          const m = await munRes.json()
          setMunicipios(m.municipios || m || [])
        }
        if (tipoRes.ok) {
          const t = await tipoRes.json()
          setTiposSitio(t.tipos || t || [])
        }
      } catch (err) {
        console.error("Error cargando datos:", err)
      } finally {
        setLoadingData(false)
        setIsMapReady(true)
      }
    }
    fetchData()
  }, [])

  /* ── Filtrar municipios ── */
  useEffect(() => {
    if (selectedDepartamento) {
      setFilteredMunicipios(
        municipios.filter((m) => m.id_departamento === parseInt(selectedDepartamento))
      )
      setSelectedMunicipio("")
    } else {
      setFilteredMunicipios([])
    }
  }, [selectedDepartamento, municipios])

  /* ── Centrar mapa al elegir municipio ── */
  useEffect(() => {
    if (!selectedMunicipio || !selectedDepartamento) return
    const mun = municipios.find((m) => m.id_municipio === parseInt(selectedMunicipio))
    const dep = departamentos.find((d) => d.id_departamento === parseInt(selectedDepartamento))
    if (!mun || !dep) return

    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        `${mun.nombre_municipio}, ${dep.nombre_departamento}, Colombia`
      )}&limit=1`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data?.[0]) {
          setMapCenter({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) })
          setMapZoom(13)
        }
      })
      .catch(console.error)
  }, [selectedMunicipio, selectedDepartamento, municipios, departamentos])

  /* ── Buscar dirección ── */
  const handleSearchAddress = async () => {
    if (!searchAddress.trim()) return
    setIsSearching(true)
    try {
      const munName = selectedMunicipio
        ? municipios.find((m) => m.id_municipio === parseInt(selectedMunicipio))?.nombre_municipio
        : null
      const query = munName
        ? `${searchAddress}, ${munName}, Colombia`
        : `${searchAddress}, Colombia`

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      )
      const data = await res.json()

      if (data?.[0]) {
        const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
        setSelectedCoords(coords)
        setMapCenter(coords)
        setMapZoom(17)
        setDireccion(data[0].display_name.split(",")[0] || searchAddress)
      } else {
        setMessage({ type: "error", text: "No se encontró la dirección. Intenta con otra búsqueda." })
      }
    } catch {
      setMessage({ type: "error", text: "Error al buscar la dirección." })
    } finally {
      setIsSearching(false)
    }
  }

  /* ── Click en mapa ── */
  const handleMapClick = useCallback((coords: Coordenadas) => {
    setSelectedCoords(coords)
    setMessage(null)

    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data?.address) {
          const a = data.address
          const base = a.road || a.pedestrian || a.neighbourhood || a.suburb || ""
          if (base) setDireccion(`${base}${a.house_number ? " #" + a.house_number : ""}`)
        }
      })
      .catch(console.error)
  }, [])

  /* ── Enviar formulario ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!selectedCoords)
      return setMessage({ type: "error", text: "Selecciona un punto en el mapa." })
    if (!selectedMunicipio)
      return setMessage({ type: "error", text: "Selecciona un municipio." })
    if (!selectedTipoSitio)
      return setMessage({ type: "error", text: "Selecciona un tipo de sitio." })
    if (nombreSitio.trim().length < 3)
      return setMessage({ type: "error", text: "El nombre debe tener al menos 3 caracteres." })
    if (direccion.trim().length < 6)
      return setMessage({ type: "error", text: "La dirección debe tener al menos 6 caracteres." })

    setLoading(true)
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
        setMessage({ type: "success", text: "¡Sitio agregado exitosamente!" })
        setNombreSitio("")
        setDireccion("")
        setTelefono1("")
        setTelefono2("")
        setSitioWeb("")
        setSelectedCoords(null)
        setSearchAddress("")
      } else {
        setMessage({ type: "error", text: result.error || "Error al guardar el sitio." })
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: `Error: ${err instanceof Error ? err.message : "Error desconocido"}`,
      })
    } finally {
      setLoading(false)
    }
  }

  /* ── Loading inicial ── */
  if (loadingData) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-sm text-emerald-700 dark:text-emerald-400">Cargando datos...</p>
      </div>
    )
  }

  /* ── Render ── */
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">

      {/* ── Header ── */}
      <div className="relative z-10 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 px-6 py-8 shadow-lg sm:px-10 sm:py-10">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-teal-300/20 blur-2xl" />
        <div className="pointer-events-none absolute right-32 bottom-0 h-24 w-24 rounded-full bg-emerald-300/20 blur-2xl" />
        <div className="relative flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 shadow-inner backdrop-blur-sm">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
                style={{ fontFamily: "'Futura', 'Trebuchet MS', sans-serif" }}>
              Agregar Sitio
            </h1>
            <p className="mt-1.5 text-sm text-emerald-200">
              Selecciona la ubicación en el mapa y completa los datos del sitio
            </p>
          </div>
        </div>
      </div>

      {/* ── Toast de mensaje ── */}
      {message && (
        <div
          className={`flex items-start gap-3 rounded-2xl border px-5 py-4 text-sm font-medium shadow-sm transition-all ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-700/50 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          )}
          {message.text}
        </div>
      )}

      {/* ── Contenido principal ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

        {/* ── COLUMNA IZQUIERDA (mapa + ubicación) ── */}
        <div className="space-y-5 lg:col-span-3">

          {/* Selección de ubicación */}
          <SectionCard title="Ubicación" icon={Navigation}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldGroup label="Departamento" htmlFor="departamento">
                <Select value={selectedDepartamento} onValueChange={setSelectedDepartamento}>
                  <SelectTrigger
                    id="departamento"
                    className="border-emerald-200 bg-white focus:ring-emerald-400 dark:border-emerald-700/60 dark:bg-emerald-950/50"
                  >
                    <SelectValue placeholder="Selecciona…" />
                  </SelectTrigger>
                  <SelectContent>
                    {departamentos.map((d) => (
                      <SelectItem key={d.id_departamento} value={d.id_departamento.toString()}>
                        {d.nombre_departamento}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldGroup>

              <FieldGroup label="Municipio" htmlFor="municipio">
                <Select
                  value={selectedMunicipio}
                  onValueChange={setSelectedMunicipio}
                  disabled={!selectedDepartamento}
                >
                  <SelectTrigger
                    id="municipio"
                    className="border-emerald-200 bg-white focus:ring-emerald-400 disabled:opacity-50 dark:border-emerald-700/60 dark:bg-emerald-950/50"
                  >
                    <SelectValue placeholder={selectedDepartamento ? "Selecciona…" : "Primero elige un departamento"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredMunicipios.map((m) => (
                      <SelectItem key={m.id_municipio} value={m.id_municipio.toString()}>
                        {m.nombre_municipio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldGroup>
            </div>

            {/* Buscador de dirección */}
            <div className="mt-4">
              <FieldGroup label="Buscar dirección" htmlFor="search-address">
                <div className="flex gap-2">
                  <Input
                    id="search-address"
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchAddress()}
                    placeholder="Ej: Carrera 7 #32-16"
                    className="border-emerald-200 bg-white focus-visible:ring-emerald-400 dark:border-emerald-700/60 dark:bg-emerald-950/50"
                  />
                  <Button
                    type="button"
                    onClick={handleSearchAddress}
                    disabled={isSearching || !searchAddress.trim()}
                    className="shrink-0 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </FieldGroup>
            </div>
          </SectionCard>

          {/* Mapa */}
          <div className="overflow-hidden rounded-2xl border border-emerald-100 shadow-sm dark:border-emerald-800/40">
            <div className="relative h-[380px] w-full">
              {isMapReady && (
                <LeafletMap
                  center={mapCenter}
                  zoom={mapZoom}
                  selectedCoords={selectedCoords}
                  onMapClick={handleMapClick}
                />
              )}
            </div>
            {/* Barra de coordenadas */}
            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2.5 dark:bg-emerald-950/50">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                {selectedCoords
                  ? `${selectedCoords.lat.toFixed(6)}, ${selectedCoords.lng.toFixed(6)}`
                  : "Haz clic en el mapa para seleccionar la ubicación"}
              </span>
            </div>
          </div>

          {/* Chips de coordenadas — solo cuando están seleccionadas */}
          {selectedCoords && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Latitud", value: selectedCoords.lat.toFixed(8) },
                { label: "Longitud", value: selectedCoords.lng.toFixed(8) },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 dark:border-emerald-800/40 dark:bg-emerald-950/30"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-500 dark:text-emerald-500">
                    {label}
                  </p>
                  <p className="mt-0.5 font-mono text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── COLUMNA DERECHA (formulario) ── */}
        <div className="space-y-5 lg:col-span-2">

          {/* Datos del sitio */}
          <SectionCard title="Datos del sitio" icon={Building2}>
            <div className="space-y-4">
              <FieldGroup label="Tipo de sitio *" htmlFor="tipo-sitio">
                <Select value={selectedTipoSitio} onValueChange={setSelectedTipoSitio}>
                  <SelectTrigger
                    id="tipo-sitio"
                    className="border-emerald-200 bg-white focus:ring-emerald-400 dark:border-emerald-700/60 dark:bg-emerald-950/50"
                  >
                    <SelectValue placeholder="Selecciona…" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposSitio.map((t) => (
                      <SelectItem key={t.id_tipo_sitio} value={t.id_tipo_sitio.toString()}>
                        {t.nombre_tipo_sitio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldGroup>

              <FieldGroup label="Nombre del sitio *" htmlFor="nombre-sitio">
                <Input
                  id="nombre-sitio"
                  value={nombreSitio}
                  onChange={(e) => setNombreSitio(e.target.value)}
                  placeholder="Ej: Parque Santander"
                  minLength={3}
                  className="border-emerald-200 bg-white focus-visible:ring-emerald-400 dark:border-emerald-700/60 dark:bg-emerald-950/50"
                />
              </FieldGroup>

              <FieldGroup label="Dirección *" htmlFor="direccion">
                <Input
                  id="direccion"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ej: Carrera 7 #32-16"
                  minLength={6}
                  className="border-emerald-200 bg-white focus-visible:ring-emerald-400 dark:border-emerald-700/60 dark:bg-emerald-950/50"
                />
              </FieldGroup>
            </div>
          </SectionCard>

          {/* Contacto */}
          <SectionCard title="Contacto" icon={Phone}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FieldGroup label="Teléfono 1" htmlFor="telefono1">
                  <Input
                    id="telefono1"
                    value={telefono1}
                    onChange={(e) => setTelefono1(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="3001234567"
                    inputMode="numeric"
                    className="border-emerald-200 bg-white focus-visible:ring-emerald-400 dark:border-emerald-700/60 dark:bg-emerald-950/50"
                  />
                </FieldGroup>
                <FieldGroup label="Teléfono 2" htmlFor="telefono2">
                  <Input
                    id="telefono2"
                    value={telefono2}
                    onChange={(e) => setTelefono2(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="3109876543"
                    inputMode="numeric"
                    className="border-emerald-200 bg-white focus-visible:ring-emerald-400 dark:border-emerald-700/60 dark:bg-emerald-950/50"
                  />
                </FieldGroup>
              </div>

              <FieldGroup label="Sitio web" htmlFor="sitio-web">
                <div className="relative">
                  <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
                  <Input
                    id="sitio-web"
                    value={sitioWeb}
                    onChange={(e) => setSitioWeb(e.target.value)}
                    placeholder="https://ejemplo.com"
                    type="url"
                    className="border-emerald-200 bg-white pl-9 focus-visible:ring-emerald-400 dark:border-emerald-700/60 dark:bg-emerald-950/50"
                  />
                </div>
              </FieldGroup>
            </div>
          </SectionCard>

          {/* Botón de envío */}
          <Button
            type="button"
            onClick={handleSubmit as unknown as React.MouseEventHandler}
            disabled={loading || !selectedCoords}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold tracking-wide hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando sitio…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <MapPin className="h-4 w-4" />
                Guardar sitio
              </span>
            )}
          </Button>

          {!selectedCoords && (
            <p className="text-center text-xs text-emerald-500 dark:text-emerald-500">
              Selecciona un punto en el mapa para poder guardar
            </p>
          )}
        </div>
      </div>
    </div>
  )
}