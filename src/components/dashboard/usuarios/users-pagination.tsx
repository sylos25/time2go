type UsersPaginationProps = {
  usersTotal: number
  usersPage: number
  usersPageSize: number
  usersTotalPages: number
  loadingUsers: boolean
  onPrev: () => void
  onNext: () => void
}

export function UsersPagination({
  usersTotal,
  usersPage,
  usersPageSize,
  usersTotalPages,
  loadingUsers,
  onPrev,
  onNext,
}: UsersPaginationProps) {
  if (usersTotal <= 0) return null

  return (
    <div className="flex items-center justify-between border-t border-lime-200/80 bg-lime-50/50 px-4 py-3 dark:border-emerald-700/60 dark:bg-emerald-900/20">
      <p className="text-sm text-green-800 dark:text-emerald-200/90">
        Mostrando {Math.min((usersPage - 1) * usersPageSize + 1, usersTotal)} - {Math.min(usersPage * usersPageSize, usersTotal)} de {usersTotal}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={usersPage <= 1 || loadingUsers}
          className="rounded-lg border border-lime-200 px-3 py-1.5 text-green-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-700 dark:text-emerald-200"
        >
          Anterior
        </button>
        <span className="text-sm text-green-800 dark:text-emerald-200/90">
          Pagina {usersPage} de {usersTotalPages}
        </span>
        <button
          onClick={onNext}
          disabled={usersPage >= usersTotalPages || loadingUsers}
          className="rounded-lg border border-lime-200 px-3 py-1.5 text-green-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-700 dark:text-emerald-200"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
