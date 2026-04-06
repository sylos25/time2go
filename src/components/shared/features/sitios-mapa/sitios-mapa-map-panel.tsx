import dynamic from "next/dynamic"
import { Loader2, MapPin } from "lucide-react"

import type { Coordenadas } from "@/lib/sitios-mapa"

const LeafletMap = dynamic(() => import("@/components/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-emerald-50 dark:bg-emerald-950/40">
      <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
    </div>
  ),
})

type SitiosMapaMapPanelProps = {
  isMapReady: boolean
  mapCenter: Coordenadas
  mapZoom: number
  selectedCoords: Coordenadas | null
  onMapClick: (coords: Coordenadas) => void
  mapHeightClassName?: string
}

export function SitiosMapaMapPanel({
  isMapReady,
  mapCenter,
  mapZoom,
  selectedCoords,
  onMapClick,
  mapHeightClassName = "h-[380px]",
}: SitiosMapaMapPanelProps) {
  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-emerald-100 shadow-sm dark:border-emerald-800/40">
        <div className={`relative w-full ${mapHeightClassName}`}>
          {isMapReady && (
            <LeafletMap
              center={mapCenter}
              zoom={mapZoom}
              selectedCoords={selectedCoords}
              onMapClick={onMapClick}
            />
          )}
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2.5 dark:bg-emerald-950/50">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
            {selectedCoords
              ? `${selectedCoords.lat.toFixed(6)}, ${selectedCoords.lng.toFixed(6)}`
              : "Haz clic en el mapa para seleccionar la ubicacion"}
          </span>
        </div>
      </div>

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
    </>
  )
}
