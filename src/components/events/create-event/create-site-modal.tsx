"use client"

import { useCallback, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MapPin,
  Search,
  Navigation,
  Building2,
  Phone,
  Globe,
} from "lucide-react"

const LeafletMap = dynamic(() => import("@/components/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-lime-50">
      <Loader2 className="h-6 w-6 animate-spin text-green-600" />
    </div>
  ),
})

/* ─── Types ─────────────────────────────────────────────────────── */
interface Departamento { id_departamento: number; nombre_departamento: string }
interface Municipio { id_municipio: number; nombre_municipio: string; id_departamento: number }
interface TipoSitio { id_tipo_sitio: number; nombre_tipo_sitio: string }
interface Coordenadas { lat: number; lng: number }
interface CreateSiteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}

const COLOMBIA_CENTER: Coordenadas = { lat: 4.5709, lng: -74.2973 }
const DEFAULT_ZOOM = 6

/* ─── Helpers ───────────────────────────────────────────────────── */
function FieldGroup({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-bold uppercase tracking-widest text-green-700">
        {label}
      </Label>
      {children}
    </div>
  )
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-green-100 bg-white shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-green-100 px-5 py-3">
        <Icon className="h-4 w-4 text-green-600" />
        <span className="text-xs font-bold uppercase tracking-widest text-green-700">{title}</span>
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </div>
  )
}

const inputCls = "rounded-xl border-green-200 bg-white focus-visible:ring-green-400"
const selectTriggerCls = "rounded-xl border-green-200 bg-white focus:ring-green-400"

