import { CheckCircle, Loader2, UserX, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { UserRow } from "@/lib/dashboard-users"

type UsersTableProps = {
  users: UserRow[]
  updatingUserId: number | null
  onBan: (user: UserRow) => void
  onValidate: (idUsuario: number) => void
}

export function UsersTable({ users, updatingUserId, onBan, onValidate }: UsersTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-lime-200/70 bg-white/85 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-950/35">
      <div className="overflow-x-auto">
        <table className="table-fixed w-full border-collapse">
          <thead className="bg-green-500 dark:bg-emerald-700">
            <tr>
              <th className="w-32 border-r border-lime-200/35 px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-white/95 dark:border-emerald-300/20">Rol</th>
              <th className="w-36 border-r border-lime-200/35 px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-white/95 dark:border-emerald-300/20">Acceso con Google</th>
              <th className="w-40 border-r border-lime-200/35 px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-white/95 dark:border-emerald-300/20">Nombres</th>
              <th className="w-40 border-r border-lime-200/35 px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-white/95 dark:border-emerald-300/20">Apellidos</th>
              <th className="w-32 border-r border-lime-200/35 px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-white/95 dark:border-emerald-300/20">Telefono</th>
              <th className="w-80 border-r border-lime-200/35 px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-white/95 dark:border-emerald-300/20">Correo</th>
              <th className="w-45 border-r border-lime-200/35 px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-white/95 dark:border-emerald-300/20">Correo Validado</th>
              <th className="w-26 border-r border-lime-200/35 px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-white/95 dark:border-emerald-300/20">Estado</th>
              <th className="w-56 px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-white/95">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lime-200/80 dark:divide-emerald-700/60">
            {users.map((user, index) => (
              <tr
                key={user.id_usuario}
                className={`transition-colors ${
                  index % 2 === 0
                    ? "bg-white/95 hover:bg-lime-50/90 dark:bg-emerald-950/25 dark:hover:bg-emerald-900/35"
                    : "bg-lime-50/45 hover:bg-lime-100/75 dark:bg-teal-950/25 dark:hover:bg-teal-900/35"
                }`}
              >
                <td className="px-6 py-4 text-center text-sm text-green-900 dark:text-emerald-100/90">{user.id_rol || "-"}</td>
                <td className="px-6 py-4 text-center text-sm text-green-900 dark:text-emerald-100/90">{user.id_google ? "Si" : "No"}</td>
                <td className="px-6 py-4 text-center text-sm text-green-900 dark:text-emerald-100/90">{user.nombres || "-"}</td>
                <td className="px-6 py-4 text-center text-sm text-green-900 dark:text-emerald-100/90">{user.apellidos || "-"}</td>
                <td className="px-6 py-4 text-center text-sm text-green-900 dark:text-emerald-100/90">{user.telefono || "-"}</td>
                <td className="px-6 py-4 text-center text-sm text-green-900 dark:text-emerald-100/90">{user.correo || "-"}</td>
                <td className="px-6 py-4 text-center text-sm text-green-900 dark:text-emerald-100/90">{user.validacion_correo ? "Si" : "No"}</td>
                <td className="px-6 py-4 text-center">
                  {user.estado ? (
                    <Badge
                      variant="outline"
                      className="border-lime-400/80 bg-lime-100/90 text-green-900 shadow-none dark:border-emerald-600/60 dark:bg-emerald-900/50 dark:text-emerald-100"
                    >
                      Activo
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="shadow-none">
                      Suspendido
                    </Badge>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      onClick={() => onBan(user)}
                      disabled={updatingUserId === user.id_usuario || !user.estado}
                      title="Suspender cuenta"
                      aria-label="Suspender cuenta"
                      className="h-9 w-9 shrink-0"
                    >
                      {updatingUserId === user.id_usuario ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserX className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      onClick={() => onValidate(user.id_usuario)}
                      disabled={updatingUserId === user.id_usuario || !!user.estado}
                      title="Reactivar cuenta"
                      aria-label="Reactivar cuenta"
                      className="h-9 w-9 shrink-0 bg-green-700 text-white hover:bg-green-800 disabled:opacity-50"
                    >
                      {updatingUserId === user.id_usuario ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(!users || users.length === 0) && (
        <div className="py-12 text-center">
          <Users className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <p className="font-medium text-green-800 dark:text-emerald-200">No se encontraron usuarios</p>
          <p className="mt-1 text-sm text-green-700/80 dark:text-emerald-200/80">
            Ajusta la busqueda o intenta nuevamente en unos segundos
          </p>
        </div>
      )}
    </div>
  )
}
