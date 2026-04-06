import { useCallback, useEffect, useMemo, useState } from "react"

import {
  COLOMBIA_CENTER,
  DEFAULT_ZOOM,
  type Coordenadas,
  type Departamento,
  type Municipio,
  type SitiosMapaMessage,
  type TipoSitio,
  buildAddressQuery,
  fetchInitialCatalogs,
  fetchNextSitioId,
  geocodePlace,
  insertSitio,
  reverseGeocode,
} from "@/lib/sitios-mapa"

export function useSitiosMapaPage() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [tiposSitio, setTiposSitio] = useState<TipoSitio[]>([])

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
  const [loadingData, setLoadingData] = useState(true)
  const [message, setMessage] = useState<SitiosMapaMessage>(null)

  const filteredMunicipios = useMemo(() => {
    if (!selectedDepartamento) return []
    return municipios.filter((item) => item.id_departamento === Number(selectedDepartamento))
  }, [municipios, selectedDepartamento])

  useEffect(() => {
    let cancelled = false

    async function loadCatalogs() {
      try {
        const data = await fetchInitialCatalogs()
        if (cancelled) return

        setDepartamentos(data.departamentos)
        setMunicipios(data.municipios)
        setTiposSitio(data.tiposSitio)
      } catch (error) {
        console.error("Error cargando datos:", error)
      } finally {
        if (!cancelled) {
          setLoadingData(false)
          setIsMapReady(true)
        }
      }
    }

    void loadCatalogs()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setSelectedMunicipio("")
  }, [selectedDepartamento])

  useEffect(() => {
    if (!selectedMunicipio || !selectedDepartamento) return

    const municipio = municipios.find((item) => item.id_municipio === Number(selectedMunicipio))
    const departamento = departamentos.find((item) => item.id_departamento === Number(selectedDepartamento))
    if (!municipio || !departamento) return
    const municipioNombre = municipio.nombre_municipio
    const departamentoNombre = departamento.nombre_departamento

    let cancelled = false

    async function centerMapByMunicipio() {
      try {
        const data = await geocodePlace(`${municipioNombre}, ${departamentoNombre}, Colombia`, 1)

        if (cancelled || !data?.[0]) return

        setMapCenter({ lat: Number.parseFloat(data[0].lat), lng: Number.parseFloat(data[0].lon) })
        setMapZoom(13)
      } catch (error) {
        console.error(error)
      }
    }

    void centerMapByMunicipio()

    return () => {
      cancelled = true
    }
  }, [selectedMunicipio, selectedDepartamento, municipios, departamentos])

  const handleSearchAddress = useCallback(async () => {
    if (!searchAddress.trim()) return

    setIsSearching(true)
    try {
      const query = buildAddressQuery({
        searchAddress,
        municipios,
        selectedMunicipio,
      })

      const data = await geocodePlace(query, 1)

      if (!data?.[0]) {
        setMessage({ type: "error", text: "No se encontro la direccion. Intenta con otra busqueda." })
        return
      }

      const coords = {
        lat: Number.parseFloat(data[0].lat),
        lng: Number.parseFloat(data[0].lon),
      }

      setSelectedCoords(coords)
      setMapCenter(coords)
      setMapZoom(17)
      setDireccion(data[0].display_name.split(",")[0] || searchAddress)
    } catch {
      setMessage({ type: "error", text: "Error al buscar la direccion." })
    } finally {
      setIsSearching(false)
    }
  }, [municipios, searchAddress, selectedMunicipio])

  const handleMapClick = useCallback(async (coords: Coordenadas) => {
    setSelectedCoords(coords)
    setMessage(null)

    try {
      const data = await reverseGeocode(coords)
      if (!data?.address) return

      const address = data.address
      const base = address.road || address.pedestrian || address.neighbourhood || address.suburb || ""
      if (base) {
        setDireccion(`${base}${address.house_number ? " #" + address.house_number : ""}`)
      }
    } catch (error) {
      console.error(error)
    }
  }, [])

  const handleSubmit = useCallback(async () => {
    setMessage(null)

    if (!selectedCoords) {
      setMessage({ type: "error", text: "Selecciona un punto en el mapa." })
      return
    }
    if (!selectedMunicipio) {
      setMessage({ type: "error", text: "Selecciona un municipio." })
      return
    }
    if (!selectedTipoSitio) {
      setMessage({ type: "error", text: "Selecciona un tipo de sitio." })
      return
    }
    if (nombreSitio.trim().length < 3) {
      setMessage({ type: "error", text: "El nombre debe tener al menos 3 caracteres." })
      return
    }
    if (direccion.trim().length < 6) {
      setMessage({ type: "error", text: "La direccion debe tener al menos 6 caracteres." })
      return
    }

    setLoading(true)
    try {
      const nextId = await fetchNextSitioId()
      const response = await insertSitio({
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
      })

      if (!response.ok) {
        setMessage({ type: "error", text: response.result.error || "Error al guardar el sitio." })
        return
      }

      setMessage({ type: "success", text: "Sitio agregado exitosamente." })
      setNombreSitio("")
      setDireccion("")
      setTelefono1("")
      setTelefono2("")
      setSitioWeb("")
      setSelectedCoords(null)
      setSearchAddress("")
    } catch (error) {
      setMessage({
        type: "error",
        text: `Error: ${error instanceof Error ? error.message : "Error desconocido"}`,
      })
    } finally {
      setLoading(false)
    }
  }, [
    direccion,
    nombreSitio,
    selectedCoords,
    selectedMunicipio,
    selectedTipoSitio,
    sitioWeb,
    telefono1,
    telefono2,
  ])

  return {
    departamentos,
    tiposSitio,
    filteredMunicipios,
    selectedDepartamento,
    selectedMunicipio,
    selectedTipoSitio,
    nombreSitio,
    direccion,
    telefono1,
    telefono2,
    sitioWeb,
    selectedCoords,
    mapCenter,
    mapZoom,
    isMapReady,
    searchAddress,
    isSearching,
    loading,
    loadingData,
    message,
    setSelectedDepartamento,
    setSelectedMunicipio,
    setSelectedTipoSitio,
    setNombreSitio,
    setDireccion,
    setTelefono1,
    setTelefono2,
    setSitioWeb,
    setSearchAddress,
    handleSearchAddress,
    handleMapClick,
    handleSubmit,
  }
}
