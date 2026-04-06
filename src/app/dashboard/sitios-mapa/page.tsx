"use client"

import { Loader2 } from "lucide-react"

import {
  SitiosMapaContactPanel,
  SitiosMapaDetailsPanel,
  SitiosMapaHero,
  SitiosMapaLocationPanel,
  SitiosMapaMapPanel,
  SitiosMapaMessage,
  SitiosMapaSubmitButton,
} from "@/components/shared/features/sitios-mapa"
import { useSitiosMapaPage } from "@/hooks/use-sitios-mapa-page"
import { sanitizePhone } from "@/lib/sitios-mapa"

export default function SitiosMapaPage() {
  const {
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
  } = useSitiosMapaPage()

  if (loadingData) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-sm text-emerald-700 dark:text-emerald-400">Cargando datos...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <SitiosMapaHero />

      <SitiosMapaMessage message={message} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          <SitiosMapaLocationPanel
            departamentos={departamentos}
            filteredMunicipios={filteredMunicipios}
            selectedDepartamento={selectedDepartamento}
            selectedMunicipio={selectedMunicipio}
            searchAddress={searchAddress}
            isSearching={isSearching}
            onSelectedDepartamentoChange={setSelectedDepartamento}
            onSelectedMunicipioChange={setSelectedMunicipio}
            onSearchAddressChange={setSearchAddress}
            onSearchAddress={handleSearchAddress}
          />

          <SitiosMapaMapPanel
            isMapReady={isMapReady}
            mapCenter={mapCenter}
            mapZoom={mapZoom}
            selectedCoords={selectedCoords}
            onMapClick={handleMapClick}
          />
        </div>

        <div className="space-y-5 lg:col-span-2">
          <SitiosMapaDetailsPanel
            tiposSitio={tiposSitio}
            selectedTipoSitio={selectedTipoSitio}
            nombreSitio={nombreSitio}
            direccion={direccion}
            onSelectedTipoSitioChange={setSelectedTipoSitio}
            onNombreSitioChange={setNombreSitio}
            onDireccionChange={setDireccion}
          />

          <SitiosMapaContactPanel
            telefono1={telefono1}
            telefono2={telefono2}
            sitioWeb={sitioWeb}
            onTelefono1Change={(value) => setTelefono1(sanitizePhone(value))}
            onTelefono2Change={(value) => setTelefono2(sanitizePhone(value))}
            onSitioWebChange={setSitioWeb}
          />

          <SitiosMapaSubmitButton loading={loading} disabled={!selectedCoords} onClick={handleSubmit} />

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