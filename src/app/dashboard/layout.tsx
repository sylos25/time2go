"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import {
  Calendar,
  ChartNoAxesColumn,
  ChevronLeft,
  ChevronRight,
  Home,
  ImageIcon,
  Loader2,
  LogOut,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  Flag,
  Users,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"

type DashboardUser = {
  id_usuario?: number
  id_rol?: number | string
  nombres?: string
  name?: string
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [canManageEvents, setCanManageEvents] = useState(false)
  const [meUser, setMeUser] = useState<DashboardUser | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const isAdmin = Number(meUser?.id_rol) === 4
  const isModOrAdmin = Number(meUser?.id_rol) === 3 || Number(meUser?.id_rol) === 4

  useEffect(() => {
    const syncTheme = () => {
      const theme = localStorage.getItem("theme")
      const isDark = theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)
      setIsDarkMode(isDark)
      if (isDark) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
    syncTheme()
    window.addEventListener("storage", syncTheme)
    window.addEventListener("themechange", syncTheme)
    return () => {
      window.removeEventListener("storage", syncTheme)
      window.removeEventListener("themechange", syncTheme)
    }
  }, [])

  useEffect(() => {
    let canceled = false

    const verifyDashboardAccess = async () => {
      setLoading(true)
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        const headers: any = {}
        if (token) headers.Authorization = `Bearer ${token}`

        const meRes = await fetch("/api/me", { headers })
        if (!meRes.ok) {
          if (!canceled) setAuthorized(false)
          return
        }

        const meData = await meRes.json()
        if (!canceled) setMeUser(meData?.user || null)

        const roleNum = meData?.user?.id_rol !== undefined ? Number(meData.user.id_rol) : undefined
        if (roleNum === undefined || Number.isNaN(roleNum)) {
          if (!canceled) setAuthorized(false)
          return
        }

        const [dashboardPermRes, eventsPermRes] = await Promise.all([
          fetch(`/api/permissions/check?id_accesibilidad=2&id_rol=${roleNum}`, {
            headers,
            credentials: "include",
          }),
          fetch(`/api/permissions/check?id_accesibilidad=4&id_rol=${roleNum}`, {
            headers,
            credentials: "include",
          }),
        ])

        if (!dashboardPermRes.ok) {
          if (!canceled) setAuthorized(false)
          return
        }

        const dashboardPerm = await dashboardPermRes.json()
        const hasDashboardAccess = Boolean(dashboardPerm?.hasAccess)
        if (!canceled) setAuthorized(hasDashboardAccess)

        if (!hasDashboardAccess) {
          return
        }

        let manageEvents = false
        if (eventsPermRes.ok) {
          const eventsPerm = await eventsPermRes.json()
          manageEvents = Boolean(eventsPerm?.hasAccess)
        }
        if (!canceled) setCanManageEvents(manageEvents)
      } catch (error) {
        console.error("Error validando acceso dashboard", error)
        if (!canceled) setAuthorized(false)
      } finally {
        if (!canceled) setLoading(false)
      }
    }

    verifyDashboardAccess()
    return () => {
      canceled = true
    }
  }, [])

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark")
      setIsDarkMode(isDark)
    })
    observer.observe(document.documentElement, { attributes: true })
    return () => observer.disconnect()
  }, [])

  const menuItems = useMemo(
    () => [
      { href: "/dashboard/resumen", name: "Resumen General", icon: Home },
      ...(canManageEvents ? [{ href: "/dashboard/inicio", name: "Personalizar el Inicio", icon: ImageIcon }] : []),
      ...(canManageEvents ? [{ href: "/dashboard/eventos", name: "Gestion de Eventos", icon: Calendar }] : []),
      { href: "/dashboard/ingresar-datos", name: "Ingresar Datos", icon: MapPin },
      { href: "/dashboard/sitios-mapa", name: "Sitios (Mapa)", icon: MapPin },
      { href: "/dashboard/ver-datos", name: "Ver Datos", icon: Search },
      { href: "/dashboard/usuarios", name: "Usuarios", icon: Users },
      ...(isModOrAdmin ? [{ href: "/dashboard/denuncias-eventos", name: "Reportes de eventos", icon: Flag }] : []),
      ...(isAdmin
        ? [{ href: "/dashboard/planes-organizador", name: "Planes y Suscripciones", icon: ChartNoAxesColumn }]
        : []),
      ...(isAdmin ? [{ href: "/dashboard/administrador", name: "Administrador", icon: ShieldCheck }] : []),
    ],
    [canManageEvents, isAdmin, isModOrAdmin]
  )

  if (loading || authorized === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-green-800 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">Comprobando permisos del dashboard...</p>
        </div>
      </div>
    )
  }

  if (authorized === false) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-card border border-border rounded-3xl shadow-xl p-8 text-center">
            <h2 className="text-2xl font-semibold text-red-600">Acceso denegado</h2>
            <p className="mt-4 text-muted-foreground">No tienes permisos para ver el dashboard.</p>
            <div className="mt-6">
              <Button onClick={() => router.push("/")} className="bg-lime-600 text-white">Volver al inicio</Button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="w-full bg-green-700 dark:bg-green-900 border-b border-green-600/50 dark:border-green-800 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/20 dark:hover:bg-green-800 transition-colors"
            >
              <Menu className="w-5 h-5 text-white dark:text-green-100" />
            </button>
            <button
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className="hidden lg:inline-flex p-2 rounded-lg hover:bg-white/20 dark:hover:bg-green-800 transition-colors"
              aria-label={isSidebarCollapsed ? "Expandir menu" : "Contraer menu"}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-5 h-5 text-white dark:text-green-100" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-white dark:text-green-100" />
              )}
            </button>

            <div className="relative h-20 w-50 sm:w-52 md:w-56">
              <Image src="/images/logo.png" alt="Time2Go" fill className="object-contain" priority />
            </div>

            <p className="text-2xl sm:text-3xl font-sans font-bold mt-0.5 text-white dark:text-green-100 truncate">
              Bienvenido, {meUser?.nombres || meUser?.name || "Usuario"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle inline />
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <div
          className="fixed inset-0 top-16 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-16 left-0 z-40 w-72 h-[calc(100vh-4rem)] bg-green-700 dark:bg-green-900 border-r border-green-500/40 dark:border-green-800 transform transition-all duration-300 lg:translate-x-0 ${
          isSidebarCollapsed ? "lg:w-20" : "lg:w-72"
        } ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="px-4 pt-20 pb-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center px-4 py-3 rounded-lg font-medium transition-all ${
                  isSidebarCollapsed ? "lg:justify-center lg:px-2" : "gap-3"
                } ${
                  isActive
                    ? "bg-pink-700 text-white shadow-md shadow-sky-600/25 cursor-pointer"
                    : "text-white dark:text-green-100 hover:bg-white/20 dark:hover:bg-green-800/40 cursor-pointer"
                }`}
                title={item.name}
              >
                <item.icon className="w-5 h-5" />
                <span className={`text-sm ${isSidebarCollapsed ? "lg:hidden" : ""}`}>{item.name}</span>
              </button>
            )
          })}

          <button
            onClick={() => router.push("/")}
            className={`mt-2 w-full flex items-center px-4 py-3 rounded-lg font-medium transition-all text-white dark:text-green-100 hover:bg-white/20 dark:hover:bg-green-800/40 cursor-pointer ${
              isSidebarCollapsed ? "lg:justify-center lg:px-2" : "gap-3"
            }`}
            title="Salir"
          >
            <LogOut className="w-5 h-5" />
            <span className={`text-sm ${isSidebarCollapsed ? "lg:hidden" : ""}`}>Salir</span>
          </button>
        </nav>
      </aside>

      <div className={`transition-all duration-300 ${isSidebarCollapsed ? "lg:ml-20" : "lg:ml-72"}`}>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
