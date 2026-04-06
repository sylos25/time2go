import { Loader2, Navigation, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Departamento, Municipio } from "@/lib/sitios-mapa"

import { FieldGroup, SectionCard } from "./sitios-mapa-shared"

type SitiosMapaLocationPanelProps = {
  departamentos: Departamento[]
  filteredMunicipios: Municipio[]
  selectedDepartamento: string
  selectedMunicipio: string
  searchAddress: string
  isSearching: boolean
  onSelectedDepartamentoChange: (value: string) => void
  onSelectedMunicipioChange: (value: string) => void
  onSearchAddressChange: (value: string) => void
  onSearchAddress: () => void
}

export function SitiosMapaLocationPanel({
  departamentos,
  filteredMunicipios,
  selectedDepartamento,
  selectedMunicipio,
  searchAddress,
  isSearching,
  onSelectedDepartamentoChange,
  onSelectedMunicipioChange,
  onSearchAddressChange,
  onSearchAddress,
}: SitiosMapaLocationPanelProps) {
  return (
    <SectionCard title="Ubicacion" icon={Navigation}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldGroup label="Departamento" htmlFor="departamento">
          <Select value={selectedDepartamento} onValueChange={onSelectedDepartamentoChange}>
            <SelectTrigger
              id="departamento"
              className="border-emerald-200 bg-white focus:ring-emerald-400 dark:border-emerald-700/60 dark:bg-emerald-950/50"
            >
              <SelectValue placeholder="Selecciona..." />
            </SelectTrigger>
            <SelectContent>
              {departamentos.map((departamento) => (
                <SelectItem
                  key={departamento.id_departamento}
                  value={departamento.id_departamento.toString()}
                >
                  {departamento.nombre_departamento}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldGroup>

        <FieldGroup label="Municipio" htmlFor="municipio">
          <Select
            value={selectedMunicipio}
            onValueChange={onSelectedMunicipioChange}
            disabled={!selectedDepartamento}
          >
            <SelectTrigger
              id="municipio"
              className="border-emerald-200 bg-white focus:ring-emerald-400 disabled:opacity-50 dark:border-emerald-700/60 dark:bg-emerald-950/50"
            >
              <SelectValue
                placeholder={selectedDepartamento ? "Selecciona..." : "Primero elige un departamento"}
              />
            </SelectTrigger>
            <SelectContent>
              {filteredMunicipios.map((municipio) => (
                <SelectItem key={municipio.id_municipio} value={municipio.id_municipio.toString()}>
                  {municipio.nombre_municipio}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldGroup>
      </div>

      <div className="mt-4">
        <FieldGroup label="Buscar direccion" htmlFor="search-address">
          <div className="flex gap-2">
            <Input
              id="search-address"
              value={searchAddress}
              onChange={(event) => onSearchAddressChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  onSearchAddress()
                }
              }}
              placeholder="Ej: Carrera 7 #32-16"
              className="border-emerald-200 bg-white focus-visible:ring-emerald-400 dark:border-emerald-700/60 dark:bg-emerald-950/50"
            />
            <Button
              type="button"
              onClick={onSearchAddress}
              disabled={isSearching || !searchAddress.trim()}
              className="shrink-0 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </FieldGroup>
      </div>
    </SectionCard>
  )
}
