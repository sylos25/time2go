export type Departamento = {
  id_departamento: number
  nombre_departamento: string
}

export type Municipio = {
  id_municipio: number
  nombre_municipio: string
  id_departamento: number
}

export type TipoSitio = {
  id_tipo_sitio: number
  nombre_tipo_sitio: string
}

export type Coordenadas = {
  lat: number
  lng: number
}

export type SitiosMapaMessage = {
  type: "success" | "error"
  text: string
} | null

export const COLOMBIA_CENTER: Coordenadas = { lat: 4.5709, lng: -74.2973 }
export const DEFAULT_ZOOM = 6

export function sanitizePhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 10)
}

export function buildAddressQuery(params: {
  searchAddress: string
  municipios: Municipio[]
  selectedMunicipio: string
}) {
  const municipioName = params.selectedMunicipio
    ? params.municipios.find((item) => item.id_municipio === Number(params.selectedMunicipio))?.nombre_municipio
    : null

  if (municipioName) {
    return `${params.searchAddress}, ${municipioName}, Colombia`
  }

  return `${params.searchAddress}, Colombia`
}

export async function fetchInitialCatalogs() {
  const [departamentosRes, municipiosRes, tiposRes] = await Promise.all([
    fetch("/api/departamentos"),
    fetch("/api/municipios"),
    fetch("/api/tipo-sitios"),
  ])

  const departamentosData = departamentosRes.ok ? await departamentosRes.json().catch(() => ({})) : {}
  const municipiosData = municipiosRes.ok ? await municipiosRes.json().catch(() => ({})) : {}
  const tiposData = tiposRes.ok ? await tiposRes.json().catch(() => ({})) : {}

  return {
    departamentos: (departamentosData.departamentos || departamentosData || []) as Departamento[],
    municipios: (municipiosData.municipios || municipiosData || []) as Municipio[],
    tiposSitio: (tiposData.tipos || tiposData || []) as TipoSitio[],
  }
}

export async function geocodePlace(query: string, limit = 1) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=${limit}`
  )

  return response.json().catch(() => []) as Promise<Array<{ lat: string; lon: string; display_name: string }>>
}

export async function reverseGeocode(coords: Coordenadas) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`
  )

  return response.json().catch(() => ({})) as Promise<{
    address?: {
      road?: string
      pedestrian?: string
      neighbourhood?: string
      suburb?: string
      house_number?: string
    }
  }>
}

export async function fetchNextSitioId() {
  const response = await fetch("/api/sitios/next-id")
  if (!response.ok) {
    return 1
  }

  const data = await response.json().catch(() => ({}))
  return Number(data.nextId || 1)
}

export async function insertSitio(payload: {
  id_sitio: number
  nombre_sitio: string
  id_tipo_sitio: number
  id_municipio: number
  direccion: string
  latitud: string
  longitud: string
  telefono_1: string | null
  telefono_2: string | null
  sitio_web: string | null
}) {
  const response = await fetch("/api/admin/insert-data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      table: "sitios",
      data: payload,
    }),
  })

  const result = await response.json().catch(() => ({}))
  return {
    ok: response.ok,
    result,
  }
}
