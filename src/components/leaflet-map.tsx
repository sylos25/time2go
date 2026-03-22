"use client"

import { useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default marker icon
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface Coordenadas {
  lat: number
  lng: number
}

interface LeafletMapProps {
  center: Coordenadas
  zoom: number
  selectedCoords: Coordenadas | null
  onMapClick: (coords: Coordenadas) => void
}

// Componente para manejar clicks en el mapa
function MapClickHandler({ onMapClick }: { onMapClick: (coords: Coordenadas) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

// Componente para centrar el mapa cuando cambian las coordenadas
function MapCenterHandler({ center, zoom }: { center: Coordenadas; zoom: number }) {
  const map = useMap()
  const prevCenterRef = useRef<Coordenadas>(center)
  const prevZoomRef = useRef<number>(zoom)

  useEffect(() => {
    if (
      prevCenterRef.current.lat !== center.lat ||
      prevCenterRef.current.lng !== center.lng ||
      prevZoomRef.current !== zoom
    ) {
      map.setView([center.lat, center.lng], zoom)
      prevCenterRef.current = center
      prevZoomRef.current = zoom
    }
  }, [map, center, zoom])

  return null
}

export default function LeafletMap({
  center,
  zoom,
  selectedCoords,
  onMapClick,
}: LeafletMapProps) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onMapClick={onMapClick} />
      <MapCenterHandler center={center} zoom={zoom} />
      {selectedCoords && (
        <Marker position={[selectedCoords.lat, selectedCoords.lng]} icon={icon} />
      )}
    </MapContainer>
  )
}
