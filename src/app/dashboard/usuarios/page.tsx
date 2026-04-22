"use client"

import { Loader2 } from "lucide-react"

import {
  UserBanDialog,
  UsersHero,
  UsersPagination,
  UsersSearch,
  UsersTable,
} from "@/components/dashboard/usuarios"
import { useDashboardUsers } from "@/hooks/use-dashboard-users"

export default function DashboardUsersPage() {
  const {
    meUser,
    users,
    loading,
    loadingUsers,
    searchUsers,
    usersPage,
    usersPageSize,
    usersTotal,
    usersTotalPages,
    updatingUserId,
    banModalOpen,
    banSubmitting,
    banUserName,
    banUserEmail,
    banMessage,
    banForm,
    motivosFiltrados,
    categoriasBan,
    motivosBan,
    setSearchUsers,
    setUsersPage,
    setBanModalOpen,
    setBanForm,
    openBanModal,
    submitBan,
    validateUser,
    formatDateTimeLocal,
  } = useDashboardUsers()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-green-800" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <UsersHero />

      <UsersSearch
        value={searchUsers}
        onChange={(value) => {
          setSearchUsers(value)
          setUsersPage(1)
        }}
      />

      <UsersTable users={users} updatingUserId={updatingUserId} onBan={openBanModal} onValidate={validateUser} />

      <UsersPagination
        usersTotal={usersTotal}
        usersPage={usersPage}
        usersPageSize={usersPageSize}
        usersTotalPages={usersTotalPages}
        loadingUsers={loadingUsers}
        onPrev={() => setUsersPage((prev) => Math.max(1, prev - 1))}
        onNext={() => setUsersPage((prev) => Math.min(usersTotalPages, prev + 1))}
      />

      <UserBanDialog
        open={banModalOpen}
        onOpenChange={setBanModalOpen}
        banSubmitting={banSubmitting}
        banUserName={banUserName}
        banUserEmail={banUserEmail}
        banForm={banForm}
        banMessage={banMessage}
        categoriasBan={categoriasBan}
        motivosBan={motivosBan}
        motivosFiltrados={motivosFiltrados}
        meUser={meUser}
        onBanFormChange={setBanForm}
        onSubmit={submitBan}
        formatDateTimeLocal={formatDateTimeLocal}
      />
    </div>
  )
}
