"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Loader } from "lucide-react"

interface ToggleEventStatusModalProps {
  isOpen: boolean
  onClose: () => void
  event: any
  onSave: (updatedEvent: any) => Promise<void>
}

export function ToggleEventStatusModal({ isOpen, onClose, event, onSave }: ToggleEventStatusModalProps) {
  const [isSaving, setIsSaving] = useState(false)

  const isCurrentlyEnabled = event?.visibility || event?.estado

  const handleToggle = async () => {
    setIsSaving(true)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const headers: any = {}
      if (token) headers["Authorization"] = `Bearer ${token}`

      const response = await fetch(`/api/events/${event.id}/toggle-status`, {
        method: "PUT",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estado: !isCurrentlyEnabled,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update event status")
      }

      const updatedData = await response.json()
      await onSave(updatedData)
      onClose()
    } catch (err) {
      console.error("Error updating event status", err)
      alert("Error al cambiar el estado del evento")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar Estado del Evento</DialogTitle>
        </DialogHeader>

        <div className="py-6">
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Evento Actual:</p>
              <p className="text-lg font-semibold text-gray-900">{event?.name}</p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-600 mb-3">Estado Actual:</p>
              <div className="flex items-center gap-2">
                {isCurrentlyEnabled ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Validado/Activo</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-500">Inactivo/Deshabilitado</span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                {isCurrentlyEnabled
                  ? "¿Deseas inhabilitar este evento? Los usuarios no podrán verlo ni comprar entradas."
                  : "¿Deseas validar/habilitar este evento? Los usuarios podrán verlo y comprar entradas."}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            onClick={handleToggle}
            disabled={isSaving}
            className={isCurrentlyEnabled ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}
          >
            {isSaving ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                {isCurrentlyEnabled ? "Inhabilitando..." : "Habilitando..."}
              </>
            ) : isCurrentlyEnabled ? (
              "Inhabilitar Evento"
            ) : (
              "Validar/Habilitar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