/* ─── Component ─────────────────────────────────────────────────── */
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
    setLoadingData(true)
    Promise.all([fetch("/api/departamentos"), fetch("/api/municipios"), fetch("/api/tipo-sitios")])
      .then(async ([deptRes, munRes, tipoRes]) => {
        if (deptRes.ok) { const d = await deptRes.json(); setDepartamentos(d.departamentos || d || []) }
        if (munRes.ok)  { const m = await munRes.json();  setMunicipios(m.municipios || m || []) }
        if (tipoRes.ok) { const t = await tipoRes.json(); setTiposSitio(t.tipos || t || []) }
      })
      .catch(console.error)
      .finally(() => { setLoadingData(false); setIsMapReady(true) })
  }, [open])

  const handleDepartamentoChange = (value: string) => {
    setSelectedDepartamento(value)
    setSelectedMunicipio("")
    setFilteredMunicipios(value ? municipios.filter((m) => String(m.id_departamento) === value) : [])
  }

  useEffect(() => {
    if (!selectedMunicipio || !selectedDepartamento) return
    const mun = municipios.find((m) => m.id_municipio === Number(selectedMunicipio))
    const dep = departamentos.find((d) => d.id_departamento === Number(selectedDepartamento))
    if (!mun || !dep) return
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${mun.nombre_municipio}, ${dep.nombre_departamento}, Colombia`)}&limit=1`)
      .then((r) => r.json())
      .then((data) => { if (data?.[0]) { setMapCenter({ lat: Number(data[0].lat), lng: Number(data[0].lon) }); setMapZoom(13) } })
      .catch(console.error)
  }, [selectedMunicipio, selectedDepartamento, municipios, departamentos])

  const handleSearchAddress = async () => {
    if (!searchAddress.trim()) return
    setIsSearching(true)
    try {
      const munName = selectedMunicipio ? municipios.find((m) => m.id_municipio === Number(selectedMunicipio))?.nombre_municipio : null
      const data = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(munName ? `${searchAddress}, ${munName}, Colombia` : `${searchAddress}, Colombia`)}&limit=1`).then((r) => r.json())
      if (data?.[0]) {
        const coords = { lat: Number(data[0].lat), lng: Number(data[0].lon) }
        setSelectedCoords(coords); setMapCenter(coords); setMapZoom(17)
        setDireccion(data[0].display_name.split(",")[0] || searchAddress)
      } else {
        setMessage({ type: "error", text: "No se encontró la dirección." })
      }
    } catch { setMessage({ type: "error", text: "Error al buscar la dirección." }) }
    finally { setIsSearching(false) }
  }

  const handleMapClick = useCallback((coords: Coordenadas) => {
    setSelectedCoords(coords); setMessage(null)
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data?.address) return
        const a = data.address
        const base = a.road || a.pedestrian || a.neighbourhood || a.suburb || ""
        if (base) setDireccion(`${base}${a.house_number ? " #" + a.house_number : ""}`)
      })
      .catch(console.error)
  }, [])

  const resetForm = () => {
    setSelectedDepartamento(""); setSelectedMunicipio(""); setSelectedTipoSitio("")
    setNombreSitio(""); setDireccion(""); setTelefono1(""); setTelefono2(""); setSitioWeb("")
    setSelectedCoords(null); setMapCenter(COLOMBIA_CENTER); setMapZoom(DEFAULT_ZOOM)
    setSearchAddress(""); setMessage(null)
  }

  const handleSubmit = async () => {
    setMessage(null)
    if (!selectedCoords)    return setMessage({ type: "error", text: "Selecciona un punto en el mapa." })
    if (!selectedMunicipio) return setMessage({ type: "error", text: "Selecciona un municipio." })
    if (!selectedTipoSitio) return setMessage({ type: "error", text: "Selecciona un tipo de sitio." })
    if (nombreSitio.trim().length < 3) return setMessage({ type: "error", text: "El nombre debe tener al menos 3 caracteres." })
    if (direccion.trim().length < 6)   return setMessage({ type: "error", text: "La dirección debe tener al menos 6 caracteres." })
    setLoading(true)
    try {
      const idRes = await fetch("/api/sitios/next-id")
      const nextId = idRes.ok ? ((await idRes.json()).nextId || 1) : 1
      const response = await fetch("/api/admin/insert-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: "sitios",
          data: {
            id_sitio: nextId, nombre_sitio: nombreSitio.trim(),
            id_tipo_sitio: Number(selectedTipoSitio), id_municipio: Number(selectedMunicipio),
            direccion: direccion.trim(), latitud: selectedCoords.lat.toFixed(8), longitud: selectedCoords.lng.toFixed(8),
            telefono_1: telefono1 || null, telefono_2: telefono2 || null, sitio_web: sitioWeb || null,
          },
        }),
      })
      const result = await response.json()
      if (!response.ok) { setMessage({ type: "error", text: result.error || "Error al agregar el sitio." }); return }
      onCreated?.(); resetForm(); onOpenChange(false)
    } catch (err) {
      setMessage({ type: "error", text: `Error: ${err instanceof Error ? err.message : "Error desconocido"}` })
    } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[120] flex h-[95vh] w-[98vw] max-w-[95vw] sm:max-w-[1600px] flex-col gap-0 overflow-hidden p-0 sm:w-[96vw]">

        {/* ── Header verde del sistema ── */}
        <DialogHeader className="relative z-10 shrink-0 overflow-hidden bg-gradient-to-r from-green-600 to-lime-500 px-7 py-5">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-lime-300/20 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/25 shadow-inner backdrop-blur-sm">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white" style={{ fontFamily: "'Futura', 'Trebuchet MS', sans-serif" }}>
                Agregar sitio del evento
              </DialogTitle>
              <p className="text-sm text-green-100">Selecciona la ubicación en el mapa y completa los datos</p>
            </div>
          </div>
        </DialogHeader>

        {/* ── Cuerpo ── */}
        {loadingData ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <p className="text-sm text-green-700">Cargando datos…</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50/60 px-6 py-6 sm:px-8">

            {message && (
              <div className={`mb-5 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-medium ${
                message.type === "success"
                  ? "border-lime-200 bg-lime-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}>
                {message.type === "success"
                  ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                  : <AlertCircle  className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />}
                {message.text}
              </div>
            )}

            {/* Grid — columna del mapa más ancha */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.7fr_1fr] lg:items-start">

              {/* ── Izquierda: mapa ── */}
              <div className="space-y-5">
                <SectionCard title="Ubicación" icon={Navigation}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FieldGroup label="Departamento" htmlFor="modal-dept">
                      <Select value={selectedDepartamento} onValueChange={handleDepartamentoChange}>
                        <SelectTrigger id="modal-dept" className={selectTriggerCls}>
                          <SelectValue placeholder="Selecciona…" />
                        </SelectTrigger>
                        <SelectContent className="z-[150]">
                          {departamentos.map((d) => (
                            <SelectItem key={d.id_departamento} value={d.id_departamento.toString()}>
                              {d.nombre_departamento}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FieldGroup>

                    <FieldGroup label="Municipio" htmlFor="modal-mun">
                      <Select value={selectedMunicipio} onValueChange={setSelectedMunicipio} disabled={!selectedDepartamento}>
                        <SelectTrigger id="modal-mun" className={`${selectTriggerCls} disabled:opacity-50`}>
                          <SelectValue placeholder={selectedDepartamento ? "Selecciona…" : "Primero elige un departamento"} />
                        </SelectTrigger>
                        <SelectContent className="z-[150]">
                          {filteredMunicipios.map((m) => (
                            <SelectItem key={m.id_municipio} value={m.id_municipio.toString()}>
                              {m.nombre_municipio}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FieldGroup>
                  </div>

                  <FieldGroup label="Buscar dirección" htmlFor="modal-search">
                    <div className="flex gap-2">
                      <Input
                        id="modal-search"
                        value={searchAddress}
                        onChange={(e) => setSearchAddress(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearchAddress()}
                        placeholder="Ej: Carrera 7 #32-16"
                        className={inputCls}
                      />
                      <button
                        type="button"
                        onClick={handleSearchAddress}
                        disabled={isSearching || !searchAddress.trim()}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-green-200 bg-white text-green-600 transition hover:bg-lime-50 disabled:opacity-50"
                      >
                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      </button>
                    </div>
                  </FieldGroup>
                </SectionCard>

                {/* Mapa grande */}
                <div className="overflow-hidden rounded-2xl border border-green-100 shadow-sm">
                  <div className="relative h-[360px] w-full md:h-[480px] lg:h-[540px]">
                    {isMapReady && (
                      <LeafletMap
                        center={mapCenter}
                        zoom={mapZoom}
                        selectedCoords={selectedCoords}
                        onMapClick={handleMapClick}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2 bg-lime-50 px-4 py-2.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-green-600" />
                    <span className="text-xs font-medium text-green-700">
                      {selectedCoords
                        ? `${selectedCoords.lat.toFixed(6)}, ${selectedCoords.lng.toFixed(6)}`
                        : "Haz clic en el mapa para seleccionar la ubicación"}
                    </span>
                  </div>
                </div>

                {selectedCoords && (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Latitud",  value: selectedCoords.lat.toFixed(8) },
                      { label: "Longitud", value: selectedCoords.lng.toFixed(8) },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-xl border border-green-100 bg-lime-50 px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-green-500">{label}</p>
                        <p className="mt-0.5 font-mono text-sm font-semibold text-green-800">{value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Derecha: formulario ── */}
              <div className="space-y-5">
                <SectionCard title="Datos del sitio" icon={Building2}>
                  <FieldGroup label="Tipo de sitio *" htmlFor="modal-tipo">
                    <Select value={selectedTipoSitio} onValueChange={setSelectedTipoSitio}>
                      <SelectTrigger id="modal-tipo" className={selectTriggerCls}>
                        <SelectValue placeholder="Selecciona…" />
                      </SelectTrigger>
                      <SelectContent className="z-[150]">
                        {tiposSitio.map((t) => (
                          <SelectItem key={t.id_tipo_sitio} value={t.id_tipo_sitio.toString()}>
                            {t.nombre_tipo_sitio}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldGroup>

                  <FieldGroup label="Nombre del sitio *" htmlFor="modal-nombre">
                    <Input id="modal-nombre" value={nombreSitio} onChange={(e) => setNombreSitio(e.target.value)}
                      placeholder="Ej: Parque Santander" minLength={3} className={inputCls} />
                  </FieldGroup>

                  <FieldGroup label="Dirección *" htmlFor="modal-dir">
                    <Input id="modal-dir" value={direccion} onChange={(e) => setDireccion(e.target.value)}
                      placeholder="Ej: Carrera 7 #32-16" minLength={6} className={inputCls} />
                  </FieldGroup>
                </SectionCard>

                <SectionCard title="Contacto" icon={Phone}>
                  <div className="grid grid-cols-2 gap-3">
                    <FieldGroup label="Teléfono 1" htmlFor="modal-tel1">
                      <Input id="modal-tel1" value={telefono1}
                        onChange={(e) => setTelefono1(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="3001234567" inputMode="numeric" className={inputCls} />
                    </FieldGroup>
                    <FieldGroup label="Teléfono 2" htmlFor="modal-tel2">
                      <Input id="modal-tel2" value={telefono2}
                        onChange={(e) => setTelefono2(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="3109876543" inputMode="numeric" className={inputCls} />
                    </FieldGroup>
                  </div>

                  <FieldGroup label="Sitio web" htmlFor="modal-web">
                    <div className="relative">
                      <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-400" />
                      <Input id="modal-web" value={sitioWeb} onChange={(e) => setSitioWeb(e.target.value)}
                        placeholder="https://ejemplo.com" type="url" className={`${inputCls} pl-9`} />
                    </div>
                  </FieldGroup>
                </SectionCard>

                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !selectedCoords}
                  className="w-full rounded-xl bg-gradient-to-r from-green-600 to-lime-500 py-3 text-sm font-semibold text-white shadow-sm hover:from-green-700 hover:to-lime-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Guardando sitio…
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <MapPin className="h-4 w-4" /> Guardar sitio
                    </span>
                  )}
                </Button>

                {!selectedCoords && (
                  <p className="text-center text-xs text-green-500">
                    Selecciona un punto en el mapa para poder guardar
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}