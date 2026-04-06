import { ShieldCheck } from "lucide-react"

import type { AccessRow, RoleRow } from "@/lib/admin-role-access"

type RoleAccessSectionProps = {
  roles: RoleRow[]
  accessibilityItems: AccessRow[]
  selectedRoleId: number
  selectedRoleName: string
  selectedAccessIds: number[]
  savingAccess: boolean
  onRoleSelection: (roleId: number) => void
  onToggleAccess: (accessId: number, checked: boolean) => void
  onSaveRoleAccess: () => void
}

const ADMIN_ROLE_ID = 4

export function RoleAccessSection({
  roles,
  accessibilityItems,
  selectedRoleId,
  selectedRoleName,
  selectedAccessIds,
  savingAccess,
  onRoleSelection,
  onToggleAccess,
  onSaveRoleAccess,
}: RoleAccessSectionProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-lime-200/70 bg-white/90 p-4 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-950/35">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-green-700 dark:text-lime-300" />
        <h4 className="text-lg font-semibold text-green-900 dark:text-emerald-100">Permisos de Accesibilidad por Rol</h4>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-sm">
          <label htmlFor="role-selector" className="mb-1 block text-sm font-medium text-green-900 dark:text-emerald-100">
            Rol a configurar
          </label>
          <select
            id="role-selector"
            value={selectedRoleId}
            onChange={(event) => onRoleSelection(Number(event.target.value))}
            className="w-full rounded-md border border-green-600 bg-white px-3 py-2 text-green-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
          >
            {roles.map((role) => (
              <option key={role.id_rol} value={role.id_rol}>
                {role.nombre_rol}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onSaveRoleAccess}
          disabled={savingAccess || selectedRoleId === ADMIN_ROLE_ID}
          className="cursor-pointer rounded-lg bg-green-700 px-4 py-2 text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {savingAccess ? "Guardando permisos..." : "Guardar permisos"}
        </button>
      </div>

      {selectedRoleId === ADMIN_ROLE_ID && (
        <p className="rounded-lg border border-amber-300/70 bg-amber-50/90 px-3 py-2 text-sm text-amber-900 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-200">
          El rol {selectedRoleName} está protegido y no se puede modificar desde esta interfaz.
        </p>
      )}

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {accessibilityItems.map((item) => {
          const checked = selectedAccessIds.includes(item.id_accesibilidad)
          return (
            <label
              key={item.id_accesibilidad}
              className="flex items-center gap-3 rounded-lg border border-lime-200/80 bg-white/80 px-3 py-2 text-green-900 dark:border-emerald-700/60 dark:bg-emerald-950/30 dark:text-emerald-100"
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={selectedRoleId === ADMIN_ROLE_ID}
                onChange={(event) => onToggleAccess(item.id_accesibilidad, event.target.checked)}
                className="cursor-pointer h-4 w-4 rounded border-green-500 text-green-700 focus:ring-lime-400"
              />
              <span>
                {item.id_accesibilidad}. {item.nombre_accesibilidad}
              </span>
            </label>
          )
        })}
      </div>
    </section>
  )
}
