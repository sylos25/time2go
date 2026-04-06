import { useEffect, useMemo, useState } from "react"

import {
  CATEGORIAS_BAN,
  MOTIVOS_BAN,
  addDaysToDateTimeLocal,
  banUser,
  fetchCurrentUser,
  fetchUsers,
  formatDateTimeLocal,
  type BanFormState,
  type MeUser,
  type UserRow,
  type UsersMessage,
  validateUserAccount,
} from "@/lib/dashboard-users"

const USERS_PAGE_SIZE = 25

export function useDashboardUsers() {
  const [meUser, setMeUser] = useState<MeUser | null>(null)
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [searchUsers, setSearchUsers] = useState("")
  const [usersPage, setUsersPage] = useState(1)
  const [usersTotal, setUsersTotal] = useState(0)
  const [usersTotalPages, setUsersTotalPages] = useState(1)
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null)

  const [banModalOpen, setBanModalOpen] = useState(false)
  const [banSubmitting, setBanSubmitting] = useState(false)
  const [banUserName, setBanUserName] = useState("")
  const [banMessage, setBanMessage] = useState<UsersMessage>(null)
  const [banForm, setBanForm] = useState<BanFormState>({
    id_usuario: 0,
    id_categoria: 0,
    id_motivo_ban: 0,
    inicio_ban: "",
    fin_ban: "",
  })

  const motivosFiltrados = useMemo(
    () => MOTIVOS_BAN.filter((item) => item.categoria === banForm.id_categoria),
    [banForm.id_categoria]
  )

  async function loadUsers(search = searchUsers, page = usersPage) {
    setLoadingUsers(true)
    try {
      const data = await fetchUsers({
        search,
        page,
        pageSize: USERS_PAGE_SIZE,
      })

      setUsers(data.usuarios)
      setUsersTotal(data.total)
      setUsersTotalPages(data.totalPages)
    } catch (error) {
      console.error("Error cargando usuarios", error)
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      setLoading(true)
      try {
        const me = await fetchCurrentUser()
        if (!cancelled) {
          setMeUser(me)
        }
      } catch (error) {
        console.error("Error cargando usuario actual", error)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (loading) return
    void loadUsers(searchUsers, usersPage)
  }, [loading, searchUsers, usersPage])

  function openBanModal(user: UserRow) {
    const inicio = formatDateTimeLocal(new Date())
    const fin = formatDateTimeLocal(new Date(Date.now() + 7 * 86400000))

    setBanMessage(null)
    setBanForm({
      id_usuario: user.id_usuario,
      id_categoria: 0,
      id_motivo_ban: 0,
      inicio_ban: inicio,
      fin_ban: fin,
    })
    setBanUserName(`${user.nombres || ""} ${user.apellidos || ""}`.trim())
    setBanModalOpen(true)
  }

  async function submitBan() {
    const idUsuario = banForm.id_usuario
    const responsable = meUser?.id_usuario

    setBanMessage(null)

    if (!Number.isFinite(idUsuario) || idUsuario <= 0) {
      setBanMessage({ type: "error", text: "ID de usuario invalido" })
      return
    }
    if (!banForm.id_motivo_ban || banForm.id_motivo_ban <= 0) {
      setBanMessage({ type: "error", text: "Selecciona categoria y motivo de suspension." })
      return
    }
    if (!banForm.inicio_ban || !banForm.fin_ban) {
      setBanMessage({ type: "error", text: "Indica fecha de inicio y fecha final." })
      return
    }

    const inicio = new Date(banForm.inicio_ban)
    const fin = new Date(banForm.fin_ban)

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
      setBanMessage({ type: "error", text: "Las fechas no son validas." })
      return
    }
    if (fin <= inicio) {
      setBanMessage({ type: "error", text: "La fecha final debe ser posterior al inicio." })
      return
    }
    if (!Number.isFinite(responsable) || !responsable || responsable <= 0) {
      setBanMessage({ type: "error", text: "No se pudo identificar al responsable del ban." })
      return
    }

    setBanSubmitting(true)
    setUpdatingUserId(idUsuario)

    try {
      const result = await banUser({
        idUsuario,
        idMotivoBan: banForm.id_motivo_ban,
        inicioBan: banForm.inicio_ban,
        finBan: banForm.fin_ban,
        responsable,
      })

      if (!result.ok) {
        setBanMessage({ type: "error", text: result.message || "No se pudo suspender la cuenta." })
        return
      }

      setUsers((prev) => prev.map((item) => (item.id_usuario === idUsuario ? { ...item, estado: false } : item)))
      setBanModalOpen(false)
      setBanMessage(null)
    } catch (error) {
      console.error("Error suspendiendo usuario", error)
      setBanMessage({ type: "error", text: "No se pudo suspender la cuenta. Intenta de nuevo." })
    } finally {
      setBanSubmitting(false)
      setUpdatingUserId(null)
    }
  }

  async function validateUser(idUsuario: number) {
    setUpdatingUserId(idUsuario)
    try {
      const result = await validateUserAccount(idUsuario)
      if (!result.ok) {
        window.alert(result.message || "No se pudo validar el usuario")
        return
      }

      setUsers((prev) => prev.map((item) => (item.id_usuario === idUsuario ? { ...item, estado: true } : item)))
    } catch (error) {
      console.error("Error validando usuario", error)
      window.alert("No se pudo validar el usuario")
    } finally {
      setUpdatingUserId(null)
    }
  }

  return {
    meUser,
    users,
    loading,
    loadingUsers,
    searchUsers,
    usersPage,
    usersPageSize: USERS_PAGE_SIZE,
    usersTotal,
    usersTotalPages,
    updatingUserId,
    banModalOpen,
    banSubmitting,
    banUserName,
    banMessage,
    banForm,
    motivosFiltrados,
    categoriasBan: CATEGORIAS_BAN,
    motivosBan: MOTIVOS_BAN,
    setSearchUsers,
    setUsersPage,
    setBanModalOpen,
    setBanForm,
    openBanModal,
    submitBan,
    validateUser,
    addDaysToDateTimeLocal,
    formatDateTimeLocal,
  }
}
