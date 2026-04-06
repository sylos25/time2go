import { Globe, Phone } from "lucide-react"

import { Input } from "@/components/ui/input"

import { FieldGroup, SectionCard } from "./sitios-mapa-shared"

type SitiosMapaContactPanelProps = {
  telefono1: string
  telefono2: string
  sitioWeb: string
  onTelefono1Change: (value: string) => void
  onTelefono2Change: (value: string) => void
  onSitioWebChange: (value: string) => void
}

export function SitiosMapaContactPanel({
  telefono1,
  telefono2,
  sitioWeb,
  onTelefono1Change,
  onTelefono2Change,
  onSitioWebChange,
}: SitiosMapaContactPanelProps) {
  return (
    <SectionCard title="Contacto" icon={Phone}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FieldGroup label="Telefono 1" htmlFor="telefono1">
            <Input
              id="telefono1"
              value={telefono1}
              onChange={(event) => onTelefono1Change(event.target.value)}
              placeholder="3001234567"
              inputMode="numeric"
              className="border-emerald-200 bg-white focus-visible:ring-emerald-400 dark:border-emerald-700/60 dark:bg-emerald-950/50"
            />
          </FieldGroup>
          <FieldGroup label="Telefono 2" htmlFor="telefono2">
            <Input
              id="telefono2"
              value={telefono2}
              onChange={(event) => onTelefono2Change(event.target.value)}
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
              onChange={(event) => onSitioWebChange(event.target.value)}
              placeholder="https://ejemplo.com"
              type="url"
              className="border-emerald-200 bg-white pl-9 focus-visible:ring-emerald-400 dark:border-emerald-700/60 dark:bg-emerald-950/50"
            />
          </div>
        </FieldGroup>
      </div>
    </SectionCard>
  )
}
