"use client"

import { ChevronDown, Plus } from "lucide-react"
import { AdditionalInfoSection } from "@/components/events/create-event/additional-info-section"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { UseCreateEventFormReturn } from "@/hooks/use-create-event-form"

interface CreateEventBasicDetailsSectionProps {
  form: UseCreateEventFormReturn
  onOpenCreateSiteModal: () => void
}

export function CreateEventBasicDetailsSection({
  form,
  onOpenCreateSiteModal,
}: CreateEventBasicDetailsSectionProps) {
  const {
    categorias,
    tiposDeEvento,
    sitios,
    busquedaSitio,
    isSitiosOpen,
    formErrors,
    newEvent,
    setNewEvent,
    setBusquedaSitio,
    setIsSitiosOpen,
    clearFieldError,
    sanitizeAlphanumSpace,
    sanitizeTextWithPunct,
    handleCupoChange,
    addInfoItem,
    updateInfoItem,
    removeInfoItem,
  } = form

  return (
    <>
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-semibold text-green-700">Nombre del Evento</Label>
            <p className="text-xs text-muted-foreground">Nombre con el que se promocionará el evento</p>
            <Input
              id="title"
              value={newEvent.nombre_evento}
              onChange={(e) => {
                const value = sanitizeAlphanumSpace(e.target.value, 50)
                clearFieldError("nombre_evento")
                setNewEvent({ ...newEvent, nombre_evento: value })
              }}
              placeholder="Nombre del evento"
              className="rounded-xl"
              maxLength={50}
            />
            {formErrors.nombre_evento && <p className="text-xs text-red-600">{formErrors.nombre_evento}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pulep_evento" className="font-semibold text-green-700">
              PULEP del evento <span className="text-gray-400 font-normal">(opcional)</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              Portal Único de Espectáculos Públicos de las Artes Escénicas
            </p>
            <Input
              id="pulep_evento"
              value={newEvent.pulep_evento}
              onChange={(e) => {
                const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)
                clearFieldError("pulep_evento")
                setNewEvent({ ...newEvent, pulep_evento: value })
              }}
              placeholder="Código PULEP"
              className="rounded-xl"
              maxLength={8}
            />
            {formErrors.pulep_evento && <p className="text-xs text-red-600">{formErrors.pulep_evento}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="responsable_evento" className="font-semibold text-green-700">
              Entidad responsable <span className="text-gray-400 font-normal">(opcional)</span>
            </Label>
            <p className="text-xs text-muted-foreground">Nombre de la entidad jurídica a cargo del desarrollo del evento</p>
            <Input
              id="responsable_evento"
              value={newEvent.responsable_evento}
              onChange={(e) => {
                const value = sanitizeAlphanumSpace(e.target.value, 40)
                clearFieldError("responsable_evento")
                setNewEvent({ ...newEvent, responsable_evento: value })
              }}
              placeholder="Nombre de la entidad responsable"
              className="rounded-xl"
              maxLength={40}
            />
            {formErrors.responsable_evento && (
              <p className="text-xs text-red-600">{formErrors.responsable_evento}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="attendees" className="font-semibold text-green-700">Aforo del evento</Label>
            <p className="text-xs text-muted-foreground">Cantidad máxima de asistentes permitidos (entre 20 y 5000)</p>
            <Input
              id="attendees"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={newEvent.cupo === "" ? "" : newEvent.cupo}
              onChange={(e) => {
                clearFieldError("cupo")
                handleCupoChange(e.target.value)
              }}
              placeholder="100"
              className="rounded-xl"
            />
            {formErrors.cupo && <p className="text-xs text-red-600">{formErrors.cupo}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="id_tipo_evento" className="font-semibold text-green-700">Categoría del Evento</Label>
            <p className="text-xs text-muted-foreground">Clasificación general del evento</p>
            <Select
              value={String(newEvent.id_categoria_evento || 0)}
              onValueChange={(value) => {
                clearFieldError("id_categoria_evento")
                setNewEvent({ ...newEvent, id_categoria_evento: Number(value), id_tipo_evento: 0 })
              }}
            >
              <SelectTrigger className="w-80 rounded-xl cursor-pointer">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Selecciona una categoría</SelectItem>
                {categorias.map((cat) => (
                  <SelectItem
                    className="rounded-xl cursor-pointer"
                    key={cat.id_categoria_evento}
                    value={String(cat.id_categoria_evento)}
                  >
                    {cat.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.id_categoria_evento && (
              <p className="text-xs text-red-600">{formErrors.id_categoria_evento}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="font-semibold text-green-700">Tipo de Evento</Label>
            <p className="text-xs text-muted-foreground">Tipo específico dentro de la categoría seleccionada</p>
            <Select
              value={String(newEvent.id_tipo_evento || 0)}
              onValueChange={(value) => {
                clearFieldError("id_tipo_evento")
                setNewEvent({ ...newEvent, id_tipo_evento: Number(value) })
              }}
              disabled={!tiposDeEvento.length}
            >
              <SelectTrigger className="w-80 rounded-xl cursor-pointer">
                <SelectValue placeholder="Selecciona un tipo de evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">(Selecciona un tipo)</SelectItem>
                {tiposDeEvento.map((tipo) => (
                  <SelectItem
                    className="rounded-xl cursor-pointer"
                    key={tipo.id_tipo_evento}
                    value={String(tipo.id_tipo_evento)}
                  >
                    {tipo.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.id_tipo_evento && <p className="text-xs text-red-600">{formErrors.id_tipo_evento}</p>}
          </div>
        </div>

        <div className="space-y-2 relative">
          <Label htmlFor="sitio" className="font-semibold text-green-700">Sitio del evento</Label>
          <p className="text-xs text-muted-foreground">Lugar físico donde se realizará el evento</p>
          <div className="flex items-center gap-2">
            <Input
              id="sitio"
              value={busquedaSitio}
              onChange={(e) => {
                const value = e.target.value.slice(0, 50)
                clearFieldError("id_sitio")
                setBusquedaSitio(value)
                setNewEvent({ ...newEvent, id_sitio: 0 })
                setIsSitiosOpen(true)
              }}
              placeholder="Nombre del sitio del evento"
              className="rounded-xl"
              maxLength={50}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setIsSitiosOpen((prev) => !prev)}
              aria-expanded={isSitiosOpen}
              aria-controls="sitios-dropdown"
              className="shrink-0 rounded-xl"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${isSitiosOpen ? "rotate-180" : "rotate-0"}`} />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onOpenCreateSiteModal}
              aria-label="Agregar sitio"
              title="Agregar sitio"
              className="shrink-0 rounded-xl inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Sitio</span>
            </Button>
          </div>
          {formErrors.id_sitio && <p className="text-xs text-red-600">{formErrors.id_sitio}</p>}
          {isSitiosOpen && (
            <div
              id="sitios-dropdown"
              className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg"
            >
              {sitios.length > 0 ? (
                <ul className="max-h-60 overflow-y-auto">
                  {sitios.map((sitio) => {
                    const isSelected = newEvent.id_sitio === sitio.id_sitio

                    return (
                      <li
                        key={sitio.id_sitio}
                        onClick={() => {
                          setBusquedaSitio(sitio.nombre_sitio)
                          setNewEvent({ ...newEvent, id_sitio: sitio.id_sitio })
                          setIsSitiosOpen(false)
                        }}
                        className={`px-4 py-2 cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-accent text-accent-foreground font-medium"
                            : "hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        {sitio.nombre_sitio}
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  No se encontraron sitios para esa búsqueda.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="font-semibold text-green-700">Descripción del evento</Label>
        <p className="text-xs text-muted-foreground">
          Resumen visible para asistentes: {newEvent.descripcion.length}/200 caracteres (mínimo 10)
        </p>
        <Textarea
          id="description"
          value={newEvent.descripcion}
          onChange={(e) => {
            const value = sanitizeTextWithPunct(e.target.value, 200)
            clearFieldError("descripcion")
            setNewEvent({ ...newEvent, descripcion: value })
          }}
          placeholder="Descripción breve del evento"
          className="rounded-xl min-h-[100px]"
          maxLength={200}
        />
        {formErrors.descripcion && <p className="text-xs text-red-600">{formErrors.descripcion}</p>}
      </div>

      <AdditionalInfoSection
        items={newEvent.informacion_adicional_items || []}
        error={formErrors.informacion_adicional_items}
        onAdd={addInfoItem}
        onUpdate={updateInfoItem}
        onRemove={removeInfoItem}
        onClearError={() => clearFieldError("informacion_adicional_items")}
        sanitizeText={sanitizeTextWithPunct}
      />
    </>
  )
}
