import { Search, UserCog } from "lucide-react"

import type { RoleRow, UserRow } from "@/lib/admin-role-access"

type UserRoleManagementSectionProps = {
  users: UserRow[]
  roles: RoleRow[]
  searchUsers: string
  usersPage: number
  usersTotal: number
  usersTotalPages: number
  pageSize: number
  savingUserId: number | null
  pendingRolesByUser: Record<number, number>
  onSearchUsersChange: (value: string) => void
  onSearch: () => void
  onPageChange: (page: number) => void
  onPendingRoleChange: (userId: number, roleId: number) => void
  onSaveUserRole: (user: UserRow) => void
}

export function UserRoleManagementSection({
  users,
  roles,
  searchUsers,
  usersPage,
  usersTotal,
  usersTotalPages,
  pageSize,
  savingUserId,
  pendingRolesByUser,
  onSearchUsersChange,
  onSearch,
  onPageChange,
  onPendingRoleChange,
  onSaveUserRole,
}: UserRoleManagementSectionProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-lime-200/70 bg-white/90 p-4 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-950/35">
      <div className="flex items-center gap-2">
        <UserCog className="h-5 w-5 text-green-700 dark:text-lime-300" />
        <h4 className="text-lg font-semibold text-green-900 dark:text-emerald-100">Administración de Roles de Usuario</h4>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex w-full items-center gap-2 sm:max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lime-600" />
            <input
              type="text"
              value={searchUsers}
              onChange={(event) => onSearchUsersChange(event.target.value)}
              placeholder="Buscar por nombre, correo o ID..."
              className="w-full rounded-lg border border-green-600 bg-white px-3 py-2 pl-10 text-green-900 placeholder:text-lime-700 focus:outline-none focus:ring-2 focus:ring-lime-400"
            />
          </div>

          <button
            type="button"
            onClick={onSearch}
            className="cursor-pointer rounded-lg border border-lime-200 px-3 py-2 text-sm text-green-900 hover:bg-lime-50 dark:border-emerald-700 dark:text-emerald-100 dark:hover:bg-emerald-800/40"
          >
            Buscar
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-lime-200/70">
        <table className="w-full min-w-[820px] table-auto border-collapse text-sm">
          <thead className="bg-teal-600 dark:bg-emerald-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/95">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/95">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/95">Correo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/95">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/95">Rol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lime-200/80 dark:divide-emerald-700/60">
            {users.map((user, index) => {
              const fullName = `${user.nombres || ""} ${user.apellidos || ""}`.trim() || "Sin nombre"
              const pendingRole = pendingRolesByUser[user.id_usuario] ?? user.id_rol
              const isDirty = pendingRole !== user.id_rol
              const isSaving = savingUserId === user.id_usuario

              return (
                <tr
                  key={user.id_usuario}
                  className={`transition-colors ${
                    index % 2 === 0
                      ? "bg-white/95 hover:bg-lime-50/90 dark:bg-emerald-950/25 dark:hover:bg-emerald-900/35"
                      : "bg-lime-50/45 hover:bg-lime-100/75 dark:bg-teal-950/25 dark:hover:bg-teal-900/35"
                  }`}
                >
                  <td className="px-4 py-3 text-green-900 dark:text-emerald-100/90">{user.id_usuario}</td>
                  <td className="px-4 py-3 text-green-900 dark:text-emerald-100/90">{fullName}</td>
                  <td className="px-4 py-3 text-green-900 dark:text-emerald-100/90">{user.correo || "-"}</td>
                  <td className="px-4 py-3 text-green-900 dark:text-emerald-100/90">{user.estado ? "Activo" : "Inactivo"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-start gap-2">
                      <select
                        value={pendingRole}
                        onChange={(event) => onPendingRoleChange(user.id_usuario, Number(event.target.value))}
                        className="w-[190px] rounded-md border border-green-600 bg-white px-2 py-1.5 text-green-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
                      >
                        {roles.map((role) => (
                          <option key={role.id_rol} value={role.id_rol}>
                            {role.nombre_rol}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => onSaveUserRole(user)}
                        disabled={!isDirty || isSaving}
                        className="cursor-pointer shrink-0 rounded-lg bg-green-700 px-3 py-1.5 text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isSaving ? "Guardando..." : "Guardar cambios"}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}

            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No se encontraron usuarios para gestionar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {usersTotal > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-lime-200/70 bg-lime-50/50 px-4 py-3 dark:border-emerald-700/60 dark:bg-emerald-900/20">
          <p className="text-sm text-green-800 dark:text-emerald-200/90">
            Mostrando {Math.min((usersPage - 1) * pageSize + 1, usersTotal)} - {Math.min(usersPage * pageSize, usersTotal)} de {usersTotal}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, usersPage - 1))}
              disabled={usersPage <= 1}
              className="rounded-lg border border-lime-200 px-3 py-1.5 text-green-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-700 dark:text-emerald-200"
            >
              Anterior
            </button>
            <span className="text-sm text-green-800 dark:text-emerald-200/90">
              Página {usersPage} de {usersTotalPages}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(usersTotalPages, usersPage + 1))}
              disabled={usersPage >= usersTotalPages}
              className="rounded-lg border border-lime-200 px-3 py-1.5 text-green-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-700 dark:text-emerald-200"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
