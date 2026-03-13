"use client"

import { useEffect, useState } from "react"
import { CheckCircle, Loader2, Search, Users, UserX } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function DashboardUsersPage() {
  const [meUser, setMeUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [searchUsers, setSearchUsers] = useState("")
  const [usersPage, setUsersPage] = useState(1)
  const [usersPageSize] = useState(25)
  const [usersTotal, setUsersTotal] = useState(0)
  const [usersTotalPages, setUsersTotalPages] = useState(1)
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null)
  const [banModalOpen, setBanModalOpen] = useState(false)
  const [banSubmitting, setBanSubmitting] = useState(false)
  const [banForm, setBanForm] = useState({
    id_usuario: "",
    motivo_ban: "",
    inicio_ban: "",
    fin_ban: "",
    responsable: "",
  })

  const formatDateTimeLocal = (date: Date) => {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    return local.toISOString().slice(0, 16)
  }

  const openBanModal = (idUsuario: number) => {
    const inicio = new Date()
    const fin = new Date(inicio.getTime() + 7 * 24 * 60 * 60 * 1000)
    setBanForm({
      id_usuario: String(idUsuario),
      motivo_ban: "",
      inicio_ban: formatDateTimeLocal(inicio),
      fin_ban: formatDateTimeLocal(fin),
      responsable: String(meUser?.id_usuario || ""),
    })
    setBanModalOpen(true)
  }

  const loadUsers = async (search = searchUsers, page = usersPage) => {
    setLoadingUsers(true)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const headers: any = {}
      if (token) headers.Authorization = `Bearer ${token}`

      const params = new URLSearchParams({
        roles: "1,2",
        page: String(page),
        pageSize: String(usersPageSize),
      })
      if (search.trim()) params.set("q", search.trim())

      const res = await fetch(`/api/usuarios?${params.toString()}`, { headers })
      if (!res.ok) return

      const data = await res.json()
      setUsers(data.usuarios || [])
      setUsersTotal(Number(data?.pagination?.total || 0))
      setUsersTotalPages(Number(data?.pagination?.totalPages || 1))
    } catch (error) {
      console.error("Error cargando usuarios", error)
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    const bootstrap = async () => {
      setLoading(true)
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        const headers: any = {}
        if (token) headers.Authorization = `Bearer ${token}`

        const meRes = await fetch("/api/me", { headers })
        if (meRes.ok && !cancelled) {
          const meData = await meRes.json()
          setMeUser(meData?.user || null)
        }
      } catch (error) {
        console.error("Error cargando usuario actual", error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (loading) return
    loadUsers(searchUsers, usersPage)
  }, [loading, searchUsers, usersPage])

  const submitBan = async () => {
    const idUsuario = Number(banForm.id_usuario)
    const responsable = Number(banForm.responsable)

    if (!Number.isFinite(idUsuario) || idUsuario <= 0) {
      alert("ID de usuario inválido")
      return
    }
    if (!banForm.motivo_ban || banForm.motivo_ban.trim().length < 10) {
      alert("El motivo debe tener mínimo 10 caracteres")
      return
    }
    if (!banForm.inicio_ban || !banForm.fin_ban) {
      alert("Debes diligenciar fecha de inicio y fecha final")
      return
    }
    if (!Number.isFinite(responsable) || responsable <= 0) {
      alert("Responsable inválido")
      return
    }

    setBanSubmitting(true)
    setUpdatingUserId(idUsuario)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const headers: any = { "Content-Type": "application/json" }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch(`/api/usuarios/${encodeURIComponent(String(idUsuario))}/ban`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          action: "ban",
          id_usuario: idUsuario,
          motivo_ban: banForm.motivo_ban.trim(),
          inicio_ban: banForm.inicio_ban,
          fin_ban: banForm.fin_ban,
          responsable,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        alert(data?.message || "No se pudo bannear el usuario")
        return
      }

      setUsers((prev) => prev.map((item) => (item.id_usuario === idUsuario ? { ...item, estado: false } : item)))
      setBanModalOpen(false)
    } catch (error) {
      console.error("Error banneando usuario", error)
      alert("No se pudo bannear el usuario")
    } finally {
      setBanSubmitting(false)
      setUpdatingUserId(null)
    }
  }

  const validateUser = async (idUsuario: number) => {
    setUpdatingUserId(idUsuario)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const headers: any = { "Content-Type": "application/json" }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch(`/api/usuarios/${encodeURIComponent(String(idUsuario))}/ban`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ action: "validate" }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        alert(data?.message || "No se pudo validar el usuario")
        return
      }

      setUsers((prev) => prev.map((item) => (item.id_usuario === idUsuario ? { ...item, estado: true } : item)))
    } catch (error) {
      console.error("Error validando usuario", error)
      alert("No se pudo validar el usuario")
    } finally {
      setUpdatingUserId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-green-800 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-green-700/30 bg-green-600 px-3 py-5 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-900 sm:px-6 sm:py-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-lime-300/30 blur-2xl dark:bg-lime-500/20" />
        <div className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-teal-300/25 blur-2xl dark:bg-emerald-500/20" />

        <div className="relative space-y-4">
          <h3 className="mb-4 text-center text-3xl font-semibold tracking-tight text-white dark:text-lime-200 sm:mb-6 sm:text-5xl">
            <span style={{ fontFamily: "Futura, Trebuchet MS, Helvetica, Arial, sans-serif" }}>Usuarios</span>
          </h3>
        </div>
      </div>

      <div className="flex justify-start">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lime-600 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchUsers}
            onChange={(e) => {
              setSearchUsers(e.target.value)
              setUsersPage(1)
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-white/95 border border-lime-200 rounded-lg placeholder:text-muted-foreground text-green-900 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-lime-200/70 bg-white/85 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-950/35">
        <div className="overflow-x-auto">
          <table className="table-fixed w-full border-collapse">
            <thead className="bg-green-500 dark:bg-emerald-700">
              <tr>
                <th className="w-32 px-6 py-4 text-center text-xs font-semibold text-white/95 uppercase tracking-wider border-r border-lime-200/35 dark:border-emerald-300/20">Rol</th>
                <th className="w-36 px-6 py-4 text-center text-xs font-semibold text-white/95 uppercase tracking-wider border-r border-lime-200/35 dark:border-emerald-300/20">Acceso con Google</th>
                <th className="w-40 px-6 py-4 text-center text-xs font-semibold text-white/95 uppercase tracking-wider border-r border-lime-200/35 dark:border-emerald-300/20">Nombres</th>
                <th className="w-40 px-6 py-4 text-center text-xs font-semibold text-white/95 uppercase tracking-wider border-r border-lime-200/35 dark:border-emerald-300/20">Apellidos</th>
                <th className="w-32 px-6 py-4 text-center text-xs font-semibold text-white/95 uppercase tracking-wider border-r border-lime-200/35 dark:border-emerald-300/20">Teléfono</th>
                <th className="w-80 px-6 py-4 text-center text-xs font-semibold text-white/95 uppercase tracking-wider border-r border-lime-200/35 dark:border-emerald-300/20">Correo</th>
                <th className="w-45 px-6 py-4 text-center text-xs font-semibold text-white/95 uppercase tracking-wider border-r border-lime-200/35 dark:border-emerald-300/20">Correo Validado</th>
                <th className="w-26 px-6 py-4 text-center text-xs font-semibold text-white/95 uppercase tracking-wider border-r border-lime-200/35 dark:border-emerald-300/20">Estado</th>
                <th className="w-56 px-6 py-4 text-center text-xs font-semibold text-white/95 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lime-200/80 dark:divide-emerald-700/60">
              {users.map((u, index) => (
                <tr
                  key={u.id_usuario}
                  className={`transition-colors ${
                    index % 2 === 0
                      ? "bg-white/95 hover:bg-lime-50/90 dark:bg-emerald-950/25 dark:hover:bg-emerald-900/35"
                      : "bg-lime-50/45 hover:bg-lime-100/75 dark:bg-teal-950/25 dark:hover:bg-teal-900/35"
                  }`}
                >
                  <td className="px-6 py-4 text-center text-sm text-green-900 dark:text-emerald-100/90">{u.id_rol || "-"}</td>
                  <td className="px-6 py-4 text-center text-sm text-green-900 dark:text-emerald-100/90">{u.id_google ? "Sí" : "No"}</td>
                  <td className="px-6 py-4 text-center text-sm text-green-900 dark:text-emerald-100/90">{u.nombres}</td>
                  <td className="px-6 py-4 text-center text-sm text-green-900 dark:text-emerald-100/90">{u.apellidos}</td>
                  <td className="px-6 py-4 text-center text-sm text-green-900 dark:text-emerald-100/90">{u.telefono || "-"}</td>
                  <td className="px-6 py-4 text-center text-sm text-green-900 dark:text-emerald-100/90">{u.correo}</td>
                  <td className="px-6 py-4 text-center text-sm text-green-900 dark:text-emerald-100/90">{u.validacion_correo ? "Sí" : "No"}</td>
                  <td className="px-6 py-4 text-center text-sm text-green-900 dark:text-emerald-100/90">{u.estado ? "Activo" : "Inactivo"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openBanModal(u.id_usuario)}
                        disabled={updatingUserId === u.id_usuario || !u.estado}
                        title="Bannear usuario"
                        aria-label="Bannear usuario"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingUserId === u.id_usuario ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => validateUser(u.id_usuario)}
                        disabled={updatingUserId === u.id_usuario || u.estado}
                        title="Validar usuario"
                        aria-label="Validar usuario"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white bg-green-700 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingUserId === u.id_usuario ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {usersTotal > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-lime-200/80 bg-lime-50/50 dark:border-emerald-700/60 dark:bg-emerald-900/20">
            <p className="text-sm text-green-800 dark:text-emerald-200/90">
              Mostrando {Math.min((usersPage - 1) * usersPageSize + 1, usersTotal)} - {Math.min(usersPage * usersPageSize, usersTotal)} de {usersTotal}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUsersPage((prev) => Math.max(1, prev - 1))}
                disabled={usersPage <= 1 || loadingUsers}
                className="px-3 py-1.5 rounded-lg border border-lime-200 text-green-900 dark:text-emerald-200 dark:border-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="text-sm text-green-800 dark:text-emerald-200/90">Página {usersPage} de {usersTotalPages}</span>
              <button
                onClick={() => setUsersPage((prev) => Math.min(usersTotalPages, prev + 1))}
                disabled={usersPage >= usersTotalPages || loadingUsers}
                className="px-3 py-1.5 rounded-lg border border-lime-200 text-green-900 dark:text-emerald-200 dark:border-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {(!users || users.length === 0) && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-green-800 dark:text-emerald-200 font-medium">No se encontraron usuarios</p>
            <p className="text-sm text-green-700/80 dark:text-emerald-200/80 mt-1">Ajusta la búsqueda o intenta nuevamente en unos segundos</p>
          </div>
        )}
      </div>

      <Dialog open={banModalOpen} onOpenChange={setBanModalOpen}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Registrar Ban de Usuario</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">ID Usuario</label>
              <input
                type="text"
                inputMode="numeric"
                value={banForm.id_usuario}
                onChange={(e) => setBanForm((prev) => ({ ...prev, id_usuario: e.target.value.replace(/\D/g, "") }))}
                className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2"
                placeholder="ID del usuario a bannear"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Motivo del ban</label>
              <textarea
                value={banForm.motivo_ban}
                onChange={(e) => setBanForm((prev) => ({ ...prev, motivo_ban: e.target.value }))}
                className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 min-h-24"
                placeholder="Escribe el motivo del ban (obligatorio, mínimo 10 caracteres)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Fecha de inicio</label>
                <input
                  type="datetime-local"
                  value={banForm.inicio_ban}
                  onChange={(e) => setBanForm((prev) => ({ ...prev, inicio_ban: e.target.value }))}
                  className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Fecha final</label>
                <input
                  type="datetime-local"
                  value={banForm.fin_ban}
                  onChange={(e) => setBanForm((prev) => ({ ...prev, fin_ban: e.target.value }))}
                  className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Responsable</label>
              <input
                type="text"
                inputMode="numeric"
                value={banForm.responsable}
                onChange={(e) => setBanForm((prev) => ({ ...prev, responsable: e.target.value.replace(/\D/g, "") }))}
                className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2"
                placeholder="ID del usuario responsable"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBanModalOpen(false)} disabled={banSubmitting}>
              Cancelar
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={submitBan} disabled={banSubmitting}>
              {banSubmitting ? "Guardando..." : "Confirmar Ban"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
