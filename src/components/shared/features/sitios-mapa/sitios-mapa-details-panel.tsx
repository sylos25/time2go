import { Building2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { TipoSitio } from "@/lib/sitios-mapa"

import { FieldGroup, SectionCard } from "./sitios-mapa-shared"

type SitiosMapaDetailsPanelProps = {
  tiposSitio: TipoSitio[]
  selectedTipoSitio: string
  nombreSitio: string
  direccion: string
  onSelectedTipoSitioChange: (value: string) => void
  onNombreSitioChange: (value: string) => void
  onDireccionChange: (value: string) => void
}

export function SitiosMapaDetailsPanel({
  tiposSitio,
  selectedTipoSitio,
  nombreSitio,
  direccion,
  onSelectedTipoSitioChange,
  onNombreSitioChange,
  onDireccionChange,
}: SitiosMapaDetailsPanelProps) {
  return (
    <SectionCard title="Datos del sitio" icon={Building2}>
      <div className="space-y-4">
        <FieldGroup label="Tipo de sitio *" htmlFor="tipo-sitio">
          <Select value={selectedTipoSitio} onValueChange={onSelectedTipoSitioChange}>
            <SelectTrigger
              id="tipo-sitio"
              className="border-emerald-200 bg-white focus:ring-emerald-400 dark:border-emerald-700/60 dark:bg-emerald-950/50"
            >
              <SelectValue placeholder="Selecciona..." />
            </SelectTrigger>
            <SelectContent>
              {tiposSitio.map((tipoSitio) => (
                <SelectItem key={tipoSitio.id_tipo_sitio} value={tipoSitio.id_tipo_sitio.toString()}>
                  {tipoSitio.nombre_tipo_sitio}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldGroup>

        <FieldGroup label="Nombre del sitio *" htmlFor="nombre-sitio">
          <Input
            id="nombre-sitio"
            value={nombreSitio}
            onChange={(event) => onNombreSitioChange(event.target.value)}
            placeholder="Ej: Parque Santander"
            minLength={3}
            className="border-emerald-200 bg-white focus-visible:ring-emerald-400 dark:border-emerald-700/60 dark:bg-emerald-950/50"
          />
        </FieldGroup>

        <FieldGroup label="Direccion *" htmlFor="direccion">
          <Input
            id="direccion"
            value={direccion}
            onChange={(event) => onDireccionChange(event.target.value)}
            placeholder="Ej: Carrera 7 #32-16"
            minLength={6}
            className="border-emerald-200 bg-white focus-visible:ring-emerald-400 dark:border-emerald-700/60 dark:bg-emerald-950/50"
          />
        </FieldGroup>
      </div>
    </SectionCard>
  )
}
