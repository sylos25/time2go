"use client"

import { useEffect, useState } from "react"
import { CheckCircle, ChevronDown, Loader2, Search, Users, UserX } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// Categorías y motivos de ban hardcodeados
const CATEGORIAS_BAN = [
  { id: 1, nombre: "Cuenta y verificación" },
  { id: 2, nombre: "Seguridad del sistema" },
  { id: 3, nombre: "Fraude y transacciones" },
  { id: 4, nombre: "Contenido inapropiado o ilegal" },
  { id: 5, nombre: "Comportamiento y reseñas" },
  { id: 6, nombre: "Organización de eventos" },
  { id: 7, nombre: "Abuso del sistema" },
  { id: 8, nombre: "Administrativo" },
]

const MOTIVOS_BAN = [
  // Categoría 1: Cuenta y verificación
  { id: 1, categoria: 1, motivo: "Uso de identidad falsa o suplantación de identidad" },
  { id: 2, categoria: 1, motivo: "Provisión de datos personales falsos en la verificación" },
  { id: 3, categoria: 1, motivo: "Creación de múltiples cuentas para evadir bloqueos o restricciones" },
  { id: 4, categoria: 1, motivo: "Uso de bots o automatizaciones no autorizadas en la plataforma" },
  // Categoría 2: Seguridad del sistema
  { id: 5, categoria: 2, motivo: "Intento de hackeo o manipulación del sistema" },
  { id: 6, categoria: 2, motivo: "Acceso no autorizado a cuentas ajenas" },
  { id: 7, categoria: 2, motivo: "Explotación de vulnerabilidades del sistema (exploits)" },
  { id: 8, categoria: 2, motivo: "Generación de intentos maliciosos y repetitivos de autenticación" },
  // Categoría 3: Fraude y transacciones
  { id: 9, categoria: 3, motivo: "Intento de fraude o manipulación en pagos de la plataforma" },
  { id: 10, categoria: 3, motivo: "Solicitudes de reembolso fraudulentas o sin justificación válida" },
  { id: 11, categoria: 3, motivo: "Compra o venta de entradas fuera del sistema oficial de la plataforma" },
  { id: 12, categoria: 3, motivo: "Reventa ilegal o manipulación de precios dentro de la plataforma" },
  // Categoría 4: Contenido inapropiado o ilegal
  { id: 13, categoria: 4, motivo: "Publicación de contenido ilegal dentro de la plataforma" },
  { id: 14, categoria: 4, motivo: "Publicación de contenido violento, amenazante o intimidatorio" },
  { id: 15, categoria: 4, motivo: "Uso de lenguaje discriminatorio, racista o discurso de odio" },
  { id: 16, categoria: 4, motivo: "Publicación de contenido sexual explícito o inapropiado" },
  { id: 17, categoria: 4, motivo: "Difusión de información personal de otros usuarios (doxxing)" },
  // Categoría 5: Comportamiento y reseñas
  { id: 18, categoria: 5, motivo: "Publicación de valoraciones o reseñas falsas de forma reiterada" },
  { id: 19, categoria: 5, motivo: "Spam en comentarios, reseñas o secciones de la plataforma" },
  { id: 20, categoria: 5, motivo: "Acoso reiterado hacia otros usuarios de la plataforma" },
  { id: 21, categoria: 5, motivo: "Amenazas hacia usuarios, moderadores o administradores del sistema" },
  // Categoría 6: Organización de eventos
  { id: 22, categoria: 6, motivo: "Cancelación reiterada de eventos sin justificación válida" },
  { id: 23, categoria: 6, motivo: "Organización de eventos sin contar con los permisos legales requeridos" },
  { id: 24, categoria: 6, motivo: "Publicación de eventos con información engañosa, falsa o fraudulenta" },
  { id: 25, categoria: 6, motivo: "Incumplimiento de medidas de seguridad en eventos organizados" },
  { id: 26, categoria: 6, motivo: "Reproducción de contenido con derechos de autor sin autorización en eventos" },
  { id: 27, categoria: 6, motivo: "Incumplimiento deliberado de las normas de accesibilidad del sistema" },
  // Categoría 7: Abuso del sistema
  { id: 28, categoria: 7, motivo: "Creación de eventos falsos con intención de spam o engaño" },
  { id: 29, categoria: 7, motivo: "Manipulación de algoritmos de visibilidad o búsqueda del sistema" },
  { id: 30, categoria: 7, motivo: "Uso indebido y reiterado de herramientas de reporte con falsos reportes" },
  { id: 31, categoria: 7, motivo: "Evasión deliberada de restricciones o penalizaciones activas" },
  // Categoría 8: Administrativo
  { id: 32, categoria: 8, motivo: "Incumplimiento reiterado de las normativas generales del software" },
  { id: 33, categoria: 8, motivo: "Negativa a cumplir solicitudes o directrices del equipo administrativo" },
  { id: 34, categoria: 8, motivo: "Conductas que afectan gravemente la experiencia de otros usuarios" },
  { id: 35, categoria: 8, motivo: "Acciones que generan riesgo legal o reputacional para la plataforma" },
]

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
    id_usuario: 0,
    id_categoria: 0,
    id_motivo_ban: 0,
    fin_ban: "",
  })
  const [banUserName, setBanUserName] = useState("")

  const formatDateTimeLocal = (date: Date) => {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    return local.toISOString().slice(0, 16)
  }

  const openBanModal = (user: any) => {
    const fin = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    setBanForm({
      id_usuario: user.id_usuario,
      id_categoria: 0,
      id_motivo_ban: 0,
      fin_ban: formatDateTimeLocal(fin),
    })
    setBanUserName(`${user.nombres} ${user.apellidos}`)
    setBanModalOpen(true)
  }

  const motivosFiltrados = MOTIVOS_BAN.filter((m) => m.categoria === banForm.id_categoria)

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
    const idUsuario = banForm.id_usuario
    const responsable = meUser?.id_usuario

    if (!Number.isFinite(idUsuario) || idUsuario <= 0) {
      alert("ID de usuario inválido")
      return
    }
    if (!banForm.id_motivo_ban || banForm.id_motivo_ban <= 0) {
      alert("Debes seleccionar un motivo de ban")
      return
    }
    if (!banForm.fin_ban) {
      alert("Debes seleccionar la fecha final del ban")
      return
    }
    if (!Number.isFinite(responsable) || responsable <= 0) {
      alert("No se pudo identificar al responsable del ban")
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
          motivo_ban: banForm.id_motivo_ban,
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
                        onClick={() => openBanModal(u)}
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
            <DialogTitle className="text-red-600">Registrar Ban de Usuario</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Info del usuario a banear */}
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                <span className="font-medium">Usuario a banear:</span> {banUserName}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                ID: {banForm.id_usuario}
              </p>
            </div>

            {/* Selector de categoría */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Categoría del motivo</label>
              <div className="relative">
                <select
                  value={banForm.id_categoria}
                  onChange={(e) => {
                    setBanForm((prev) => ({ 
                      ...prev, 
                      id_categoria: Number(e.target.value),
                      id_motivo_ban: 0 // Resetear motivo al cambiar categoría
                    }))
                  }}
                  className="w-full appearance-none border border-border bg-card text-foreground rounded-md px-3 py-2.5 pr-10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value={0}>Selecciona una categoría</option>
                  {CATEGORIAS_BAN.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Selector de motivo */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Motivo específico</label>
              <div className="relative">
                <select
                  value={banForm.id_motivo_ban}
                  onChange={(e) => setBanForm((prev) => ({ ...prev, id_motivo_ban: Number(e.target.value) }))}
                  disabled={!banForm.id_categoria}
                  className="w-full appearance-none border border-border bg-card text-foreground rounded-md px-3 py-2.5 pr-10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value={0}>
                    {banForm.id_categoria ? "Selecciona un motivo" : "Primero selecciona una categoría"}
                  </option>
                  {motivosFiltrados.map((motivo) => (
                    <option key={motivo.id} value={motivo.id}>
                      {motivo.motivo}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Mostrar motivo seleccionado */}
            {banForm.id_motivo_ban > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <span className="font-medium">Motivo seleccionado:</span>{" "}
                  {MOTIVOS_BAN.find((m) => m.id === banForm.id_motivo_ban)?.motivo}
                </p>
              </div>
            )}

            {/* Fecha fin del ban */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Fecha final del ban</label>
              <input
                type="datetime-local"
                value={banForm.fin_ban}
                onChange={(e) => setBanForm((prev) => ({ ...prev, fin_ban: e.target.value }))}
                className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Por defecto se establece 7 días a partir de ahora
              </p>
            </div>

            {/* Info del responsable */}
            <div className="p-3 bg-muted/50 border border-border rounded-lg">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Responsable del ban:</span>{" "}
                {meUser?.nombres} {meUser?.apellidos} (ID: {meUser?.id_usuario})
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBanModalOpen(false)} disabled={banSubmitting}>
              Cancelar
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white" 
              onClick={submitBan} 
              disabled={banSubmitting || !banForm.id_motivo_ban}
            >
              {banSubmitting ? "Guardando..." : "Confirmar Ban"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
