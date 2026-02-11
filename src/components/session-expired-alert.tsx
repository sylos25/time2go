"use client"

import { AlertCircle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { signOut } from "@/lib/auth-client"

interface SessionExpiredAlertProps {
  isOpen: boolean
  onClose: () => void
}

export function SessionExpiredAlert({
  isOpen,
  onClose,
}: SessionExpiredAlertProps) {
  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          // Redirigir al login después de cerrar sesión
          window.location.href = "/auth"
        },
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <DialogTitle>Sesión Expirada</DialogTitle>
          </div>
          <DialogDescription>
            Tu sesión ha expirado debido a inactividad. Por favor, inicia sesión nuevamente.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Por tu seguridad, las sesiones expiran después de 30 minutos de inactividad.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Permanecer en la página
          </Button>
          <Button onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Ir a iniciar sesión
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
