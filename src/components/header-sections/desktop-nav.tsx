import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, Calendar, Ticket, Star, Heart, CreditCard } from "lucide-react"
import type { JSX } from "react"

export interface NavigationItem {
  name: string
  path: string
}

interface DesktopNavProps {
  navigationItems: NavigationItem[]
  loggedIn: boolean
  canCreate: boolean
  canDashboard: boolean
  displayName: string
  isRegularUser: boolean
  canViewTransactions: boolean
  navigateTo: (path: string) => void
  onJoinClick: () => void
  onLogoutClick: () => void
}

export function DesktopNav({
  navigationItems,
  loggedIn,
  canCreate,
  canDashboard,
  displayName,
  isRegularUser,
  canViewTransactions,
  navigateTo,
  onJoinClick,
  onLogoutClick,
}: DesktopNavProps): JSX.Element {
  return (
    <nav className="hidden lg:flex items-center space-x-8">
      {navigationItems.map((item) => (
        <button
          key={item.name}
          onClick={() => navigateTo(item.path)}
          className="text-white hover:text-lime-400 font-medium transition-colors relative group cursor-pointer"
        >
          {item.name}
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-lime-500 transition-all group-hover:w-full" />
        </button>
      ))}

      {!loggedIn ? (
        <Button
          onClick={onJoinClick}
          className="bg-rose-600 text-white font-medium shadow-lg rounded-sm transition-all duration-300 hover:scale-105 hover:bg-rose-500 hover:shadow-md"
        >
          Únete
        </Button>
      ) : (
        <div className="flex items-center gap-3">
          {canCreate && (
            <button
              onClick={() => navigateTo("/eventos/crear")}
              className="text-white hover:text-lime-400 font-medium transition-colors relative group cursor-pointer"
            >
              Crear Evento
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-lime-500 transition-all group-hover:w-full" />
            </button>
          )}

          {canDashboard && (
            <button
              onClick={() => navigateTo("/dashboard")}
              className="text-white hover:text-lime-400 font-medium transition-colors relative group cursor-pointer"
            >
              Dashboard
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-lime-500 transition-all group-hover:w-full" />
            </button>
          )}

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="group flex items-center gap-3 px-4 py-6 hover:bg-black/10 text-white"
              >
                <span className="text-base font-bold text-white transition-colors duration-300 ease-out group-hover:text-lime-300">
                  {displayName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 z-[80] bg-popover text-popover-foreground border border-border shadow-lg"
            >
              <DropdownMenuLabel className="text-green-700">
                <p>Mi Cuenta</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigateTo("/perfil")}
                className="cursor-pointer"
              >
                <User className="h-4 w-4 mr-2" />
                <p>Mi Perfil</p>
              </DropdownMenuItem>
              {isRegularUser ? (
                <DropdownMenuItem
                  onClick={() => navigateTo("/mis-reservas")}
                  className="cursor-pointer"
                >
                  <Ticket className="h-4 w-4 mr-2" />
                  Mis Reservas
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => navigateTo("/mis-eventos")}
                  className="cursor-pointer"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Mis Eventos
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => navigateTo("/mis-valoraciones")}
                className="cursor-pointer"
              >
                <Star className="h-4 w-4 mr-2" />
                Mis valoraciones
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigateTo("/mis-favoritos")}
                className="cursor-pointer"
              >
                <Heart className="h-4 w-4 mr-2" />
                Mis favoritos
              </DropdownMenuItem>
              {canViewTransactions && (
                <DropdownMenuItem
                  onClick={() => navigateTo("/mis-transacciones")}
                  className="cursor-pointer"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Mis transacciones
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onLogoutClick}
                className="text-red-600 cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </nav>
  )
}
