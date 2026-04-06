"use client"

import { Loader2 } from "lucide-react"

import {
  SitiosMapaContactPanel,
  SitiosMapaDetailsPanel,
  SitiosMapaLocationPanel,
  SitiosMapaMapPanel,
  SitiosMapaMessage,
  SitiosMapaSubmitButton,
} from "@/components/shared/features/sitios-mapa"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCreateSiteModal } from "@/hooks/use-create-site-modal"
import { sanitizePhone } from "@/lib/sitios-mapa"

interface CreateSiteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}

export function CreateSiteModal({ open, onOpenChange, onCreated }: CreateSiteModalProps) {
  const {
    departamentos,
    filteredMunicipios,
    tiposSitio,
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
    setSelectedMunicipio,
    setSelectedTipoSitio,
    setNombreSitio,
    setDireccion,
    setTelefono1,
    setTelefono2,
    setSitioWeb,
    setSearchAddress,
    handleDepartamentoChange,
    handleSearchAddress,
    handleMapClick,
    handleSubmit,
  } = useCreateSiteModal({
    open,
    onOpenChange,
    onCreated,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[120] w-[96vw] sm:w-[94vw] max-w-[1400px] sm:max-w-[1400px] h-[88vh] overflow-hidden overflow-x-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="text-pink-600">Agregar sitio del evento</DialogTitle>
        </DialogHeader>

        {loadingData ? (
          <div className="flex h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-2 text-green-700">Cargando datos...</span>
          </div>
        ) : (
          <div className="h-[calc(88vh-73px)] overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-6">
            <SitiosMapaMessage message={message} />

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5 lg:items-start">
              <div className="space-y-5 lg:col-span-3">
                <SitiosMapaLocationPanel
                  departamentos={departamentos}
                  filteredMunicipios={filteredMunicipios}
                  selectedDepartamento={selectedDepartamento}
                  selectedMunicipio={selectedMunicipio}
                  searchAddress={searchAddress}
                  isSearching={isSearching}
                  onSelectedDepartamentoChange={handleDepartamentoChange}
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
                  mapHeightClassName="h-[300px] md:h-[420px] lg:h-[560px]"
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

                <SitiosMapaSubmitButton
                  loading={loading}
                  disabled={!selectedCoords}
                  onClick={handleSubmit}
                  loadingText="Guardando sitio..."
                  idleText="Agregar Sitio"
                />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
