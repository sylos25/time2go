import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import {
  type AccessRow,
  type LoadPayload,
  type RoleRow,
  type UserRow,
  fetchCurrentUserRole,
  fetchRoleAccessData,
  updateRoleAccess,
  updateUserRole,
} from "@/lib/admin-role-access"

const ADMIN_ROLE_ID = 4
export const ADMIN_USERS_PAGE_SIZE = 25

type LoadOptions = {
  page?: number
  q?: string
  roleId?: number
}

function toMessage(caughtError: unknown, fallback: string) {
  return caughtError instanceof Error ? caughtError.message : fallback
}

function normalizePayload(payload: LoadPayload, fallbackRoleId: number) {
  return {
    users: payload.users || [],
    roles: payload.roles || [],
    accessibilityItems: payload.accessibilityItems || [],
    selectedRoleId: Number(payload.selectedRoleId || fallbackRoleId || ADMIN_ROLE_ID),
    selectedRoleAccessIds: (payload.selectedRoleAccessIds || []).map((value) => Number(value)),
    total: Number(payload.pagination?.total || 0),
    totalPages: Number(payload.pagination?.totalPages || 1),
    page: Number(payload.pagination?.page || 1),
  }
}

export function useAdminRoleAccess() {
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

  const [selectedRoleId, setSelectedRoleId] = useState<number>(ADMIN_ROLE_ID)
  const [selectedAccessIds, setSelectedAccessIds] = useState<number[]>([])

  const [savingUserId, setSavingUserId] = useState<number | null>(null)
  const [pendingRolesByUser, setPendingRolesByUser] = useState<Record<number, number>>({})
  const [savingAccess, setSavingAccess] = useState(false)

  const [toast, setToast] = useState<string | null>(null)
  const toastTimeoutRef = useRef<number | null>(null)

  const selectedRoleName = useMemo(
    () => roles.find((role) => role.id_rol === selectedRoleId)?.nombre_rol || "",
    [roles, selectedRoleId]
  )

  const showToast = useCallback((message: string) => {
    setToast(message)
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current)
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null)
      toastTimeoutRef.current = null
    }, 2800)
  }, [])

  const applyPayload = useCallback((payload: LoadPayload, fallbackRoleId: number) => {
    const normalized = normalizePayload(payload, fallbackRoleId)

    setUsers(normalized.users)
    setRoles(normalized.roles)
    setAccessibilityItems(normalized.accessibilityItems)
    setSelectedRoleId(normalized.selectedRoleId)
    setSelectedAccessIds(normalized.selectedRoleAccessIds)
    setUsersTotal(normalized.total)
    setUsersTotalPages(normalized.totalPages)
    setUsersPage(normalized.page)
  }, [])

  const loadData = useCallback(
    async (params?: LoadOptions) => {
      const page = params?.page ?? usersPage
      const q = params?.q ?? searchUsers
      const roleId = params?.roleId ?? selectedRoleId

      const payload = await fetchRoleAccessData({
        page,
        pageSize: ADMIN_USERS_PAGE_SIZE,
        q,
        roleId,
      })

      applyPayload(payload, roleId)
    },
    [applyPayload, searchUsers, selectedRoleId, usersPage]
  )

  const refreshUsers = useCallback(
    async (page = usersPage, q = searchUsers) => {
      try {
        await loadData({ page, q, roleId: selectedRoleId })
      } catch (caughtError: unknown) {
        setError(toMessage(caughtError, "No se pudo recargar la información"))
      }
    },
    [loadData, searchUsers, selectedRoleId, usersPage]
  )

  const handleSearchUsersChange = useCallback((value: string) => {
    setSearchUsers(value)
    setUsersPage(1)
  }, [])

  const handleSaveUserRole = useCallback(
    async (user: UserRow) => {
      const pendingRole = pendingRolesByUser[user.id_usuario]
      if (!pendingRole || pendingRole === user.id_rol) {
        return
      }

      setSavingUserId(user.id_usuario)
      setError(null)
      try {
        await updateUserRole(user.id_usuario, pendingRole)
        showToast("Rol de usuario actualizado")

        setPendingRolesByUser((prev) => {
          const next = { ...prev }
          delete next[user.id_usuario]
          return next
        })

        await refreshUsers()
      } catch (caughtError: unknown) {
        setError(toMessage(caughtError, "No fue posible actualizar el rol"))
      } finally {
        setSavingUserId(null)
      }
    },
    [pendingRolesByUser, refreshUsers, showToast]
  )

  const handleSaveRoleAccess = useCallback(async () => {
    if (selectedRoleId === ADMIN_ROLE_ID) {
      setError("Por seguridad, los permisos del rol Administrador no se pueden editar")
      return
    }

    setSavingAccess(true)
    setError(null)
    try {
      await updateRoleAccess(selectedRoleId, selectedAccessIds)
      showToast("Permisos de accesibilidad actualizados")
      await loadData({ page: usersPage, q: searchUsers, roleId: selectedRoleId })
    } catch (caughtError: unknown) {
      setError(toMessage(caughtError, "No fue posible actualizar la accesibilidad del rol"))
    } finally {
      setSavingAccess(false)
    }
  }, [loadData, searchUsers, selectedAccessIds, selectedRoleId, showToast, usersPage])

  const handleToggleAccess = useCallback((accessId: number, checked: boolean) => {
    if (selectedRoleId === ADMIN_ROLE_ID) return

    setSelectedAccessIds((prev) => {
      if (checked) {
        if (prev.includes(accessId)) return prev
        return [...prev, accessId].sort((a, b) => a - b)
      }
      return prev.filter((item) => item !== accessId)
    })
  }, [selectedRoleId])

  const handleRoleSelection = useCallback(
    async (roleId: number) => {
      setSelectedRoleId(roleId)
      setError(null)

      try {
        await loadData({ page: usersPage, q: searchUsers, roleId })
      } catch (caughtError: unknown) {
        setError(toMessage(caughtError, "No se pudo cargar la accesibilidad del rol"))
      }
    },
    [loadData, searchUsers, usersPage]
  )

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      setLoading(true)
      setError(null)

      try {
        const role = await fetchCurrentUserRole()
        if (cancelled) return

        setIsAdmin(role === ADMIN_ROLE_ID)

        if (role !== ADMIN_ROLE_ID) {
          setError("Solo el rol Administrador puede acceder a esta sección")
          return
        }

        await loadData({ page: 1, q: "", roleId: ADMIN_ROLE_ID })
      } catch (caughtError: unknown) {
        if (!cancelled) {
          setError(toMessage(caughtError, "Error cargando la sección Administrador"))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current)
      }
    }
  }, [loadData])

  return {
    loading,
    isAdmin,
    error,
    toast,
    searchUsers,
    usersPage,
    users,
    roles,
    accessibilityItems,
    usersTotal,
    usersTotalPages,
    selectedRoleId,
    selectedRoleName,
    selectedAccessIds,
    savingUserId,
    pendingRolesByUser,
    savingAccess,
    setPendingRolesByUser,
    setError,
    refreshUsers,
    handleSearchUsersChange,
    handleSaveUserRole,
    handleSaveRoleAccess,
    handleToggleAccess,
    handleRoleSelection,
  }
}
