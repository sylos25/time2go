/**
 * Clases de badge por rol. id_rol alineado con middleware / tabla_roles.
 * Acepta "promotor" en nombre por datos antiguos hasta migrar nombre_rol.
 */
export function getRoleBadgeClass(roleName?: string, idRol?: number): string {
  if (idRol === 4) return "bg-gradient-to-tr from-red-400 to-rose-500"
  if (idRol === 3) return "bg-gradient-to-tr from-red-600 to-fuchsia-700"
  if (idRol === 2) return "bg-gradient-to-tr from-emerald-600 to-lime-500"

  const role = roleName?.toLowerCase().trim() || "usuario"
  if (role === "admin" || role === "administrador") {
    return "bg-gradient-to-tr from-red-400 to-rose-500"
  }
  if (role === "moderador") return "bg-gradient-to-tr from-red-600 to-fuchsia-700"
  if (role === "organizador" || role === "promotor") {
    return "bg-gradient-to-tr from-emerald-600 to-lime-500"
  }
  if (role === "cliente") return "bg-gradient-to-tr from-blue-600 to-sky-400"
  return "bg-gradient-to-tr from-amber-500 to-yellow-400"
}
