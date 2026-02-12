"use client"

import { useState, useEffect, useRef } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, User, LogOut, Settings, LayoutDashboard, Calendar } from "lucide-react"
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
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const [user, setUser] = useState<any>(null);
  const logoutTimerRef = useRef<number | null>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const parseJwtExp = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp as number | undefined;
    } catch {
      return undefined;
    }
  };

  const scheduleAutoLogout = (expiresAtSec?: number) => {
    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (!expiresAtSec) return;
    const ms = expiresAtSec * 1000 - Date.now();
    if (ms <= 0) {
      performLogout();
      return;
    }
    logoutTimerRef.current = window.setTimeout(() => {
      performLogout();
    }, ms);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const pathname = usePathname();

  useEffect(() => {
    // Read token from localStorage on mount and on route change to keep session
    const syncFromStorage = () => {
      const token = localStorage.getItem("token");
      const storedName = localStorage.getItem("userName");
      const storedDoc = localStorage.getItem("userDocument");
      const storedRole = localStorage.getItem("userRole");
      if (token) {
        const exp = parseJwtExp(token);
        setUser({ token, name: storedName || undefined, numero_documento: storedDoc || undefined, role: storedRole ? Number(storedRole) : undefined });
        if (exp) scheduleAutoLogout(exp);
      }
      // if no token, don't immediately clear user here — we'll validate session with the server
    };

    const validateSession = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // If token exists, validate locally by expiry to avoid unnecessary server calls
          const exp = parseJwtExp(token);
          if (exp && exp * 1000 <= Date.now()) {
            // expired token
            performLogout();
            return;
          }

          // Token seems valid locally — optimistically set user from localStorage
          const storedName = localStorage.getItem('userName');
          setUser({ token, name: storedName || (user as any)?.name });
          if (exp) scheduleAutoLogout(exp);

            // Also validate token with the server in background (silent clear if invalid)
          try {
            const res = await fetch('/api/me', { headers: { Authorization: `Bearer ${token}` }, credentials: 'include' });
            if (!res.ok) {
              // token not valid on server -> clear silently
              clearSessionSilent();
              return;
            }
            const data = await res.json();
            if (data?.ok && data.user) {
              const name = data.user.nombres || data.user.correo || storedName || user?.name;
              const numero_documento = data.user.numero_documento || localStorage.getItem('userDocument') || undefined;
              const roleNumber = data.user.id_rol !== undefined ? Number(data.user.id_rol) : undefined;
              if (numero_documento) localStorage.setItem('userDocument', String(numero_documento));
              if (roleNumber !== undefined) localStorage.setItem('userRole', String(roleNumber));
              setUser({ token, name, numero_documento, role: roleNumber });
            } else {
              clearSessionSilent();
            }
          } catch (err) {
            console.error('validateSession server check error', err);
          }

          return;
        }

        // No token in localStorage — maybe server session (cookie) exists; ask /api/me
        const res = await fetch('/api/me', { credentials: 'include' });
        if (!res.ok) {
          // session invalid — clear silently so we don't interrupt navigation
          clearSessionSilent();
          return;
        }
        const data = await res.json();
        if (data?.ok && data.user) {
          const name = data.user.nombres || data.user.correo || localStorage.getItem('userName') || user?.name;
          const tokenFromStorage = localStorage.getItem('token') || (user as any)?.token;
          const numero_documento = data.user.numero_documento || localStorage.getItem('userDocument') || undefined;
          const roleNumber = data.user.id_rol !== undefined ? Number(data.user.id_rol) : undefined;
          if (numero_documento) localStorage.setItem('userDocument', String(numero_documento));
          if (roleNumber !== undefined) localStorage.setItem('userRole', String(roleNumber));
          setUser({ token: tokenFromStorage, name, numero_documento, role: roleNumber });
          const expFromToken = tokenFromStorage ? parseJwtExp(tokenFromStorage) : undefined;
          if (expFromToken) scheduleAutoLogout(expFromToken);
        } else {
          // server said no session — clear silently
          clearSessionSilent();
        }
      } catch (err) {
        console.error('validateSession error', err);
      }
    };

    syncFromStorage();
    validateSession();

    const onLogin = (e: Event) => {
      const ev = e as CustomEvent;
      const detail = ev.detail ?? {};
      const token = detail.token || localStorage.getItem("token");
      const name = detail.name || detail.nombre || localStorage.getItem("userName") || "Usuario";
      const numero_documento = detail.numero_documento || localStorage.getItem("userDocument") || undefined;
      const roleNumber = detail.id_rol !== undefined ? Number(detail.id_rol) : undefined;
      if (token) localStorage.setItem("token", token);
      if (name) localStorage.setItem("userName", name);
      if (numero_documento) localStorage.setItem("userDocument", String(numero_documento));
      if (roleNumber !== undefined) localStorage.setItem('userRole', String(roleNumber));
      setUser({ token, name, numero_documento, role: roleNumber });
      const exp = detail.expiresAt || parseJwtExp(token || "");
      if (exp) scheduleAutoLogout(exp);
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === "token") {
        // if token removed in another tab, logout here
        if (!e.newValue) {
          performLogout();
        } else {
          // new token added/updated -> re-validate session
          syncFromStorage();
          validateSession();
        }
      }
      if (e.key === "userName") {
        // just sync name
        const storedName = localStorage.getItem('userName');
        setUser((prev: any) => (prev ? { ...prev, name: storedName || prev.name } : prev));
      }
      if (e.key === 'userRole') {
        const storedRole = localStorage.getItem('userRole');
        setUser((prev: any) => (prev ? { ...prev, role: storedRole !== null ? Number(storedRole) : prev.role } : prev));
      }
    };

    window.addEventListener("user:login", onLogin);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("user:login", onLogin);
      window.removeEventListener("storage", onStorage);
    };
  }, [pathname]);

  // derive login state and display name from local user state (fallback to props)
  const loggedIn = Boolean(user) || isLoggedIn;
  const displayName = (user?.name || user?.firstName || user?.name || user?.firstName || userName) as string;

  // determine role (1 = usuario regular per DB) — prefer in-memory user, fallback to localStorage
  const userRole = user?.role !== undefined ? Number(user.role) : Number(typeof window !== 'undefined' ? localStorage.getItem('userRole') || 0 : 0);
  const isRegularUser = userRole === 1;
  const isPromotor = userRole === 2;
  const canCreate = isPromotor || userRole === 3 || userRole === 4;
  const canDashboard = userRole === 3 || userRole === 4;

  const navigationItems = [
    { name: "Inicio", path: "/" },
    { name: "Eventos", path: "/eventos" },
    { name: "Contacto", path: "/contacto" },
  ]

  const navigateTo = (path: string) => {
    router.push(path)
    setMenuOpen(false)
  }

  const performLogout = () => {
    // limpiar estado y localStorage, notificar y redirigir
    // Ask server to clear cookie (best-effort)
    try {
      void fetch('/api/logout', { method: 'POST', credentials: 'include' })
    } catch (err) {
      console.error('logout request error', err)
    }

    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem('userRole');
    setUser(null);
    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    window.dispatchEvent(new CustomEvent("user:logout"));
    router.push("/");
    setMenuOpen(false);
    setLogoutDialogOpen(false);
  }

  // Limpiar sesión sin redirigir ni disparar eventos (usado para expiración automática o invalidación silenciosa)
  const clearSessionSilent = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem('userRole');
    setUser(null);
    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    // do not dispatch user:logout or redirect here to avoid interrupting navigation
  }

  const handleLogout = () => {
    // abrir modal de confirmación en lugar de confirmar inmediato
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
            <Button variant="outline" onClick={() => setLogoutDialogOpen(false)}>Cancelar</Button>
            <Button onClick={performLogout} className="bg-red-600 text-white">Cerrar sesión</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-[70] w-full bg-gradient-to-tr from-green-700 to-lime-500 shadow-md shadow-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-white/10"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>

            {/* Logo */}
            <button
              onClick={() => navigateTo("/")}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-40 lg:h-40 relative">
                <Image src="/images/logo_header.png?height=48&width=48" alt="Time2Go Logo" fill className="object-contain" />
              </div>
            </button>

            {/* Desktop Navigation */}
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
                  onClick={() => router.push("/auth")}
                  className="bg-amber-300 text-amber-800 hover:bg-yellow-300 font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-sm"
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

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 hover:bg-white/10 text-white">
                        <div className="w-8 h-8 rounded-sm bg-white flex items-center justify-center text-lime-600 font-medium">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{displayName}</span>
                      </Button>
                    </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigateTo("/perfil")} className="cursor-pointer">
                          <User className="h-4 w-4 mr-2" />
                          Mi Perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigateTo("/mis-eventos")} className="cursor-pointer">
                          <Calendar className="h-4 w-4 mr-2" />
                          Mis Eventos
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigateTo("/configuracion")} className="cursor-pointer">
                          <Settings className="h-4 w-4 mr-2" />
                          Configuración
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                          <LogOut className="h-4 w-4 mr-2" />
                          Cerrar Sesión
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </nav>


          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav
        className={`fixed top-0 left-0 h-full w-72 sm:w-80 max-w-full bg-white/95 backdrop-blur-md shadow-2xl transform transition-transform duration-300 z-40 lg:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="pt-24 px-6">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => navigateTo(item.path)}
                  className="flex items-center space-x-3 text-gray-800 hover:text-lime-600 font-semibold text-base py-3 px-4 rounded-lg hover:bg-lime-50 transition-all w-full text-left group"
                >
                  <span className="w-2 h-2 bg-lime-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
            {loggedIn && (
              <>
                {canCreate && (
                  <li>
                    <button
                      onClick={() => navigateTo("/eventos/crear")}
                      className="flex items-center space-x-3 text-gray-800 hover:text-lime-600 font-semibold text-base py-3 px-4 rounded-lg hover:bg-lime-50 transition-all w-full text-left group"
                    >
                      <span className="w-2 h-2 bg-lime-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span>Crear Evento</span>
                    </button>
                  </li>
                )}
                {canDashboard && (
                  <li>
                    <button
                      onClick={() => navigateTo("/dashboard")}
                      className="flex items-center space-x-3 text-gray-800 hover:text-lime-600 font-semibold text-base py-3 px-4 rounded-lg hover:bg-lime-50 transition-all w-full text-left group"
                    >
                      <span className="w-2 h-2 bg-lime-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span>Dashboard</span>
                    </button>
                  </li>
                )}
              </>
            )}
          </ul>

          <div className="mt-8 pt-8 border-t border-gray-200">
            {!loggedIn ? (
              <Button
                onClick={() => router.push("/auth")}
                className="w-full bg-gradient-to-r from-lime-500 to-lime-600 text-white hover:from-lime-600 hover:to-lime-700 font-semibold shadow-lg hover:shadow-xl transition-all rounded-lg py-6 text-base"
              >
                Únete a Time2Go
              </Button>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => navigateTo("/perfil")}
                  className="flex items-center space-x-3 text-gray-800 hover:text-lime-600 font-semibold text-base py-3 px-4 rounded-lg hover:bg-lime-50 transition-all w-full text-left"
                >
                  <User className="h-5 w-5 text-lime-600" />
                  <span>Mi Perfil</span>
                </button>
                <button
                  onClick={() => navigateTo("/mis-eventos")}
                  className="flex items-center space-x-3 text-gray-800 hover:text-lime-600 font-semibold text-base py-3 px-4 rounded-lg hover:bg-lime-50 transition-all w-full text-left"
                >
                  <Calendar className="h-5 w-5 text-lime-600" />
                  <span>Mis Eventos</span>
                </button>
                <button
                  onClick={() => navigateTo("/configuracion")}
                  className="flex items-center space-x-3 text-gray-800 hover:text-lime-600 font-semibold text-base py-3 px-4 rounded-lg hover:bg-lime-50 transition-all w-full text-left"
                >
                  <Settings className="h-5 w-5 text-lime-600" />
                  <span>Configuración</span>
                </button>
                <button
                  onClick={handleLogout}
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
    </>
  )
}
