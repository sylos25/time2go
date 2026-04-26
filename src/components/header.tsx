"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
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
  /** Solo mientras la primera validación /api/me no termina (p. ej. perfil con sesión por cookie). */
  isLoggedIn?: boolean
  userName?: string
}

export function Header({
  isLoggedIn = false,
  userName = "Usuario",
}: HeaderProps): JSX.Element {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const { user, performLogout, sessionResolved } = useHeaderSession()

  const loggedIn = Boolean(user) || (isLoggedIn && !sessionResolved)
  const displayName = (user?.name || user?.firstName || userName) as string

  const permissionsKnown = sessionResolved && Boolean(user)
  const roleForPermissions =
    user?.role !== undefined && Number.isFinite(Number(user.role))
      ? Number(user.role)
      : undefined
  const isRegularUser = permissionsKnown && roleForPermissions === 1
  const canViewTransactions =
    permissionsKnown && (roleForPermissions === 1 || roleForPermissions === 2)

  const { hasAccess: canCreate } = usePermission(
    permissionsKnown ? PERMISSIONS.CREAR_EVENTOS : null,
    roleForPermissions,
  )
  const { hasAccess: canDashboard } = usePermission(
    permissionsKnown ? PERMISSIONS.VER_DASHBOARD : null,
    roleForPermissions,
  )

  const navigationItems: NavigationItem[] = [
    { name: "Inicio", path: "/" },
    { name: "Eventos", path: "/eventos" },
    { name: "Contacto", path: "/contacto" },
  ]

  const handleJoinClick = () => {
    const currentPath = `${window.location.pathname}${window.location.search}`
    const redirectParam = currentPath && currentPath !== "/" ? `?redirect=${encodeURIComponent(currentPath)}` : ""
    router.push(`/auth${redirectParam}`)
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
            <DialogTitle className="text-green-700">Confirmar cierre de sesión</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas cerrar sesión? Se cerrará tu sesión actual.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="border-green-700 text-green-700 hover:bg-green-50 hover:text-green-700 hover:scale-103 transition-transform" onClick={() => setLogoutDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleConfirmLogout} className="bg-rose-600 hover:scale-102 hover:bg-rose-500 text-white">Cerrar sesión</Button>
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
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer">
                <div className="relative w-[90px] h-[90px] md:w-[130px] md:h-[130px] lg:w-[160px] lg:h-[160px]">
                  <Image src="/images/logo_header.png" 
                  alt="Time2Go Logo" 
                  fill 
                  className="object-contain" />
                </div>
            </Link>

            <DesktopNav
              navigationItems={navigationItems}
              loggedIn={loggedIn}
              canCreate={canCreate}
              canDashboard={canDashboard}
              displayName={displayName}
              isRegularUser={isRegularUser}
              canViewTransactions={canViewTransactions}
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
        canViewTransactions={canViewTransactions}
        onNavigate={() => setMenuOpen(false)}
        onJoinClick={handleJoinClick}
        onLogoutClick={handleLogout}
      />
    </>
  )
}
