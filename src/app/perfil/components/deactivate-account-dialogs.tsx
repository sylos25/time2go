import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  Database,
  Loader2,
  LogIn,
  ShieldAlert,
  UserX,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { getRoleBadgeClass } from "@/lib/role-badge"

import type { UserData } from "@/app/perfil/lib/profile-types"

type DeactivateAccountDialogsProps = {
  user: UserData
  deactivateOpen: boolean
  deactivateStep: 1 | 2
  deactivating: boolean
  deactivateError: string | null
  onClose: () => void
  onGoStep1: () => void
  onGoStep2: () => void
  onConfirmDeactivate: () => void
}

export function DeactivateAccountDialogs({
  user,
  deactivateOpen,
  deactivateStep,
  deactivating,
  deactivateError,
  onClose,
  onGoStep1,
  onGoStep2,
  onConfirmDeactivate,
}: DeactivateAccountDialogsProps) {
  return (
    <>
      <Dialog open={deactivateOpen && deactivateStep === 1} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md p-0 overflow-hidden gap-0">
          <div className="bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-800 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/60 flex items-center justify-center shrink-0">
                <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-red-800 dark:text-red-300">
                  ¿Desactivar tu cuenta?
                </DialogTitle>
                <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">
                  Lee con atención antes de continuar
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 space-y-3">
            {[
              {
                icon: LogIn,
                text: "Tu cuenta quedará inactiva de inmediato y no podrás iniciar sesión.",
              },
              {
                icon: Database,
                text: "Tus reservas y valoraciones seguirán existiendo en el sistema.",
              },
              {
                icon: CalendarClock,
                text: "Para reactivarla deberás contactar al soporte. El proceso puede tardar varios días hábiles.",
              },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-md bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-sm text-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 border-t border-border flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="border-green-600 dark:border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/40 hover:text-green-700 dark:hover:text-green-300 hover:scale-102 transition-transform">
              Cancelar
            </Button>
            <Button onClick={onGoStep2} className="bg-rose-600 hover:bg-rose-500 text-white hover:scale-102 transition-transform dark:bg-rose-700 dark:hover:bg-rose-600">
              Entiendo, continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deactivateOpen && deactivateStep === 2} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md p-0 overflow-hidden gap-0">
          <div className="bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-800 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/60 flex items-center justify-center shrink-0">
                <UserX className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-red-800 dark:text-red-300">Confirmación final</DialogTitle>
                <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">
                  Esta acción no se puede deshacer fácilmente
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-muted-foreground">Estás a punto de desactivar la siguiente cuenta:</p>

            <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {user.nombres} {user.apellidos}
              </p>
              <p className="text-xs text-muted-foreground">{user.correo}</p>
              {user.nombre_rol && (
                <span
                  className={`inline-block mt-1 px-2 py-0.5 ${getRoleBadgeClass(
                    user.nombre_rol,
                    user.id_rol
                  )} text-white text-xs font-medium rounded-full`}
                >
                  {user.nombre_rol}
                </span>
              )}
            </div>

            <p className="text-sm text-foreground font-medium">
              ¿Confirmas que deseas desactivar esta cuenta?
            </p>

            {deactivateError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-md border border-red-200 dark:border-red-900">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{deactivateError}</span>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-border flex justify-between gap-2">
            <Button
              variant="ghost"
              onClick={onGoStep1}
              disabled={deactivating}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
            <Button
              onClick={onConfirmDeactivate}
              disabled={deactivating}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deactivating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  Desactivando...
                </>
              ) : (
                <>
                  <UserX className="h-4 w-4 mr-1" />
                  Sí, desactivar
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}