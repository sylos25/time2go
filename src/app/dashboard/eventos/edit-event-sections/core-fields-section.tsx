import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Categoria, TipoEvento, Sitio, FormDataState, FormErrors } from "@/types/event-edit"

interface CoreFieldsSectionProps {
  formData: Pick<FormDataState, "nombre_evento" | "pulep_evento" | "responsable_evento" | "descripcion" | "id_categoria_evento" | "id_tipo_evento" | "id_sitio">
  formErrors: Partial<FormErrors>
  categories: Categoria[]
  eventTypes: TipoEvento[]
  sites: Sitio[]
  busquedaSitio: string
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onSitioInputChange: (value: string) => void
  onSelectSitio: (sitio: Sitio) => void
}

export function CoreFieldsSection({
  formData,
  formErrors,
  categories,
  eventTypes,
  sites,
  busquedaSitio,
  onInputChange,
  onSitioInputChange,
  onSelectSitio,
}: CoreFieldsSectionProps) {
  return (
    <>
      <div>
        <Label htmlFor="nombre_evento">Nombre del Evento</Label>
        <Input
          id="nombre_evento"
          name="nombre_evento"
          value={formData.nombre_evento}
          onChange={onInputChange}
          placeholder="Nombre del evento"
        />
        {formErrors.nombre_evento && <p className="text-xs text-red-600 mt-1">{formErrors.nombre_evento}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pulep_evento">PULEP del evento</Label>
          <Input
            id="pulep_evento"
            name="pulep_evento"
            value={formData.pulep_evento}
            onChange={onInputChange}
            placeholder="Codigo PULEP"
          />
          {formErrors.pulep_evento && <p className="text-xs text-red-600 mt-1">{formErrors.pulep_evento}</p>}
        </div>
        <div>
          <Label htmlFor="responsable_evento">Entidad responsable</Label>
          <Input
            id="responsable_evento"
            name="responsable_evento"
            value={formData.responsable_evento}
            onChange={onInputChange}
            placeholder="Nombre de la entidad responsable"
          />
          {formErrors.responsable_evento && <p className="text-xs text-red-600 mt-1">{formErrors.responsable_evento}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="id_categoria_evento">Categoria</Label>
          <select
            id="id_categoria_evento"
            name="id_categoria_evento"
            value={formData.id_categoria_evento}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecciona una categoria</option>
            {categories.map((cat) => (
              <option key={cat.id_categoria_evento || cat.id} value={cat.id_categoria_evento || cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
          {formErrors.id_categoria_evento && <p className="text-xs text-red-600 mt-1">{formErrors.id_categoria_evento}</p>}
        </div>
        <div>
          <Label htmlFor="id_tipo_evento">Tipo de Evento</Label>
          <select
            id="id_tipo_evento"
            name="id_tipo_evento"
            value={formData.id_tipo_evento}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecciona un tipo</option>
            {eventTypes.map((t) => (
              <option key={t.id_tipo_evento || t.id} value={t.id_tipo_evento || t.id}>{t.nombre}</option>
            ))}
          </select>
          {formErrors.id_tipo_evento && <p className="text-xs text-red-600 mt-1">{formErrors.id_tipo_evento}</p>}
        </div>
      </div>

      <div className="space-y-2 relative">
        <Label htmlFor="sitio">Sitio</Label>
        <Input
          id="sitio"
          value={busquedaSitio}
          onChange={(e) => onSitioInputChange(e.target.value)}
          placeholder="Escribe el nombre del sitio donde sera el evento"
          className="rounded-lg"
        />
        {formErrors.id_sitio && <p className="text-xs text-red-600 mt-1">{formErrors.id_sitio}</p>}
        {busquedaSitio.trim().length >= 2 && !formData.id_sitio && sites.length > 0 && (
          <ul className="absolute z-10 bg-card border border-border rounded-lg mt-1 w-full max-h-60 overflow-y-auto shadow-lg">
            {sites.map((sitio) => (
              <li
                key={sitio.id_sitio || sitio.id}
                onClick={() => onSelectSitio(sitio)}
                className="px-4 py-2 hover:bg-accent cursor-pointer"
              >
                {sitio.nombre_sitio || sitio.nombre}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripcion del evento</Label>
        <Textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={onInputChange}
          placeholder="Descripcion detallada del evento"
          className="rounded-xl min-h-[100px]"
        />
        {formErrors.descripcion && <p className="text-xs text-red-600 mt-1">{formErrors.descripcion}</p>}
      </div>
    </>
  )
}
