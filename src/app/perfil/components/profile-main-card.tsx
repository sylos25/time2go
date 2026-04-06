import {
  AlertCircle,
  CheckCircle,
  Lock,
  Rat,
  ShieldAlert,
  UserX,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getRoleBadgeClass } from "@/lib/role-badge"

import type { UserData } from "@/app/perfil/lib/profile-types"

type ProfileMainCardProps = {
  user: UserData
  successMessage: string | null
  onOpenOrganizadorDialog: () => void
  onChangePassword: () => void
  onLogoutToHome: () => void
  onOpenDeactivate: () => void
}

export function ProfileMainCard({
  user,
  successMessage,
  onOpenOrganizadorDialog,
  onChangePassword,
  onLogoutToHome,
  onOpenDeactivate,
}: ProfileMainCardProps) {
  return (
    <div className="pt-32 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        <Card className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          <div
            className="h-32 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url(/images/banner_perfil.jpg)" }}
          />

          <div className="px-8 pb-8">
            <div className="flex items-end gap-6 mb-8 relative -mt-12">
              <div className="w-32 h-32 rounded-lg bg-card flex items-center justify-center border-4 border-green-700 shadow-lg">
                <Rat className="h-16 w-16 text-lime-500" />
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-tr from-green-600 to-lime-400 text-transparent bg-clip-text">
                      {user.nombres} {user.apellidos}
                    </h1>
                    <div className="flex items-center gap-4 mt-2">
                      {user.fecha_registro && (
                        <span className="text-muted-foreground text-sm">
                          Registrado el {new Date(user.fecha_registro).toLocaleDateString("es-ES")}
                        </span>
                      )}
                      <span
                        className={`inline-block px-3 py-1 ${getRoleBadgeClass(
                          user.nombre_rol,
                          user.id_rol
                        )} text-white text-sm font-medium rounded-full`}
                      >
                        {user.nombre_rol || "Usuario"}
                      </span>
                    </div>
                  </div>
                  {user.id_rol === 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onOpenOrganizadorDialog}
                      className="border-green-500 text-green-700 hover:scale-103 hover:bg-green-50 hover:text-green-800"
                    >
                      Organiza tus eventos
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-lime-500 mb-6">Informacion Personal</h2>

              <div className="border border-border rounded-lg p-5 hover:bg-accent hover:border-green-500 transition-colors">
                <p className="text-green-600 text-sm font-bold mb-1">NOMBRE COMPLETO</p>
                <p className="text-foreground text-lg font-medium">
                  {user.nombres} {user.apellidos}
                </p>
              </div>

              <div className="border border-border rounded-lg p-5 hover:bg-accent hover:border-green-500 transition-colors">
                <p className="text-green-700 text-sm font-bold mb-1">PAIS</p>
                <p className="text-foreground text-lg font-medium">{user.nombre_pais || "No especificado"}</p>
              </div>

              <div className="border border-border rounded-lg p-5 hover:bg-accent hover:border-green-500 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-green-700 text-sm font-bold mb-1">CORREO ELECTRONICO</p>
                    <p className="text-foreground text-lg font-medium break-all">{user.correo}</p>
                  </div>
                  <div className="flex-shrink-0 pt-2">
                    {user.validacion_correo ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">Validado</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-amber-600">
                        <AlertCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">Pendiente</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-5 hover:bg-accent hover:border-green-500 transition-colors">
                <p className="text-green-700 text-sm font-bold mb-1">NUMERO DE TELEFONO</p>
                <p className="text-foreground text-lg font-medium">
                  {user.telefono ? String(user.telefono) : "No registrado"}
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <Button
                onClick={onChangePassword}
                className="w-full bg-gradient-to-tr from-fuchsia-700 to-red-600 hover:from-fuchsia-600 hover:to-red-500 hover:scale-102 text-white font-medium flex items-center justify-center gap-2"
              >
                <Lock className="h-4 w-4" />
                Cambiar Contrasena
              </Button>
              <Button
                onClick={onLogoutToHome}
                variant="outline"
                className="w-full border-border text-foreground hover:bg-accent hover:scale-102 font-medium"
              >
                Volver al Inicio
              </Button>
            </div>

            <div className="mt-8 rounded-xl border border-red-200 dark:border-red-900/60 overflow-hidden">
              <div className="bg-red-50 dark:bg-red-950/30 px-5 py-3 flex items-center gap-2 border-b border-red-200 dark:border-red-900/60">
                <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">Zona de peligro</span>
              </div>
              <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-sm font-medium text-foreground">Desactivar cuenta</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Suspende el acceso de inmediato. Requiere solicitud manual para reactivar.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onOpenDeactivate}
                  className="shrink-0 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-500 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40 transition-colors"
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Desactivar mi cuenta
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}