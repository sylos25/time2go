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
import type { SessionEndReason } from "@/hooks/use-session-expiry"

interface SessionExpiredAlertProps {
  isOpen: boolean
  reason?: SessionEndReason
  onClose: () => void
}

export function SessionExpiredAlert({
  isOpen,
  reason = "expired",
  onClose,
}: SessionExpiredAlertProps) {
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" })
    } catch (error) {
      console.error("Logout request error:", error)
    } finally {
      localStorage.removeItem("token")
      localStorage.removeItem("userName")
      localStorage.removeItem("userPublicId")
      localStorage.removeItem("userRole")
      window.dispatchEvent(new CustomEvent("user:logout"))
      window.location.href = "/auth"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            <DialogTitle className="text-rose-700 dark:text-rose-400">{reason === "session_replaced" ? "Sesión Cerrada" : "Sesión Expirada"}</DialogTitle>
          </div>
          <DialogDescription>
            {reason === "session_replaced"
              ? "Tu cuenta inició sesión en otro dispositivo o navegador. Esta sesión se cerró por seguridad."
              : "Tu sesión ha expirado debido a inactividad. Por favor, inicia sesión nuevamente."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            {reason === "session_replaced"
              ? "Si no reconoces este acceso, cambia tu contraseña inmediatamente."
              : "Por tu seguridad, las sesiones expiran después de 30 minutos de inactividad."}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="gap-2 text-green-600 dark:text-green-400 border border-green-600 dark:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/40 hover:text-green-700 dark:hover:text-green-300 hover:scale-102 transition-transform">
            Permanecer en la página
          </Button>
          <Button onClick={handleLogout} className="gap-2 bg-rose-600 hover:bg-rose-500 text-white hover:scale-102 transition-transform">
            <LogOut className="h-4 w-4" />
            Ir a iniciar sesión
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
