"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Search, ShieldCheck, UserCog } from "lucide-react"

type UserRow = {
  id_usuario: number
  id_rol: number
  nombre_rol: string
  estado: boolean
  nombres: string | null
  apellidos: string | null
  correo: string | null
}

type RoleRow = {
  id_rol: number
  nombre_rol: string
}

type AccessRow = {
  id_accesibilidad: number
  nombre_accesibilidad: string
}

type LoadPayload = {
  users: UserRow[]
  roles: RoleRow[]
  accessibilityItems: AccessRow[]
  selectedRoleId: number
  selectedRoleAccessIds: number[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasPrev: boolean
    hasNext: boolean
  }
}

const PAGE_SIZE = 25

export default function DashboardAdministradorPage() {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [searchUsers, setSearchUsers] = useState("")
  const [usersPage, setUsersPage] = useState(1)

  const [users, setUsers] = useState<UserRow[]>([])
  const [roles, setRoles] = useState<RoleRow[]>([])
  const [accessibilityItems, setAccessibilityItems] = useState<AccessRow[]>([])

  const [usersTotal, setUsersTotal] = useState(0)
  const [usersTotalPages, setUsersTotalPages] = useState(1)

  const [selectedRoleId, setSelectedRoleId] = useState<number>(4)
  const [selectedAccessIds, setSelectedAccessIds] = useState<number[]>([])

  const [savingUserId, setSavingUserId] = useState<number | null>(null)
  const [pendingRolesByUser, setPendingRolesByUser] = useState<Record<number, number>>({})
  const [savingAccess, setSavingAccess] = useState(false)

  const [toast, setToast] = useState<string | null>(null)

  const selectedRoleName = useMemo(
    () => roles.find((role) => role.id_rol === selectedRoleId)?.nombre_rol || "",
    [roles, selectedRoleId]
  )

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2800)
  }

  const loadData = async (params?: { page?: number; q?: string; roleId?: number }) => {
    const page = params?.page ?? usersPage
    const q = params?.q ?? searchUsers
    const roleId = params?.roleId ?? selectedRoleId

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    const headers: HeadersInit = {}
    if (token) headers.Authorization = `Bearer ${token}`

    const query = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
      roleId: String(roleId),
    })

    if (q.trim()) {
      query.set("q", q.trim())
    }

    const res = await fetch(`/api/admin/role-access?${query.toString()}`, {
      headers,
      credentials: "include",
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data?.ok) {
      throw new Error(data?.message || "No se pudo cargar la administración de roles")
    }

    const payload = data as LoadPayload

    setUsers(payload.users || [])
    setRoles(payload.roles || [])
    setAccessibilityItems(payload.accessibilityItems || [])
    setSelectedRoleId(Number(payload.selectedRoleId || roleId || 4))
    setSelectedAccessIds((payload.selectedRoleAccessIds || []).map((value) => Number(value)))

    setUsersTotal(Number(payload.pagination?.total || 0))
    setUsersTotalPages(Number(payload.pagination?.totalPages || 1))
    setUsersPage(Number(payload.pagination?.page || page))
  }

  useEffect(() => {
    let cancelled = false

    const bootstrap = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        const headers: HeadersInit = {}
        if (token) headers.Authorization = `Bearer ${token}`

        const meRes = await fetch("/api/me", { headers, credentials: "include" })
        const meData = await meRes.json().catch(() => ({}))
        const role = Number(meData?.user?.id_rol)

        if (!cancelled) {
          setIsAdmin(role === 4)
        }

        if (role !== 4) {
          if (!cancelled) {
            setError("Solo el rol Administrador puede acceder a esta sección")
          }
          return
        }

        await loadData({ page: 1, q: "", roleId: 4 })
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Error cargando la sección Administrador")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  const refreshUsers = async (page = usersPage, q = searchUsers) => {
    try {
      await loadData({ page, q, roleId: selectedRoleId })
    } catch (err: any) {
      setError(err?.message || "No se pudo recargar la información")
    }
  }

  const handleSaveUserRole = async (user: UserRow) => {
    const pendingRole = pendingRolesByUser[user.id_usuario]
    if (!pendingRole || pendingRole === user.id_rol) {
      return
    }

    setSavingUserId(user.id_usuario)
    setError(null)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const headers: HeadersInit = { "Content-Type": "application/json" }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch("/api/admin/role-access", {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify({
          action: "updateUserRole",
          userId: user.id_usuario,
          newRoleId: pendingRole,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        throw new Error(data?.message || "No fue posible actualizar el rol")
      }

      showToast("Rol de usuario actualizado")
      setPendingRolesByUser((prev) => {
        const next = { ...prev }
        delete next[user.id_usuario]
        return next
      })
      await refreshUsers()
    } catch (err: any) {
      setError(err?.message || "No fue posible actualizar el rol")
    } finally {
      setSavingUserId(null)
    }
  }

  const handleSaveRoleAccess = async () => {
    if (selectedRoleId === 4) {
      setError("Por seguridad, los permisos del rol Administrador no se pueden editar")
      return
    }

    setSavingAccess(true)
    setError(null)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const headers: HeadersInit = { "Content-Type": "application/json" }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch("/api/admin/role-access", {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify({
          action: "setRoleAccess",
          roleId: selectedRoleId,
          accessIds: selectedAccessIds,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        throw new Error(data?.message || "No fue posible actualizar la accesibilidad del rol")
      }

      showToast("Permisos de accesibilidad actualizados")
      await loadData({ page: usersPage, q: searchUsers, roleId: selectedRoleId })
    } catch (err: any) {
      setError(err?.message || "No fue posible actualizar la accesibilidad del rol")
    } finally {
      setSavingAccess(false)
    }
  }

  const handleToggleAccess = (accessId: number, checked: boolean) => {
    if (selectedRoleId === 4) return

    setSelectedAccessIds((prev) => {
      if (checked) {
        if (prev.includes(accessId)) return prev
        return [...prev, accessId].sort((a, b) => a - b)
      }
      return prev.filter((item) => item !== accessId)
    })
  }

  if (loading) {
    return (
      <div className="min-h-[55vh] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-green-800 animate-spin" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border border-red-400/40 bg-red-50/80 p-6 text-red-700 dark:bg-red-900/20 dark:text-red-200">
        {error || "Acceso denegado"}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-green-700/30 bg-green-600 px-3 py-5 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-900 sm:px-6 sm:py-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-lime-300/30 blur-2xl dark:bg-lime-500/20" />
        <div className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-teal-300/25 blur-2xl dark:bg-emerald-500/20" />
        <div className="relative">
          <h3 className="text-center text-3xl font-semibold tracking-tight text-white dark:text-lime-200 sm:text-5xl">
            <span style={{ fontFamily: "Futura, Trebuchet MS, Helvetica, Arial, sans-serif" }}>Administrador</span>
          </h3>
        </div>
      </div>

      {toast && (
        <div className="rounded-xl border border-emerald-400/50 bg-emerald-100/80 px-4 py-3 text-emerald-900 dark:bg-emerald-900/35 dark:text-emerald-200">
          {toast}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-400/40 bg-red-50/80 px-4 py-3 text-red-700 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

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
                onChange={(e) => {
                  setSearchUsers(e.target.value)
                  setUsersPage(1)
                }}
                placeholder="Buscar por nombre, correo o ID..."
                className="w-full rounded-lg border border-green-600 bg-white px-3 py-2 pl-10 text-green-900 placeholder:text-lime-700 focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>

            <button
              type="button"
              onClick={() => refreshUsers(1, searchUsers)}
              className="rounded-lg border border-lime-200 px-3 py-2 text-sm text-green-900 hover:bg-lime-50 dark:border-emerald-700 dark:text-emerald-100 dark:hover:bg-emerald-800/40 cursor-pointer"
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
                          onChange={(e) =>
                            setPendingRolesByUser((prev) => ({
                              ...prev,
                              [user.id_usuario]: Number(e.target.value),
                            }))
                          }
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
                          onClick={() => handleSaveUserRole(user)}
                          disabled={!isDirty || isSaving}
                          className="shrink-0 rounded-lg bg-green-700 px-3 py-1.5 text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
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
              Mostrando {Math.min((usersPage - 1) * PAGE_SIZE + 1, usersTotal)} - {Math.min(usersPage * PAGE_SIZE, usersTotal)} de {usersTotal}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => refreshUsers(Math.max(1, usersPage - 1), searchUsers)}
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
                onClick={() => refreshUsers(Math.min(usersTotalPages, usersPage + 1), searchUsers)}
                disabled={usersPage >= usersTotalPages}
                className="rounded-lg border border-lime-200 px-3 py-1.5 text-green-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-700 dark:text-emerald-200"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </section>

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
              onChange={async (e) => {
                const roleId = Number(e.target.value)
                setSelectedRoleId(roleId)
                try {
                  await loadData({ page: usersPage, q: searchUsers, roleId })
                } catch (err: any) {
                  setError(err?.message || "No se pudo cargar la accesibilidad del rol")
                }
              }}
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
            onClick={handleSaveRoleAccess}
            disabled={savingAccess || selectedRoleId === 4}
            className="rounded-lg bg-green-700 px-4 py-2 text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {savingAccess ? "Guardando permisos..." : "Guardar permisos"}
          </button>
        </div>

        {selectedRoleId === 4 && (
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
                  disabled={selectedRoleId === 4}
                  onChange={(e) => handleToggleAccess(item.id_accesibilidad, e.target.checked)}
                  className="h-4 w-4 rounded border-green-500 text-green-700 focus:ring-lime-400 cursor-pointer"
                />
                <span>
                  {item.id_accesibilidad}. {item.nombre_accesibilidad}
                </span>
              </label>
            )
          })}
        </div>
      </section>
    </div>
  )
}
