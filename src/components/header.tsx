"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Menu, X } from "lucide-react"
import { usePermission, PERMISSIONS } from "@/hooks/use-permissions"
import { useHeaderSession } from "@/hooks/use-header-session"
import {
  DesktopNav,
  type NavigationItem,
} from "@/components/header-sections/desktop-nav"
import { MobileNav } from "@/components/header-sections/mobile-nav"
import type { JSX } from "react"

interface HeaderProps {
  onAuthClick?: (isLogin: boolean) => void
  isLoggedIn?: boolean
  isAdmin?: boolean
  userName?: string
}

export function Header({
  onAuthClick,
  isLoggedIn = false,
  isAdmin = false,
  userName = "Usuario",
}: HeaderProps): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user, performLogout } = useHeaderSession(pathname)

  // derive login state and display name from local user state (fallback to props)
  const loggedIn = Boolean(user) || isLoggedIn
  const displayName = (user?.name || user?.firstName || userName) as string

  // Determine role only from deterministic sources during render.
  const userRole = user?.role !== undefined ? Number(user.role) : isAdmin ? 2 : 0
  const isRegularUser = userRole === 1
  
  // Verificar permisos usando el sistema de accesibilidad
  const { hasAccess: canCreate } = usePermission(
    loggedIn ? PERMISSIONS.CREAR_EVENTOS : null,
    userRole,
  )
  const { hasAccess: canDashboard } = usePermission(
    loggedIn ? PERMISSIONS.VER_DASHBOARD : null,
    userRole,
  )

  const navigationItems: NavigationItem[] = [
    { name: "Inicio", path: "/" },
    { name: "Eventos", path: "/eventos" },
    { name: "Contacto", path: "/contacto" },
  ]

  const navigateTo = (path: string) => {
    router.push(path)
    setMenuOpen(false)
  }

  const handleJoinClick = () => {
    if (onAuthClick) {
      onAuthClick(true)
      setMenuOpen(false)
      return
    }
    router.push("/auth")
    setMenuOpen(false)
  }

  const handleConfirmLogout = async () => {
    await performLogout()
    setMenuOpen(false)
    setLogoutDialogOpen(false)
  }

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  }

  return (
    <>
      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden" onClick={() => setMenuOpen(false)} />
      )}

      {/* Logout confirmation modal */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar cierre de sesión</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas cerrar sesión? Se cerrará tu sesión actual.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="hover:scale-103" onClick={() => setLogoutDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleConfirmLogout} className="bg-gradient-to-tr from-fuchsia-700 to-red-500 hover:scale-103 hover:bg-gradient-to-tr hover:from-fuchsia-600 hover:to-red-450 text-white">Cerrar sesión</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-[70] w-full bg-gradient-to-tr from-green-700 to-lime-500 dark:from-slate-900 dark:to-slate-800 dark:border-b dark:border-border shadow-md shadow-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-black/10 dark:hover:bg-white/10"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>

            {/* Logo */}
            <button
              onClick={() => navigateTo("/")}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer">
                <div className="relative w-[90px] h-[90px] md:w-[130px] md:h-[130px] lg:w-[160px] lg:h-[160px]">
                  <Image src="/images/logo_header.png" 
                  alt="Time2Go Logo" 
                  fill 
                  className="object-contain" />
                </div>
            </button>

            <DesktopNav
              navigationItems={navigationItems}
              loggedIn={loggedIn}
              canCreate={canCreate}
              canDashboard={canDashboard}
              displayName={displayName}
              isRegularUser={isRegularUser}
              navigateTo={navigateTo}
              onJoinClick={handleJoinClick}
              onLogoutClick={handleLogout}
            />


          </div>
        </div>
      </header>

      <MobileNav
        menuOpen={menuOpen}
        navigationItems={navigationItems}
        loggedIn={loggedIn}
        canCreate={canCreate}
        canDashboard={canDashboard}
        isRegularUser={isRegularUser}
        navigateTo={navigateTo}
        onJoinClick={handleJoinClick}
        onLogoutClick={handleLogout}
      />
    </>
  )
}
