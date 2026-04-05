"use client"

import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { UseCreateEventFormReturn } from "@/hooks/use-create-event-form"

interface CreateEventContactScheduleSectionProps {
  form: UseCreateEventFormReturn
}

export function CreateEventContactScheduleSection({ form }: CreateEventContactScheduleSectionProps) {
  const {
    showTelefono2,
    today,
    formErrors,
    newEvent,
    setNewEvent,
    setShowTelefono2,
    clearFieldError,
  } = form

  return (
    <>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="telefono1" className="font-semibold text-green-700 leading-tight">Teléfono del organizador del evento</Label>
            <p className="text-xs text-muted-foreground">Número de contacto de 10 dígitos del organizador</p>
            <Input
              id="telefono1"
              value={newEvent.telefono1}
              onChange={(e) => {
                const value = e.target.value
                if (/^\d{0,10}$/.test(value)) {
                  clearFieldError("telefono1")
                  setNewEvent({ ...newEvent, telefono1: value })
                }
              }}
              placeholder="Teléfono 1"
              className="rounded-xl"
              maxLength={10}
              inputMode="numeric"
              pattern="\d*"
            />
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={newEvent.telefono_principal === "1"}
                onChange={() => setNewEvent({ ...newEvent, telefono_principal: "1" })}
                className="w-4 h-4"
              />
              Teléfono principal
            </label>
            {formErrors.telefono1 && <p className="text-xs text-red-600">{formErrors.telefono1}</p>}
          </div>

          {showTelefono2 && (
            <div className="space-y-2">
              <Label htmlFor="telefono2" className="font-semibold text-green-700 leading-tight">Segundo teléfono del organizador</Label>
              <p className="text-xs text-muted-foreground">Número de contacto alternativo de 10 dígitos</p>
              <Input
                id="telefono2"
                value={newEvent.telefono2 || ""}
                onChange={(e) => {
                  const value = e.target.value
                  if (/^\d{0,10}$/.test(value)) {
                    clearFieldError("telefono2")
                    setNewEvent({ ...newEvent, telefono2: value })
                  }
                }}
                placeholder="Teléfono 2"
                className="rounded-xl"
                maxLength={10}
                inputMode="numeric"
                pattern="\d*"
              />
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={newEvent.telefono_principal === "2"}
                  onChange={() => setNewEvent({ ...newEvent, telefono_principal: "2" })}
                  className="w-4 h-4"
                />
                Teléfono principal
              </label>
              {formErrors.telefono2 && <p className="text-xs text-red-600">{formErrors.telefono2}</p>}
            </div>
          )}

          {!showTelefono2 && <div className="hidden md:block" aria-hidden="true" />}
        </div>

        {!showTelefono2 && (
          <Button
            type="button"
            onClick={() => setShowTelefono2(true)}
            aria-label="Agregar segundo teléfono"
            title="Agregar segundo teléfono"
            className="inline-flex items-center gap-2 cursor-pointer rounded-md border px-3 py-2 bg-gradient-to-tr from-green-700 to-lime-500 text-white text-sm hover:bg-gradient-to-tr hover:from-green-600 hover:to-lime-400"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar segundo teléfono</span>
          </Button>
        )}

        {showTelefono2 && (
          <Button
            type="button"
            onClick={() => {
              setShowTelefono2(false)
              setNewEvent({ ...newEvent, telefono2: "", telefono_principal: "1" })
            }}
            aria-label="Quitar segundo teléfono"
            title="Quitar segundo teléfono"
            className="inline-flex items-center gap-2 cursor-pointer rounded-md border px-3 py-2 bg-gradient-to-tr from-fuchsia-700 to-red-500 text-white text-sm hover:bg-gradient-to-tr hover:from-fuchsia-600 hover:to-red-400"
          >
            <Trash2 className="h-4 w-4" />
            <span>Quitar segundo teléfono</span>
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fecha_inicio" className="font-semibold text-green-700">Fecha de inicio del evento</Label>
          <p className="text-xs text-muted-foreground">Día en que comienza el evento</p>
          <DatePicker
            id="fecha_inicio"
            selected={newEvent.fecha_inicio}
            onChange={(date) => {
              clearFieldError("fecha_inicio")
              setNewEvent({ ...newEvent, fecha_inicio: date })
            }}
            dateFormat="dd/MM/yyyy"
            minDate={today ?? undefined}
            placeholderText="01/01/2025"
            className="cursor-pointer w-75 rounded-xl border-border bg-card text-foreground shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
          />
          {formErrors.fecha_inicio && <p className="text-xs text-red-600">{formErrors.fecha_inicio}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fecha_final" className="font-semibold text-green-700">Fecha final del evento</Label>
          <p className="text-xs text-muted-foreground">Día en que finaliza el evento</p>
          <DatePicker
            id="fecha_final"
            selected={newEvent.fecha_final}
            onChange={(date) => {
              clearFieldError("fecha_final")
              setNewEvent({
                ...newEvent,
                fecha_final: date,
              })
            }}
            dateFormat="dd/MM/yyyy"
            minDate={newEvent.fecha_inicio || today || undefined}
            placeholderText="31/12/2025"
            className="cursor-pointer w-75 rounded-xl border-border bg-card text-foreground shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
          />
          {formErrors.fecha_final && <p className="text-xs text-red-600">{formErrors.fecha_final}</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="hora_inicio" className="font-semibold text-green-700">Hora de inicio</Label>
          <p className="text-xs text-muted-foreground">Hora a la que inicia el evento</p>
          <Input
            id="hora_inicio"
            type="time"
            value={newEvent.hora_inicio}
            onChange={(e) => {
              clearFieldError("hora_inicio")
              setNewEvent({ ...newEvent, hora_inicio: e.target.value })
            }}
            className="w-75 rounded-xl"
          />
          {formErrors.hora_inicio && <p className="text-xs text-red-600">{formErrors.hora_inicio}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="hora_final" className="font-semibold text-green-700">Hora final</Label>
          <p className="text-xs text-muted-foreground">Hora a la que finaliza el evento</p>
          <Input
            id="hora_final"
            type="time"
            value={newEvent.hora_final}
            onChange={(e) => {
              clearFieldError("hora_final")
              setNewEvent({ ...newEvent, hora_final: e.target.value })
            }}
            className="w-75 rounded-xl"
          />
          {formErrors.hora_final && <p className="text-xs text-red-600">{formErrors.hora_final}</p>}
        </div>
      </div>
    </>
  )
}
