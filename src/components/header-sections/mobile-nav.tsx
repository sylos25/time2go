import { Button } from "@/components/ui/button"
import Link from "next/link"
import { User, LogOut, Calendar, Ticket, Star, Heart, CreditCard } from "lucide-react"
import type { JSX } from "react"
import type { NavigationItem } from "./desktop-nav"

interface MobileNavProps {
  menuOpen: boolean
  navigationItems: NavigationItem[]
  loggedIn: boolean
  canCreate: boolean
  canDashboard: boolean
  isRegularUser: boolean
  canViewTransactions: boolean
  onNavigate: () => void
  onJoinClick: () => void
  onLogoutClick: () => void
}

export function MobileNav({
  menuOpen,
  navigationItems,
  loggedIn,
  canCreate,
  canDashboard,
  isRegularUser,
  canViewTransactions,
  onNavigate,
  onJoinClick,
  onLogoutClick,
}: MobileNavProps): JSX.Element {
  return (
    <nav
      className={`fixed top-0 left-0 h-full w-72 sm:w-80 max-w-full bg-background/95 dark:bg-card/95 text-foreground backdrop-blur-md shadow-2xl transform transition-transform duration-300 z-40 lg:hidden ${
        menuOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="pt-24 px-6">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.path}
                onClick={onNavigate}
                className="flex items-center space-x-3 text-foreground hover:text-green-700 font-semibold text-base py-3 px-4 rounded-lg hover:bg-accent transition-all w-full text-left group"
              >
                <span className="w-2 h-2 bg-lime-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
          {loggedIn && (
            <>
              {canCreate && (
                <li>
                  <Link
                    href="/eventos/crear"
                    onClick={onNavigate}
                    className="flex items-center space-x-3 text-foreground hover:text-green-700 font-semibold text-base py-3 px-4 rounded-lg hover:bg-accent transition-all w-full text-left group"
                  >
                    <span className="w-2 h-2 bg-lime-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Crear Evento</span>
                  </Link>
                </li>
              )}
              {canDashboard && (
                <li>
                  <Link
                    href="/dashboard"
                    onClick={onNavigate}
                    className="flex items-center space-x-3 text-foreground hover:text-green-700 font-semibold text-base py-3 px-4 rounded-lg hover:bg-accent transition-all w-full text-left group"
                  >
                    <span className="w-2 h-2 bg-lime-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Dashboard</span>
                  </Link>
                </li>
              )}
            </>
          )}
        </ul>

        <div className="mt-8 pt-8 border-t border-gray-200">
          {!loggedIn ? (
            <Button
              onClick={onJoinClick}
              className="w-full bg-gradient-to-tr from-green-700 to-lime-500 text-white hover:from-emerald-800 hover:to-lime-500 font-semibold shadow-lg hover:shadow-xl transition-all rounded-lg py-6 text-base"
            >
              Únete a Time2Go
            </Button>
          ) : (
            <div className="space-y-2">
              <Link
                href="/perfil"
                onClick={onNavigate}
                className="flex items-center space-x-3 text-foreground hover:text-green-700 font-semibold text-base py-3 px-4 rounded-lg hover:bg-accent transition-all w-full text-left group"
              >
                <User className="h-5 w-5 text-lime-600" />
                <span>Mi Perfil</span>
              </Link>
              {isRegularUser ? (
                <Link
                  href="/mis-reservas"
                  onClick={onNavigate}
                  className="flex items-center space-x-3 text-foreground hover:text-green-700 font-semibold text-base py-3 px-4 rounded-lg hover:bg-accent transition-all w-full text-left group"
                >
                  <Ticket className="h-5 w-5 text-lime-600" />
                  <span>Mis Reservas</span>
                </Link>
              ) : (
                <Link
                  href="/mis-eventos"
                  onClick={onNavigate}
                  className="flex items-center space-x-3 text-foreground hover:text-green-700 font-semibold text-base py-3 px-4 rounded-lg hover:bg-accent transition-all w-full text-left group"
                >
                  <Calendar className="h-5 w-5 text-lime-600" />
                  <span>Mis Eventos</span>
                </Link>
              )}
              <Link
                href="/mis-valoraciones"
                onClick={onNavigate}
                className="flex items-center space-x-3 text-foreground hover:text-green-700 font-semibold text-base py-3 px-4 rounded-lg hover:bg-accent transition-all w-full text-left group"
              >
                <Star className="h-5 w-5 text-lime-600" />
                <span>Mis Valoraciones</span>
              </Link>
              <Link
                href="/mis-favoritos"
                onClick={onNavigate}
                className="flex items-center space-x-3 text-foreground hover:text-green-700 font-semibold text-base py-3 px-4 rounded-lg hover:bg-accent transition-all w-full text-left group"
              >
                <Heart className="h-5 w-5 text-lime-600" />
                <span>Mis Favoritos</span>
              </Link>
              {canViewTransactions && (
                <Link
                  href="/mis-transacciones"
                  onClick={onNavigate}
                  className="flex items-center space-x-3 text-foreground hover:text-green-700 font-semibold text-base py-3 px-4 rounded-lg hover:bg-accent transition-all w-full text-left group"
                >
                  <CreditCard className="h-5 w-5 text-lime-600" />
                  <span>Mis Transacciones</span>
                </Link>
              )}
              <button
                onClick={onLogoutClick}
                className="flex items-center space-x-3 text-red-600 hover:text-red-700 font-semibold text-base py-3 px-4 rounded-lg hover:bg-red-50 transition-all w-full text-left mt-4"
              >
                <LogOut className="h-5 w-5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
