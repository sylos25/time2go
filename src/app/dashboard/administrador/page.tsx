"use client"

import { Loader2 } from "lucide-react"

import { AdministratorHero } from "@/components/dashboard/administrador/administrator-hero"
import { RoleAccessSection } from "@/components/dashboard/administrador/role-access-section"
import { UserRoleManagementSection } from "@/components/dashboard/administrador/user-role-management-section"
import { ADMIN_USERS_PAGE_SIZE, useAdminRoleAccess } from "@/hooks/use-admin-role-access"

export default function DashboardAdministradorPage() {
  const {
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
    refreshUsers,
    handleSearchUsersChange,
    handleSaveUserRole,
    handleSaveRoleAccess,
    handleToggleAccess,
    handleRoleSelection,
  } = useAdminRoleAccess()

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
      <AdministratorHero />

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

      <UserRoleManagementSection
        users={users}
        roles={roles}
        searchUsers={searchUsers}
        usersPage={usersPage}
        usersTotal={usersTotal}
        usersTotalPages={usersTotalPages}
        pageSize={ADMIN_USERS_PAGE_SIZE}
        savingUserId={savingUserId}
        pendingRolesByUser={pendingRolesByUser}
        onSearchUsersChange={handleSearchUsersChange}
        onSearch={() => refreshUsers(1, searchUsers)}
        onPageChange={(page) => refreshUsers(page, searchUsers)}
        onPendingRoleChange={(userId, roleId) =>
          setPendingRolesByUser((prev) => ({
            ...prev,
            [userId]: roleId,
          }))
        }
        onSaveUserRole={handleSaveUserRole}
      />

      <RoleAccessSection
        roles={roles}
        accessibilityItems={accessibilityItems}
        selectedRoleId={selectedRoleId}
        selectedRoleName={selectedRoleName}
        selectedAccessIds={selectedAccessIds}
        savingAccess={savingAccess}
        onRoleSelection={handleRoleSelection}
        onToggleAccess={handleToggleAccess}
        onSaveRoleAccess={handleSaveRoleAccess}
      />
    </div>
  )
}
