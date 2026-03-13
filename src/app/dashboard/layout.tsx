"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Calendar, Home, Loader2, MapPin, Menu, Search, Users } from "lucide-react"
import { SessionMonitor } from "@/components/session-monitor"
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
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [canManageEvents, setCanManageEvents] = useState(false)
  const [meUser, setMeUser] = useState<DashboardUser | null>(null)

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
          fetch(`/api/permissions/check?id_accesibilidad=4&id_rol=${roleNum}`, {
            headers,
            credentials: "include",
          }),
          fetch(`/api/permissions/check?id_accesibilidad=3&id_rol=${roleNum}`, {
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

  const menuItems = useMemo(
    () => [
      { href: "/dashboard/resumen", name: "Resumen General", icon: Home },
      ...(canManageEvents ? [{ href: "/dashboard/eventos", name: "Gestion de Eventos", icon: Calendar }] : []),
      { href: "/dashboard/ingresar-datos", name: "Ingresar Datos", icon: MapPin },
      { href: "/dashboard/ver-datos", name: "Ver Datos", icon: Search },
      { href: "/dashboard/usuarios", name: "Usuarios", icon: Users },
    ],
    [canManageEvents]
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
      <SessionMonitor />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 w-72 h-screen bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-bl from-fuchsia-700 to-red-600 text-white shadow-md shadow-sky-600/25 cursor-pointer"
                    : "text-foreground hover:bg-accent cursor-pointer"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.name}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      <div className="lg:ml-72">
        <header className="bg-card border-b border-border backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <Menu className="w-5 h-5 text-foreground" />
              </button>
              <div>
                <p className="text-3xl text-foreground font-sans font-bold mt-0.5">
                  Bienvenido, {meUser?.nombres || meUser?.name || "Usuario"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 ">
              <button
                onClick={() => router.push("/")}
                className="px-3 py-1 text-sm bg-card/90 text-foreground rounded-lg shadow-sm hover:bg-accent cursor-pointer border border-border"
              >
                Salir
              </button>
            </div>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
